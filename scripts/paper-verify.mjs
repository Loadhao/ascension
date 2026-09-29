// 本篇卷（笔记页「测一下」）体检（9 项）：方向与笔记可达 / 题数与 id / kind 配比与题型覆盖 /
// 小节标题逐字真实 / 引文逐字命中正文 + 理由可用 / answer 合法且干扰项不被同题引文命中 /
// relate 邻居真实 / 题面不与全局题库重合 / 方向覆盖空转守卫。
// 出题发生在构建之前（站点纯静态，浏览器里没有服务可调模型），所以「答案有没有正文依据」
// 只能靠静态断言卡住：引文必须是该篇正文的连续子串，小节必须真实存在——
// 写错的题不会构建失败，只会静默地把没有依据的话教给读者。
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAPERS = join(ROOT, 'src/data/papers');
const DOCS = join(ROOT, 'src/content/docs');
const QUIZ = join(ROOT, 'src/data/quiz');
const GRAPHS = join(ROOT, 'src/data/graphs');

const KINDS = new Set(['recall', 'diverge', 'relate', 'interview']);
const TYPES = new Set(['single', 'multiple', 'judge']);
const JUDGE_OPTIONS = ['正确', '错误'];
const MIN_QUOTE = 12; // 短于这个数的「引文」等于一个词，撑不起依据

/** 归一化：去掉强调标记与所有空白，让引文可以与跨行正文比对 */
const norm = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/[\s　]/g, '');

