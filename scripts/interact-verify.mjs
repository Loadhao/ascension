// 验证 Mermaid 悬停交互：节点/子图 hover 高亮、点击固定、链路正确性、控制台无错误
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/ascension';
const browser = await chromium.launch();
const errors = [];

const run = async (scheme) => {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const page = await ctx.newPage();
  page.on('console', (msg) => msg.type() === 'error' && errors.push(`[${scheme}] ${msg.text()}`));
  page.on('pageerror', (err) => errors.push(`[${scheme}] pageerror: ${err.message}`));

  // —— 1. file-ops：hover 决策节点 B，验证关联链路 ——
  await page.goto(`${BASE}/linux/basic/commands/file-ops/`, { waitUntil: 'networkidle' });
  const svg = page.locator('svg.flowchart').first();

  const onClasses = (sel) =>
    page.evaluate((s) => {
      const svg = document.querySelector('svg.flowchart');
      return {
        focus: svg.classList.contains('mmd-focus'),
        on: [...svg.querySelectorAll(s)].filter((el) => el.classList.contains('mmd-on')).map((el) => el.id || el.dataset.id),
      };
    }, sel);

  console.log(`\n=== ${scheme}: file-ops ===`);
  await page.locator('g.node[id*="flowchart-B-"]').hover();
  console.log('hover B → nodes on :', await onClasses('g.node'));
  console.log('hover B → edges on :', await onClasses('path.flowchart-link'));
  console.log('hover B → labels on:', await onClasses('g.edgeLabel'));

  // 截图（暗色下高亮态）
  await svg.screenshot({ path: `scripts/shots/interact-hover-${scheme}.png` });

  // —— 2. 点击固定：移开鼠标后焦点保持；点空白解除 ——
  await page.locator('g.node[id*="flowchart-B-"]').click();
  await page.mouse.move(5, 5);
  const pinned = await page.evaluate(() => {
    const svg = document.querySelector('svg.flowchart');
    return { focus: svg.classList.contains('mmd-focus'), onCount: svg.querySelectorAll('.mmd-on').length };
  });
  console.log('pin B (mouse away) :', pinned);
  await svg.click({ position: { x: 2, y: 2 } });
  const unpinned = await page.evaluate(() => {
    const svg = document.querySelector('svg.flowchart');
    return { focus: svg.classList.contains('mmd-focus'), onCount: svg.querySelectorAll('.mmd-on').length };
  });
  console.log('click empty →      :', unpinned);

  // —— 3. jvm-memory：hover 子图「Private」（簇中心被节点遮挡，改用簇标题），验证内部节点高亮 ——
  await page.goto(`${BASE}/java/advanced/jvm/memory/`, { waitUntil: 'networkidle' });
  await page.locator('g.cluster#mermaid-0-Private .cluster-label').hover();
  const clusterState = await page.evaluate(() => {
    const svg = document.querySelector('svg.flowchart');
    return {
      focus: svg.classList.contains('mmd-focus'),
      onNodes: [...svg.querySelectorAll('g.node.mmd-on')].map((el) => el.id.match(/flowchart-(.*)-\d+$/)?.[1]),
      offNodes: [...svg.querySelectorAll('g.node:not(.mmd-on)')].map((el) => el.id.match(/flowchart-(.*)-\d+$/)?.[1]),
    };
  });
  console.log(`\n=== ${scheme}: jvm cluster hover ===`);
  console.log(clusterState);
  await page.locator('svg.flowchart').first().screenshot({ path: `scripts/shots/interact-cluster-${scheme}.png` });

  // —— 4. guide：click 链接节点存在且 hover 正常（xlink:href 为命名空间属性，不用 [href] 选择器） ——
  await page.goto(`${BASE}/guide/diagrams/`, { waitUntil: 'networkidle' });
  const linkNode = page.locator('svg.flowchart a g.node');
  const linkState = await page.evaluate(() => {
    const a = document.querySelector('svg.flowchart a');
    if (!a) return { exists: false };
    const g = a.querySelector('g.node');
    return {
      exists: true,
      href: a.getAttribute('xlink:href') || a.getAttribute('href'),
      node: g?.id,
      clickable: g?.classList.contains('clickable'),
      tooltip: g?.getAttribute('title'),
    };
  });
  console.log(`\n=== ${scheme}: click link ===`);
  console.log(linkState);
  // hover 该节点也应高亮
  await linkNode.hover();
  const linkHover = await page.evaluate(() => {
    const svg = document.querySelector('svg.flowchart a')?.closest('svg');
    return { focus: svg?.classList.contains('mmd-focus'), on: svg?.querySelectorAll('g.node.mmd-on').length };
  });
  console.log('hover linked node  :', linkHover);

  await ctx.close();
};

await run('dark');
await run('light');
await browser.close();
console.log('\nconsole errors:', errors.length ? errors : '无');
