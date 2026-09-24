/**
 * 影像教学资产注册表：站内唯一登记处。
 *
 * 与 flows/summaries 同规——数据里不写颜色，外观全部由 custom.css 的
 * `.media-fig` 与主题令牌接管。资产必须从既有教学内容派生（source 指向
 * 源 FlowViz key），narration 是逐帧口播文稿，事实以源动画与笔记正文为准。
 */

export interface MediaAssetConfig {
	/** 展示标题，进 figure 的 aria-label */
	title: string;
	/** 站内绝对路径；`.mp4` 按视频渲染，其余按静图渲染 */
	src: string;
	/** 视频封面（首帧）；静图不需要 */
	poster?: string;
	width: number;
	height: number;
	/** 成片秒数，由 scripts/media-encode.mjs 量出后回填 */
	duration?: number;
	/** 屏读与图裂时的替代文本，必须自带信息量 */
	alt: string;
	/** 图注：一句结论，不复述标题 */
	caption: string;
	/** 派生来源的 FlowViz demo key，供审计回溯与重录 */
	source: string;
	/** 逐帧口播文稿，长度须与 source 的帧数一致 */
	narration?: string[];
}

export const mediaAssets: Record<string, MediaAssetConfig> = {
	'mysql-2pc-video': {
		title: '两阶段提交 · 配音短片',
		src: '/videos/mysql-2pc-video.mp4',
		poster: '/videos/mysql-2pc-video.poster.png',
		width: 1280,
		height: 858,
		duration: 57.2,
		alt: '动画短片：一条 UPDATE 依次经过 Server 层与 InnoDB，先写 redo log 置 prepare，' +
			'再写 binlog，最后把 redo log 置 commit，两阶段提交把两套日志绑成原子单元。',
		caption: '一句 UPDATE 的旅程：redo 保崩溃安全，binlog 保复制归档，中间夹着的这段就是两阶段提交。',
		source: 'mysql-2pc',
		narration: [
			'一条 UPDATE 的旅程，看两阶段提交发生在哪一步。',
			'Server 层先鉴权、解析、选索引，再交给执行器发起读写。',
			'执行器调用 InnoDB，按主键定位这行所在的数据页。',
			'Buffer Pool 里改成新值成为脏页，日志没写妥就不能提交。',
			'第一步写 redo log，记下改了哪页哪偏移，状态置 prepare。',
			'第二步回 Server 层写 binlog，主从复制和时点恢复都靠它。',
			'redo 置 commit，崩溃时按 binlog 是否完整来决断。',
			'两套日志绑成原子单元，向客户端返回执行成功。',
			'脏页由后台线程择机刷盘，宕机也有 redo 重放兜底。',
			'记住分工：redo 保崩溃安全，binlog 保复制与归档。',
		],
	},
	'mysql-2pc-card': {
		title: '两阶段提交 · 复盘图卡',
		src: '/images/mysql-2pc-card.png',
		width: 1352,
		height: 906,
		alt: '静态图卡：一条 UPDATE 的完整链路——执行器经引擎接口写 Buffer Pool 数据页，' +
			'redo log 标 commit、binlog 标已写入，脏页由后台刷盘。',
		caption: '复盘一张图：redo（物理日志）保崩溃安全，binlog（逻辑日志）保复制与归档。',
		source: 'mysql-2pc',
	},
	'url-to-page-video': {
		title: '输入 URL 到页面显示 · 配音短片',
		src: '/videos/url-to-page-video.mp4',
		poster: '/videos/url-to-page-video.poster.png',
		width: 1280,
		height: 786,
		duration: 56.9,
		alt: '动画短片：一次 https://example.com 访问依次经过 DNS 解析、TCP 三次握手、TLS 握手、' +
			'HTTP 请求、服务端链路、响应回程与渲染，八步串成一条因果链，也是线上排障的地图。',
		caption: '八步因果链既是背八股的总纲，也是排障的地图：倒着二分，curl 直打后端 IP 就知道断在哪一段。',
		source: 'url-to-page',
		narration: [
			'输入 URL 到页面显示，是网络八股的总纲。',
			'DNS 解析：浏览器缓存、hosts、本地 DNS 逐级问到权威。',
			'首次解析可能跨多个来回，所以各级缓存很关键。',
			'TCP 三次握手，同步双方的初始序号。',
			'https 才有这一步：验证书、协商会话密钥。',
			'发 HTTP 请求，带 Cookie，经 CDN 与负载均衡进服务端。',
			'服务端这段最常出故障：网关、慢 SQL、线程池。',
			'keep-alive 下连接不断，后续请求直接复用。',
			'最后渲染成页面；排障时把这条链倒着二分。',
		],
	},
};
