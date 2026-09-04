// 校验 Mermaid 图表在亮/暗两档下的计算样式是否符合暖琥珀变量
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ascension';

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/java/jvm/memory/`, { waitUntil: 'networkidle' });
  const checks = await page.evaluate(() => {
    const get = (sel, prop) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el)[prop] : '(missing)';
    };
    return {
      nodeFill: get('.node rect', 'fill'),
      nodeStroke: get('.node rect', 'stroke'),
      nodeText: get('.node .label', 'color'),
      clusterFill: get('.cluster rect', 'fill'),
      clusterText: get('.cluster-label span', 'color'),
      actorFill: get('.actor', 'fill'),
      actorText: get('text.actor tspan', 'fill'),
      noteFill: get('.note', 'fill'),
      messageLine: get('.messageLine0', 'stroke'),
      edgeLabelBg: get('.edgeLabel', 'background-color'),
      svgMargin: get('svg[id^="mermaid-"]', 'margin'),
      nodeShadow: get('.node rect', 'filter'),
    };
  });
  console.log(`\n=== ${scheme} ===`);
  for (const [k, v] of Object.entries(checks)) console.log(`${k.padEnd(14)} ${v}`);
  await ctx.close();
}
await browser.close();
