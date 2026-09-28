// 面试考点卡体检（10 项）：方向对应 / JSON 结构 / id 唯一 / noteId 可达 / group 对齐速答手册 /
// 字段齐全与三段字数下限 / 禁裸露 markdown 记号 / 同篇考点重合 / 缺卡方向空转守卫 /
// 三段话块形状（每段按 \n 拆成「一块一句」，答案首块是结论句）。
// 考点卡的 noteId 只被 InterviewIsland 构建期聚合、渲染时当「查看完整笔记」链接用一次，
// 写错不会构建失败也不会报错，只会静默 404；三段字数不设闸就会退化成关键词堆砌——
// 所以「每个回答都满意」这件事必须由机器卡住，不靠写题人的自觉。
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IC = join(ROOT, 'src/data/interview');
const QUIZ = join(ROOT, 'src/data/quiz');
const DOCS = join(ROOT, 'src/content/docs');
const CHEATSHEET = join(DOCS, 'guide/interview-cheatsheet.md');
const FIELDS = ['id', 'noteId', 'group', 'difficulty', 'q', 'intent', 'answer', 'followup'];
// 内容下限：三段按汉字计（ASCII 标识符不计），q 上限同样只数汉字
const MIN = { intent: 15, answer: 40, followup: 15 };
const MAX_Q = 60;
// 同篇两张卡的中文最长公共连续段判红线（机制与 quiz-verify 第 9 项同款）
const LINE = { qq: 12, qa: 16 };

const cjkLen = (s) => (String(s ?? '').match(/[一-鿿]/g) ?? []).length;
const prose = (s) => String(s ?? '').replace(/[^一-鿿]+/g, '');
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

let files = [];
try {
	files = readdirSync(IC).filter((f) => f.endsWith('.json'));
} catch {
	console.error('✗ 考点卡目录不存在：src/data/interview/');
	process.exit(1);
}
const cards = [];
const parseFail = [];
for (const f of files) {
	let raw;
	try {
		raw = JSON.parse(readFileSync(join(IC, f), 'utf8'));
	} catch (e) {
		parseFail.push(`${f}: ${e.message.split('\n')[0]}`);
		continue;
	}
	if (!Array.isArray(raw.cards)) {
		parseFail.push(`${f}: 顶层缺 cards 数组`);
		continue;
	}
	for (const [i, c] of raw.cards.entries()) cards.push({ file: f, i, c });
}
const report = {};

