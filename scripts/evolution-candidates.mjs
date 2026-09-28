// 无人值守轮次的候选勘察器：一条命令算出四个车道的候选池与条数。
// 配方（docs/evolution-recipes.md）要求用它选题，不在文档里存清单——清单会过期。
// 用法：node scripts/evolution-candidates.mjs [--top 8] [--round n]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'src/content/docs');
const argTop = process.argv.indexOf('--top');
const TOP = argTop === -1 ? 8 : Number(process.argv[argTop + 1]);

const git = (args) =>
	execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
// 真实笔记：五级架构下的 .md/.mdx，排除分类页与 guide 元文档
const notes = git([
	'ls-files',
	'src/content/docs/*/*/*/*.md',
	'src/content/docs/*/*/*/*.mdx',
])
	.filter((f) => !f.endsWith('/index.md') && !f.endsWith('/index.mdx') && !f.startsWith('src/content/docs/guide/'))
	.map((f) => f.replace(/^src\/content\/docs\//, '').replace(/\.mdx?$/, ''));
const withFigure = new Set(
	// 两个 -e 比 BRE 的 \| 更稳（BSD/GNU grep 行为一致）
	execFileSync('grep', ['-rl', '-e', '```mermaid', '-e', 'AlgorithmVizIsland', 'src/content/docs'], { cwd: ROOT, encoding: 'utf8' })
		.trim()
		.split('\n')
		.map((f) => f.replace(/^src\/content\/docs\//, '').replace(/\.mdx?$/, '')),
);
const quizNoteIds = new Set();
for (const f of readdirSync(join(ROOT, 'src/data/quiz'))) {
	for (const q of JSON.parse(readFileSync(join(ROOT, 'src/data/quiz', f), 'utf8')).questions) quizNoteIds.add(q.noteId);
}
// Windows 上 join() 出的是反斜杠绝对路径，ESM import() 只认 file:// URL（第 196 轮实测
// ERR_UNSUPPORTED_ESM_URL_SCHEME 'd:'），必须经 pathToFileURL 转换；POSIX 下行为不变。
const { flowDemos } = await import(pathToFileURL(join(ROOT, 'src/data/viz/flows.ts')).href);
const { mediaAssets } = await import(pathToFileURL(join(ROOT, 'src/data/viz/media.ts')).href);

const noFigure = notes.filter((n) => !withFigure.has(n));
const noQuiz = notes.filter((n) => !quizNoteIds.has(n));
const bothGaps = noFigure.filter((n) => new Set(noQuiz).has(n));
// A 车道两级兜底池里混着 `docs/content-roadmap.md` §4「已饱和清单」的点——配方 §2 明写
// 饱和主题一律不写、改为互链，而第 204 轮实测双缺 19 条的前 8 条全是它，每个 A 轮都得
// 人工比对一次。这里现读 §4 表格做标注：只改呈现、不改选题规则，落点清单不落进脚本。
const LEVELS = new Set(['basic', 'intermediate', 'advanced']);
// 「代表篇」列有三种写法：目录（`distributed/intermediate/case-studies/`、`zookeeper/*`）、
// 带扩展名的文件（`java/advanced/jvm/07-tuning.md`）、省掉等级段的简写（`redis/usage/03`，
// 真实落点是 `redis/intermediate/usage/03-distributed-lock.mdx`）。故比对时同时用全路径与
// 「去掉等级段的短路径」两种形态——只比全路径的话简写会静默不命中，标注就成了假绿。
const saturatedTopics = [];
for (const line of (readFileSync(join(ROOT, 'docs/content-roadmap.md'), 'utf8')
	.replace(/\r\n/g, '\n')
	.split('\n## ')
	.find((s) => s.startsWith('4.')) ?? '')
	.split('\n')) {
	if (!line.startsWith('|')) continue;
	const cells = line.split('|').map((c) => c.trim());
	if (cells.length < 4 || cells[2] === '代表篇' || /^-{3,}$/.test(cells[2])) continue;
	const tokens = [...cells[2].matchAll(/`([^`]+)`/g)].map((m) => {
		const raw = m[1];
		const dir = raw.endsWith('/') || /\/\*$/.test(raw);
		const file = /\.mdx?$/.test(raw);
		return { dir, file, stem: raw.replace(/\/\*$/, '').replace(/\/$/, '').replace(/\.mdx?$/, '') };
	});
	if (tokens.length) saturatedTopics.push({ label: cells[1], tokens });
}
const saturatedHits = saturatedTopics.reduce((s, t) => s + t.tokens.length, 0);
function covers(path, t) {
	if (t.dir) return path === t.stem || path.startsWith(t.stem + '/');
	if (t.file) return path === t.stem;
	return path === t.stem || path.startsWith(t.stem + '/') || path.startsWith(t.stem + '-');
}
const saturatedHit = (note) => {
	const segs = note.split('/');
	const forms = segs.length === 4 && LEVELS.has(segs[1]) ? [note, `${segs[0]}/${segs[2]}/${segs[3]}`] : [note];
	return saturatedTopics.find((t) => t.tokens.some((k) => forms.some((f) => covers(f, k))))?.label ?? '';
};
// 标注后仍按原顺序整池打印，饱和条目留在原位可见（过滤掉会让「这池有多少条」读不出来）
const annotate = (list) => {
	const hits = list.map((n) => saturatedHit(n));
	return {
		saturated: hits.filter(Boolean).length,
		lines: list.map((n, i) => (hits[i] ? `${n}  ← §4 已饱和：${hits[i]}` : n)),
	};
};
const videoQueue = Object.keys(flowDemos).filter((k) => !Object.values(mediaAssets).some((a) => a.source === k));
const quizQueue = readFileSync(join(ROOT, 'docs/coverage-deepening.md'), 'utf8')
	.split('\n')
	.filter((l) => l.startsWith('- [ ] '));
// 全局轮次真源：evolution.md 里最大轮次号
const rounds = [...readFileSync(join(ROOT, 'docs/evolution.md'), 'utf8').matchAll(/^### 第 (\d+) 轮/gm)].map((m) => Number(m[1]));
const argRound = process.argv.indexOf('--round');
if (argRound !== -1 && !Number.isInteger(Number(process.argv[argRound + 1]))) {
	console.error('--round 需要一个正整数轮次号');
	process.exit(2);
}
const next = argRound === -1 ? Math.max(...rounds) + 1 : Number(process.argv[argRound + 1]);
// 车道游标：与 docs/evolution-recipes.md §1 的 n mod 5 表逐格对齐。按余数显式建表，
// 不用位置数组——建档版 `['', 'A', 'B', 'C', 'B', 'D'][n % 5]` 把余数 4 打成 B、
// 余数 0 打成空白（第 194、195 轮实测），且配方改表时数组下标会静默错位。
const LANES = { 0: 'D 体检与工具', 1: 'A 新章节', 2: 'B 影像资产', 3: 'C 题库', 4: 'A 新章节' };
const lane = LANES[next % 5];

const show = (label, list) => {
	console.log(`\n${label}：${list.length} 条`);
	for (const x of list.slice(0, TOP)) console.log(`  ${x}`);
	if (list.length > TOP) console.log(`  …另 ${list.length - TOP} 条`);
};

console.log(`笔记 ${notes.length} 篇｜题库 ${quizNoteIds.size} 篇有题｜动画 ${Object.keys(flowDemos).length} 支｜影像 ${Object.keys(mediaAssets).length} 个`);
console.log(
	`§4 已饱和标注：解析出 ${saturatedTopics.length} 个主题 / ${saturatedHits} 个落点${
		saturatedTopics.length === 0 ? '  ⚠ 一条都没解析到，A 池标注已空转（roadmap §4 表格被改动？）' : ''
	}`,
);
console.log(
	`\n>>> ${argRound === -1 ? '下一轮' : '游标核对（--round 覆盖，未读台账）'} = 第 ${next} 轮，${next} mod 5 = ${next % 5} → 车道 ${lane}`,
);
const gapPool = annotate(bothGaps);
const textPool = annotate(noFigure);
show(`A 车道｜既无图又零题（价值最高，补一篇两种缺口都收）｜其中 §4 已饱和 ${gapPool.saturated} 条不可直取`, gapPool.lines);
show(`A 车道｜纯文字无图笔记｜其中 §4 已饱和 ${textPool.saturated} 条不可直取`, textPool.lines);
show('A 车道｜有图但零题笔记', noQuiz.filter((n) => withFigure.has(n)));
show('B 车道｜已有动画未出配音视频', videoQueue);
show('C 车道｜coverage-deepening 队列头部', quizQueue.map((l) => l.replace('- [ ] ', '')));
console.log('\nD 车道：跑 pnpm verify:docs 与 node scripts/mermaid-contrast-verify.mjs，输出即候选池（全绿则新增 2 条带证据候选入队）');
