// 全站 Mermaid 语法校验：提取 src/content/docs 下所有 ```mermaid 围栏块，
// 在无头浏览器中用项目同版本 mermaid.parse 逐块校验。
// 背景：rehype-mermaid 构建时静默吞掉语法错误（正文整页丢失、构建仍成功），
// 本脚本是语法守护：失败清单 + exit 1（勿删，每轮内容变更后运行）。
import { chromium } from 'playwright';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'src/content/docs');
const MERMAID_UMD = join(ROOT, 'node_modules/mermaid/dist/mermaid.min.js');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(md|mdx)$/.test(name)) out.push(p);
  }
  return out;
}

const blocks = [];
for (const file of walk(DOCS)) {
  const raw = readFileSync(file, 'utf8');
  const re = /^```mermaid\n([\s\S]*?)\n^```/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const line = raw.slice(0, m.index).split('\n').length;
    blocks.push({ file: file.replace(ROOT + '/', ''), line, code: m[1] });
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({ path: MERMAID_UMD });
const failures = await page.evaluate(async (blocks) => {
  const mermaid = window.mermaid;
  mermaid.initialize({ startOnLoad: false });
  const bad = [];
  for (const b of blocks) {
    try {
      await mermaid.parse(b.code);
    } catch (err) {
      bad.push({ ...b, error: String(err?.message || err).split('\n')[0].slice(0, 160) });
    }
  }
  return bad;
}, blocks);
await browser.close();

console.log(`Mermaid 语法校验：${blocks.length} 个图块`);
if (failures.length) {
  for (const f of failures) console.log(`  ✗ ${f.file}:${f.line} — ${f.error}`);
  console.log(`失败 ${failures.length} 处`);
  process.exit(1);
}
console.log('通过：全部图块语法有效');
