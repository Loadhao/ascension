#!/usr/bin/env python3
# 渲染脚本：从 data/<direction>.json 分级结果自动生成 guide/<direction>.mdx
# 结构：概览统计 → A 级转写候选清单（checkbox）→ B/C 级按主题分栏导航 → D 级清理建议
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 主题友好名（取书签一级子目录名映射）
THEME_NAMES = {
    # SQL 方向
    'MongoDB': 'MongoDB', 'PostgreSQL': 'PostgreSQL', 'MySQL': 'MySQL',
    '缓存': 'Redis 与缓存', 'MyBatis': 'MyBatis', 'InfluxDB': 'InfluxDB（时序）',
    'OLAP': 'OLAP 与分析', 'TiDB': 'TiDB', 'newSQL': 'NewSQL',
    'ClinkHouse': 'ClickHouse', '分库分表': '分库分表与中间件',
    '数据库原理': '数据库原理', 'SQL': 'SQL 语言', 'SqlServer': 'SQL Server',
    '数据库版本管理工具': '版本管理工具', 'SequoiaDB': 'SequoiaDB',
    'TDengine': 'TDengine（时序）', '': '未分类',
    # JS 方向
    'Node-js': 'Node.js', 'TypeScript': 'TypeScript', 'JavaScript': 'JavaScript',
    '框架': '框架与 UI 库', '工具': '工具库', '图表': '数据可视化',
    '模板': '模板站', 'ECMAScript': 'ECMAScript/ES6', '微前端': '微前端',
    'vue': 'Vue 生态',
    # Linux 方向
    'Linux服务器开荒': '服务器开荒', 'shell': 'Shell 脚本',
    'Linux监控工具': '监控与面板', '服务器': '云服务器',
    '源-镜像仓库': '镜像源与仓库', '常用': '常用命令', '嵌入式': '嵌入式',
    '常用工具': '常用工具', 'TCP分析': '网络与 TCP', '树莓派': '树莓派',
    'RAID': 'RAID 与存储',
}

# 主题展示顺序（按方向配置，未列出的排最后）
THEME_ORDER = {
    'SQL': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis 与缓存', 'MyBatis',
            '数据库原理', 'SQL 语言', '分库分表与中间件', 'OLAP 与分析',
            'TiDB', 'NewSQL', 'ClickHouse', 'InfluxDB（时序）', 'TDengine（时序）'],
    'JS': ['JavaScript', 'ECMAScript/ES6', 'TypeScript', 'Node.js',
           '框架与 UI 库', 'Vue 生态', '微前端', '数据可视化', '工具库', '模板站'],
    'Linux': ['服务器开荒', 'Shell 脚本', '常用命令', '常用工具', '网络与 TCP',
              '监控与面板', '镜像源与仓库', 'RAID 与存储', '树莓派', '云服务器', '嵌入式'],
}

LEVEL_DESC = {
    'A': '高价值必读：官方文档、体系化深度长文，转写为知识库笔记的候选',
    'B': '有价值深读：具体技术主题的优质文章，按主题分组系统读',
    'C': '参考速查：安装、配置、单点技巧与排错，用到再查',
    'D': '低价值清理：错放、近似重复、低质量平台，建议整批清理',
}


def theme_of(item):
    """从书签路径提取主题：取首个一级子目录（如 MongoDB/PostgreSQL/缓存）"""
    parts = [p for p in item['path'].split('/') if p]
    # SQL 方向书签挂在「数据库相关」下，主题取其下一级
    if parts and parts[0] == '数据库相关':
        parts = parts[1:]
    key = parts[0] if parts else ''
    return THEME_NAMES.get(key, key or '未分类')


def theme_order_key_factory(direction):
    """主题排序：核心主题在前（按方向配置）"""
    order = THEME_ORDER.get(direction, [])

    def key(name):
        try:
            return order.index(name)
        except ValueError:
            return len(order)
    return key