{
	const dirs = new Set(readdirSync(DOCS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name));
	const bad = files.filter((f) => !dirs.has(f.replace(/\.json$/, ''))).map((f) => `${f} 不是任何方向的目录名（不会出现在考点卡页）`);
	report['1.考点卡文件对应真实方向'] = { ok: bad.length === 0, detail: `${files.length} 个考点卡文件`, bad };
}
report['2.考点卡 JSON 可解析'] = {
	ok: parseFail.length === 0,
	detail: `共 ${cards.length} 张`,
	bad: parseFail,
};
{
	const seen = new Set();
	const bankIds = new Set();
	for (const qf of readdirSync(QUIZ).filter((f) => f.endsWith('.json')))
		for (const q of JSON.parse(readFileSync(join(QUIZ, qf), 'utf8')).questions ?? []) bankIds.add(q.id);
	const bad = [];
	for (const { c } of cards) {
		const id = String(c.id ?? '');
		if (!id) {
			bad.push('有无 id 的卡');
			continue;
		}
		if (seen.has(id)) bad.push(`重复 id：${id}`);
		if (bankIds.has(id)) bad.push(`id 与题库撞车：${id}`);
		seen.add(id);
	}
	report['3.考点卡 id 全局唯一'] = { ok: bad.length === 0, detail: `${seen.size} 个 id`, bad };
}
{
	const bad = [];
	for (const { c } of cards) {
		const id = String(c.noteId ?? '').trim();
		if (!id || (!existsSync(join(DOCS, `${id}.md`)) && !existsSync(join(DOCS, `${id}.mdx`))))
			bad.push(`${c.id} -> ${id || '(空)'}`);
	}
	report['4.noteId 指向真实笔记'] = { ok: bad.length === 0, detail: '写错只会静默 404', bad };
}
{
	const groups = new Set();
	for (const l of readFileSync(CHEATSHEET, 'utf8').split('\n')) {
		const m = /^## (.+?)\s*$/.exec(l);
		if (m && m[1] !== '使用建议') groups.add(m[1]);
	}
	const bad = [];
	if (groups.size < 20) bad.push(`速答手册主题分组只解析出 ${groups.size} 组，期望集近乎空转`);
	for (const { c } of cards) if (!groups.has(String(c.group ?? ''))) bad.push(`${c.id} 的 group「${c.group ?? ''}」不在手册 ${groups.size} 个主题分组里`);
	report['5.group 对齐速答手册主题'] = { ok: bad.length === 0, detail: `手册 ${groups.size} 个主题分组`, bad };
}
{
	const bad = [];
	for (const { c } of cards) {
		const miss = FIELDS.filter((k) => c[k] === undefined || (typeof c[k] === 'string' && !c[k].trim()));
		if (miss.length) {
			bad.push(`${c.id} 缺字段 ${miss.join('/')}`);
			continue;
		}
		const d = c.difficulty;
		if (!Number.isInteger(d) || d < 1 || d > 5) bad.push(`${c.id} difficulty=${d}（须 1~5 整数）`);
		if (cjkLen(c.q) > MAX_Q) bad.push(`${c.id} q 汉字 ${cjkLen(c.q)} 超 ${MAX_Q}`);
		for (const k of Object.keys(MIN)) if (cjkLen(c[k]) < MIN[k]) bad.push(`${c.id} ${k} 汉字 ${cjkLen(c[k])} 少于下限 ${MIN[k]}`);
	}
	report['6.字段齐全与三段字数下限'] = {
		ok: bad.length === 0,
		detail: `intent≥${MIN.intent} / answer≥${MIN.answer} / followup≥${MIN.followup}（按汉字计），q≤${MAX_Q}`,
		bad,
	};
}
{
	const bad = [];
	for (const { c } of cards) {
		const blob = [c.q, c.intent, c.answer, c.followup].join('\n');
		const marks = [];
		if (blob.includes('`')) marks.push('反引号');
		if (blob.includes('**')) marks.push('星号加粗');
		if (marks.length) bad.push(`${c.id} 含裸露 markdown 记号（${marks.join('、')}）——字段按纯文本渲染`);
	}
	report['7.题目字段纯文本'] = { ok: bad.length === 0, detail: '字段值不得出现反引号与星号加粗', bad };
}
{
	const groups = new Map();
	for (const { c } of cards) {
		const key = String(c.noteId ?? '').trim();
		if (!key) continue;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push({ id: c.id, Q: prose(c.q), A: prose([c.intent, c.answer, c.followup].join('|')) });
	}
	const bad = [];
	let pairs = 0;
	for (const [noteId, list] of groups) {
		for (let i = 0; i < list.length; i++)
			for (let j = i + 1; j < list.length; j++) {
				pairs++;
				const a = list[i];
				const b = list[j];
				const qq = run(a.Q, b.Q);
				const qa = [run(a.Q, b.A), run(b.Q, a.A)].sort((x, y) => y.len - x.len)[0];
				let grade = '';
				if (qq.len >= LINE.qq) grade = `两张卡的题干复述同一句 ${qq.len} 字「${qq.text}」`;
				else if (qa.len >= LINE.qa) grade = `一张卡的题干被另一张卡的讲解整句给出 ${qa.len} 字「${qa.text}」`;
				if (grade) bad.push(`${noteId}：${a.id} × ${b.id} ${grade}`);
			}
	}
	report['8.同篇考点不重复'] = { ok: bad.length === 0, detail: `同篇卡对 ${pairs} 组，判红线 题干↔题干 ≥${LINE.qq} / 题干↔讲解 ≥${LINE.qa}（只量中文）`, bad };
}
{
	// 覆盖率空转守卫：带题库的方向都该有考点卡。首批只铺 java/mysql/ai 三个方向，
	// 其余按存量登记为 KNOWN_MISSING 放行；每轮 E 车道补卡后必须同步删项——
	// 清单里的方向本轮已有卡却不删 → 判红（与 quiz-verify 的 KNOWN 同一套防空转写法）。
	const KNOWN_MISSING = new Set([
		'algorithm',
		'distributed',
		'docker',
		'elasticsearch',
		'etcd',
		'git',
		'js',
		'kubernetes',
		'langchain',
		'linux',
		'middleware',
		'mongodb',
		'mqtt',
		'network',
		'nginx',
		'postgresql',
		'python',
		'rabbitmq',
		'react',
		'rocketmq',
		'seata',
		'security',
		'tools',
		'typescript',
		'vue',
		'zookeeper',
	]);
	const withBank = readdirSync(QUIZ)
		.filter((f) => f.endsWith('.json'))
		.map((f) => f.replace(/\.json$/, ''));
	const hasCards = new Set(files.map((f) => f.replace(/\.json$/, '')));
	const bad = [];
	for (const d of withBank) {
		if (hasCards.has(d) && KNOWN_MISSING.has(d)) bad.push(`存量清单过期：${d} 本轮已有考点卡，须从 KNOWN_MISSING 删项`);
	}
	const missing = withBank.filter((d) => !hasCards.has(d) && !KNOWN_MISSING.has(d));
	for (const d of missing) bad.push(`缺考点卡：${d}（带题库却零卡，且不在存量清单——新方向落地后须补卡或在清单登记）`);
	report['9.考点卡方向覆盖空转守卫'] = {
		ok: bad.length === 0,
		detail: `带题库方向 ${withBank.length} 个｜已有卡 ${withBank.filter((d) => hasCards.has(d)).length} 个｜存量待补 ${KNOWN_MISSING.size} 个`,
		bad,
	};
}

