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
	'tcp-handshake-video': {
		title: 'TCP 三次握手 · 配音短片',
		src: '/videos/tcp-handshake-video.mp4',
		poster: '/videos/tcp-handshake-video.poster.png',
		width: 1280,
		height: 732,
		duration: 41.6,
		alt: '动画短片：TCP 三次握手逐帧走完，SYN、SYN+ACK、ACK 三个报文与两端状态徽标同步迁移，' +
			'讲清每一次同步了什么序号，以及只握两次会为历史连接留下什么。',
		caption: '握手不是背三步，而是两个「为什么」：每次同步了谁的序号，以及第三次为什么是给历史连接留的否决机会。',
		source: 'tcp-handshake',
		narration: [
			'服务端先监听，客户端主动建连；为什么恰好三次，最后一帧揭晓。',
			'第一次：客户端发 SYN，带上初始序号 x，自己进入 SYN_SENT。',
			'第二次：服务端回 SYN+ACK，序号从 y 起，同时确认 x+1。',
			'第三次：客户端回 ACK 确认 y+1，也是给历史连接留的否决机会。',
			'两次不行：旧 SYN 会让服务端白分配资源；三次是互认收发能力的最低次数。',
			'双方序号坐标系对齐完毕，连接建立，开始传数据。',
		],
	},
	'tcp-close-video': {
		title: 'TCP 四次挥手 · 配音短片',
		src: '/videos/tcp-close-video.mp4',
		poster: '/videos/tcp-close-video.poster.png',
		width: 1280,
		height: 690,
		duration: 48.1,
		alt: '动画短片：TCP 四次挥手逐帧走完，两侧状态徽标随 FIN 与 ACK 迁移，' +
			'讲清半关闭为什么让 ACK 和 FIN 分成两次，以及 TIME_WAIT 为何落在主动关闭方。',
		caption: '挥手的主线不是背四步，而是两个「为什么」：为什么四次（半关闭），为什么等 2MSL（兜底 ACK + 清洗旧报文）。',
		source: 'tcp-close',
		narration: [
			'传输完毕，开始断开。四次挥手谁都能先发起，这里假设客户端先关。',
			'客户端发出第一个 FIN，进 FIN_WAIT_1，我的数据发完了。',
			'服务端回 ACK，进 CLOSE_WAIT；连接只关了一半。',
			'服务端把剩下的数据接着发完，这就是半关闭的意义。',
			'数据发完，服务端发 FIN 进 LAST_ACK，关掉剩下那个方向。',
			'客户端回最后一个 ACK，却进 TIME_WAIT，定时 2MSL。',
			'等 2MSL 有两个理由：ACK 丢了能重答，旧报文自然消亡。',
			'2MSL 到期双方关闭；TIME_WAIT 只属于主动关闭的一方。',
		],
	},
	'redisson-watchdog-video': {
		title: 'Redisson 看门狗 · 配音短片',
		src: '/videos/redisson-watchdog-video.mp4',
		poster: '/videos/redisson-watchdog-video.poster.png',
		width: 1280,
		height: 786,
		duration: 51.9,
		alt: '动画短片：Redisson lock() 不指定 leaseTime 时，后台看门狗每 10 秒检查锁归属并将 TTL 续回 30 秒；unlock 停止续期，显式 leaseTime 不启动看门狗，客户端崩溃后锁最多 30 秒自动过期。',
		caption: '不指定 leaseTime 才由看门狗续期；显式租期与进程崩溃都让锁按 TTL 到期。',
		source: 'redisson-watchdog',
		narration: [
			'业务跑四十秒，锁 TTL 只有三十秒，不续期就会失去互斥。',
			'lock() 不传 leaseTime，成功后默认 TTL 三十秒。',
			'同进程看门狗每十秒检查锁是否仍归当前线程持有。',
			'业务继续跑，TTL 燃烧；检查时还剩十四秒。',
			'确认仍持有锁，看门狗把 TTL 续回三十秒。',
			'业务未结束，看门狗持续续期，避免锁提前失效。',
			'finally 调用 unlock 删除锁 key，看门狗停止。',
			'显式传入十秒 leaseTime，就不启动看门狗。',
			'客户端崩溃后无人续期，锁最多三十秒自动过期。',
		],
	},
	'kafka-segment-video': {
		title: 'Kafka segment 的一生 · 配音短片',
		src: '/videos/kafka-segment-video.mp4',
		poster: '/videos/kafka-segment-video.poster.png',
		width: 1280,
		height: 808,
		duration: 52.6,
		alt: '动画短片：一个 Kafka 分区在磁盘上的 segment 文件串，逐帧走完生产者顺序追加、' +
			'消费者按 offset 查稀疏索引、写满后封口滚出新段、retention 到期整文件删除四个阶段。',
		caption:
			'写得快、读得不慢、清得便宜：顺序追加 + 分段滚动 + 稀疏索引 + 整文件删除，四件事合起来才是高吞吐。',
		source: 'kafka-segment',
		narration: [
			'一个分区在磁盘上就是一串 segment 文件，只追加、不改写。',
			'生产者把消息批次发进 0 号分区，目录就是这一排段文件。',
			'写入永远落在活跃段的文件尾：磁盘顺序写接近内存随机写。',
			'消费按 offset 取数据，先查稀疏索引——只给少量消息建条目。',
			'索引只答「大致在哪个位置」，找到起点后再顺序扫几条。',
			'写满 log.segment.bytes 或到时间就封口，另起新段接着写。',
			'retention 到期就删掉最旧那整个文件，不逐条删，代价 O(1)。',
			'顺序追加、分段滚动、稀疏索引、文件级删除，换来高吞吐。',
		],
	},
	'es-write-video': {
		title: '一次写入到可搜索 · 配音短片',
		src: '/videos/es-write-video.mp4',
		poster: '/videos/es-write-video.poster.png',
		width: 1280,
		height: 860,
		duration: 51.9,
		alt: '动画短片：一篇文档在 ES 主分片上依次经过协调节点路由、写内存 buffer 与 translog、' +
			'复制给副本、refresh 成不可变 segment 变得可搜、后台 flush 落盘变得可持久，逐帧讲清近实时从哪来。',
		caption:
			'「写入成功」不等于「搜得到」：buffer 与 translog 只保证不丢，可搜索要等 refresh，可持久要等 flush。',
		source: 'es-write',
		narration: [
			'一次写入怎么变成可搜索？四个动作逐个登场。',
			'写请求发给任意节点，它充当这次的协调节点。',
			'按 _id 哈希算出目标分片，转发给 P0 所在节点。',
			'写进内存 buffer 和 translog，此时还搜不到。',
			'主分片并行复制给副本，各写各的缓冲和日志。',
			'副本回 ACK，同步组全部到位这次写才算成功。',
			'确认逐层返回，客户端拿到成功，但文档仍搜不到。',
			'到 refresh 就生成新段，文档从此可搜，这叫近实时。',
			'后台 flush 落盘并把日志清空，此时才算持久。',
			'refresh 管可搜，flush 管持久，merge 管回收。',
		],
	},
	'java-classload-video': {
		title: '类加载五阶段 · 配音短片',
		src: '/videos/java-classload-video.mp4',
		poster: '/videos/java-classload-video.poster.png',
		width: 1280,
		height: 786,
		duration: 48.5,
		alt: '动画短片：一个类从 .class 字节码到可用，依次经过加载、验证、准备、解析、初始化五个阶段，' +
			'逐帧讲清准备期静态变量只拿到零值、真正赋值要等初始化执行 <clinit>，以及主动引用才触发初始化。',
		caption:
			'五阶段里两处反直觉都在后半程：准备期 `a` 还是 0，写进 1 的是加锁执行、只跑一次的 <clinit>。',
		source: 'java-classload',
		narration: [
			'类从字节码到可用要走五步：加载、验证、准备、解析、初始化。',
			'加载：读入字节流，在方法区建类结构，堆里生成 Class 对象。',
			'验证：格式、语义、字节码、符号引用四道安检，坏字节码挡在门外。',
			'准备：静态变量只分配内存设零值，源码写 1 此刻仍是 0。',
			'解析：把符号引用换成直接引用，这一步可推迟到运行期。',
			'初始化：静态变量才真正赋值，JVM 给这段执行加锁，只跑一次。',
			'初始化由主动引用触发：new、反射、初始化子类连带父类。',
		],
	},
	'kafka-producer-video': {
		title: '生产者 send() 的旅程 · 配音短片',
		src: '/videos/kafka-producer-video.mp4',
		poster: '/videos/kafka-producer-video.poster.png',
		width: 1280,
		height: 808,
		duration: 45.3,
		alt: '动画短片：一条消息在 Kafka 生产者客户端里依次经过主线程的序列化与分区选择、' +
			'累加器按分区攒批、Sender 线程批量取出、发往分区 Leader 追加日志、ISR 副本按 acks 裁决，确认沿路返回后回调才触发。',
		caption:
			'send() 返回只走到累加器那一步：落盘要等 Leader 追加、acks 裁决；丢、重、乱都能沿这条双线程路径定位。',
		source: 'kafka-producer',
		narration: [
			'send() 返回不等于发送成功，主线程只做了三件事。',
			'序列化、按三规则选分区，再返回 Future，全程不碰网络。',
			'进累加器：每个分区一个队列，攒满或到点才发。',
			'Sender 线程把凑好的整批取走，主线程与网络解耦。',
			'整批发往分区 Leader，Leader 顺序追加到本地日志。',
			'acks 三档定谁回了才算数，也就定下丢数据的窗口。',
			'确认沿路返回触发回调；失败重试，开幂等才不重不乱。',
			'复盘这条路径：丢了、重了、乱了，都能定位到环节。',
		],
	},
	'redis-sentinel-video': {
		title: '哨兵故障转移 · 配音短片',
		src: '/videos/redis-sentinel-video.mp4',
		poster: '/videos/redis-sentinel-video.poster.png',
		width: 1280,
		height: 846,
		duration: 48.9,
		alt: '动画短片：主库失联后，三个哨兵每秒探活把它记成主观下线、互相问成客观下线，' +
			'过半选出 leader，leader 按优先级与复制位点把从库晋升为新主，其余从库改挂新主，卡住的旧主恢复后被降级重同步。',
		caption:
			'故障转移三道关：探活记主观下线、quorum 定客观下线、majority 定 leader——两个门槛各自管什么，别混。',
		source: 'redis-sentinel',
		narration: [
			'主从只保证有备份，主库挂了要人工切——哨兵来自动化。',
			'哨兵每秒 ping 主库、从库和彼此；超时无回应记主观下线。',
			'主观下线一人说了不算，它去问其他哨兵是否同意。',
			'同意数达到 quorum，客观下线才成立。',
			'哨兵再拉票选 leader，过半当选，由它执行切换。',
			'挑新主先排掉断线和延迟大的，再按三条规则排序。',
			'胜出的从库晋升新主，其余改挂新主，客户端重连。',
			'旧主只是卡了又恢复，会被降级重同步，写入丢失。',
			'quorum 定下线，majority 定 leader，两个数别混。',
		],
	},
	'mysql-replication-video': {
		title: '主从复制链路 · 配音短片',
		src: '/videos/mysql-replication-video.mp4',
		poster: '/videos/mysql-replication-video.poster.png',
		width: 1280,
		height: 810,
		duration: 52.9,
		alt: '动画短片：一条主库更新依次走完 binlog 落盘、dump 线程推送、从库 IO 线程写 relay log、' +
			'SQL 线程重放四步落到从库，末两帧对比默认异步与半同步在主库何时返回上的差别。',
		caption:
			'三个线程各管一段：relay log 把接收与重放解耦，异步与半同步差的只是主库等不等那句「收到」。',
		source: 'mysql-replication',
		narration: [
			'主从复制靠三个线程和两份日志，看一条更新怎么走到从库。',
			'主库执行写入，提交时按顺序写进 binlog，复制只认这一份日志。',
			'binlog 落盘，主库 dump 线程待命，把它推给每一台从库。',
			'断线重连按 GTID 或位点续传，不重复也不丢。',
			'从库 IO 线程先把它写成本地 relay log，接收和重放就此解耦。',
			'SQL 线程重放 relay log，应用到从库数据，追平后读流量才安全。',
			'默认是异步，主库提交就返回不等从库，延迟由此而来。',
			'半同步折中：至少一台从库收到才返回，降点吞吐换不丢数据。',
		],
	},
	'zk-zab-video': {
		title: 'ZAB 写流程 · 配音短片',
		src: '/videos/zk-zab-video.mp4',
		poster: '/videos/zk-zab-video.poster.png',
		width: 1280,
		height: 786,
		duration: 46.0,
		alt: '动画短片：一次 ZooKeeper 写入依次经过 Leader 分配 zxid、按序广播 Proposal、' +
			'Follower 落盘回 ACK、过半提交后广播 COMMIT，末两帧演 Leader 宕机后 zxid 最大者当选并先同步数据。',
		caption:
			'那句 ACK 的意思是「我已持久化」而不是「已对客户端可见」——恢复时已过半的写不丢，未过半的丢弃。',
		source: 'zk-zab',
		narration: [
			'ZAB 写流程：排序、广播 Proposal、过半 ACK、提交。',
			'写请求只由 Leader 处理，每个写分配全局递增的 zxid。',
			'Proposal 按 zxid 顺序广播，Follower 各自落盘。',
			'Follower 落盘才回 ACK：我已持久化，不是已对客户端可见。',
			'过半 ACK 到齐（三台取两台），Leader 提交后广播 COMMIT。',
			'Follower 应用变更，Leader 回客户端，顺序一致靠 zxid。',
			'Leader 宕机选主：zxid 最大者当选，已过半不丢，未过半丢弃。',
			'新 Leader 先同步数据再服务：广播与恢复循环，与 Raft 同源。',
		],
	},
	'seata-at-video': {
		title: 'Seata AT 一二阶段 · 配音短片',
		src: '/videos/seata-at-video.mp4',
		poster: '/videos/seata-at-video.poster.png',
		width: 1280,
		height: 798,
		duration: 53.1,
		alt: '动画短片：一次 Seata AT 全局事务依次演 TM 申请 XID、RM 代理拦截 SQL 生成 undo log、' +
			'一阶段本地提交当场释放行锁、分支二同样处理、全局提交后异步删 undo log，末两帧演按改前镜像反向补偿与 AT 不是 2PC 的复盘。',
		caption:
			'行锁在本地提交那刻就放了，只留一把 TC 侧全局锁——这一条把 AT 和两阶段提交分开。',
		source: 'seata-at',
		narration: [
			'三角色分工：TM 发起、TC 协调、RM 管分支。',
			'注解开启全局事务，向 TC 申请唯一的 XID 往下传播。',
			'RM 拦截 SQL，解析改前改后镜像，生成 undo log。',
			'一阶段当场提交本地事务，行锁立刻释放，不等二阶段。',
			'分支二同样：留镜像、拿全局锁、本地提交并注册。',
			'全局提交只做异步清理：删掉 undo log，几乎零成本。',
			'任一分支失败就全局回滚，按镜像反向补偿，脏写人工兜。',
			'所以 AT 不是两阶段提交：本地锁提交时就放了，只留 TC 侧全局锁。',
		],
	},
	'rocketmq-tx-video': {
		title: 'RocketMQ 事务消息 · 配音短片',
		src: '/videos/rocketmq-tx-video.mp4',
		poster: '/videos/rocketmq-tx-video.poster.png',
		width: 1280,
		height: 690,
		duration: 57.6,
		alt: '动画短片：下单扣库存一条事务消息依次演半消息进 Broker 但对消费者不可见、确认到手才执行本地事务、' +
			'成功回 commit 让半消息转正投递给库存服务、失败 rollback 直接删除，末两帧演 Broker 定时回查本地订单表与整条链复盘。',
		caption:
			'悬念由半消息锁住、定论由本地事务给、兜底由回查做——它换掉的是自建那张本地消息表。',
		source: 'rocketmq-tx',
		narration: [
			'本地消息表要建表还要扫表，RocketMQ 把这套做法内建成了协议。',
			'第一步发半消息进 Broker：消息已经存下，但对消费者完全不可见。',
			'确认到手才执行本地事务：订单落库，投不投递的悬念先由半消息锁住。',
			'本地事务成功就回 commit：半消息转正，消费者这才看得见它。',
			'链路在库存服务消费后闭合；本地事务失败就 rollback，半消息删除。',
			'要是生产者宕机、commit 丢了，Broker 收不到确认就定时回查它。',
			'生产者拿本地订单表作答：查得到就转正，查不到就删除半消息。',
			'半消息锁悬念、本地事务给定论、回查兜底；强一致留给 Seata。',
		],
	},
	'java-tricolor-video': {
		title: '三色标记与并发漏标 · 配音短片',
		src: '/videos/java-tricolor-video.mp4',
		poster: '/videos/java-tricolor-video.poster.png',
		width: 1280,
		height: 836,
		duration: 57.5,
		alt: '动画短片：并发标记把对象分成白未扫、灰扫了自己没扫成员、黑全部扫完三色，' +
			'逐帧演灰对象删掉到白对象的引用、黑对象又新增指向这个白对象的引用，两个动作凑齐漏标，' +
			'清理阶段白对象被当垃圾回收，末帧给出增量更新与原始快照两条补救路线。',
		caption:
			'漏标要两个条件同时成立：黑色不再重扫看不见新边，灰色删掉的那条引用没人再去找它。',
		source: 'java-tricolor',
		narration: [
			'三色标记：白没扫到，灰扫了自己没扫成员，黑全扫完。',
			'先从根扫，GC Roots 直连的对象变灰，成员还没查。',
			'扫 A：把它引用的 B、D 拉成灰，A 自己转黑。',
			'灰队继续清空，可达对象全黑即标记完成，还没有并发。',
			'并发来了：A 黑、B 灰、C 白，业务线程连做两个动作。',
			'动作一：灰的 B 删掉到 C 的引用，C 没了会扫它的来源。',
			'动作二：黑的 A 新增指向 C 的引用，黑色不再重扫。',
			'两个条件凑齐：清理时 C 仍是白，被当垃圾回收。',
			'补救两派：CMS 记下黑对象的新边再扫，G1 按删前快照重标。',
		],
	},
	'tls-handshake-video': {
		title: 'TLS 1.2 握手 · 配音短片',
		src: '/videos/tls-handshake-video.mp4',
		poster: '/videos/tls-handshake-video.poster.png',
		width: 1280,
		height: 690,
		duration: 52.3,
		alt: '动画短片：一条明文连接按 TLS 1.2 依次演客户端报上随机数与候选密码套件、服务端回自己的随机数' +
			'和装着公钥的证书、客户端验域名与有效期并把签发链追到本机内置根 CA、用公钥加密送出预主密钥、' +
			'双方各自派生出同一把会话密钥、互发 Finished 校验握手没被篡改，末帧收在应用数据全部改走对称加密。',
		caption:
			'非对称那把钥匙全程只出场一次：它负责把「种子」搬过信道，之后每一条数据都由会话密钥对称加密。',
		source: 'tls-handshake',
		narration: [
			'明文连接怎么变成加密通道：加密防窃听、证书防冒充、校验防篡改。',
			'客户端发 ClientHello：带上一个随机数和支持的密码套件。',
			'服务端回自己的随机数、选定算法，公钥就在发来的证书里。',
			'客户端验证书：域名匹配、在有效期内、签发链追到本机内置根 CA。',
			'客户端生成预主密钥，用证书里的公钥加密发过去，没私钥解不开。',
			'双方各自用两个随机数加预主密钥，派生出同一个会话密钥。',
			'互发 Finished：给之前全部握手报文做签名，篡改当场识破。',
			'之后数据全走对称加密：非对称只在握手搬一次种子。',
		],
	},
	'js-event-loop-video': {
		title: '事件循环 · 配音短片',
		src: '/videos/js-event-loop-video.mp4',
		poster: '/videos/js-event-loop-video.poster.png',
		width: 1280,
		height: 750,
		duration: 55.8,
		alt: '动画短片：一段同步代码里同时登记 setTimeout 与 Promise 的 then，逐帧演调用栈清空后先清空整个' +
			'微任务队列、再取一个宏任务执行、宏任务跑完又清一遍微任务才轮到渲染，末帧收在两条排班铁律。',
		caption:
			'微任务插队插在渲染和下一个宏任务之前——这就是「3 2 1」里那个 1 排到最后的全部原因。',
		source: 'js-event-loop',
		narration: [
			'排班表：同步跑完，清空全部微任务，渲染，再取一个宏任务。',
			'同步里遇到 setTimeout，回调不是零毫秒后执行，是排进宏任务队列。',
			'遇到 Promise 的 then，回调进微任务队列，和宏任务不同班次。',
			'同步执行完、调用栈清空，此刻微一个宏一个，谁先跑？',
			'先清空整个微任务队列：then 立刻执行，它插队在渲染和下一个宏任务之前。',
			'微队列空了，循环才取一个宏任务，setTimeout 回调到这一步才跑。',
			'宏任务跑完再清一遍微任务，才轮到渲染，每个宏任务都是清空点。',
			'两条铁律：每个宏任务之后清空全部微任务，微任务永远优先于宏任务。',
		],
	},
	'rabbitmq-reliable-video': {
		title: '可靠投递 · 配音短片',
		src: '/videos/rabbitmq-reliable-video.mp4',
		poster: '/videos/rabbitmq-reliable-video.poster.png',
		width: 1280,
		height: 810,
		duration: 53.4,
		alt:
			'动画短片：一条持久化消息依次经过生产者发布、Broker 内存入队、落盘、回 confirm、投递消费者与手动 ACK，' +
			'八帧走完，末帧收在「生产者到 broker」与「消费者到 broker」两段独立责任链。',
		caption:
			'confirm 只证明 broker 收到了，消费成败归手动 ACK——两段责任链各守一段才叫不丢，重发造成的重复交给幂等。',
		source: 'rabbitmq-reliable',
		narration: [
			'「不丢」是三段责任链：生产者确认、broker 持久化、消费者手动 ACK。',
			'生产者发持久化消息，delivery_mode 为 2，经交换机路由进队列。',
			'消息先进内存排队，落盘前都不可靠，确认此刻被门控着。',
			'durable 队列收下这条消息，写盘完成才有资格回确认。',
			'生产者收到确认才删本地待确认记录，收不到就超时重发。',
			'随后 broker 投递给消费者，确认只代表收到，与消费成败无关。',
			'消费者处理完回手动 ACK，broker 才删这条，没 ACK 就重新入队。',
			'两段责任链各自守住才不丢，重发造成的重复交给业务幂等。',
		],
	},
	'mongo-election-video': {
		title: '复制集选举 · 配音短片',
		src: '/videos/mongo-election-video.mp4',
		poster: '/videos/mongo-election-video.poster.png',
		width: 1280,
		height: 750,
		duration: 50.1,
		alt:
			'动画短片：三成员复制集在 Primary 宕机后依次经过心跳失联、自检资格、同僚新鲜度仲裁、' +
			'Elect 投票与三十秒选举锁、过半当选与驱动自动切换，八帧走完，末帧收在旧主回滚降级。',
		caption:
			'旧数据没资格当主：选举要过新鲜度仲裁与多数派投票两道，凑不齐多数派就整体只读而不出双主。',
		source: 'mongo-election',
		narration: [
			'三个投票成员的复制集，两两每两秒一次心跳，各看各的视角。',
			'主挂了，S2 心跳超时先按自己视角标记它失联，再自检资格。',
			'它向同僚发新鲜度检查：oplog 不是最新的，没资格当主。',
			'同僚校验通过，确认它的数据够新，可以参选。',
			'资格落定，正式向存活成员发起投票求票。',
			'投票方三十秒内持有选举锁，不再投给别人；过半即当选。',
			'新主上任，驱动感知拓扑变化自动把写入切过来，应用基本无感。',
			'旧主回来要回滚分叉的日志再降级加入；凑不齐多数派就全体只读。',
		],
	},
	'pg-wal-video': {
		title: 'WAL 与崩溃恢复 · 配音短片',
		src: '/videos/pg-wal-video.mp4',
		poster: '/videos/pg-wal-video.poster.png',
		width: 1280,
		height: 808,
		duration: 51.4,
		alt:
			'动画短片：一条修改依次经过追加 WAL 并落盘、把共享缓冲里的数据页改脏、提交返回、' +
			'后台刷盘、checkpoint 记下重放起点、崩溃、从起点重放补齐，九帧走完，末帧收在同一条日志还养着流复制。',
		caption:
			'提交成功只欠日志落盘，数据页可以晚刷——checkpoint 不是「刷不刷日志」的开关，而是崩溃后重放从哪儿起步。',
		source: 'pg-wal',
		narration: [
			'契约只有一句：改数据页之前，先把这一改写进日志。',
			'这条修改先追加进 WAL 并 fsync，等哪一步看提交参数。',
			'数据页这时才在缓冲区里被改脏，内存可见、文件还没变。',
			'日志落了盘就能回提交成功，脏页可以晚一点再刷。',
			'后台进程择机刷盘，铁律是日志必须先于它描述的页落盘。',
			'checkpoint 批量刷脏页，顺手记一条「到此都已落盘」。',
			'崩溃！内存里的脏页全丢，数据文件停在旧状态。',
			'从上一个起点重放 WAL，整页镜像保证拼不出半页。',
			'一条 WAL 养两件事：崩溃恢复，和流复制那份副本。',
		],
	},
	'rabbitmq-dlq-video': {
		title: '死信与延迟消息 · 配音短片',
		src: '/videos/rabbitmq-dlq-video.mp4',
		poster: '/videos/rabbitmq-dlq-video.poster.png',
		width: 1280,
		height: 786,
		duration: 48.6,
		alt:
			'动画短片：一条订单消息依次经过进无人消费的延迟队列、在队头等 TTL 到期、过期变死信转投 DLX、' +
			'按绑定规则投进业务队列、消费者到点执行取消，七帧走完，末帧收在「用等待换延迟」与同一口 DLX 兜住失败告警。',
		caption:
			'延迟不是谁在计时，而是消息先过期——队头没到期后面全堵，这是 TTL 方案的结构性边界。',
		source: 'rabbitmq-dlq',
		narration: [
			'没有原生延迟队列，经典解法是 TTL 加死信的组合拳。',
			'订单消息不进业务队列，只进无人消费、设了 TTL 的延迟队列。',
			'它在里头躺着等过期，只看队头，队头没到期后面全堵。',
			'三十分钟到，消息过期变死信，自动转给队列绑定的死信交换机。',
			'交换机按绑定规则把它投进业务队列，忘了绑队列就无路可走。',
			'消费者到点才第一次见到它，执行取消，全程不轮询不扫表。',
			'复盘一句：用等待换延迟，同一口死信交换机还兜住失败与告警。',
		],
	},
	'mqtt-qos2-video': {
		title: 'QoS2 四段握手 · 配音短片',
		src: '/videos/mqtt-qos2-video.mp4',
		poster: '/videos/mqtt-qos2-video.poster.png',
		width: 1280,
		height: 690,
		duration: 51.3,
		alt:
			'动画短片：一条 QoS2 消息依次经过带消息编号的 PUBLISH、接收方登记编号后回 PUBREC、' +
			'发送方从此只重发确认不重发数据、收到 PUBREL 才投给应用层、回 PUBCOMP 清算，八帧走完，' +
			'末帧收在两条报文至少一次与四条报文恰好一次的分工。',
		caption:
			'恰好一次不是靠少重发，而是靠接收方先把编号记下来——重复报文只补确认，不再投第二次。',
		source: 'mqtt-qos2',
		narration: [
			'QoS2 求的是恰好一次，不重也不丢，代价是四段报文。',
			'第一步发 PUBLISH 带上消息编号，没收到确认前它随时可能重发。',
			'接收方先登记这个编号，再回 PUBREC，登记就是去重的根。',
			'发送方收到 PUBREC 就明白对方已收到且已登记，从此只补确认。',
			'没等到 PUBCOMP 就重发 PUBREL，重发的是确认不是数据。',
			'收到 PUBREL 才把消息交给应用层，只交这一次，再回最后一段。',
			'窗口内再来重复报文，查到编号已登记就不再投递，只补一次确认。',
			'两条报文至少一次，四条报文恰好一次，默认前者加业务幂等。',
		],
	},
	'etcd-write-video': {
		title: 'etcd 一次写入 · 配音短片',
		src: '/videos/etcd-write-video.mp4',
		poster: '/videos/etcd-write-video.poster.png',
		width: 1280,
		height: 786,
		duration: 56.0,
		alt:
			'动画短片：一次 etcdctl 写入依次经过客户端只发给领导者、领导者追加日志并复制给跟随者、' +
			'过半确认才提交、落到多版本状态树分配全局递增版本号、订阅前缀的客户端立刻收到事件流，' +
			'八帧走完，末帧收在压缩旧版本与三者各保一条承诺。',
		caption:
			'强一致不在写入那一刻，而在过半确认；提交之后还有一次版本递增和一条事件推送，声明式系统才转得起来。',
		source: 'etcd-write',
		narration: [
			'一次写入要看三条线：Raft 定序、MVCC 留版本、Watch 推事件。',
			'客户端发起写请求，层级键加一个小值，写只发给领导者。',
			'领导者把它追加成一条日志，复制给跟随者，过半确认才提交。',
			'提交后才落到状态树，每次写分配全局递增的 revision。',
			'订阅了这个前缀的客户端立刻收到事件流，控制器随即重新收敛。',
			'默认读走共识保线性一致；换本地读更快但可能略旧，租约到期自动删键。',
			'历史版本不能无限留，压缩旧版本才压得住存储和内存膨胀。',
			'复盘：Raft 管多数派认可，MVCC 管可溯，Watch 管即时可见。',
		],
	},
	'springmvc-flow-video': {
		title: 'Spring MVC 九步流水线 · 配音短片',
		src: '/videos/springmvc-flow-video.mp4',
		poster: '/videos/springmvc-flow-video.poster.png',
		width: 1280,
		height: 810,
		duration: 54.4,
		alt:
			'动画短片：一条请求依次经过容器层的过滤器链、DispatcherServlet 的 doDispatch 总调度、' +
			'HandlerMapping 按网址与方法匹配出处理器与拦截器链、拦截器 preHandle 前置放行、' +
			'HandlerAdapter 统一适配调用并做参数与报文解析、返回值写成 JSON 或渲染视图，' +
			'八帧走完，末帧收在拦截器收尾与全局异常处理器兜底。',
		caption:
			'过滤器归容器，映射表管「找到谁」，适配器管「统一调」——九步里考点最密的三站各有归属。',
		source: 'springmvc-flow',
		narration: [
			'Spring MVC 的核心就是一个 Servlet，一条请求走完九步。',
			'第一站是过滤器链，它归 Servlet 容器规范，编码鉴权常挂在这。',
			'接着前端控制器接管，doDispatch 一启动，总调度就开始了。',
			'HandlerMapping 按网址、方法、条件，匹配出处理器与拦截器链。',
			'拦截器 preHandle 先跑，它返回否，后面所有步骤直接短路。',
			'适配器用统一姿势调用各种处理器，参数与报文解析完才执行方法。',
			'返回值分两条路：标了注解直接写 JSON，普通返回才渲染视图。',
			'最后拦截器收尾、响应回客户端；途中抛错由全局异常处理器接住。',
		],
	},
};
