// 截取全屏按钮新样式：露出态 / hover 态（亮暗），以及查看器工具栏
import { chromium } from 'playwright';

const PAGE = 'http://localhost:4321/ascension/linux/basic/commands/file-ops/';
const browser = await chromium.launch();

for (const scheme of ['dark', 'light']) {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(PAGE, { waitUntil: 'networkidle' });
  // 站点主题由 data-theme + localStorage 驱动（默认暗），colorScheme 不生效，手动切换
  await page.evaluate(() => (document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  if (scheme === 'dark') await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));

  const wrap = page.locator('.mmd-zoom-wrap').first();
  const btn = page.locator('.mmd-fullscreen-btn').first();

  // 1) 露出态：hover 图表区域让按钮浮现（未 hover 按钮）
  await wrap.hover({ position: { x: 40, y: 40 } });
  await page.waitForTimeout(350);
  const idle = await btn.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { border: cs.borderColor, bg: cs.backgroundColor, blur: cs.backdropFilter, transform: cs.transform };
  });
  console.log(`${scheme} idle :`, JSON.stringify(idle));
  await wrap.screenshot({ path: `scripts/shots/btn-idle-${scheme}.png` });

  // 2) hover 态：琥珀描边 + 辉光
  await btn.hover();
  await page.waitForTimeout(350);
  const hover = await btn.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { border: cs.borderColor, color: cs.color, shadow: cs.boxShadow.slice(0, 60) };
  });
  console.log(`${scheme} hover :`, JSON.stringify(hover));
  await page.locator('.mmd-zoom-wrap').first().screenshot({ path: `scripts/shots/btn-hover-${scheme}.png` });

  // 3) 查看器工具栏：毛玻璃分组 + hover 按钮
  await btn.click();
  await page.waitForTimeout(300);
  await page.locator('.mmd-vbtn[aria-label="放大"]').hover();
  await page.waitForTimeout(250);
  const vbtn = await page.evaluate(() => {
    const el = document.querySelector('.mmd-vbtn[aria-label="放大"]');
    const cs = getComputedStyle(el);
    const grp = getComputedStyle(el.closest('.mmd-vgrp'));
    return { bg: cs.backgroundColor, color: cs.color, grpBorder: grp.borderColor, grpBlur: grp.backdropFilter };
  });
  console.log(`${scheme} vbtn  :`, JSON.stringify(vbtn));
  await page.locator('.mmd-viewer-bar').screenshot({ path: `scripts/shots/viewer-bar-${scheme}.png` });
  await page.keyboard.press('Escape');
  await ctx.close();
}

await browser.close();
console.log('done');
