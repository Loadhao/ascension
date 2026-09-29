// 轮次内容增量闸门（配方 §1 硬约束的机器兜底，用户 2026-09-29 指令「必须强制不能偷懒」）。
// 每轮收尾必须产出至少一项面向读者的知识资产——新章节/新考题/考点卡/速答行/新图。
// 体检、闸门、候选登记、台账维护、媒体派生（media.ts/视频/封面）一律不算内容增量。
// 口径：取 evolution.md「轮次记录」里最大轮次号 N，找提交信息含「第 N 轮」的全部提交，
// 对其改动文件并集判定——任一路径落在内容区即算检出，否则判红要求当轮补产出。
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const EVOLUTION = 'docs/evolution.md';
if (!existsSync(EVOLUTION)) {
	console.error('✗ 1.轮次内容增量（找不到 docs/evolution.md）');
	process.exit(1);
}

const text = readFileSync(EVOLUTION, 'utf8');
const nums = [...text.matchAll(/^### 第 (\d+) 轮（/gm)].map((m) => Number(m[1]));
if (nums.length === 0) {
	console.error('✗ 1.轮次内容增量（台账里一条轮次记录都没有）');
	process.exit(1);
}
const latest = Math.max(...nums);
const argv = process.argv.slice(2);
const i = argv.indexOf('--round');
const n = i !== -1 ? Number(argv[i + 1]) : latest;
if (!Number.isInteger(n) || !nums.includes(n)) {
	console.error(`✗ 1.轮次内容增量（--round ${argv[i + 1]} 不是台账里存在的轮次号）`);
	process.exit(1);
}

const git = (args) => {
	try {
		return execFileSync('git', args, { encoding: 'utf8' });
	} catch {
		return null;
	}
};
const log = git(['log', `--grep=第 ${n} 轮`, '--format=%H']);
if (log === null) {
	console.error('✗ 1.轮次内容增量（git 不可用，无法核对第 ' + n + ' 轮提交）');
	process.exit(1);
}
const commits = [...new Set(log.split('\n').filter(Boolean))];
if (commits.length === 0) {
	if (existsSync('.git/shallow')) {
		console.error(`✗ 1.轮次内容增量（浅克隆仓库核对不到第 ${n} 轮提交——CI 需 fetch-depth: 0，不许静默放行）`);
	} else {
		console.error(`✗ 1.轮次内容增量（第 ${n} 轮有台账记录但找不到对应提交——回退轮不写记录，写记录就必须有产出）`);
	}
	process.exit(1);
}

// 内容区：正文（新章节/新图/速答行）、三类题库数据、教学动画/总结卡数据。
// 明确不算：media.ts 与 public/videos|images（影像派生）、docs/evolution*|coverage*（台账）、scripts/、astro.config、graphs（关联图谱随新章节出现，单独出现不算）。
const CONTENT = [
	(p) => p.startsWith('src/content/docs/'),
	(p) => p.startsWith('src/data/quiz/'),
	(p) => p.startsWith('src/data/papers/'),
	(p) => p.startsWith('src/data/interview/'),
	(p) => p === 'src/data/viz/flows.ts' || p === 'src/data/viz/summaries.ts',
];
const NOT_CONTENT_NOTE = new Map([
	['src/data/viz/media.ts', '影像派生登记'],
	['public/videos', '成片与封面'],
	['public/images', '导出图卡'],
]);

const paths = new Set();
for (const c of commits) {
	const out = git(['show', '--name-only', '--format=', c]) ?? '';
	for (const p of out.split('\n').filter(Boolean)) paths.add(p);
}
const hits = [...paths].filter((p) => CONTENT.some((f) => f(p)));

if (hits.length > 0) {
	const derived = [...paths].filter((p) => [...NOT_CONTENT_NOTE.keys()].some((k) => p.startsWith(k)));
	console.log(
		`✓ 1.轮次内容增量（第 ${n} 轮 ${commits.length} 笔提交、${paths.size} 个文件中检出知识资产 ${hits.length} 个：` +
			hits.slice(0, 4).join('、') +
			(hits.length > 4 ? ' 等' : '') +
			(derived.length ? `；另含${NOT_CONTENT_NOTE.get(derived[0].startsWith('public') ? (derived[0].includes('videos') ? 'public/videos' : 'public/images') : derived[0])}等派生件，不计入判定` : '') +
			'）',
	);
	process.exit(0);
}

console.error(`✗ 1.轮次内容增量（第 ${n} 轮 ${commits.length} 笔提交 ${paths.size} 个文件里没有任何知识资产——新章节/考题/考点卡/速答行/新图一个都没有`);
console.error('  按配方 §1 硬约束：体检、闸门、候选登记、台账维护、媒体派生都不算产出，必须当轮补内容再收尾，不许跳过');
console.error('  涉及文件：' + [...paths].slice(0, 10).join('、') + (paths.size > 10 ? ' 等' : ''));
process.exit(1);
