// 帧序列 + 逐帧口播文稿 → 带中文配音的教学短片（含首帧封面）。
// 配音用 macOS 自带 `say`（离线、零额度），画面时长严格跟随音轨，禁止先配音再凑画。
// 用法：
//   node scripts/media-encode.mjs --demo mysql-2pc-video [--frames <目录>] [--outdir public/videos]
// 文稿来自 src/data/viz/media.ts 的 narration（与笔记正文同源，逐帧对齐动画帧）。
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const brew = (tool) => (existsSync(`/opt/homebrew/bin/${tool}`) ? `/opt/homebrew/bin/${tool}` : tool);
const FFMPEG = brew('ffmpeg');
const FFPROBE = brew('ffprobe');
const SAY_VOICE = 'Tingting';
// 每帧在口播结束后多留的呼吸时间
const TAIL_S = 0.35;
// 单条成片体积上限（与 media-verify.mjs 的闸门一致）
const MAX_MB = 4;
// 静态帧画面，24 已足够清晰且体积很小；超预算由 media-verify 拦下人工处理
const CRF = 24;
const WORK_ROOT = resolve('node_modules', '.cache', 'media-work');

const argv = process.argv.slice(2);
const flag = (name) => {
	const i = argv.indexOf(`--${name}`);
	return i === -1 ? undefined : argv[i + 1];
};
const key = flag('demo');
if (!key) {
	console.error('缺少 --demo <media.ts 里的 key>');
	process.exit(2);
}
const outdir = flag('outdir') ?? join('public', 'videos');
const framesDir = resolve(flag('frames') ?? join('node_modules', '.cache', 'media-frames', key));

const run = (cmd, args, opts = {}) => {
	const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
	if (r.status !== 0) {
		throw new Error(`${basename(cmd)} 失败（exit ${r.status}）：${cmd} ${args.join(' ')}\n${(r.stderr || r.stdout || '').slice(-1200)}`);
	}
	return r.stdout;
};
const probe = (file, args) =>
	run(FFPROBE, ['-v', 'error', '-show_entries', args, '-of', 'default=noprint_wrappers=1:nokey=1', file]).trim();

const { mediaAssets } = await import(resolve('src', 'data', 'viz', 'media.ts'));
const asset = mediaAssets[key];
if (!asset) {
	console.error(`media.ts 里没有「${key}」，请先登记资产（含 narration 文稿）`);
	process.exit(2);
}
if (!asset.narration?.length) {
	console.error('media-encode 只做配音视频，该资产缺 narration 文稿——禁止无稿口播');
	process.exit(2);
}

const manifestPath = join(framesDir, 'manifest.json');
if (!existsSync(manifestPath)) {
	console.error(`帧目录无 manifest：${framesDir}\n先跑 scripts/media-capture.mjs 逐帧截图`);
	process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.frames !== asset.narration.length) {
	console.error(`文稿与帧数不齐：动画 ${manifest.frames} 帧，narration ${asset.narration.length} 段`);
	console.error('逐帧口播必须与源动画一帧一句，请补齐或删减 media.ts');
	process.exit(1);
}
// 帧尺寸必须完全一致，否则逐帧切片会跨分辨率拼接，播放器只能拉伸
const dims = new Set(
	Array.from({ length: manifest.frames }, (_, i) =>
		probe(join(framesDir, `${String(i).padStart(3, '0')}.png`), 'stream=width,height').replace('\n', 'x'),
	),
);
if (dims.size > 1) {
	console.error(`帧尺寸不齐：${[...dims].join(' / ')}\n重跑 media-capture.mjs（它会先把逐帧说明区钉成等高）`);
	process.exit(1);
}

const work = resolve(WORK_ROOT, key);
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
mkdirSync(outdir, { recursive: true });

const clipFor = (i) => join(framesDir, `${String(i).padStart(3, '0')}.png`);
const videoPath = join(outdir, `${key}.mp4`);
const posterPath = join(outdir, `${key}.poster.png`);
const segFiles = [];
const clipFiles = [];
let total = 0;

