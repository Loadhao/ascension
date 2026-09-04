// 验证 Mermaid 全屏缩放查看器：按钮/打开/缩放/平移/双指/还原/主题/键盘
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ascension';
const PAGE = `${BASE}/linux/basic/commands/file-ops/`; // 大图：权限排查流程
const errors = [];
const browser = await chromium.launch();

const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.goto(PAGE, { waitUntil: 'networkidle' });

// —— 1. 按钮挂载：每张流程图一个 ——
const mount = await page.evaluate(() => {
  const wraps = [...document.querySelectorAll('.mmd-zoom-wrap')];
  return {
    wraps: wraps.length,
    svgsWrapped: wraps.filter((w) => w.querySelector('svg[id^="mermaid-"]')).length,
    buttons: wraps.filter((w) => w.querySelector('.mmd-fullscreen-btn')).length,
  };
});
console.log('1. mount:', mount);

// —— 2. 打开：覆盖层出现、svg 移入、滚动锁定、初始适屏 ——
await page.locator('.mmd-fullscreen-btn').first().click();
const opened = await page.evaluate(() => {
  const ov = document.querySelector('.mmd-viewer');
  const svg = ov?.querySelector('svg[id^="mermaid-"]');
  return {
    viewer: !!ov,
    role: ov?.getAttribute('role'),
    svgInside: !!svg,
    scrollLocked: document.documentElement.classList.contains('mmd-viewer-open'),
    pct: ov?.querySelector('.mmd-vpct')?.textContent,
    transform: ov?.querySelector('.mmd-viewer-stage')?.style.transform,
    naturalW: svg?.getAttribute('width'),
    focusedClose: document.activeElement?.getAttribute('aria-label'),
  };
});
console.log('2. open:', opened);

// —— 3. 工具栏缩放：+ 两次 → 100% 基准放大，− 回落 ——
const zoomBtns = await page.evaluate(() =>
  [...document.querySelectorAll('.mmd-vbtn')].map((b) => b.getAttribute('aria-label'))
);
console.log('   toolbar:', zoomBtns);
await page.locator('.mmd-vbtn[aria-label="放大"]').click();
await page.locator('.mmd-vbtn[aria-label="放大"]').click();
const zoomedIn = await page.evaluate(() => ({
  pct: document.querySelector('.mmd-vpct').textContent,
  transform: document.querySelector('.mmd-viewer-stage').style.transform,
}));
console.log('3. zoom in x2:', zoomedIn);
await page.locator('.mmd-vbtn[aria-label="适屏"]').click();
const fitted = await page.evaluate(() => document.querySelector('.mmd-vpct').textContent);
console.log('   fit:', fitted);

// —— 4. 滚轮缩放（锚点跟随光标） ——
await page.mouse.move(640, 420);
await page.mouse.wheel(0, -400);
const wheeled = await page.evaluate(() => ({
  pct: document.querySelector('.mmd-vpct').textContent,
  transform: document.querySelector('.mmd-viewer-stage').style.transform,
}));
console.log('4. wheel zoom:', wheeled);

// —— 5. 拖拽平移 ——
await page.mouse.move(640, 420);
await page.mouse.down();
await page.mouse.move(760, 500, { steps: 6 });
await page.mouse.up();
const panned = await page.evaluate(() => document.querySelector('.mmd-viewer-stage').style.transform);
console.log('5. pan:', panned);

// —— 6. 暗色主题下查看器内配色（脱离 .sl-markdown-content 仍应吃到暗色变量） ——
const themed = await page.evaluate(() => {
  const rect = document.querySelector('.mmd-viewer svg[id^="mermaid-"] .node rect');
  return getComputedStyle(rect).fill;
});
console.log('6. dark fill in viewer:', themed, '(期望 rgb(39, 32, 25))');

// 截图：暗色放大态
await page.locator('.mmd-viewer').screenshot({ path: 'scripts/shots/viewer-dark.png' });

// —— 7. Esc 关闭：DOM 还原（svg 回包装层、属性复原、滚动解锁、焦点交还） ——
await page.keyboard.press('Escape');
const closed = await page.evaluate(() => {
  const svg = document.querySelector('.sl-markdown-content svg[id^="mermaid-"]');
  return {
    viewerGone: !document.querySelector('.mmd-viewer'),
    svgBackInWrap: svg?.parentElement?.className === 'mmd-zoom-wrap',
    widthAttr: svg?.getAttribute('width'),
    styleAttr: svg?.getAttribute('style'),
    scrollUnlocked: !document.documentElement.classList.contains('mmd-viewer-open'),
    focusBack: document.activeElement?.className,
  };
});
console.log('7. esc close:', closed);

// —— 8. 双击进入 + 按钮关闭 ——
await page.locator('svg.flowchart').first().dblclick();
const viaDbl = await page.evaluate(() => !!document.querySelector('.mmd-viewer'));
await page.locator('.mmd-vbtn[aria-label="关闭 (Esc)"]').click();
const viaBtn = await page.evaluate(() => !document.querySelector('.mmd-viewer'));
console.log('8. dblclick open:', viaDbl, '/ btn close:', viaBtn);

// —— 9. 亮色主题 ——
await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
await page.locator('.mmd-fullscreen-btn').first().click();
const lightThemed = await page.evaluate(
  () => getComputedStyle(document.querySelector('.mmd-viewer svg[id^="mermaid-"] .node rect')).fill
);
console.log('9. light fill in viewer:', lightThemed, '(期望 rgb(246, 239, 227))');
await page.locator('.mmd-viewer').screenshot({ path: 'scripts/shots/viewer-light.png' });
await page.keyboard.press('Escape');

// —— 10. 移动端：按钮常显 + 双指捏合 ——
const mctx = await browser.newContext({
  colorScheme: 'dark',
  viewport: { width: 390, height: 780 },
  hasTouch: true,
  isMobile: true,
});
const mp = await mctx.newPage();
mp.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message));
await mp.goto(PAGE, { waitUntil: 'networkidle' });
const btnOpacity = await mp.evaluate(
  () => getComputedStyle(document.querySelector('.mmd-fullscreen-btn')).opacity
);
console.log('10. mobile btn opacity (期望 0.75):', btnOpacity);
await mp.locator('.mmd-fullscreen-btn').first().click();
const pinch = await mp.evaluate(() => {
  const stageWrap = document.querySelector('.mmd-viewer-stage-wrap');
  const fire = (type, id, x, y) =>
    stageWrap.dispatchEvent(
      new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, isPrimary: id === 1 })
    );
  const before = document.querySelector('.mmd-viewer-stage').style.transform;
  fire('pointerdown', 1, 120, 400);
  fire('pointerdown', 2, 270, 400);
  // 捏合张开：间距 150 → 300（放大 2x）
  for (let i = 1; i <= 5; i++) {
    const d = 150 + (150 * i) / 5;
    fire('pointermove', 1, 195 - d / 2, 400);
    fire('pointermove', 2, 195 + d / 2, 400);
  }
  fire('pointerup', 1, 120, 325);
  fire('pointerup', 2, 270, 475);
  return {
    before,
    after: document.querySelector('.mmd-viewer-stage').style.transform,
    pct: document.querySelector('.mmd-vpct').textContent,
  };
});
console.log('    pinch out:', pinch);
await mp.locator('.mmd-viewer').screenshot({ path: 'scripts/shots/viewer-mobile.png' });
await mctx.close();
await ctx.close();
await browser.close();

console.log('\nconsole errors:', errors.length ? errors : '无');