/** 取笔记正文（去 frontmatter），并抽出 ##/### 小节标题原文 */
function noteSource(noteId) {
	const rel = String(noteId ?? '').replace(/^\/+|\/+$/g, '');
	for (const cand of [`${rel}.md`, `${rel}.mdx`]) {
		const p = join(DOCS, cand);
		if (!existsSync(p)) continue;
		const raw = readFileSync(p, 'utf8');
		const lines = raw.split('\n');
		let body = raw;
		if (lines[0] === '---') {
			const end = lines.slice(1).indexOf('---') + 1;
			if (end > 0) body = lines.slice(end + 1).join('\n');
		}
		const sections = [];
		for (const line of body.split('\n')) {
			const m = line.match(/^(?:##|###)\s+(.+?)\s*$/);
			if (m) sections.push(m[1]);
		}
		return { path: cand, body, sections };
	}
	return null;
}

const report = {};
const files = existsSync(PAPERS) ? readdirSync(PAPERS).filter((f) => f.endsWith('.json')) : [];
const papers = [];
const parseFail = [];

for (const f of files) {
	let raw;
	try {
		raw = JSON.parse(readFileSync(join(PAPERS, f), 'utf8'));
	} catch (e) {
		parseFail.push(`${f}: ${e.message.split('\n')[0]}`);
		continue;
	}
	const list = raw.papers;
	if (!Array.isArray(list)) {
		parseFail.push(`${f}: 顶层缺 papers 数组`);
		continue;
	}
	for (const p of list) papers.push({ file: f, p });
}

{
	const dirs = new Set(readdirSync(DOCS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name));
	const badDir = files.filter((f) => !dirs.has(f.replace(/\.json$/, ''))).map((f) => `${f} 不是任何方向的目录名`);
	const badNote = [];
	const seenNote = new Map();
	for (const { file, p } of papers) {
		if (!noteSource(p.noteId)) badNote.push(`${file}：${p.noteId} 不是任何一篇笔记（须为 <方向>/<等级>/<分类>/<知识点>，不含 index）`);
		else if (seenNote.has(p.noteId)) badNote.push(`${file}：${p.noteId} 在一份文件里出了两卷`);
		else seenNote.set(p.noteId, file);
	}
	const bad = [...parseFail, ...badDir, ...badNote];
	report['1.卷文件与 noteId 指向真实笔记'] = {
		ok: bad.length === 0,
		detail: `${files.length} 个文件／${papers.length} 卷`,
		bad,
	};
}

{
	const bad = [];
	const ids = new Map();
	for (const { file, p } of papers) {
		const qs = Array.isArray(p.questions) ? p.questions : [];
		if (typeof p.title !== 'string' || !p.title.trim()) bad.push(`${file}：${p.noteId} 缺 title`);
		if (qs.length < 5 || qs.length > 10) bad.push(`${file}：${p.noteId} 题数 ${qs.length}（要求 5~10）`);
		for (const q of qs) {
			if (typeof q.id !== 'string' || !q.id.trim()) bad.push(`${file}：${p.noteId} 有无 id 的题`);
			else if (ids.has(q.id)) bad.push(`题 id 重复 ${q.id}（${ids.get(q.id)} 与 ${file}）`);
			else ids.set(q.id, file);
			if (!KINDS.has(q.kind)) bad.push(`${file}#${q.id}：kind=${JSON.stringify(q.kind)}`);
			if (!TYPES.has(q.type)) bad.push(`${file}#${q.id}：type=${JSON.stringify(q.type)}`);
			if (!norm(q.q).length) bad.push(`${file}#${q.id}：题干为空`);
			if (!Array.isArray(q.options) || q.options.length < 2) bad.push(`${file}#${q.id}：选项少于 2 个`);
		}
	}
	report['2.每卷 5~10 题且字段形状合法'] = { ok: bad.length === 0, detail: `${ids.size} 个题 id`, bad };
}

{
	const bad = [];
	for (const { file, p } of papers) {
		const qs = p.questions || [];
		const by = (k) => qs.filter((q) => q.kind === k);
		const recall = by('recall');
		if (recall.length < 3) bad.push(`${file}：${p.noteId} recall 仅 ${recall.length}（要求 ≥3）`);
		const sec = new Set(recall.map((q) => q.section));
		if (sec.size !== recall.length) bad.push(`${file}：${p.noteId} recall 有 ${recall.length - sec.size} 题与小节重合`);
		if (by('interview').length < 1) bad.push(`${file}：${p.noteId} 缺面试题口径的题（kind=interview）`);
		if (by('relate').length > 2) bad.push(`${file}：${p.noteId} relate ${by('relate').length} 题（上限 2）`);
		if (new Set(qs.map((q) => q.type)).size < 2) bad.push(`${file}：${p.noteId} 题型只有 1 类`);
		if (new Set(qs.map((q) => q.kind)).size < 2) bad.push(`${file}：${p.noteId} kind 只有 1 类`);
	}
	report['3.kind 配比与题型覆盖'] = {
		ok: bad.length === 0,
		detail: `recall≥3 分属不同小节、interview≥1、relate≤2、≥2 类题型`,
		bad,
	};
}

{
	const bad = [];
	for (const { file, p } of papers) {
		const src = noteSource(p.noteId);
		if (!src) continue;
		const secs = src.sections.map(norm);
		for (const q of p.questions || []) {
			const s = norm(q.section);
			if (!s) bad.push(`${file}#${q.id}：section 为空`);
			else if (!secs.includes(s)) bad.push(`${file}#${q.id}：「${q.section}」不是本篇的小节标题`);
		}
	}
	report['4.section 逐字命中本篇小节标题'] = {
		ok: bad.length === 0,
		detail: `全站笔记小节标题取自正文 ##/###`,
		bad,
	};
}

{
	const bad = [];
	for (const { file, p } of papers) {
		const src = noteSource(p.noteId);
		if (!src) continue;
		const body = norm(src.body);
		for (const q of p.questions || []) {
			const quote = norm(q.quote);
			if (quote.length < MIN_QUOTE) bad.push(`${file}#${q.id}：引文仅 ${quote.length} 字（≥${MIN_QUOTE}）`);
			else if (!body.includes(quote)) bad.push(`${file}#${q.id}：引文不是本篇正文的连续原文「${String(q.quote).slice(0, 34)}…」`);
			const why = norm(q.why);
			if (why.length < MIN_QUOTE) bad.push(`${file}#${q.id}：理由仅 ${why.length} 字（≥${MIN_QUOTE}）`);
			else if (quote && why === quote) bad.push(`${file}#${q.id}：理由与引文一字不差，等于没讲理由`);
		}
	}
	report['5.引文逐字可查且理由可用'] = { ok: bad.length === 0, detail: `引文须为本篇连续原文`, bad };
}

{
	const bad = [];
	for (const { file, p } of papers) {
		for (const q of p.questions || []) {
			const opts = Array.isArray(q.options) ? q.options : [];
			const ans = Array.isArray(q.answer) ? q.answer : [];
			if (q.type === 'judge') {
				if (opts.length !== 2 || !opts.every((o, i) => o === JUDGE_OPTIONS[i]))
					bad.push(`${file}#${q.id}：判断题选项须为「正确 / 错误」`);
				if (ans.length !== 1) bad.push(`${file}#${q.id}：判断题的答案数 ${ans.length}（须恰好 1 个）`);
			}
			if (q.type === 'single' && ans.length !== 1) bad.push(`${file}#${q.id}：single 的答案数 ${ans.length}`);
			if (q.type === 'multiple' && ans.length < 2) bad.push(`${file}#${q.id}：multiple 的答案数 ${ans.length}`);
			if (new Set(ans).size !== ans.length) bad.push(`${file}#${q.id}：答案下标重复`);
			if (ans.some((i) => !Number.isInteger(i) || i < 0 || i >= opts.length))
				bad.push(`${file}#${q.id}：答案下标越界 ${JSON.stringify(ans)}/${opts.length}`);
			// 干扰项若逐字出现在本题引文里，等于把正确答案抄在错误项上让读者挑
			const quote = norm(q.quote);
			if (quote)
				for (const [i, o] of opts.entries()) if (!ans.includes(i) && norm(o).length >= 6 && quote.includes(norm(o)))
					bad.push(`${file}#${q.id}：干扰项[${i}]「${o}」逐字出现在本题引文里`);
			// 正确项若整句照抄引文，读者做字符串匹配就能命中，测不到理解
			if (quote)
				for (const i of ans) if (norm(opts[i]).length >= 10 && quote.includes(norm(opts[i])))
					bad.push(`${file}#${q.id}：正确项[${i}]整句照抄引文，可靠字符串匹配答对`);
		}
	}
	report['6.答案下标合法且干扰项不被引文命中'] = { ok: bad.length === 0, detail: `逐题校验`, bad };
}

{
	const bad = [];
	const neighbors = new Map();
	for (const f of readdirSync(GRAPHS).filter((x) => x.endsWith('.json'))) {
		const g = JSON.parse(readFileSync(join(GRAPHS, f), 'utf8'));
		const href = new Map(g.nodes.map((n) => [n.id, n.href ? n.href.replace(/^\/|\/$/g, '') : null]));
		for (const e of g.edges) {
			const a = href.get(e.source);
			const b = href.get(e.target);
			if (!a || !b || a === b || !noteSource(a) || !noteSource(b)) continue;
			if (!neighbors.has(a)) neighbors.set(a, new Set());
			if (!neighbors.has(b)) neighbors.set(b, new Set());
			neighbors.get(a).add(b);
			neighbors.get(b).add(a);
		}
	}
	for (const { file, p } of papers)
		for (const q of p.questions || []) {
			if (q.kind !== 'relate') continue;
			if (typeof q.neighborId !== 'string' || !q.neighborId.trim()) bad.push(`${file}#${q.id}：relate 缺 neighborId`);
			else if (!(neighbors.get(p.noteId) || new Set()).has(q.neighborId.replace(/^\/+|\/+$/g, '')))
				bad.push(`${file}#${q.id}：${q.neighborId} 不是本篇的图谱笔记级邻居`);
			if (q.neighborId && (typeof q.neighborTitle !== 'string' || !q.neighborTitle.trim()))
				bad.push(`${file}#${q.id}：relate 缺 neighborTitle（读者看到的链接文字）`);
		}
	report['7.relate 题的相关性有图谱依据'] = { ok: bad.length === 0, detail: `邻居按图谱「笔记↔笔记」边现算`, bad };
}

{
	const bankQ = [];
	for (const f of readdirSync(QUIZ).filter((x) => x.endsWith('.json'))) {
		const j = JSON.parse(readFileSync(join(QUIZ, f), 'utf8'));
		for (const q of j.questions || []) bankQ.push({ id: q.id, n: norm(q.q) });
	}
	const bad = [];
	for (const { file, p } of papers)
		for (const q of p.questions || []) {
			const n = norm(q.q);
			if (n.length < 12) continue;
			const hit = bankQ.find((b) => b.n === n || (b.n.length >= 12 && (n.includes(b.n) || b.n.includes(n))));
			if (hit) bad.push(`${file}#${q.id}：题面与全局题库 ${hit.id} 重合（测一下不是题库的子集）`);
		}
	report['8.题面不与全局题库重合'] = { ok: bad.length === 0, detail: `题库 ${bankQ.length} 题参与比对`, bad };
}

{
	// 覆盖率空转守卫：带题库的方向都该有本篇卷。M1 只铺 java，其余按存量登记为 KNOWN_MISSING
	// 放行；每轮补卷后必须同步删项——清单里的方向本轮已有卷却不删 → 判红（同考点卡那套写法）。
	const KNOWN_MISSING = new Set([
		'ai',
		'algorithm',
		'distributed',
		'docker',
		'elasticsearch',
		'etcd',
		'git',
		'js',
		'kafka',
		'kubernetes',
		'langchain',
		'linux',
		'middleware',
		'mongodb',
		'mqtt',
		'mysql',
		'netty',
		'network',
		'nginx',
		'postgresql',
		'python',
		'rabbitmq',
		'react',
		'redis',
		'rocketmq',
		'seata',
		'security',
		'spring-ai',
		'tools',
		'typescript',
		'vue',
		'zookeeper',
]);
	const withBank = readdirSync(QUIZ)
		.filter((f) => f.endsWith('.json'))
		.map((f) => f.replace(/\.json$/, ''));
	const hasPaper = new Set(papers.map(({ p }) => String(p.noteId).split('/')[0]));
	const bad = [];
	for (const d of withBank) if (hasPaper.has(d) && KNOWN_MISSING.has(d)) bad.push(`存量清单过期：${d} 已有本篇卷，须从 KNOWN_MISSING 删项`);
	for (const d of withBank.filter((x) => !hasPaper.has(x) && !KNOWN_MISSING.has(x))) bad.push(`缺本篇卷：${d}（带题库却零卷，且不在存量清单）`);
	report['9.本篇卷方向覆盖空转守卫'] = {
		ok: bad.length === 0,
		detail: `带题库方向 ${withBank.length} 个｜已有卷 ${withBank.filter((d) => hasPaper.has(d)).length} 个｜存量待补 ${KNOWN_MISSING.size} 个`,
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
console.log(`\n通过：${Object.keys(report).length} 项本篇卷体检全绿（${papers.length} 卷／${papers.reduce((a, { p }) => a + (p.questions || []).length, 0)} 题）`);
