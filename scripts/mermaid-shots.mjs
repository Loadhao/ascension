// 截取 Mermaid 图表亮/暗两版效果：pnpm preview 需已在 4321 端口运行
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4321/ascension';
const PAGES = [
  ['jvm-memory', `${BASE}/java/jvm/memory/`],
  ['file-ops', `${BASE}/linux/basics/file-ops/`],
  ['guide-diagrams', `${BASE}/guide/diagrams/`],
];

mkdirSync('scripts/shots', { recursive: true });

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  for (const [name, url] of PAGES) {
    await page.goto(url, { waitUntil: 'networkidle' });
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    const svgs = page.locator('svg[id^="mermaid-"]');
    const n = await svgs.count();
    for (let i = 0; i < n; i++) {
      // 脑图等在 Tabs 内的图可能不可见，跳过
      if (!(await svgs.nth(i).isVisible())) continue;
      await svgs.nth(i).screenshot({ path: `scripts/shots/${name}-${i}-${scheme}.png` });
    }
    // 整页上下文图
    await page.screenshot({
      path: `scripts/shots/${name}-page-${scheme}.png`,
      fullPage: true,
    });
    console.log(`${scheme} [${theme}] ${name}: ${n} svg`);
  }
  await ctx.close();
}
await browser.close();
