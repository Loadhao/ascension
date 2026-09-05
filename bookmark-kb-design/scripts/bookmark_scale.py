#!/usr/bin/env python3
# 通用书签分级流水线：按方向（方向/<名称>）抽取书签，URL 去重后按 A/B/C/D 分级
# 分级标准（机器首轮，输出后需人工校准）：
#   A 高价值必读 —— 官方文档/文档站、体系化深度长文（原理/源码/集群/分片/最佳实践），值得转写为知识库笔记
#   B 有价值深读 —— 具体技术主题的优质文章，按主题分组后系统读
#   C 参考速查   —— 配置、安装、单点技巧、速查表，用到再查
#   D 低价值清理 —— 错放内容、论坛问答、缓存/死链平台、聚合站、过期转载
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'source' / 'bookmarks.html'


def parse_bookmarks(content):
    """解析 Netscape 书签，返回 [(路径tuple, 标题, url)]"""
    tokens = re.finditer(
        r'<(/?)DL\b[^>]*>|<(H3)\b[^>]*>(.*?)</H3>|<A\b([^>]*)>(.*?)</A>',
        content, re.I | re.S)
    folder_stack = []
    items = []
    for m in tokens:
        if m.group(1) is not None and m.group(1) == '':
            folder_stack.append(None)  # <DL> 占位，等待 H3 命名
        elif m.group(1):
            if folder_stack:
                folder_stack.pop()  # </DL> 弹出一层
        elif m.group(2):
            t = re.sub(r'<[^>]+>', '', m.group(3) or '').strip()
            if folder_stack:
                folder_stack[-1] = t
        elif m.group(4) is not None:
            attrs = dict(re.findall(r'(\w+)\s*=\s*"([^"]*)"', m.group(4)))
            title = re.sub(r'<[^>]+>', '', m.group(5) or '').strip()
            path = tuple(x for x in folder_stack if x)
            items.append((path, title, attrs.get('HREF', '')))
    return items


# ---------- 分级规则 ----------

# 低价值平台/页面模式（缓存页、文库、论坛、聚合站、死平台）
JUNK_URL_PATTERNS = [
    r'cache\.baiducontent\.com',   # 百度快照缓存
    r'wenku\.baidu\.com',          # 百度文库
    r'bbs\.csdn\.net',             # CSDN 论坛问答
    r'blog\.sina\.com\.cn',        # 新浪博客（已停）
    r'it1352\.com',                # 内容聚合站
    r'docs4dev\.com',              # 镜像文档聚合站（原文已可直达）
    r'w3school\.com\.cn',          # 入门教程站（知识库已覆盖）
]

# 错放信号：标题/URL 命中且与当前方向无关（按方向配置在 MISFILED_KEYWORDS）
def is_misfiled(direction, title, url):
    text = f'{title} {url}'.lower()
    for kw in MISFILED_KEYWORDS.get(direction, []):
        if kw.lower() in text:
            return True
    return False

MISFILED_KEYWORDS = {
    # SQL 方向里明显属于其它方向的散链
    'SQL': ['npm 中文文档', 'npmjs', 'countdownlatch'],
}

# A 级：官方文档/文档站（域名白名单）
OFFICIAL_DOCS = [
    r'postgresql\.org/docs', r'redis\.io/documentation', r'redis\.cn/commands',
    r'mongoing\.com', r'pingcap\.com', r'university\.pingcap\.com',
    r'shardingsphere\.apache\.org', r'flywaydb\.org', r'mp\.baomidou\.com',
    r'pagehelper\.github\.io', r'taosdata\.com/cn/documentation',
    r'v2\.docs\.influxdata\.com', r'clickhouse\.com', r'jasper-zhang1\.gitbooks\.io',
    r'mysql\.com', r'mongodb\.com',
]

# A 级：标题深度信号（体系化、原理、源码、长文、集群、最佳实践）
A_TITLE_PATTERNS = [
    r'原理', r'源码', r'体系', r'知识梳理', r'总结精讲', r'最佳实践',
    r'3[wW]字', r'高可用', r'容灾', r'集群(技术|原理|实践|架构)',
    r'分片(技术|架构|集群)', r'分布式', r'分库分表', r'性能优化',
    r'[一-龥]{0,6}深入', r'一文(带你|读懂|搞懂)', r'转写', r'课程',
]
# C 级：操作性/速查信号（这些命中则不进 A）
C_TITLE_PATTERNS = [
    r'安装', r'编译', r'下载', r'修改密码', r'远程(访问|设置|连接)',
    r'修改最大连接数', r'启动命令', r'启用身份验证', r'开启安全认证',
    r'创建用户', r'常用命令', r'常用函数', r'常用类型', r'远程设置',
    r'报错', r'错误提示', r'异常', r'坑', r'爬坑', r'连接失败',
    r'时区问题', r'怎么去(掉|除)', r'参数说明', r'配置文件',
    r'搭建', r'部署', r'快速入门', r'下载地址', r'入门教程',
]

# B 级：主题深度信号
B_TITLE_PATTERNS = [
    r'索引', r'事务', r'隔离级别', r'锁', r'分页', r'聚合', r'复制集',
    r'副本集', r'主从', r'流水线', r'pipelined', r'批量', r'优化',
    r'对比', r'区别', r'存储过程', r'存储引擎', r'备份', r'恢复',
    r'慢查询', r'性能测试', r'性能分析', r'explain', r'整合',
    r'范式', r'依赖', r'关系运算', r'超键', r'候选键', r'函数依赖',
    r'加解密', r'数据加密', r'过期(处理|时间)', r'where与having',
]


