// 影像教学资产体检（7 项）：文件存在 / 体积闸门 / 文稿与帧数对齐 / 音轨与封面 /
// 元信息可用 / 孤儿文件 / 正文引用可达。
// 任何一项失败输出清单并 exit 1；配音视频是进 git 的静态资源，体积与一致性必须卡住。
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const brew = (t) => (existsSync(`/opt/homebrew/bin/${t}`) ? `/opt/homebrew/bin/${t}` : t);

// 与 guide/diagrams「配音短片与图卡」一节同口径
const CAP = { mp4: 4 << 20, png: 300 << 10, poster: 150 << 10, total: 60 << 20 };
const MAX_FRAMES = 12;
const MAX_SECONDS = 60;
const MAX_LINE_CHARS = 36;

const { mediaAssets } = await import(join(ROOT, 'src/data/viz/media.ts'));
const { flowDemos } = await import(join(ROOT, 'src/data/viz/flows.ts'));

const mb = (bytes) => (bytes / 1048576).toFixed(2);
const sizeOf = (rel) => statSync(join(ROOT, rel)).size;
const probe = (file, entries) =>
	execFileSync(brew('ffprobe'), ['-v', 'error', '-show_entries', entries, '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }).trim();
const hasFfprobe = (() => {
	try {
		execFileSync(brew('ffprobe'), ['-version'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
})();

const entries = Object.entries(mediaAssets);
const report = {};
const skipNotes = [];

{
	const missing = [];
	for (const [key, a] of entries) {
		for (const [field, p] of [['src', a.src], ['poster', a.poster]]) {
			if (!p) continue;
			if (!existsSync(join(ROOT, 'public', p.replace(/^\//, '')))) missing.push(`${key}.${field} → public${p}`);
		}
	}
	report['1.影像资产文件存在'] = { ok: missing.length === 0, detail: `${entries.length} 个已登记资产`, bad: missing };
}

{
	const over = [];
	let total = 0;
	for (const dir of ['videos', 'images']) {
		const base = join(ROOT, 'public', dir);
		if (!existsSync(base)) continue;
		for (const f of readdirSync(base, { recursive: true })) {
			const file = join(base, String(f));
			if (!statSync(file).isFile()) continue;
			const bytes = statSync(file).size;
			total += bytes;
			const rel = `public/${dir}/${f}`;
			if (rel.endsWith('.mp4') && bytes > CAP.mp4) over.push(`${rel} ${mb(bytes)}MB > ${mb(CAP.mp4)}MB`);
			else if (rel.endsWith('.poster.png') && bytes > CAP.poster) over.push(`${rel} ${mb(bytes)}MB > ${mb(CAP.poster)}MB`);
			else if (rel.endsWith('.png') && bytes > CAP.png) over.push(`${rel} ${mb(bytes)}MB > ${mb(CAP.png)}MB`);
		}
	}
	if (total > CAP.total) over.push(`public/ 合计 ${mb(total)}MB > ${mb(CAP.total)}MB`);
	report['2.影像体积闸门'] = { ok: over.length === 0, detail: `public 媒体合计 ${mb(total)}MB（上限 ${mb(CAP.total)}MB）`, bad: over };
}

{
	const bad = [];
	for (const [key, a] of entries) {
		if (!a.src.endsWith('.mp4')) continue;
		const src = flowDemos[a.source];
		if (!src) {
			bad.push(`${key}: source「${a.source}」不在 flowDemos 里`);
			continue;
		}
		if (!a.narration?.length) bad.push(`${key}: 缺 narration，禁止无稿口播`);
		else if (a.narration.length !== src.frames.length)
			bad.push(`${key}: 文稿 ${a.narration.length} 段 ≠ 源动画 ${src.frames.length} 帧`);
		else {
			const long = a.narration.findIndex((s) => [...s.replace(/\s/g, '')].length > MAX_LINE_CHARS);
			if (long >= 0) bad.push(`${key}: 第 ${long + 1} 句超 ${MAX_LINE_CHARS} 字，成片会拖长`);
			if (a.narration.some((s) => !s.trim())) bad.push(`${key}: 有空句`);
		}
		if (src.frames.length > MAX_FRAMES) bad.push(`${key}: 源动画 ${src.frames.length} 帧 > 上限 ${MAX_FRAMES}`);
		if (!a.duration) bad.push(`${key}: duration 未回填`);
		else if (a.duration > MAX_SECONDS) bad.push(`${key}: 成片 ${a.duration}s > 上限 ${MAX_SECONDS}s`);
		if (!a.width || !a.height) bad.push(`${key}: width/height 未回填`);
	}
	report['3.口播文稿与帧数对齐'] = { ok: bad.length === 0, detail: `逐帧 ≤${MAX_LINE_CHARS} 字、成片 ≤${MAX_SECONDS}s`, bad };
}

{
	const bad = [];
	if (!hasFfprobe) {
		skipNotes.push('未找到 ffprobe，跳过音轨/真实时长核验（装 ffmpeg 后重跑）');
		report['4.音轨与封面'] = { ok: true, detail: 'ffprobe 不可用，已跳过', bad: [] };
	} else {
		for (const [key, a] of entries) {
			if (!a.src.endsWith('.mp4')) continue;
			const file = join(ROOT, 'public', a.src.replace(/^\//, ''));
			if (!existsSync(file)) continue;
			const kinds = probe(file, 'stream=codec_type');
			if (!kinds.includes('audio')) bad.push(`${key}: 成片无音轨（配音失败，别发布）`);
			if (!kinds.includes('video')) bad.push(`${key}: 成片无画面`);
			if (!a.poster) bad.push(`${key}: 视频缺封面`);
			const real = Number(probe(file, 'format=duration'));
			if (a.duration && Math.abs(real - a.duration) > 1) bad.push(`${key}: 登记 ${a.duration}s ≠ 实测 ${real.toFixed(1)}s`);
		}
		report['4.音轨与封面'] = { ok: bad.length === 0, detail: '配音视频必须有音轨与封面', bad };
	}
}

{
	const bad = [];
	for (const [key, a] of entries) {
		if (!a.title?.trim()) bad.push(`${key}: 无 title`);
		if (!a.alt || a.alt.length < 20) bad.push(`${key}: alt 太短或缺失（屏读与图裂时要有信息量）`);
		if (!a.caption || a.caption.length < 10) bad.push(`${key}: caption 太短（要写结论，不是「示意图」）`);
		else if (a.caption === a.title) bad.push(`${key}: caption 与 title 重复`);
	}
	report['5.图注与替代文本可用'] = { ok: bad.length === 0, detail: 'alt ≥20 字、caption ≥10 字且不重复标题', bad };
}

{
	const registered = new Set();
	for (const [, a] of entries) {
		if (a.src) registered.add(`public/${a.src.replace(/^\//, '')}`);
		if (a.poster) registered.add(`public/${a.poster.replace(/^\//, '')}`);
	}
	// 正文里手写的 markdown 图片也算登记（不必都进 media.ts）
	const contentRefs = new Set();
	const walk = (dir) => {
		for (const f of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, f.name);
			if (f.isDirectory()) walk(p);
			else if (/\.(md|mdx)$/.test(f.name)) {
				const body = readFileSync(p, 'utf8');
				for (const m of body.matchAll(/\/(?:images|videos)\/[^\s)"']+/g)) contentRefs.add(`public${m[0]}`);
			}
		}
	};
	walk(join(ROOT, 'src/content/docs'));
	const orphans = [];
	for (const dir of ['videos', 'images']) {
		const base = join(ROOT, 'public', dir);
		if (!existsSync(base)) continue;
		for (const f of readdirSync(base, { recursive: true })) {
			const rel = `public/${dir}/${f}`;
			if (statSync(join(ROOT, rel)).isFile() && !registered.has(rel) && !contentRefs.has(rel)) orphans.push(rel);
		}
	}
	report['6.未登记的媒体文件'] = { ok: orphans.length === 0, detail: '孤儿文件不入仓', bad: orphans };
}

{
	const dead = [];
	const walk = (dir) => {
		for (const f of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, f.name);
			if (f.isDirectory()) walk(p);
			else if (/\.(md|mdx)$/.test(f.name)) {
				const body = readFileSync(p, 'utf8');
				for (const m of body.matchAll(/!\[[^\]]*\]\((\/images\/[^\s)]+)\)/g)) {
					if (!existsSync(join(ROOT, 'public', m[1].replace(/^\//, '')))) dead.push(`${p.replace(ROOT + '/', '')} → ${m[1]}`);
				}
			}
		}
	};
	walk(join(ROOT, 'src/content/docs'));
	report['7.正文图片引用可达'] = { ok: dead.length === 0, detail: 'markdown 手写的 /images/ 引用', bad: dead };
}

let failed = 0;
for (const [name, r] of Object.entries(report)) {
	console.log(`${r.ok ? '✓' : '✗'} ${name}（${r.detail}）${r.ok ? '' : ': ' + r.bad.join('; ')}`);
	if (!r.ok) failed++;
}
for (const s of skipNotes) console.log(`⚠ ${s}`);
if (failed) {
	console.log(`\n失败 ${failed} 项`);
	process.exit(1);
}
console.log(`\n通过：${Object.keys(report).length} 项影像资产体检全绿`);
