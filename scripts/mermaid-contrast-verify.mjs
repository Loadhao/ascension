// 全站 Mermaid 双主题对比度审计：对 dist 中所有含图页面，在暗/亮主题下
// 计算节点文字与节点填充、连线标签文字与标签底色的 WCAG 对比度，
// 低于 4.5:1 即报告（图表禁止硬编码颜色的守护脚本，先 pnpm preview 再运行）。
import { chromium } from 'playwright';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://localhost:4321/ascension/';
const DIST = 'dist';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (name === 'index.html' && readFileSync(p, 'utf8').includes('class="node ')) out.push(p);
  }
  return out;
}

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

const pages = walk(DIST).map((p) => BASE + p.replace(/^dist\//, '').replace(/index\.html$/, ''));
console.log(`审计 ${pages.length} 个含图页面 × 2 主题`);

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
for (let i = 0; i < pages.length; i++) {
  if (!(await gotoWithRetry(pages[i]))) {
    skipped.push(pages[i]);
    console.log(`  ⚠ 跳过（连续超时）：${pages[i]}`);
    continue;
  }
  for (const theme of ['dark', 'light']) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const issues = await page.evaluate(audit);
    if (issues.length) {
      bad.push({ page: pages[i], theme, issues: issues.slice(0, 5) });
      total += issues.length;
    }
  }
  if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${pages.length}`);
}
await browser.close();
if (skipped.length) console.log(`跳过 ${skipped.length} 页（导航连续超时，需人工复核）：\n  ${skipped.join('\n  ')}`);
console.log(total === 0 ? '通过：所有图表双主题对比度 ≥ 4.5:1' : `不通过：低对比文字 ${total} 处，页面/主题组合 ${bad.length} 组`);
for (const b of bad.slice(0, 20)) console.log(JSON.stringify(b));
process.exit(total === 0 ? 0 : 1);