def grade(direction, path, title, url, is_homepage=False):
    """对单条书签分级，返回 (级别, 依据)"""
    text = title
    u = url.lower()
    parsed = urlparse(url)
    path_part = parsed.path.rstrip('/')

    # D：错放
    if is_misfiled(direction, title, url):
        return 'D', '错放（与方向无关）'
    # D：低价值平台
    for pat in JUNK_URL_PATTERNS:
        if re.search(pat, u):
            return 'D', f'低价值平台（{pat}）'

    has_c_signal = any(re.search(p, text, re.I) for p in C_TITLE_PATTERNS)
    has_a_signal = any(re.search(p, text, re.I) for p in A_TITLE_PATTERNS)

    # 产品首页：入口页不进 A（转写笔记无意义），一律 B
    if is_homepage:
        return 'B', '官方入口/产品页'

    # A：官方文档/文档站
    for pat in OFFICIAL_DOCS:
        if re.search(pat, u) and not has_c_signal:
            return 'A', '官方文档/文档站'
    # A：深度长文（无 C 级操作信号干扰）
    if has_a_signal and not has_c_signal:
        return 'A', '深度体系化内容'

    # B：官方/产品入口
    for pat in OFFICIAL_DOCS:
        if re.search(pat, u):
            return 'B', '官方入口/产品页'
    # B：主题深度文章
    if any(re.search(p, text, re.I) for p in B_TITLE_PATTERNS) and not has_c_signal:
        return 'B', '主题深度文章'

    # C：操作/速查/排错类
    if has_c_signal:
        return 'C', '操作/速查/排错'

    # 兜底：有明确主题归属 → C，无主题散链 → D
    if len(path) >= 4:  # 位于具体子分类下，尚有主题价值
        return 'C', '分类下一般条目'
    return 'D', '无主题散链'


def normalize_title(title):
    """归一化标题：去掉站点名后缀等噪音，用于近似重复检测"""
    t = re.sub(r'[-_|]\s*[^-_|]{0,20}(博客|专栏|社区|文档|中文)$', '', title)
    t = re.sub(r'\(?\d+条消息\)?', '', t)
    t = re.sub(r'[\s\-_|：:，,。.·（）()【】\[\]]+', '', t).lower()
    return t


def main():
    direction = sys.argv[1] if len(sys.argv) > 1 else 'SQL'
    content = SOURCE.read_text(encoding='utf-8', errors='replace')
    items = parse_bookmarks(content)

    # 抽取指定方向
    scoped = []
    for path, title, url in items:
        if len(path) >= 3 and path[0] == '书签栏' and path[1] == '方向' and path[2] == direction:
            scoped.append((path, title, url))

    # URL 去重（保留首个）
    seen = {}
    for path, title, url in scoped:
        key = url.strip()
        if key and key not in seen:
            seen[key] = (path, title, url)
    deduped = list(seen.values())

    # 分级（先做近似重复检测，重复者直接 D）
    seen_cores = {}
    theme_counts = {}
    graded = []
    for path, title, url in deduped:
        core = normalize_title(title)
        folder = '/'.join(path[3:-1]) if len(path) > 4 else ''
        # 近似重复：同归一化标题出现过
        if core in seen_cores:
            level, reason = 'D', '近似重复'
        else:
            # 同主题多篇：同文件夹下"对比/区别"类文章超过 2 篇，后续降 D
            if re.search(r'对比|区别|哪个更好|哪个更优', title):
                key = f'cmp:{folder}'
                theme_counts[key] = theme_counts.get(key, 0) + 1
                if theme_counts[key] > 2:
                    level, reason = 'D', '同主题多篇（对比类）'
                    graded.append({'level': level, 'reason': reason,
                                   'path': '/'.join(path[3:]), 'title': title,
                                   'url': url, 'domain': urlparse(url).netloc})
                    continue
            parsed = urlparse(url)
            is_homepage = parsed.path in ('', '/', '/cn/', '/cn', '/zh/', '/zh', '/index.html')
            level, reason = grade(direction, path, title, url, is_homepage)
            seen_cores[core] = True
        graded.append({
            'level': level,
            'reason': reason,
            'path': '/'.join(path[3:]),
            'title': title,
            'url': url,
            'domain': urlparse(url).netloc,
        })

    # 统计
    from collections import Counter
    counter = Counter(g['level'] for g in graded)
    out = {
        'direction': direction,
        'total': len(scoped),
        'deduped': len(graded),
        'stats': {k: counter.get(k, 0) for k in 'ABCD'},
        'items': sorted(graded, key=lambda g: ('ABCD'.index(g['level']), g['path'], g['title'])),
    }

    data_dir = ROOT / 'data'
    data_dir.mkdir(exist_ok=True)
    out_path = data_dir / f'{direction.lower()}.json'
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"方向 {direction}: 总 {out['total']} 条，去重 {out['deduped']} 条")
    print(f"分级：A {out['stats']['A']} · B {out['stats']['B']} · C {out['stats']['C']} · D {out['stats']['D']}")
    print(f'输出：{out_path}')


if __name__ == '__main__':
    main()