def render(direction):
    data_path = ROOT / 'data' / f'{direction.lower()}.json'
    data = json.loads(data_path.read_text(encoding='utf-8'))
    items = data['items']
    stats = data['stats']

    lines = []
    lines.append('---')
    lines.append(f'title: {direction} 方向书签筛选清单')
    lines.append(f'description: {direction} 方向书签机器首轮分级（A{stats["A"]}·B{stats["B"]}·C{stats["C"]}·D{stats["D"]}），A 级为转写候选，B/C 按主题分组导航')
    lines.append('---')
    lines.append('')
    lines.append(f'# {direction} 方向书签筛选清单')
    lines.append('')
    lines.append(f'> 来源：浏览器书签 `方向/{direction}`（{data["total"]} 条，URL 去重后 {data["deduped"]} 条）。'
                 '机器首轮分级，**待人工校准**：A 级确认后再转写笔记，D 级确认后整批清理。')
    lines.append('')
    lines.append('## 概览')
    lines.append('')
    lines.append('| 级别 | 数量 | 说明 |')
    lines.append('|---|---|---|')
    for lv in 'ABCD':
        lines.append(f"| **{lv}** | {stats[lv]} | {LEVEL_DESC[lv]} |")
    lines.append('')

    # A 级转写候选
    a_items = [i for i in items if i['level'] == 'A']
    lines.append(f'## A 级 · 转写候选（{len(a_items)}）')
    lines.append('')
    lines.append('确认后逐篇转写为知识库笔记，转写完成的打勾：')
    lines.append('')
    for i in a_items:
        title = i['title'].replace('|', '｜')
        lines.append(f"- [ ] [{title}]({i['url']}) —— {i['reason']}")
    lines.append('')

    # B 级主题导航
    b_items = [i for i in items if i['level'] == 'B']
    lines.append(f'## B 级 · 主题导航（{len(b_items)}）')
    lines.append('')
    by_theme = defaultdict(list)
    for i in b_items:
        by_theme[theme_of(i)].append(i)
    for theme in sorted(by_theme, key=theme_order_key_factory(direction)):
        entries = by_theme[theme]
        lines.append(f'### {theme}（{len(entries)}）')
        lines.append('')
        for i in entries:
            title = i['title'].replace('|', '｜')
            lines.append(f'- [{title}]({i["url"]})')
        lines.append('')

    # C 级速查参考
    c_items = [i for i in items if i['level'] == 'C']
    lines.append(f'## C 级 · 速查参考（{len(c_items)}）')
    lines.append('')
    c_by_theme = defaultdict(list)
    for i in c_items:
        c_by_theme[theme_of(i)].append(i)
    for theme in sorted(c_by_theme, key=theme_order_key_factory(direction)):
        entries = c_by_theme[theme]
        lines.append(f'### {theme}（{len(entries)}）')
        lines.append('')
        for i in entries:
            title = i['title'].replace('|', '｜')
            lines.append(f'- [{title}]({i["url"]})')
        lines.append('')

    # D 级清理建议
    d_items = [i for i in items if i['level'] == 'D']
    lines.append(f'## D 级 · 清理建议（{len(d_items)}）')
    lines.append('')
    lines.append('确认后从浏览器书签中删除：')
    lines.append('')
    d_by_reason = defaultdict(list)
    for i in d_items:
        d_by_reason[i['reason']].append(i)
    for reason, entries in d_by_reason.items():
        lines.append(f'**{reason}（{len(entries)}）**')
        lines.append('')
        for i in entries:
            title = i['title'].replace('|', '｜')
            lines.append(f'- [{title}]({i["url"]})')
        lines.append('')

    out = ROOT / 'guide' / f'{direction.lower()}.mdx'
    out.parent.mkdir(exist_ok=True)
    out.write_text('\n'.join(lines), encoding='utf-8')
    print(f'渲染完成：{out}')
    print(f"A{stats['A']} · B{stats['B']} · C{stats['C']} · D{stats['D']}")


if __name__ == '__main__':
    render(sys.argv[1] if len(sys.argv) > 1 else 'SQL')