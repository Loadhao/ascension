// 全站一致性体检（11 项，编号 1–11，其中图谱结构记作 9）：侧边栏死链 / 笔记未注册 / 图谱死链 / 图谱覆盖率 /
// 笔记内绝对内链 / frontmatter 必填 / level 与目录一致 / 空壳分类页 /
// 图谱结构 / 图表与可视化数据硬编码颜色 / 容器指令写法与闭合。
// 任何一项失败输出清单并 exit 1；由 apex-project-evolution 例行运行，也可手动跑。
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'src/content/docs');
const LEVELS = new Set(['basic', 'intermediate', 'advanced']);

function resolveLink(url) {
  const rel = url.split('#')[0].split('?')[0].replace(/^\/+/, '');
  if (!rel) return true;
  return [
    'src/content/docs/' + rel + 'index.mdx',
    'src/content/docs/' + rel + 'index.md',
    'src/content/docs/' + rel.replace(/\/$/, '') + '.mdx',
    'src/content/docs/' + rel.replace(/\/$/, '') + '.md',
  ].some((c) => existsSync(ROOT + '/' + c));
}

const gitFiles = execSync('git ls-files src/content/docs', { cwd: ROOT, encoding: 'utf8' })
  .trim().split('\n');
const notes = gitFiles.filter((f) => /\.(md|mdx)$/.test(f) && !/index\.(md|mdx)$/.test(f) && !f.startsWith('src/content/docs/guide/'));
const indexes = gitFiles.filter((f) => /index\.(md|mdx)$/.test(f) && f !== 'src/content/docs/index.mdx');

