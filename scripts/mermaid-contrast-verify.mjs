// 全站 Mermaid 双主题对比度审计：对 dist 中所有含图页面，在暗/亮主题下
// 计算节点文字与节点填充、连线标签文字与标签底色的 WCAG 对比度，
// 低于 4.5:1 即报告（图表禁止硬编码颜色的守护脚本，先 pnpm preview 再运行）。
// 自校验（第 181 轮加）：并行会话重建 dist 时本脚本会读到半清空目录而静默漏页
// （第 175 轮实测只审计到 66 页，真实 385 页），故审计前先拿内容树的带图笔记数
// 校验 dist 完整性，审计后再复核页面体积未变；两种情况任一不满足即 exit 1，
// 宁可报「读数不可信」，不报「0 处低对比」。
import { chromium } from 'playwright';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://localhost:4321/ascension/';
const DIST = 'dist';
const DOCS = 'src/content/docs';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 期望集：内容树里带 mermaid 围栏的 .md/.mdx，每个恰好渲染成一个页面。
// 这里刻意放宽行首缩进（列表项内嵌的围栏同样会被渲染），而 consistency-verify
// 与 mermaid-syntax-verify 用的是行首锚定正则——已实测漏掉 2 块，见 evolution.md 候选表。
const expectedPages = () => {
  const re = /^[ \t]*```mermaid\n([\s\S]*?)\n^[ \t]*```/gm;
  const out = new Set();
  for (const p of walk(DOCS)) {
    if (!/\.(md|mdx)$/.test(p)) continue;
    re.lastIndex = 0;
    if (!re.test(readFileSync(p, 'utf8'))) continue;
    const rel = p.slice(DOCS.length + 1).replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
    out.add(rel.endsWith('/index') ? rel.slice(0, -'/index'.length) : rel);
  }
  return out;
};

// 只把「渲染出节点文字」的页面纳入审计（页面含 class="node 前缀），但顺带记录
// 所有渲染出 mermaid SVG 的页面，供下面的自校验比对。
const scanned = walk(DIST)
  .filter((p) => p.endsWith('index.html'))
  .map((p) => {
    const text = readFileSync(p, 'utf8');
    const rel = p.slice(DIST.length + 1).replace(/\/index\.html$/, '').replace(/\\/g, '/');
    return {
      file: p,
      rel,
      svg: text.includes('id="mermaid-'),
      auditable: text.includes('class="node '),
      size: statSync(p).size,
    };
  });
const distSvg = scanned.filter((e) => e.svg);
const pages = distSvg.filter((e) => e.auditable);
const expected = expectedPages();
const distSvgRels = new Set(distSvg.map((e) => e.rel));
const missing = [...expected].filter((rel) => !distSvgRels.has(rel));
const stale = distSvg.filter((e) => !expected.has(e.rel));
const uncovered = distSvg.filter((e) => !e.auditable);

console.log(`审计 ${pages.length} 个含图页面 × 2 主题（内容树带图笔记 ${expected.size} 篇 / dist 渲染出图 ${distSvg.length} 页）`);
if (missing.length) {
  console.log(`✗ dist 残缺或落后于内容树：${missing.length} 篇带图笔记在 dist 里没有渲染出 mermaid SVG`);
  for (const rel of missing.slice(0, 10)) console.log(`    缺：${rel}`);
  console.log('    常见成因：并行会话正在重建 dist，或构建后内容树又有新增。此刻的「0 处低对比」是假阴性——先重跑 pnpm build 再审计。');
  process.exit(1);
}
if (stale.length) console.log(`  ⚠ dist 里有 ${stale.length} 个带图页面在内容树找不到对应围栏（构建比内容旧，或围栏写法特殊）：${stale.slice(0, 5).map((e) => e.rel).join(', ')}`);
if (uncovered.length) console.log(`  ⚠ ${uncovered.length} 页含 mermaid SVG 但审计的节点/连线文字选择器不覆盖（序列图、饼图等），本轮未判定：${uncovered.slice(0, 8).map((e) => e.rel).join(', ')}${uncovered.length > 8 ? ' …' : ''}`);

