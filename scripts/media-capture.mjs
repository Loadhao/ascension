// 把站内步进动画（FlowViz / AlgorithmViz 等）逐帧截成图片序列，供 media-encode.mjs 合成配音短片。
// 前提：`pnpm preview` 已在跑（与 mermaid-shots.mjs 同一约定）。
// 用法：
//   node scripts/media-capture.mjs --page /guide/diagrams/ --figure 0 --demo <media.ts 的 key>
//   node scripts/media-capture.mjs --page /guide/diagrams/ --figure 0 --list   # 只数列数不截图
// 帧写到 node_modules/.cache/media-frames/<key>/（不入 git）。
import { chromium } from 'playwright';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// 播放器逐帧的 CSS 过渡与数据包动画落定时间
const SETTLE_MS = 520;

const argv = process.argv.slice(2);
const flag = (name) => {
	const i = argv.indexOf(`--${name}`);
	return i === -1 ? undefined : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);
// 4321 被其他会话的 preview 占用时，Astro 会自动换端口，用 --base 指过去
const BASE = flag('base') ?? 'http://localhost:4321/ascension';

const pagePath = flag('page');
if (!pagePath) {
	console.error('缺少 --page /<方向>/<路径>/（站内绝对路径）');
	process.exit(2);
}
const figureIdx = Number(flag('figure') ?? 0);
const url = pagePath.startsWith('http') ? pagePath : BASE + pagePath;
const slug = pagePath.replace(/^\/ascension/, '').replace(/^\/|\/$/g, '').replace(/\//g, '-');
// 给 --demo 时按 key 落帧目录，与 media-encode.mjs 的默认读取路径对齐
const outDir = flag('out') ?? join('node_modules', '.cache', 'media-frames', flag('demo') ?? `${slug}-${figureIdx}`);

/** 读 `.algo-viz-step` 的「当前 / 总数」，作为帧状态唯一真值 */
const readStep = async (stepEl) => {
	const text = (await stepEl.textContent()) ?? '';
	const m = text.match(/(\d+)\s*\/\s*(\d+)/);
	if (!m) throw new Error(`帧码解析失败，读到「${text.trim()}」`);
	return { at: Number(m[1]) - 1, last: Number(m[2]) - 1 };
};

const browser = await chromium.launch();
try {
	const ctx = await browser.newContext({
		viewport: { width: 1280, height: 900 },
		// 成品像素固定亮色底：暗色主题下读成一张卡片（见 custom.css .media-fig 注释）
		colorScheme: 'light',
		deviceScaleFactor: 2,
	});
	const page = await ctx.newPage();
	const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
	if (!resp || !resp.ok()) {
		throw new Error(`页面不可达（${resp?.status() ?? '无响应'}）：${url}\n请先跑 pnpm preview，并确认 --page 路径存在`);
	}

	// 站点 :root 是暗色基准、[data-theme='light'] 才切亮色，colorScheme 管不到它
	await page.evaluate(() => {
		localStorage.setItem('starlight-theme', 'light');
		document.documentElement.dataset.theme = 'light';
	});
	await page.waitForTimeout(120);

	const figure = page.locator('figure.algo-viz').nth(figureIdx);
	if ((await figure.count()) === 0) {
		const total = await page.locator('figure.algo-viz').count();
		throw new Error(`该页只有 ${total} 个动画 figure，取不到第 ${figureIdx} 个`);
	}
	// client:visible 岛屿要进视口才水合
	await figure.scrollIntoViewIfNeeded();
	await figure.waitFor({ state: 'visible' });
	const title = (await figure.getAttribute('aria-label')) ?? '';

	// 控制条、帧码与进度条是播放器外设，不进教学画面
	await page.addStyleTag({
		content: '.algo-viz-controls,.algo-viz-step,.algo-viz-progress{display:none!important}',
	});

	const stepEl = figure.locator('.algo-viz-step');
	const noteEl = figure.locator('.algo-viz-note');
	await figure.focus();
	// 键盘单步会顺带暂停自动播放；倒回到第一帧，保证序列确定
	const rewind = async () => {
		let cur = (await readStep(stepEl)).at;
		for (; cur > 0; cur--) await page.keyboard.press('ArrowLeft');
		await page.waitForTimeout(SETTLE_MS);
		const now = await readStep(stepEl);
		if (now.at !== 0) throw new Error(`未能回到第一帧，当前 ${now.at}`);
	};
	await rewind();
	const first = await readStep(stepEl);

	if (has('list')) {
		console.log(JSON.stringify({ title, frames: first.last + 1 }));
		process.exitCode = 0;
	}

	// 第一遍只量高度：逐帧说明的文字行数不同会让 figure 高度跳动，
	// 帧尺寸不齐会让后面的切片拼接跨分辨率，播放器只能拉伸。
	const notes = [];
	const figH = [];
	const noteH = [];
	for (let i = 0; i <= first.last; i++) {
		notes.push((await noteEl.textContent())?.trim() ?? '');
		figH.push((await figure.boundingBox())?.height ?? 0);
		noteH.push((await noteEl.boundingBox())?.height ?? 0);
		if (i < first.last) {
			await page.keyboard.press('ArrowRight');
			await page.waitForTimeout(SETTLE_MS);
		}
	}
	const tallest = Math.max(...figH);
	// 除说明区之外的固定高度（图区 + 标题 + 内边距），各帧应当一致，取最小值兜底
	const fixed = Math.min(...figH.map((h, i) => h - noteH[i]));
	const targetNoteH = Math.ceil(tallest - fixed);
	if (targetNoteH > Math.max(...noteH)) {
		// 把说明区钉到最高那一档，之后每一帧的 figure 尺寸完全一致
		await page.addStyleTag({ content: `.algo-viz-note{min-height:${targetNoteH}px}` });
		console.log(`帧高不齐（${Math.min(...figH)}~${tallest}px），逐帧说明区已等高钉到 ${targetNoteH}px`);
	}

	if (has('list')) process.exit(0);
	rmSync(outDir, { recursive: true, force: true });
	mkdirSync(outDir, { recursive: true });

	// 第二遍正式截图
	await rewind();
	const shots = [];
	for (let i = 0; i <= first.last; i++) {
		const file = join(outDir, `${String(i).padStart(3, '0')}.png`);
		await figure.screenshot({ path: file });
		shots.push({ i, file, note: notes[i] });
		console.log(`帧 ${i + 1}/${first.last + 1} ${notes[i].slice(0, 34)}`);
		if (i < first.last) {
			await page.keyboard.press('ArrowRight');
			await page.waitForTimeout(SETTLE_MS);
			const now = await readStep(stepEl);
			if (now.at !== i + 1) throw new Error(`第 ${i + 2} 帧未就位，读到 ${now.at}`);
		}
	}

	writeFileSync(
		join(outDir, 'manifest.json'),
		JSON.stringify({ url, title, figureIdx, frames: shots.length, shots }, null, 2),
	);
	console.log(`已导出 ${shots.length} 帧 + manifest：${outDir}`);
} finally {
	await browser.close();
}