const report = {};
{
  const cfg = readFileSync(ROOT + '/astro.config.mjs', 'utf8');
  const links = [...cfg.matchAll(/link: \x27([^\x27]+)\x27/g)].map((m) => m[1]);
  const dead = links.filter((l) => !resolveLink(l));
  report['1.侧边栏死链'] = { ok: dead.length === 0, detail: `共 ${links.length} 条`, bad: dead };
  const linkSet = new Set(links.map((l) => l.replace(/^\/+|\/+$/g, '')));
  const unreg = notes.map((f) => f.replace(/^src\/content\/docs\//, '').replace(/\.(md|mdx)$/, '')).filter((p) => !linkSet.has(p));
  report['2.笔记未注册侧边栏'] = { ok: unreg.length === 0, detail: `笔记 ${notes.length} 篇（guide 元文档豁免）`, bad: unreg };

  const graphHrefs = new Set();
  let graphDead = [];
  const dupIds = [];
  const danglingEdges = [];
  const dupEdges = new Set();
  const dupEdgesInfo = [];
  const connected = new Set();
  const allNodeIds = [];
  for (const g of readdirSync(ROOT + '/src/data/graphs').filter((f) => f.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(ROOT + '/src/data/graphs/' + g, 'utf8'));
    const ids = new Set();
    for (const n of d.nodes || []) {
      if (ids.has(n.id)) dupIds.push(`${g}: 节点 id 重复 "${n.id}"`);
      ids.add(n.id);
      allNodeIds.push(`${g}|${n.id}`);
      if (!n.href) continue;
      graphHrefs.add(n.href.replace(/^\/+|\/+$/g, ''));
      if (!resolveLink(n.href)) graphDead.push(`${g}:${n.label || n.id}->${n.href}`);
    }
    for (const e of d.edges || []) {
      connected.add(`${g}|${e.source}`);
      connected.add(`${g}|${e.target}`);
      const edgeKey = `${g}|${e.source}->${e.target}|${e.label || ''}`;
      if (dupEdges.has(edgeKey)) dupEdgesInfo.push(`${g}: 边重复 ${e.source}->${e.target}（${e.label || '无标签'}）`);
      dupEdges.add(edgeKey);
      if (!ids.has(e.source) || !ids.has(e.target)) {
        danglingEdges.push(`${g}: ${e.source}->${e.target}（端点不存在于节点表）`);
      }
    }
  }
  report['3.图谱死链'] = { ok: graphDead.length === 0, detail: '25+ 份图谱', bad: graphDead };
  const uncovered = notes.filter((f) => !graphHrefs.has(f.replace(/^src\/content\/docs\//, '').replace(/\.(md|mdx)$/, '')));
  report['4.图谱覆盖率'] = { ok: uncovered.length === 0, detail: `${((notes.length - uncovered.length) / notes.length * 100).toFixed(1)}%`, bad: uncovered };
  report['9.图谱结构（重复id/悬空边/重复边）'] = { ok: dupIds.length + danglingEdges.length + dupEdgesInfo.length === 0, detail: '节点唯一、边端点有效、边不重复', bad: [...dupIds, ...danglingEdges, ...dupEdgesInfo] };
  var orphanWarnings = allNodeIds.filter((id) => !connected.has(id));

  const brokenLinks = [];
  const fmIssues = [];
  const levelIssues = [];
  for (const f of notes) {
    // 归一行尾：Windows 上 git core.autocrlf=true 会把工作区检出为 CRLF（索引仍是 LF），
    // 下面按 \n 锚定的正则（frontmatter / mermaid 围栏）会整类失配——第 196 轮实测
    // frontmatter 假红 559 篇、mermaid 块假绿 0 块。读入即归一，两种检出都判真。
    const raw = readFileSync(ROOT + '/' + f, 'utf8').replace(/\r\n/g, '\n');
    const noCode = raw.replace(/^```[\s\S]*?^```/gm, '');
    let m;
    const re = /\[[^\]]*\]\((\/[^)]+)\)/g;
    while ((m = re.exec(noCode)) !== null) {
      const u = m[1].trim();
      if (!/^\/ascension\//.test(u) && !resolveLink(u)) brokenLinks.push(`${f.replace(/^src\/content\/docs\//, '')} -> ${u}`);
    }
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    const rel = f.replace(/^src\/content\/docs\//, '');
    if (!fm || !/^title: /m.test(fm[1]) || !/^description: /m.test(fm[1])) fmIssues.push(rel);
    else {
      const lm = fm[1].match(/^level: (.+)$/m);
      const dl = rel.split('/')[1];
      if (lm && LEVELS.has(dl) && lm[1] !== dl) levelIssues.push(`${rel} level=${lm[1]}`);
    }
  }
  report['5.笔记内绝对内链断链'] = { ok: brokenLinks.length === 0, detail: '已剔除代码块', bad: brokenLinks };
  report['6.frontmatter 必填'] = { ok: fmIssues.length === 0, detail: 'title/description', bad: fmIssues };
  report['7.level 与目录一致'] = { ok: levelIssues.length === 0, detail: 'basic/intermediate/advanced', bad: levelIssues };

  const emptyPages = [];
  for (const f of indexes) {
    const body = readFileSync(ROOT + '/' + f, 'utf8')
      .replace(/^---[\s\S]*?---/, '')
      .replace(/<CategoryNotesIsland[^>]*\/>/g, '')
      .replace(/<RoadmapIsland[^>]*\/>/g, '')
      .replace(/import .*$/gm, '')
      .replace(/[#`\s>*-]/g, '')
      .trim();
    if (!body) emptyPages.push(f.replace(/^src\/content\/docs\//, '').replace(/\/index\.(md|mdx)$/, ''));
  }
  report['8.空壳分类页'] = { ok: emptyPages.length === 0, detail: `${indexes.length} 个 index 页`, bad: emptyPages };
}

// 第 10 项：颜色一律由站点主题接管（AGENTS.md 硬约束）。
// mermaid 块内的 fill/color/hex 会被烘焙成行内 !important 压过 custom.css 的变量，
// 亮暗两主题必有一种浅底浅字；对比度审计量的是结果且要 preview 在跑，漏跑就静默入库，
// 这条在源码层直接禁——语义区分只用 good/bad/hl/rb-black/rb-red 五个语义类。
{
  const COLOR_RULES = [
    [/%%\{\s*init/i, '主题指令 %%{init}'],
    [/\b(?:fill|stroke|color|background)\s*:/i, 'CSS 颜色声明'],
    [/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/, '十六进制颜色'],
    [/\b(?:rgba?|hsla?)\s*\(/i, 'rgb/hsl 颜色函数'],
    [/\b(?:bgColor|fontColor|borderColor|strokeColor|color|fill|background)\s*:\s*['"`]/, '颜色字段写了字面量'],
  ];
  const hits = [];
  const scan = (rel, raw, lineOffsetOf = (i) => i + 1) => {
    raw.split('\n').forEach((ln, i) => {
      const hit = COLOR_RULES.find(([re]) => re.test(ln));
      if (hit) hits.push(`${rel}:${lineOffsetOf(i)} ${hit[1]}｜${ln.trim().slice(0, 60)}`);
    });
  };
  let mermaidBlocks = 0;
  const walkDocs = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walkDocs(p);
      else if (/\.(md|mdx)$/.test(name)) {
        const raw = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
        // 容忍列表项内缩进的围栏：这类块同样会被渲染成读者看到的 SVG，行首锚定会整块
        // 漏检（第 200 轮实测 567 vs 588 块，差 21 块分布在 2 个文件），漏检的块既不进
        // 本项配色审计也不进 mermaid-syntax-verify。
        const re = /^[ \t]*```mermaid\n([\s\S]*?)\n^[ \t]*```/gm;
        let m;
        while ((m = re.exec(raw)) !== null) {
          mermaidBlocks++;
          const start = raw.slice(0, m.index).split('\n').length;
          scan(p.replace(ROOT + '/', ''), m[1], (i) => start + i + 1);
        }
      }
    }
  };
  walkDocs(DOCS);
  const VIZ = join(ROOT, 'src/data/viz');
  const vizFiles = existsSync(VIZ) ? readdirSync(VIZ).filter((f) => f.endsWith('.ts')) : [];
  for (const f of vizFiles) {
    scan(`src/data/viz/${f}`, readFileSync(join(VIZ, f), 'utf8'));
  }
  report['10.图表与可视化数据硬编码颜色'] = {
    ok: hits.length === 0,
    detail: `mermaid ${mermaidBlocks} 块 + viz 数据 ${vizFiles.length} 份，配色归 custom.css 主题令牌`,
    bad: [...new Set(hits)],
  };
}

// 第 11 项：容器指令（提示框）的写法与闭合。第 214 轮实测「:::note 空格形标题」在
// 当时 26 项全绿下静默漏过、真机读 .starlight-aside 命中 0 才现形，故把这一类失效整体收进闸门。
// 三种形状各自有不同的失效后果，都在源码层可判：
// ① 标题写成空格形（:::note 标题）→ 指令不被识别，读者看到字面量 :::note；
// ② 容器名不在 Starlight 支持的四类里（实测站内有 :::warning、:::important）→ 走
//    transformUnhandledDirective 回退，框、图标与 aria-label 全丢，内容降级成无样式裸 div；
// ③ 开围栏缺对应的 ::: → 容器一直吞到文末，其后整节被包进提示框（第 215 轮 dist 实测
//    33 个方向首页的 :::tip[面试冲刺] 把「知识图谱」小标题与图谱组件一并吞了进去；
//    后续按用户指令「工具页顶部不留元说明框」把这些引流框整块删掉，该形态存量归零）。
// 四类依据 node_modules/@astrojs/starlight/dist/integrations/aside-utils.js 的 asideVariants
// （0.42.0 读到的就是 note/tip/caution/danger 四个，无别名映射），升 Starlight 时先复核该表。
// ④（第 239 轮并入）标题里的直双引号：remark 的 typographer 按前后字符判引号方向，`"` 前邻
// 是汉字或字母数字（既非空白也非标点）时判成闭引号，标题落进 dist 就是「这一页没写”整体关掉
// 观测”的开关」——本该朝内的开引号方向朝外。站内约定用「」（现算 1646 处／222 篇，中文弯引号
// 仅 6 处／3 篇），故一律改写成「」。正文侧同形状存量大（第 239 轮按渲染文本现算 1541 处／
// 415 篇），其处置路线待用户裁决、不在本闸门范围内，这里只守住「容器标题」这一档新增。
{
  const ASIDE_TYPES = new Set(['note', 'tip', 'caution', 'danger']);
  // 全站现算出的已知存量，已登记进 docs/evolution.md 候选表第 17/18 行待修。
  // 修掉或改写到不再命中时，下面「清单过期」那条会判红要求同步删项——
  // 既不放宽容差，也不允许清单静默过期（与 quiz-verify 第 9 项同款口径）。
  // 第 216 轮登记 38 处 → 第 221 轮销 2 处 → 第 233 轮销最后 3 处，现存量归零。
  const KNOWN = {};
  const violations = [];
  const scanned = { files: 0, opens: 0 };
  const walkAsides = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walkAsides(p);
      else if (!/\.(md|mdx)$/.test(name)) continue;
      else {
        scanned.files++;
        const rel = p.replace(ROOT + '/', '');
        const lines = readFileSync(p, 'utf8').replace(/\r\n/g, '\n').split('\n');
        let fence = null;
        const stack = [];
        lines.forEach((ln, i) => {
          // 代码围栏内的 ::: 是示例或 mermaid 的节点打标（A-->B:::good），不是容器指令。
          const cm = ln.match(/^[ \t]*(```|~~~)/);
          if (cm) {
            fence = fence ? null : cm[1];
            return;
          }
          if (fence) return;
          const om = ln.match(/^[ \t]*:::([a-zA-Z][a-zA-Z0-9_-]*)(.*)$/);
          if (om) {
            scanned.opens++;
            stack.push(i + 1);
            if (!ASIDE_TYPES.has(om[1])) violations.push(`${rel}:${i + 1}|容器名`);
            if (om[2] !== '' && om[2][0] !== '[') violations.push(`${rel}:${i + 1}|标题空格形`);
            // ④ 标题里写直双引号：typographer 会把「汉字后紧跟的 "」判成闭引号，
            //    标题落进 dist 就是 这一页没写”整体关掉观测”的开关 —— 开引号方向朝外。
            //    标题是加粗小标题、读者最先看到，故这一形状一并判红（站内约定改用「」）。
            if (om[2][0] === '[') {
              const close = om[2].indexOf(']');
              const title = close > 0 ? om[2].slice(1, close) : om[2].slice(1);
              if (title.includes('"')) violations.push(`${rel}:${i + 1}|标题直双引号`);
            }
            return;
          }
          if (/^[ \t]*:::[ \t]*$/.test(ln)) {
            if (stack.length) stack.pop();
            else violations.push(`${rel}:${i + 1}|多余闭围栏`);
          }
        });
        for (const l of stack) violations.push(`${rel}:${l}|未闭合`);
      }
    }
  };
  walkAsides(DOCS);
  const hit = new Set(violations);
  const fresh = violations.filter((v) => !KNOWN[v]);
  const stale = Object.keys(KNOWN).filter((k) => !hit.has(k));
  report['11.容器指令写法与闭合'] = {
    ok: fresh.length === 0 && stale.length === 0,
    detail: `${scanned.files} 篇扫出 ${scanned.opens} 个开围栏、${violations.length} 处不成立（其中已登记待修 ${Object.keys(KNOWN).length} 处）；容器名限 note/tip/caution/danger、标题须写成 name[标题]、开围栏须闭合、标题里不写直双引号（汉字后紧跟会被判成闭引号，一律改用「」）`,
    bad: [...fresh.map((v) => `新增违规 ${v}`), ...stale.map((k) => `存量清单过期、修好后须删项 ${k}`)],
  };
}

let failed = 0;
for (const [name, r] of Object.entries(report)) {
  console.log(`${r.ok ? '✓' : '✗'} ${name}（${r.detail}）${r.ok ? '' : ': ' + r.bad.join('; ')}`);
  if (!r.ok) failed++;
}
const orphans = orphanWarnings;
if (orphans.length) {
  console.log(`⚠ 孤立节点警告（无任何边连接，不阻塞）：${orphans.join('; ')}`);
}
if (failed) {
  console.log(`\n失败 ${failed} 项`);
  process.exit(1);
}
console.log(`\n通过：${Object.keys(report).length} 项一致性体检全绿`);