const audit = () => {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (s) => (s.match(/\d+(\.\d+)?/g) || [0, 0, 0]).slice(0, 3).map(Number);
  const ratio = (a, b) => {
    const [l1, l2] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const out = [];
  const texts = document.querySelectorAll("svg[id^='mermaid-'] g.node span.nodeLabel, svg[id^='mermaid-'] g.node text");
  for (const t of texts) {
    const c = getComputedStyle(t).color;
    // 节点文字的底色只看节点形状本身（不沿 DOM 穿透到页面背景）
    const node = t.closest('g.node');
    const shape = node?.querySelector('rect, circle, ellipse, polygon, path:not(.marker):not([class*="arrow"])');
    const bg = shape ? getComputedStyle(shape).fill : null;
    if (!bg || bg.includes('none')) continue;
    const r = ratio(c, bg);
    if (r < 4.5) out.push({ sel: node?.id || 'node', text: (t.textContent || '').trim().slice(0, 24), fg: c, bg, r: +r.toFixed(2) });
  }
  // 连线标签：span 颜色 vs 标签底
  for (const el of document.querySelectorAll("svg[id^='mermaid-'] .edgeLabel")) {
    const span = el.querySelector('span, p');
    if (!span) continue;
    const c = getComputedStyle(span).color;
    const rect = el.querySelector('rect');
    let bg = rect ? getComputedStyle(rect).fill : getComputedStyle(el).backgroundColor;
    if (!bg || bg.includes('none')) bg = getComputedStyle(el).backgroundColor;
    if (!bg || bg.includes('none') || bg.includes('0, 0, 0, 0')) continue;
    const r = ratio(c, bg);
    if (r < 4.5) out.push({ sel: 'edgeLabel', text: (span.textContent || '').trim().slice(0, 24), fg: c, bg, r: +r.toFixed(2) });
  }
  return out;
};

const targets = pages.map((e) => ({ url: BASE + (e.rel ? e.rel + '/' : ''), file: e.file, size: e.size }));

const browser = await chromium.launch();
const page = await browser.newPage();
let total = 0, bad = [];
const skipped = [];
async function gotoWithRetry(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      return true;
    } catch (err) {
      if (attempt === 3) return false;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}
for (let i = 0; i < targets.length; i++) {
  if (!(await gotoWithRetry(targets[i].url))) {
    skipped.push(targets[i].url);
    console.log(`  ⚠ 跳过（连续超时）：${targets[i].url}`);
    continue;
  }
  for (const theme of ['dark', 'light']) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const issues = await page.evaluate(audit);
    if (issues.length) {
      bad.push({ page: targets[i].url, theme, issues: issues.slice(0, 5) });
      total += issues.length;
    }
  }
  if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${targets.length}`);
}
await browser.close();
// 审计期间 dist 被并行构建改写 → 读过的页面可能已不是当前产物，结论不可信
const rewritten = targets.filter((t) => {
  try {
    return statSync(t.file).size !== t.size;
  } catch {
    return true;
  }
});
if (rewritten.length) {
  console.log(`✗ 审计期间 dist 被改写：${rewritten.length} 个页面体积变化或已消失（${rewritten.slice(0, 5).map((t) => t.file).join(', ')}…），本次结论不可信`);
  process.exit(1);
}
if (skipped.length) console.log(`跳过 ${skipped.length} 页（导航连续超时，需人工复核）：\n  ${skipped.join('\n  ')}`);
const clean = total === 0 && skipped.length === 0;
console.log(
  clean
    ? `通过：${targets.length} 页 × 2 主题所有图表双主题对比度 ≥ 4.5:1`
    : `不通过：低对比文字 ${total} 处，页面/主题组合 ${bad.length} 组${skipped.length ? `，另有 ${skipped.length} 页未审计到（结论不完整）` : ''}`,
);
for (const b of bad.slice(0, 20)) console.log(JSON.stringify(b));
process.exit(clean ? 0 : 1);
