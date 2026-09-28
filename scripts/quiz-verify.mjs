// 自测题库体检（9 项）：方向对应 / JSON 结构 / id 唯一 / noteId 可达 / difficulty /
// type 与选项形态 / answer 下标 / hint 可用 / 同篇题对考点重合。
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

{
	// —— 第 9 项：同一篇笔记的两题是否把同一个考点讲了两遍 ——
	// 起因（第 208 轮车道 C 实测）：给同一篇笔记补第二题时最容易把首题已经答过的那句再抄
	// 一遍，而 hint 天生要复述答案，撞车面比选项宽得多——当时队列头部 5 条里 4 条撞车，全靠
	// 人工逐条读「首题选项 + 首题 hint」双清单判出来。本项把那次人工复算固化成闸门。
	// 定线口径（第 210 轮全站 221 个同篇题对现算）：
	// · 只量中文散文：ASCII 标识符与代码在同篇两题里重复出现是正常讨论。实测保留 ASCII 后
	//   ≥16 字的题对有 19 对，其中 13 对纯由标识符贡献（discardReadBytes、default_factory 等），
	//   先删非汉字后剩 6 对、且全是整句复述——故归一化只保留 CJK。
	// · 判红只看考点陈述所在的字段：正确项↔正确项 ≥12（同一答案白刷两遍，全站现算仅 1 对）、
	//   正确项↔hint ≥16（第二题的正确项被首题讲解整句送出，全站现算仅 1 对）。
	// · 干扰项不参与：现算 221 对里「干扰项↔任何一侧」≥12 的为 0 对，纳入只增噪声。
	// · hint↔hint 只计数不判红：两句讲解各自引用同一句正文属可接受的教学冗余（现 5 对）。
	const LINE = { cc: 12, ch: 16, hh: 16 };
	// 全站现算出的已知存量，已按 b 类登记进 docs/coverage-deepening.md 待返修。
	// 修掉或改写到不再判红时，下方「空转守卫」会判红要求同步删项——不放宽容差也不允许清单过期。
	const KNOWN = {
		'mysql-mvcc-003|mysql-rcrr-012': '正确项↔正确项 21 字',
		'ai-infparams-046|ai-infparams-052': '正确项↔讲解 17 字',
	};
	const prose = (s) => String(s ?? '').replace(/[^一-鿿]+/g, '');
	// hint 全站统一以「第 X/Y 项正确、第 A/B 项错」开句（第 208 轮写题纪律），这句对偶是
	// 逐字相同的模板；先删非汉字会把模板和它后面的正文粘成一段，故判红前先剥掉这段开场白。
	const stripScoring = (s) => String(s ?? '').replace(/^第[\s\d/、,，和或]+项正确[，、]?第[\s\d/、,，和或]+项错[，。]?/, '');
	// 最长公共连续段（滚动数组 DP），返回长度与片段原文便于定位
	const run = (a, b) => {
		let prev = new Uint16Array(b.length + 1);
		let cur = new Uint16Array(b.length + 1);
		let len = 0;
		let end = 0;
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0;
				if (cur[j] > len) {
					len = cur[j];
					end = i;
				}
			}
			const t = prev;
			prev = cur;
			cur = t;
			cur.fill(0);
		}
		return { len, text: a.slice(end - len, end) };
	};
	const groups = new Map();
	for (const { q } of bank) {
		const key = String(q.noteId ?? '').trim();
		if (!key) continue;
		const right = new Set(Array.isArray(q.answer) ? q.answer : []);
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push({
			id: q.id,
			C: prose((q.options ?? []).filter((_, i) => right.has(i)).join('|')),
			H: prose(stripScoring(q.hint)),
		});
	}
	const bad = [];
	const hit = new Set();
	let pairs = 0;
	let watch = 0;
	for (const [noteId, list] of groups) {
		for (let i = 0; i < list.length; i++)
			for (let j = i + 1; j < list.length; j++) {
				const a = list[i];
				const b = list[j];
				pairs++;
				const key = [a.id, b.id].sort().join('|');
				const cc = run(a.C, b.C);
				const ch = [run(a.C, b.H), run(a.H, b.C)].sort((x, y) => y.len - x.len)[0];
				const hh = run(a.H, b.H);
				let grade = '';
				if (cc.len >= LINE.cc) grade = `两题的正确项复述同一句 ${cc.len} 字「${cc.text}」`;
				else if (ch.len >= LINE.ch) grade = `一题的正确项被另一题讲解整句给出 ${ch.len} 字「${ch.text}」`;
				if (!grade) {
					if (hh.len >= LINE.hh) watch++;
					continue;
				}
				hit.add(key);
				if (!KNOWN[key]) bad.push(`${noteId}：${a.id} × ${b.id} ${grade}`);
			}
	}
	for (const key of Object.keys(KNOWN))
		if (!hit.has(key)) bad.push(`存量清单过期：${key} 本轮不再判红，须核实是否已返修并删项`);
	report['9.同篇题对考点不重复'] = {
		ok: bad.length === 0,
		detail: `同篇题对 ${pairs} 组，判红线 正确项↔正确项 ≥${LINE.cc} / 正确项↔讲解 ≥${LINE.ch}（只量中文），已知存量 ${Object.keys(KNOWN).length} 对已登记待返修，另 ${watch} 对仅讲解重复（观察）`,
		bad,
	};
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