{
	// 话块形状：三段一律按 `\n` 拆成「一块一句」。整段长文既记不住也说不出口——
	// 「不潦草」不等于「成段」，所以块数与每块汉字数都判红。答案首块另设更严的上限，
	// 它承担「开口第一句该说什么」，是整张卡最该被记住的一句。
	const SHAPE = { intent: [2, 3], answer: [3, 5], followup: [2, 3] };
	const MAX_BEAT = 40;
	const MAX_LEAD = 24;
	const MIN_BEAT = 8;
	const bad = [];
	for (const { c } of cards) {
		for (const [field, [lo, hi]] of Object.entries(SHAPE)) {
			const beats = String(c[field] ?? '')
				.split('\n')
				.map((s) => s.trim())
				.filter(Boolean);
			if (beats.length < lo || beats.length > hi)
				bad.push(`${c.id}.${field} 话块 ${beats.length} 块，须在 ${lo}~${hi} 之间（整段不换行即判红）`);
			beats.forEach((b, i) => {
				const n = cjkLen(b);
				const cap = field === 'answer' && i === 0 ? MAX_LEAD : MAX_BEAT;
				if (n > cap) bad.push(`${c.id}.${field} 第 ${i + 1} 块 ${n} 汉字，超单块上限 ${cap}`);
				else if (n < MIN_BEAT) bad.push(`${c.id}.${field} 第 ${i + 1} 块 ${n} 汉字，不足 ${MIN_BEAT} 不成一句`);
			});
		}
	}
	report['10.三段话块形状'] = {
		ok: bad.length === 0,
		detail: `按换行拆块 intent 2~3 / answer 3~5 / followup 2~3，每块 ≤${MAX_BEAT} 汉字（答案首块 ≤${MAX_LEAD}）、≥${MIN_BEAT}`,
		bad,
	};
}

let failed = 0;
for (const [name, r] of Object.entries(report)) {
	console.log(`${r.ok ? '✓' : '✗'} ${name}（${r.detail}）${r.ok ? '' : ': ' + r.bad.slice(0, 8).join('; ')}${r.bad.length > 8 ? ` …共 ${r.bad.length} 处` : ''}`);
	if (!r.ok) failed++;
}
if (failed) {
	console.log(`\n失败：${failed} 项考点卡体检未过`);
	process.exit(1);
}
console.log(`\n通过：${Object.keys(report).length} 项考点卡体检全绿（${cards.length} 张）`);
