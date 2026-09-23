// 自测题库体检（8 项）：方向对应 / JSON 结构 / id 唯一 / noteId 可达 / difficulty /
// type 与选项形态 / answer 下标 / hint 可用。
// 题目只被 QuizIsland 按文件名当方向加载，noteId 只在「查看完整笔记」链接里用一次，
// 写错不会构建失败也不会报错，只会静默 404——所以必须静态卡住。
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUIZ = join(ROOT, 'src/data/quiz');
const DOCS = join(ROOT, 'src/content/docs');
const TYPES = new Set(['single', 'multiple', 'judge']);
const JUDGE_OPTIONS = ['正确', '错误'];

const files = readdirSync(QUIZ).filter((f) => f.endsWith('.json'));
const bank = [];
const report = {};
const parseFail = [];

for (const f of files) {
	let raw;
	try {
		raw = JSON.parse(readFileSync(join(QUIZ, f), 'utf8'));
	} catch (e) {
		parseFail.push(`${f}: ${e.message.split('\n')[0]}`);
		continue;
	}
	const qs = raw.questions;
	if (!Array.isArray(qs)) {
		parseFail.push(`${f}: 顶层缺 questions 数组`);
		continue;
	}
	for (const [i, q] of qs.entries()) bank.push({ file: f, i, q });
}

{
	const dirs = new Set(readdirSync(DOCS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name));
	const bad = files.filter((f) => !dirs.has(f.replace(/\.json$/, ''))).map((f) => `${f} 不是任何方向的目录名（不会出现在作答页）`);
	report['1.题库文件对应真实方向'] = { ok: bad.length === 0, detail: `${files.length} 个题库文件`, bad };
}

{
	report['2.题库 JSON 可解析'] = {
		ok: parseFail.length === 0,
		detail: `共 ${bank.length} 题`,
		bad: parseFail,
	};
}

{
	const seen = new Map();
	const bad = [];
	for (const { file, i, q } of bank) {
		if (typeof q.id !== 'string' || !q.id.trim()) bad.push(`${file}#${i}: id 缺失`);
		else if (seen.has(q.id)) bad.push(`id 重复 ${q.id}（${seen.get(q.id)} 与 ${file}）`);
		else seen.set(q.id, file);
	}
	report['3.题目 id 全局唯一'] = { ok: bad.length === 0, detail: `${seen.size} 个 id`, bad };
}

{
	const resolve = (noteId) => {
		if (typeof noteId !== 'string' || !noteId.trim()) return false;
		const rel = noteId.replace(/^\/+|\/+$/g, '');
		return [`${rel}.md`, `${rel}.mdx`, `${rel}/index.mdx`, `${rel}/index.md`].some((c) => existsSync(join(DOCS, c)));
	};
	const bad = bank.filter(({ q }) => !resolve(q.noteId)).map(({ file, i, q }) => `${file}#${i}「${q.id}」→ ${q.noteId}`);
	report['4.noteId 指向真实笔记'] = { ok: bad.length === 0, detail: '写错只会静默 404', bad };
}

{
	const bad = [];
	for (const { file, i, q } of bank) {
		if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 5)
			bad.push(`${file}#${i}「${q.id}」difficulty=${JSON.stringify(q.difficulty)}`);
	}
	report['5.difficulty 为 1~5 整数'] = { ok: bad.length === 0, detail: `${bank.length} 题`, bad };
}

{
	const bad = [];
	for (const { file, i, q } of bank) {
		if (!TYPES.has(q.type)) bad.push(`${file}#${i}「${q.id}」type=${JSON.stringify(q.type)}`);
		if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 5)
			bad.push(`${file}#${i}「${q.id}」选项数 ${q.options?.length}`);
		else if (q.options.some((o) => typeof o !== 'string' || !o.trim())) bad.push(`${file}#${i}「${q.id}」有空选项`);
		if (q.type === 'judge' && JSON.stringify(q.options) !== JSON.stringify(JUDGE_OPTIONS))
			bad.push(`${file}#${i}「${q.id}」判断题选项必须是 ${JUDGE_OPTIONS.join('/')}`);
		if (typeof q.q !== 'string' || !q.q.trim()) bad.push(`${file}#${i}「${q.id}」题干为空`);
	}
	report['6.type 与选项形态'] = { ok: bad.length === 0, detail: 'single/multiple/judge，选项 2~5 项', bad };
}

{
	const bad = [];
	for (const { file, i, q } of bank) {
		const a = q.answer;
		const n = Array.isArray(q.options) ? q.options.length : 0;
		if (!Array.isArray(a) || a.length === 0) bad.push(`${file}#${i}「${q.id}」answer 缺失`);
		else {
			const oob = a.filter((x) => !Number.isInteger(x) || x < 0 || x >= n);
			if (oob.length) bad.push(`${file}#${i}「${q.id}」answer 下标越界 ${JSON.stringify(a)}（选项 ${n}）`);
			if (new Set(a).size !== a.length) bad.push(`${file}#${i}「${q.id}」answer 重复 ${JSON.stringify(a)}`);
			if (q.type === 'single' && a.length !== 1) bad.push(`${file}#${i}「${q.id}」单选题答案应恰好 1 个`);
			if (q.type === 'multiple' && a.length < 2) bad.push(`${file}#${i}「${q.id}」多选题答案应 ≥2 个`);
			if (q.type === 'judge' && a.length !== 1) bad.push(`${file}#${i}「${q.id}」判断题答案应恰好 1 个`);
		}
	}
	report['7.answer 下标与题型自洽'] = { ok: bad.length === 0, detail: '不越界、不重复、数量匹配题型', bad };
}

{
	const bad = [];
	for (const { file, i, q } of bank) {
		if (typeof q.hint !== 'string' || q.hint.trim().length < 8) bad.push(`${file}#${i}「${q.id}」hint 缺失或过短`);
	}
	report['8.hint 讲解可用'] = { ok: bad.length === 0, detail: '每题必须有讲解（答错只看到 hint）', bad };
}

let failed = 0;
for (const [name, r] of Object.entries(report)) {
	console.log(`${r.ok ? '✓' : '✗'} ${name}（${r.detail}）${r.ok ? '' : ': ' + r.bad.slice(0, 8).join('; ')}${r.bad.length > 8 ? ` …共 ${r.bad.length} 处` : ''}`);
	if (!r.ok) failed++;
}
if (failed) {
	console.log(`\n失败 ${failed} 项`);
	process.exit(1);
}
console.log(`\n通过：${Object.keys(report).length} 项题库体检全绿（${bank.length} 题）`);