console.log(`《${asset.title}》源动画 ${asset.source}，${manifest.frames} 帧`);
for (let i = 0; i < manifest.frames; i++) {
	const text = asset.narration[i];
	const aiff = join(work, `n${i}.aiff`);
	const padded = join(work, `n${i}.wav`);
	run('say', ['-v', SAY_VOICE, '-o', aiff, text]);
	const speech = Number(probe(aiff, 'format=duration'));
	const clipDur = speech + TAIL_S;
	// 先归一化采样率再补尾静音，保证音轨总长与画面逐帧时长严格对齐
	run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', aiff, '-af', `apad=pad_dur=${TAIL_S}`, '-ar', '44100', '-ac', '1', padded]);
	segFiles.push(padded);
	// 逐帧切片：静态画面循环成 clipDur 秒的小片段，时长由 -t 精确控制
	// （concat demuxer 对图片的 duration 指令不可靠，实测会把 10 帧压成 3 段）
	const clip = join(work, `c${i}.mp4`);
	run(FFMPEG, [
		'-hide_banner', '-loglevel', 'error', '-y',
		'-loop', '1', '-framerate', '30', '-i', clipFor(i),
		'-t', clipDur.toFixed(3),
		'-vf', 'scale=1280:-2:flags=lanczos',
		'-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-r', '30',
		clip,
	]);
	clipFiles.push(clip);
	total += clipDur;
	console.log(`  帧 ${i + 1}：口播 ${speech.toFixed(2)}s → 画面 ${clipDur.toFixed(2)}s｜${text.slice(0, 22)}`);
}

const alist = join(work, 'audio-list.txt');
const clipsList = join(work, 'clips-list.txt');
writeFileSync(alist, segFiles.map((f) => `file '${f}'`).join('\n') + '\n');
writeFileSync(clipsList, clipFiles.map((f) => `file '${f}'`).join('\n') + '\n');

const audioPath = join(work, 'voice.wav');
run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', alist, '-c:a', 'pcm_s16le', audioPath]);

// 切片同参数同尺寸，视频流直接 copy 拼接，不再重编码
run(FFMPEG, [
	'-hide_banner', '-loglevel', 'error', '-y',
	'-f', 'concat', '-safe', '0', '-i', clipsList,
	'-i', audioPath,
	'-map', '0:v', '-map', '1:a',
	'-c:v', 'copy', '-c:a', 'aac', '-b:a', '64k',
	'-movflags', '+faststart', '-shortest',
	videoPath,
]);

// 封面有 150 KiB 闸门（media-verify），帧 0 画面偏复杂时默认滤波会超；-pred mixed + 最高压缩
// 是无损手段（解成 raw rgb24 与不带参数的产物逐字节相同），不调调色板（那属有损）
run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', clipFor(0), '-vf', 'scale=1280:-2:flags=lanczos', '-pred', 'mixed', '-compression_level', '12', posterPath]);

const w = probe(videoPath, 'stream=width,height');
const dur = probe(videoPath, 'format=duration');
const streams = probe(videoPath, 'stream=codec_type');
const sizeMb = statSync(videoPath).size / 1048576;
console.log('\n—— 回填 media.ts ——');
console.log(`${key}: width/height = ${w.split('\n').join('x')}, duration = ${Number(dur).toFixed(1)}s, ${sizeMb.toFixed(2)} MB`);
console.log(`音轨：${streams.includes('audio') ? '有' : '缺（配音失败，别发布）'}｜画面时长 ${Number(dur).toFixed(1)}s（脚本预算 ${total.toFixed(1)}s）`);
if (sizeMb > MAX_MB) console.warn(`⚠️ 成片 ${sizeMb.toFixed(2)} MB 超上限 ${MAX_MB} MB，media-verify 会拦下：精简帧数或口播`);
console.log(`成品：${videoPath}｜封面：${posterPath}`);
rmSync(work, { recursive: true, force: true });
