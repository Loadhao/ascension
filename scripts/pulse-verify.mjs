// 验证呼吸节点动画：常规模式采样两时刻的 filter、reduced-motion 降级、峰值截图
import { chromium } from 'playwright';

const URL = 'http://localhost:4321/ascension/guide/diagrams/';
const browser = await chromium.launch();

// —— 常规模式：动画运行 + filter 随时间变化 ——
let ctx = await browser.newContext({ colorScheme: 'dark' });
let page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
const anim = await page.evaluate(() => {
  const el = document.querySelector('.node.pulse rect');
  if (!el) return { error: 'pulse rect not found' };
  const cs = getComputedStyle(el);
  return {
    name: cs.animationName,
    duration: cs.animationDuration,
    filter0: cs.filter,
  };
});
console.log('animation:', anim);

// 等到动画周期中段（2.4s 周期，峰值为 1.2s 处），采样 filter 变化
await page.waitForTimeout(1200);
const mid = await page.evaluate(() => getComputedStyle(document.querySelector('.node.pulse rect')).filter);
console.log('filter@1.2s:', mid);
await page.waitForTimeout(1200);
const back = await page.evaluate(() => getComputedStyle(document.querySelector('.node.pulse rect')).filter);
console.log('filter@2.4s:', back);

// —— 峰值截图：负 delay 相位偏移到 50% + 暂停 ——
await page.evaluate(() => {
  const style = document.createElement('style');
  style.textContent =
    '.node.pulse rect{animation-delay:-1.2s !important;animation-play-state:paused !important}';
  document.head.appendChild(style);
});
await page.waitForTimeout(100);
const svg = page.locator('svg[id^="mermaid-"]').filter({ has: page.locator('.node.pulse') });
await svg.screenshot({ path: 'scripts/shots/pulse-peak-dark.png' });
console.log('peak screenshot saved');
await ctx.close();

// —— 亮色峰值 ——
ctx = await browser.newContext({ colorScheme: 'light' });
page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  const style = document.createElement('style');
  style.textContent =
    '.node.pulse rect{animation-delay:-1.2s !important;animation-play-state:paused !important}';
  document.head.appendChild(style);
});
await page.waitForTimeout(100);
const svg2 = page.locator('svg[id^="mermaid-"]').filter({ has: page.locator('.node.pulse') });
await svg2.screenshot({ path: 'scripts/shots/pulse-peak-light.png' });
console.log('light peak screenshot saved');
await ctx.close();

// —— reduced-motion 降级 ——
ctx = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
const rm = await page.evaluate(() => {
  const el = document.querySelector('.node.pulse rect');
  const cs = getComputedStyle(el);
  return {
    name: cs.animationName,
    filter: cs.filter,
    strokeWidth: cs.strokeWidth,
  };
});
console.log('reduced-motion:', rm);
await ctx.close();

await browser.close();
