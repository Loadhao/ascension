// 无人值守轮次的候选勘察器：一条命令算出四个车道的候选池与条数。
// 配方（docs/evolution-recipes.md）要求用它选题，不在文档里存清单——清单会过期。
// 用法：node scripts/evolution-candidates.mjs [--top 8] [--round n]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const { flowDemos } = await import(join(ROOT, 'src/data/viz/flows.ts'));
const { mediaAssets } = await import(join(ROOT, 'src/data/viz/media.ts'));

const noFigure = notes.filter((n) => !withFigure.has(n));
const noQuiz = notes.filter((n) => !quizNoteIds.has(n));
const bothGaps = noFigure.filter((n) => new Set(noQuiz).has(n));
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
	`\n>>> ${argRound === -1 ? '下一轮' : '游标核对（--round 覆盖，未读台账）'} = 第 ${next} 轮，${next} mod 5 = ${next % 5} → 车道 ${lane}`,
);
show('A 车道｜既无图又零题（价值最高，补一篇两种缺口都收）', bothGaps);
show('A 车道｜纯文字无图笔记', noFigure);
show('A 车道｜有图但零题笔记', noQuiz.filter((n) => withFigure.has(n)));
show('B 车道｜已有动画未出配音视频', videoQueue);
show('C 车道｜coverage-deepening 队列头部', quizQueue.map((l) => l.replace('- [ ] ', '')));
console.log('\nD 车道：跑 pnpm verify:docs 与 node scripts/mermaid-contrast-verify.mjs，输出即候选池（全绿则新增 2 条带证据候选入队）');
