// 全站一致性体检（8 项）：侧边栏死链 / 笔记未注册 / 图谱死链 / 图谱覆盖率 /
// 笔记内绝对内链 / frontmatter 必填 / level 与目录一致 / 空壳分类页。
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
    const raw = readFileSync(ROOT + '/' + f, 'utf8');
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
console.log('\n通过：8 项一致性体检全绿');
