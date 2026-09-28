# 题库与速答深化状态

> 本文件只剩**队列数据**：题库深化已并入「知识库无人值守演进」定时任务的 **C 车道**
> （作业规范见 `docs/evolution-recipes.md`，每轮取队列头部 3 条，收尾销号并追加 2~4 条）。
> 原「每 2 小时」独立 cron 已停用，单写者执行，不再另起调度。
> 全局轮次编号以 `docs/evolution.md` 为唯一真源，本文件**禁止自增全局轮次**；
> 下文「题库深化第 N 轮」是历史二级序号，继续沿用即可。
> 铁律不变：每轮必产出并提交推送，禁止空转；题库字段合法性已由
> `node scripts/quiz-verify.mjs` 卡住（并入 `pnpm verify:docs`），不再依赖人工纪律。

## 深化队列

### a 类：核心笔记第二题（core:true 且仅单一考点角度，按池重新入队）





















- [ ] ai/intermediate/llm/06-vllm — 第二题**角度需重定后才能出**（第 213 轮二次通读仍未解除）：队列原指定四条角度（PagedAttention 顺带 Copy-on-Write 让并行采样共享前缀 KV／前缀缓存＝相同系统提示 KV 的服务端复用／TensorRT-LLM·SGLang（RadixAttention 前缀树）·llama.cpp 三家核心思想趋同／HF 直接推理「能跑不等于能服务」）**已被首题 `ai-vllm-050` 的 hint 逐条点名**（第 208 轮实测），照原角度出第二题等于把首题讲解再考一遍。第 213 轮按残余角度复核：正文第 15~19 行与速答第一条**确实把「内部碎片＝按最大长度预留的预留未用／外部碎片＝连续分配失败」写清了且首题未考**（该轮实测把首题正确项、干扰项与 hint 全量与正文逐句比对，碎片这一档零命中），但把「两类碎片归属」拆成两条正确项后，第三条只能落回「延迟约束内把 batch 推到最大」——那句是首题 `ai-vllm-050` 的**正确项本身**，闸门第 9 项的「正确项↔正确项 ≥12 字」必判红；「本篇管全体请求效率 vs 推理参数篇管单请求效果」只有一条，凑不出 3 正确 + 2 干扰。**仍待裁决的两条路线**：给该篇补一节「碎片分类与两层分工」的正文再考（A 车道的活），或把队列位置让给别的 core 笔记。（首题 `ai-vllm-050` 已考「分页机制与浪费 60%~80%→4%、静态批陪跑与迭代级调度、TTFT/TPOT 约束内把 batch 推到最大、瓶颈是显存带宽而非算力」）。**第 231 轮按 a 类头部顺序取点时未三度通读**：本轮取的是其后三条「0 题补缺」首题，该条限制（撑不起 3 正确 + 2 干扰）原样生效
- [x] distributed/intermediate/case-studies/31-bloom-filter — **done 2026-09-28（第 213 轮车道 C 出 `dist-bloom-046` multiple／d4）**。队列原指定的「RedisBloom 命令 + 三种删除方案 + n 为实际元素数」经复算**大半撞首题 `dist-bloom-044` 的 hint**（末段已点名 BF.ADD/BF.EXISTS、CF 变体与定期全量重建，Counting 空间 ×4~8 更已是首题正确项）；本轮改取四条未触及角度出第二题——**方向性决定适用场景**（速答第一条「方向性是理解布隆的钥匙」）、**公式里 n 的容量规划含义**（超量写入摊薄位比、误判率偏离设计值）、**Counting 与 Cuckoo 的取舍不等价**（一个用空间换删除、一个能删还更省，正文只到「新场景优选」故题面只问优选不引申到极限场景）、**百万级以下走 Set 这条内存预算决定选型的口径**；错项把「存在」说成精确结论并按正文否定。**入队第 9 项实测的一条写法教训**：初稿 hint 把首题 hint 的「正文明确数据量小（百万级以下）用 Set…才换布隆」整句逐字复述（28 字），改一稿又复述了「数据量可控时定期全量重建新过滤器」（16 字）——两稿都把观察级计数从 **4 对推到 5 对**（闸门只判红「正确项↔正确项／正确项↔hint」，**hint↔hint 的机械复述不判红却同样在白送分**），第二稿换成不复述的措辞后计数回落 **4 对**；这条应升为写题纪律（讲解可以引用正文，不要引用另一题的讲解）。
- [ ] distributed/intermediate/case-studies/17-payment — 第二题**角度两次复算均未解除**（第 208、213 轮）：原指定「退款三纪律 + 部分退多次退 + 网关只暴露 pay(...) 的用意」——前半整段就是首题 `dist-payment-045` hint 末句「顺手记一条」，后半撞其正确项 4（渠道差异终结在网关层）。第 213 轮回正文逐句比对，**未被首题选项与 hint 触及的只剩两处短句**：「微信分、支付宝元」这个具体单位差异（首题只考「统一用分」这一侧），以及状态机里「支付成功 → 退款中 → 已退款」「支付中 → 已关闭（超时关单）」两条转移的归属——**都撑不起 3 正确 + 2 干扰**，宁缺毋滥继续留队。可行的解除路线：退款链路的专篇是 `distributed/intermediate/case-studies/28-refund`（core、第 213 轮实测**全站 0 题**），**已按「0 题补缺」在本轮入队为首题条目**，支付篇这条改由该宿主承接后可销号（**第 231 轮兑现**：该宿主已出 `dist-refund-047`，其三线时长差与额度时限那两档改由 d 类新条目承接；支付篇这条限制原样生效、未三度通读）
- [ ] js/intermediate/node/04-stream — 第二题**角度两次复算均未解除**（第 208、213 轮）：原指定的四项（手写 data/drain 配对、`stream/promises` 与 stream-compose 同属替代 pipe、串多个 transform 成处理链、三块典型舞台）**全部在首题 `js-stream-026` 的 hint 里已点名**。第 213 轮回正文逐句比对，剩余未被触及的只有「大文件复制那段 `rs.pipe(ws)` 的代码形态」与 mermaid 里 false→暂停/drain→恢复的归属——**两者都已被 hint 覆盖**（背压自动调节那句）；本篇 80 行、正文骨架即「四类型表 + 背压 + pipeline + 三条速答」，**没有够撑起 3 正确 + 2 干扰的第三档**，宁缺毋滥继续留队。解除路线同支付篇：要么由 A 车道给该篇补一节（如 objectMode / highWaterMark / 背压手写实现——**但这些正文目前都没写，不能凭空出题**），要么把队列位置让给别的 core 笔记（**第 231 轮按头部顺序取点时未三度通读，该限制原样生效**；本轮让位的是其后三条「0 题补缺」条目）
- [x] mongodb/intermediate/usage/09-multikey-index — **done 2026-09-28（第 225 轮车道 C 出 `mongo-multikey-150` single／d4，按三清单复算改道）**。复算订正：原指定两条里「写放大与数组长度成正比、超大数组走桶模式」那半**已在首题 `mongo-multikey-015` 的 hint 末句整句送出**（第 203 轮写首题 hint 时就带上它，第 213 轮入队只比对了首题选项、漏比 hint，本轮按「正确项／干扰项／hint」三清单复算才判出），故不再作正确项。本篇剩下的未触面只有「覆盖查询受限且数组字段返回的是数组本身」与「点路径自动多键只允许一层、深层靠 $elemMatch 与点路径组合」两条，**凑不出 3 正确 + 2 干扰**，题形由 multiple 改道 single（1 正确项收两条边界，干扰项取「一律不能覆盖、必回表」「只返回命中的那一个元素」「嵌套数组写清点路径即可无限层」三个正文明确反对的说法）。至此该篇两题把正文覆盖面吃满，**不再入队第三题**。原指定角度（保留备查）：第二题考「多键索引的写放大代价（N 元素 = N 个索引项、与数组长度成正比，超大数组走桶模式拆分）与覆盖查询为何对多键不友好（数组字段返回的是数组本身）」（首题 `mongo-multikey-015` 已考「自动多键化 + 一次查询一个多键 + 复合索引至多一个数组字段 + $elemMatch 防跨元素假匹配」）
- [x] java/intermediate/concurrent/06-threadlocal — **done 2026-09-28（第 213 轮车道 C 出 `java-threadlocal-144` multiple／d3，按原指定角度未改道：Map 挂在 Thread 身上的关键反转 + 读写路径 + 三个典型场景各图什么；干扰项把挂载方向说反，并复用了首题 004 那条「get 全量清理」的反例形态——实测与 004/140 的正确项与 hint 重合分别为 3/7 字，零撞车）**
- [x] java/basic/collection/03-concurrenthashmap — **done 2026-09-28（第 213 轮车道 C 出 `java-chm-145` multiple／d4：按原指定角度出到「空桶 CAS 失败回自旋循环重新定位」「double check 防锁错对象」「树化双条件」「spread 在 putVal 里排在 null 检查之后」四条正确项；对 spread 只写代码可见的「高低位异或 + 与 HASH_BITS 相与」，不引申扰动「用意」——正文档未给该理由，避免无据断言）**
- [x] java/intermediate/concurrent/05-aqs — **done 2026-09-28（第 225 轮车道 C 出 `java-aqs-148` multiple／d4，按原指定角度未改道）**。三清单复算：`java-aqs-009` 只考「volatile state + CLH 变体等待队列」一句，`java-aqs-142` 的正确项与 hint 都没碰模板方法清单、虚拟哨兵、setState 不必 CAS 与四个取值归属，故本题三条正确项零重合；干扰项取正文明确反对的说法（把哨兵读成「head 存着持锁线程」、把「按需覆写」读成「五个不补全就编译不过」）。闸门实测同篇题对 234→**240** 组、判红 **2 对**与观察 **4 对**一字未动。至此该篇三题覆盖面吃满，**不再入队第四题**（共享模式级联传播、四工具类对 state 的解释、公平与非公平只差一次检查这三档已分别在 142 的正确项与 hint 里）。原指定角度（保留备查）：第三题考「子类只需覆写 tryAcquire/tryRelease/tryAcquireShared/tryReleaseShared/isHeldExclusively 五个模板方法（默认全抛 UnsupportedOperationException）、排队挂起唤醒骨架由 acquire/release 代劳，以及自研 MyMutex 里 tryRelease 为何 setState(0) 不必 CAS（只有持锁者会调）、队列头为何是不存线程的虚拟哨兵（真正排队者从第二个节点开始）、节点为何只盯前驱的 waitStatus 而不做全队列广播（CLH 自旋锁思想在阻塞锁上的变体），以及 CANCELLED(1)/SIGNAL(-1)/CONDITION(-2)/0 四个取值的归属」（首题 `java-aqs-009` 已考「核心骨架是 volatile state + CLH 变体等待队列」，第二题 `java-aqs-142` 已考「挂起前必须先把前驱置 SIGNAL 防丢失唤醒／被唤醒 ≠ 拿到锁／park 对中断不敏感故 acquire 属不可中断模式／公平与非公平只差一次 hasQueuedPredecessors／同一块 state 在 Semaphore·CountDownLatch·读写锁里的不同解释」，两题均未触及模板方法清单、虚拟哨兵头、只盯前驱的因果与自研互斥锁细节）
- [x] java/intermediate/concurrent/06-threadlocal — **done 2026-09-28（第 225 轮车道 C 出 `java-threadlocal-149` single／d4，按余角改道）**。复算记录：余角列的两档里「Entry 继承 WeakReference、value 是普通字段即强引用」与「expungeStaleEntry 只在 set/get/rehash 顺路扫」都**已由 `java-threadlocal-144` 的 hint 整句送出**，本轮不再作正确项，只在讲解里换句式补因果；真正没被碰过的判断只剩「泄漏要**两个条件同时成立**、非池化的一次性线程不构成残留」这一条（`java-threadlocal-004` 是把三条成因并列成多选，没有做「同时满足」与「一次性线程算不算」这层判断），单条撑不起 3 正确 + 2 干扰，故题形改道 single——正确项一条把两半写全，干扰项取「key 变 null 之后 Entry 连同 value 一起被 GC 收走」「与线程寿命无关」「池把各线程的 Map 并成一张全局表」。至此该篇四题覆盖面吃满，**不再入队第五题**。原指定角度（保留备查）：**补满 3 题后的余角（第 213 轮通读钉死）**：可考「泄漏成立需要**两个条件同时满足**——ThreadLocal 实例被回收（key＝null）且线程长期存活；非池化的一次性线程用完即回收，不构成长期残留」这条机制（正文「泄漏成立需要两个条件同时满足」段与流程图末节点「线程池核心线程永生 → value 泄漏放大」），外加 Entry 那段代码的读法（Entry 继承 WeakReference、value 是普通字段即强引用）——现有三题里 004 考成因链、140 考弱引用是止血带与 ITL/TTL 及开放寻址、144 考挂载反转与三个场景各图什么，**均未把「两个条件同时满足」做成考点**
- [x] vue/basic/core/04-form-inputs — **done 2026-09-29（第 231 轮车道 C 出 `vue-formmodel-147` 与 `vue-formvalid-148` 两题，均 multiple／d4／answer [0,1,2]）**。宿主按 `.md` 现算（本队列此前多写成 `.mdx`，落点核对时以 `ls` 为准）、`src/data/quiz/vue.json` 9 题按 noteId 计数该篇 **0 命中**，天然不构成同篇撞车；原指定那一长串拆成两题各吃一半——147 收「三对 property/event、被吃掉的初始 value/checked/selected、iOS 下拉框第一项选不中的成因与 disabled 空值项」，干扰项取「true-value/false-value 会改写元素的 value 所以原生提交带得上 no」（正文那条失效边界正相反）与「IME 拼字阶段的对策是在 v-model 之外再补一个 change 监听」（官方对策是绕开 v-model 自己接 input）；148 收「:invalid 不含交互语义、pattern 不拦空值、程序写入的值不报长度约束」，干扰项取「setCustomValidity 之后靠失焦或重载自动恢复」与「novalidate 等于关掉必填判定」。跨文件现算 `novalidate|setCustomValidity|user-invalid|true-value|iOS|parseFloat` 在整个 `src/data/quiz/` **0 命中**（IM**E** 在 java/linux/network 的命中是 TIME_WAIT、NMT 等词内假阳性），这批考点站内首次被考。同方向另一宿主 `basic/core/02-component-model` 的 `vue-dataflow-005` 虽把「v-model 是 modelValue + update:modelValue 的糖」做成了正确项，属不同 noteId、闸门第 9 项不比该对；本轮正确项未取那条机制陈述，只在自己的 hint 末留一句「defineModel 的 default 不回推父组件」。**不再入队第三题以外的旧角度**，改按 d 类口径新入两条第二题（见 d 类末尾）。
- [x] vue/intermediate/routing/01-routing-and-guards — **done 2026-09-29（第 231 轮车道 C 出 `vue-router-149` multiple／d4／answer [0,1,2]）**。第 206 轮 A 车道新篇、现算 `vue.json` 该篇 0 题（第 209/210 轮两次预告「归 C 轮现算」后由第 213 轮补入队）。原队列只钉了落点与零题事实、角度留本轮通读现算，取三档：同组件换参数的复用陷阱与两条解法（watch 单参数／`onBeforeRouteUpdate` 可返回 false）、全局守卫按创建顺序且导航等全部 resolve 配 `afterEach` 改不了导航、守卫返回式四路结论（undefined|true 放行／false 取消并重置回 from／抛错交 `router.onError()`／返回地址即中断当前导航用相同 from 起新导航）；干扰项取「不通过就 next 登录地址、再无条件 next 一次是最常见写法」（官方明写这是常见错误来源、必须严格一次）与「路由组件写成 defineAsyncComponent 更稳妥、建表时就执行取函数」（官方禁止路由内用异步组件，且只第一次进入才执行并缓存）。跨文件现算 `beforeEach|afterEach|addRoute|pathMatch|beforeRouteUpdate|keep-alive` 在 `src/data/quiz/` **0 命中**；站内 `js/intermediate/web/07-route` 讲的是 hashchange/pushState 机制层、与本篇分工正文明写「不重讲机制」，未触及该题任一档。**新入两条第二题**（关卡二的匹配语法与关卡一的其余档本轮未吃）。
- [x] distributed/intermediate/case-studies/28-refund — **done 2026-09-29（第 231 轮车道 C 出 `dist-refund-047` multiple／d4／answer [0,1,2]）**。该篇 `core: true`、现算 `distributed.json` 46 题按 noteId 计数 **0 命中**。三清单复算两处撞车面：① 同篇方向的 `dist-payment-045` 是**不同 noteId**，闸门第 9 项只比同篇，但其 hint 末句已送出「退款走逆向调用渠道退款接口 + 退款单状态机 + 原路退回，同样要幂等与对账，部分退、多次退是常规定制点」——按第 213 轮「讲解可以引用正文，不要引用另一题的讲解」，本题正确项改吃该篇自己的骨架读数（可退余额公式含处理中那几笔／三线各有触发时机且到账与回仓差数量级／退款与发货的双向前置检查），「独立事实源、累计不超实付、渠道有效期与线下打款」只进 hint 且不复用那句措辞；② 同方向 `dist-coupon-042` 的正确项里有「取消或退款回到已领取」那一段（券状态机），本题库存与券那一档因此只写**触发条件**（回补挂在退货入库确认、券只在整单取消时退），不复述券的状态流转。干扰项取「申请时先把可退额度清零、退完再放开」与「退款失败重试超限就驳回申请、静默失败不会有客诉」两条正文明确反对的说法。**新入一条第二题**（渠道时限与仅退款风控那一档本轮未吃）。
- [x] mongodb/intermediate/usage/06-change-streams — **done 2026-09-28（第 227 轮车道 D 附加 1 题出 `mongo-cstream-020` multiple／d4，按原指定四条角度直取未改道）**原指定四条角度（oplog 结构化订阅视图与 tailable cursor 的对照／单文档与单分片内按 oplog 顺序但**跨分片不保证全局顺序**／事务按 majority 提交后事件才对外可见／oplog 环形滚动决定 resume token 有效期所以要进容量规划）现算本篇零既有题（`src/data/quiz/mongodb.json` 19 题按 noteId 计数 **0 命中**）、天然不构成同篇撞车；跨文件 grep `tailable|resume token|resumeToken|Change Stream|change stream` 在整个 `src/data/quiz/` **0** 命中，这是该考点群站内首次被考；与 `mongo-oplog-006` 各讲一侧（那条 hint 讲 Secondary 落后套圈要 initial-sync，本题只取本篇自己给的「MySQL binlog 同样是环形覆盖」对照，不复述他题讲解——第 213 轮那条「讲解可以引用正文，不要引用另一题的讲解」）；两个干扰项分别撞「update 事件默认带完整文档」与「token 永久有效、与 oplog 窗口无关」这两条正文明确反对的说法
- [x] mongodb/intermediate/usage/06-change-streams — **done 2026-09-29（第 237 轮车道 C 出 `mongo-cstream-022` multiple／d4／answer [0,1,2]，按原队列口径直取未改道）**。四条对照轴里正确项吃三轴：数据源范围（只认 MongoDB vs 多库统一）、消费方式（应用内直连游标 vs 经队列广播多方订阅）、适用边界（单生态轻量联动 vs 多数据源多下游强可靠）；**部署那一轴未做正确项**——首题 `mongo-cstream-020` 的正确项 0 已整句给出「应用不必额外部署解析器和消息队列就能收到变更」，再取即复述；断点续听那一格改从「外部方案拿组件换更强持久化」的对照侧入讲解，不复述 020 已考过的 token 有效期。两个干扰项取正文明确反对的说法：把表里那格的「更可靠」说成「位点不必自己管」、把部署说成唯一代价而否认两条路续听能力不同。**三清单复算读数**（与 020 按闸门第 9 项同款 DP 现算）：正确项↔正确项 **4** 字「消息队列」、正确项↔讲解 **3** 字、讲解↔讲解 **6** 字「留了一句对照」，三数全部低于 12／16 判红线；**初稿的讲解↔讲解是 9 字「位点管理是两类方案」**——那一串正是 020 讲解的原话，按第 213 轮「讲解可以引用正文，不要引用另一题的讲解」改成自己的措辞后才回落到 6 字。另把该新题与全站 716 条既有题逐条 DP：跨篇最大正确项↔正确项 **4**、正确项↔讲解 **4**、讲解↔讲解 **4**，无一条接近判红线。**至此该篇两题吃满正文覆盖面**（020：订阅视图与三档粒度／跨分片顺序／事务可见性／token 有效期／updateLookup 默认值；022：选型对照表四行），**不再入队第三题**
- [x] distributed/intermediate/case-studies/16-stock-deduction — **done 2026-09-29（第 237 轮车道 C 出 `dist-stocktime-048` multiple／d4／answer [0,1,2]，首题补缺按原指定角度直取）**。现算该篇 `core: true` 且 `src/data/quiz/distributed.json` 47 题按 noteId 计数 **0 命中**；四条角度全数落地——三时机风险方向相反（下单减怕占库存必须配超时回补／支付减的「下单成功」到支付那一刻才验证）、DB 侧条件更新的原子性由行锁兜住且先查再改必超卖、爆款单 SKU 用库存分桶拆热点行（对照热点账户缓冲记账），第四条「少卖以 DB 为准修正 Redis、回补流水兼作修复依据」让位给 hint——闸门第 6 项把选项数卡在 2~5，5 个选项里已有 3 正确 + 2 干扰，再塞第六条会越线；两个干扰项取正文明确反对的说法（把 Redis 说成事实源并按它回写 DB、以为换下单减能两头风险一起归零）。跨文件现算：`库存分桶`／`先查再改`／`缓冲记账` 在补题前全站 714 题的题目字段里 **0 命中**（该考点群站内首次被考）。同方向的 `dist-flash-026`（judge，已把「DB 层保留 where stock > 0 条件更新作兜底」说成正确陈述）与 `dist-flashrefund-036`（hint 已送出「关单回补靠延迟消息」）是最近的两个撞车面，属不同 noteId、闸门第 9 项不比该对，故按全站逐条 DP 复算：本题最大正确项↔正确项 **4** 字（`dist-cachec-015`「在并发下」）、正确项↔讲解 **5** 字（`dist-coupon-042`「建唯一索引」）、讲解↔讲解 **4** 字，无一接近 12／16 线。**第二题已按 d 规则入队见下方新条**
- [x] distributed/intermediate/case-studies/15-order-timeout — **done 2026-09-29（第 237 轮车道 C 出 `dist-closetimeout-049` multiple／d4／answer [0,1,2]，首题补缺按原指定角度直取）**。现算该篇 `core: true` 且全站 0 题；三条正确项吃「Redis 过期监听只配当辅助的两条理由（惰性删除让事件可能久延迟 + keyspace notification 是 fire-and-forget 丢事件无人补偿）／轮询与延迟消息不是对立而是分层（且延迟消息那侧仍配低频扫表兜底，因为消息本身可能丢）／撞车正解＝状态机 CAS 关单 + 已关闭自动退款 + 回补按订单号幂等」，干扰项取「内存延迟队列最可靠可作主方案」（正文定性为单机玩具、重启丢任务）与「把已关闭订单改回待支付继续走」（正文：重新下单即可，恢复订单把状态机复杂度翻倍）；hint 末段收「四方案各自致命短板逐条归属」与本篇那句问题意识。跨文件现算：`过期监听`／`keyspace`／`fire-and-forget` 在补题前全站 714 题的题目字段里 **0 命中**。最近撞车面是同方向 `dist-flashrefund-036`（其 hint 已送出「关单回补靠延迟消息」）与 `redis-expire-006`（惰性删除那一侧归 redis 方向），按全站 716 条逐条 DP：本题最大正确项↔正确项 **4** 字、正确项↔讲解 **4** 字（两者同为该 flashrefund 条的「延迟消息」）、讲解↔讲解 **5** 字（`rmq-delaylvl-016`「延迟消息的」）。**第二题已按 d 规则入队见下方新条**
- [ ] distributed/intermediate/case-studies/16-stock-deduction — 第二题考「预扣那条三段流程各步做什么（下单锁额度 → 支付转正式扣减 → 超时或取消释放）与三层组合拳的分工：Redis 预扣只挡并发、DB 条件更新才是事实源、回补闭环与定时对账各兜哪一段，以及为什么『Redis 是可丢的计数器』这句决定了对账差异只能以 DB 为准修正 Redis」（首题 `dist-stocktime-048` 已考三时机风险方向相反与各自的坑、条件更新 vs 先查再改、库存分桶拆热点行，其 hint 又送出回补按订单号幂等 + 回补流水唯一索引、少卖以 DB 记录修正 Redis、「Redis 剩余 + 已扣 = 初始库存」这条对账等式——**四条正确项与 hint 都要按三清单复算**；本轮通读实测该篇余面只剩「三段流程与各层职责」这一档，若复算仍撑不起 3 正确 + 2 干扰就地改写保留队列位，不硬凑）
- [ ] distributed/intermediate/case-studies/15-order-timeout — 第二题考「DB 轮询为什么同时是兜底对账的天然形态（MQ 方案也建议配一个低频轮询兜底，因为消息可能丢）+ 四方案致命短板的逐条归属（轮询受轮询间隔与大表扫描限制、内存队列丢在单机内存态且无法分布式、过期监听丢在不可达语义、延迟消息的代价是引入一套 MQ）+ 精度与可靠性两条轴上四方案各落在哪一格」（首题 `dist-closetimeout-049` 已考过期监听两条理由、分层与兜底、CAS 关单 + 自动退款 + 回补幂等，其 hint 已把「四方案各自短板逐条归属」与「内存队列＝单机玩具、延迟消息＝重启不丢」送出，正确项不得复述自己 hint 里那一句；**该篇 71 行、余面集中在对照表的「原理／优点」两列未被吃过的部分（如时间轮与 DelayQueue 的关系、RocketMQ 延迟级别 vs RabbitMQ TTL+死信 ——正文只写了一句括号、无展开，按「正文没写的不进题」不入考点）**，出盘前先通读判能否解除，解除不了就地改写保留队列位）
- [ ] distributed/intermediate/case-studies/06-sensitive-words — **0 题补缺·首题**（第 237 轮现算：`core: true`、全站 0 题、`core ∩ 0 题 ∩ 不在队列` 池 47 条之一）考「三层演进各自的性能理由：朴素 contains 是 O(词数 × 文本长 × 词长) 且重复比较前缀 → trie 前缀共享、单字符出发 O(最长词长) 与词库大小无关但失配后不利用已比较信息 → AC 自动机给每个节点加失败指针、文本指针永不回退、一次 O(文本长) 扫完匹配全部万级词（词库翻倍只增构建时间）」＋「与 KMP 的关系是多模式推广」＋「变体靠归一化预处理防、命中后按原文位置还原」「词库热更新走双缓冲原子替换」；干扰项取正文明确反对的说法（把万级模式拼成一条大正则、以为 trie 已经利用失配信息）；跨文件现算 `敏感词`／`AC 自动机`／`Aho-Corasick`／`双数组 trie` 在全站题目字段 **0 命中**

### b 类：旧题返修

- [ ] 抽查 hint 质量：hint 复述答案、干扰项不成立的就地返修（每条记录原因）
- [ ] 全库题型配比盘点：multiple 占比偏低的方向优先补多选
- [ ] a 类第二题／第三题条目**入队前须按「首题选项 + 首题 hint」双清单复算角度**，不能只比题面与正文：第 208 轮实测队列头部 5 条里 4 条不同程度撞车——`ai/intermediate/llm/06-vllm`（四条角度全在首题 hint 里）、`distributed/intermediate/case-studies/17-payment`（退款三纪律整段就是首题 hint 末句「顺手记一条」）、`js/intermediate/node/04-stream`（手写 data/drain 配对、pipeline 与 stream-compose 同属替代 pipe、串多个 Transform 成处理链、三块典型舞台四项均在 hint）、`mongodb/intermediate/usage/09-multikey-index`（写放大 N 元素 = N 索引项与桶模式拆分在首题 hint 末句）；只有 `linux/intermediate/system/07-cron-timer` 因第 198 轮入队时就地标注「Quartz 六字段那条首题 hint 已点名，写题时改考表达式判别而非复述 hint」而躲过——**应把这种就地标注升为 a 类入队的默认动作**（hint 天生要复述答案，撞车面比选项宽得多）
- [ ] 同篇两题**考点撞车存量 2 对**待返修（第 210 轮由 `scripts/quiz-verify.mjs` 新增的第 9 项现算判出，已登记为该脚本 `KNOWN` 清单里的暂免判红项）：① `mysql-mvcc-003` × `mysql-rcrr-012`（同篇 `mysql/intermediate/transaction-lock/01-transaction-mvcc`）——两题把「RC 与 RR 只差 ReadView 生成时机：RC 每次快照读重新生成、RR 第一次生成后复用」这同一句**都做成了正确项**（中文连续重合 21 字），读者刷到第二题时这一分是白送的；② `ai-infparams-046` × `ai-infparams-052`（同篇 `ai/intermediate/llm/04-inference-params`）——双向送分：052 的 hint 复述了 046 的正确项「（top_p 默认 1 即不截断）此时温度是唯一的分布手术刀」16 字，046 的 hint 又复述了 052 的正确项「能治车轱辘话但调过头会误伤专有名词」17 字。改法：按各篇正文换该题未考过的角度重写那**一项**（不是删题、不改题型），修完回脚本删掉 `KNOWN` 对应条目——空转守卫会在清单条目本轮不再命中时判红，逼着同步，不允许清单静默过期。另有 **4 对仅「两句讲解各自引用同一句正文」**（`linux-cron-017`×`linux-cron-019` 30 字、`ai-multi-013`×`ai-paradigm-031` 20 字、`ai-tooldesign-048`×`ai-tooldesign-054` 16 字、`rabbit-amqp-001`×`rmq-silentdrop-005` 16 字）判为可接受的教学冗余，闸门只计数不判红；若日后要收严这条，先把计数改判红、再逐对返修
- [ ] 题目字段按**纯文本**渲染、不走 markdown（`src/components/quiz/Quiz.tsx:519` 的 `<span className="quiz-opt-text">{opt}</span>` 与 `:540` 的 `<span className="quiz-hint">{q.hint}</span>` 都是直接插值），但全站 689 题实测 **25 题的 options/hint 含反引号、4 题含 `**`**（分布在 java 14 / mongodb 2 / python 3 / js 2 / ai 1 / algorithm 1 / distributed 1 / spring-ai 1 / tools 1 / vue 1；其中 `java-threadlocal-140`、`java-chm-141`、`mongo-multikey-015`、`vue-state-007` 是第 203/205 轮新引入）——读者看到的是裸露的反引号与星号而不是代码与加粗。改法：按第 207 轮 `kafka-producer-017` 与第 208 轮三题的口径统一去记号（标识符直接写、需要划范围用「」），逐题就地返修并在此记录原因；新题自第 208 轮起由写题脚本断言拦下（含 `` ` `` 或 `**` 即不落盘）

- [ ] a 类题**hint 不得逐字复用同篇另一题的 hint**（第 213 轮实测两稿）：闸门第 9 项只判红「正确项↔正确项 ≥12／正确项↔讲解 ≥16」，**hint↔hint 的机械复述只进观察计数、不判红，却同样在白送分**——本轮 `dist-bloom-046` 初稿把首题 `dist-bloom-044` hint 里那句「数据量小（百万级以下）用 Set……才换布隆」整句搬来（现算重合 28 字），改一稿又复述了「数据量可控时定期全量重建新过滤器」（16 字），**两稿都把全站观察级计数从 4 对推到 5 对**；第二稿改成按自己的话讲同一条事实后回落 4 对。修法：写题时把同篇既有题的「正确项 + 干扰项 + hint」当三份清单读一遍（b 类上一条只要求前两份），凡要复述的正文事实一律重新组织语言，不引用另一题的措辞；观察级计数是否升为判红线，待该口径被写题实践验证后再议（涉及既有 4 对存量的返修面，不擅自收严）

### c 类：速答打磨

- [ ] 通读「系统设计」小节，检查一句话是否都先结论、有无含糊表述

### d 类：新知补充

入队规则（2026-09-25 起）：`docs/content-roadmap.md` 的 A 车道新笔记落地时，在下方入队
**该新篇的第二题角度**（首题已随笔记同轮写入 `src/data/quiz/<方向>.json`，不必重复入队）；
条目格式沿用 a 类：`- [ ] <笔记路径> — 第二题考「<与首题不重叠的角度>」（首题已考 <X>）`。
另：发现值得覆盖但站内无笔记的知识点，仍按原规则在此登记，先补笔记再收录。

- [ ] java/intermediate/build/01-dependency-conflict — 第二题考「`dependencyManagement` 与直接声明、import BOM 三者的优先级，以及 exclusion 与 `optional=true` 在传递性上的差别」（首题已考「两个 jar 提供同一个类时按 classpath 顺序谁赢 + nearest 仲裁」）
- [ ] java/advanced/jvm/10-arthas-jfr — 第二题考「`trace`/`watch` 的字节码增强代价与 `-n` 命中上限、`reset` 与 `stop` 的区别，为何高 QPS 接口挂 trace 不设上限会自己变成故障」（首题已考「偶发慢现场取证：trace 条件过滤 vs tt 重放 vs JFR 环形缓冲回放」）
- [ ] java/intermediate/spring/09-mybatis-in-practice — 第二题考「一级缓存的失效条件与 `localCacheScope=STATEMENT`、二级缓存 namespace 级清空在分布式多实例下为何会读到过期数据（生产建议不开）」（首题已考「`<association>` nested select 造成 N+1 与 lazy 触发点」）
- [ ] java/intermediate/stream/02-collectors — 第二题考「downstream 嵌套的选型：`groupingBy` 套 `summarizingInt`/`mapping`/`partitioningBy` 各解决什么，以及 `teeing` 与 `collectingAndThen` 的分工」（首题已考「toMap 两种异常的成因 + CONCURRENT 语义」）
- [ ] java/advanced/dubbo/03-generic-and-shutdown — 第二题考「泛化调用的类型代价：`$invoke` 参数类型数组必须是全限定名、POJO↔Map 的静默失配、为什么不能为省依赖在业务代码里用泛化、以及接口名外部可控时的白名单要求」（首题已考「无损下线的四步与 preStop 时序」）
- [ ] java/basic/io/04-direct-memory — 第二题考「显式 `clean()` 的时序约束（之后任何人再碰即踩已释放内存）与 NMT 的可见性边界：NMT 合计远小于 RSS 说明什么、为什么 `-XX:+DisableExplicitGC` 会切断堆外兜底通路」（首题已考「System.gc 重试因果 / 默认额度与 Xmx 同量级 / mmap 不走 reserveMemory」）
- [ ] mysql/advanced/performance-ha/04-backup-pitr — 第二题考「物理备份的 `--prepare` 为什么不可跳（拷贝期间数据页撕裂、redo 按 LSN 前滚后才一致）+ 逻辑备份恢复时间为何随数据量线性膨胀 + 备份窗口内禁 DDL 的原因」（首题已考「反向 SQL 只撤 DML、PITR 通用路径、延迟从库」）
- [ ] mysql/intermediate/transaction-lock/04-lock-wait-triage — 第二题考「`trx_query` 为 NULL 的空闲长事务为什么最难发现（不进慢日志、不吃 CPU 却持有行锁与 MDL）+ 8.0 与 5.7 锁视图的表名迁移 + `innodb_print_all_deadlocks` 为什么该生产常开」（首题已考「MDL 写者优先与 kill 前先估回滚代价」）
- [ ] redis/intermediate/usage/07-redisson — 第二题考「`RSemaphore` 与 `RPermitExpirableSemaphore` 的归属差异（后者按 permitId 释放、租约必须长于任务时长）+ `RateType.OVERALL` 与 `PER_CLIENT` 该在什么场景各选哪个（首题已考「许可泄漏、trySetRate 与 setRate 之别、fencing 必须资源侧校验、读锁也要网络往返」）」
- [ ] redis/intermediate/usage/08-observability — 第二题考「SCAN 姿势：为什么单次返回空不能判定键不存在、`COUNT` 与 `MATCH` 各自的语义（工作量提示 vs 取回后过滤）、以及 `KEYS` 为什么被官方归入只用于调试」（首题已考「慢日志只量执行段 → 空记录时的三个转向：LATENCY 事件、intrinsic 基线、输出缓冲堆积」）
- [ ] kafka/intermediate/core/06-transactions-eos — 第二题考「`transactional.id` 的身份语义：为什么它必须与任务分区一一对应且不能随机生成（共用互相 fence、换 ID 等于放弃僵尸保护），以及 `commitTransaction()` 超时后为什么不能重试提交」（首题已考「悬挂事务卡 LSO + 默认 read_uncommitted 仍可见中止数据」）
- [ ] kubernetes/intermediate/ops/05-java-on-k8s — 第二题考「优雅停机预算的相加关系：preStop 执行完才发 SIGTERM 且这段时间计入宽限期，所以 grace ≥ preStop sleep + 注册中心下线 + 应用收尾；为什么在 hook 与 Spring phase timeout 里各等 30 秒会直接爆」（首题已考「CPU limit 是周期配额不是核数 → P99 台阶 + JVM 不按 shares 算核数」）
- [ ] vue/basic/core/04-form-inputs — 第二题考「带参数的 v-model 与自定义修饰符这一档：`v-model:title` 对应 `title` prop 与 `update:title` 事件、选项要排在 model 名称之后，又有参数又有修饰符时生成的 prop 名是 arg + Modifiers（`titleModifiers`），`defineModel` 返回 `[model, modifiers]` 后要靠 `get`/`set` 自己接住转换；`.number` 的两条兜底（parseFloat 处理不了返回原始值、清空返回空字符串）与它和 `valueAsNumber` 的差别、`type="number"` 时自动启用；`.trim` 只去两端、中间空格照旧」（首题 `vue-formmodel-147` 已考三对 property/event 与初始 attribute 被忽略、iOS 空值占位项，`vue-formvalid-148` 已考 :invalid 与 :user-invalid 的语义差、pattern 不拦空值、程序写入值不报长度约束、setCustomValidity 须置空、novalidate 只关气泡——**两题的正确项与 hint 都要按三清单复算**，尤其 148 的 hint 已点名「type 为 email 自带模式判定」与「willValidate 为真再读 validationMessage」）
- [ ] vue/intermediate/routing/01-routing-and-guards — 第二题考「关卡二的匹配语法与关卡一其余档：`:id` 内部是至少一个非斜杠字符、`(\\d+)` 自定义正则区分两条同为参数的路由、`+`/`*` 可重复拿到的是数组、`?` 可选；**routes 数组的顺序并不重要**（官方原话），默认不区分大小写也容忍尾斜杠、要靠 `sensitive`/`strict` 收紧，嵌套路径以 `/` 开头即视为根路径；三种历史模式里 memory 不碰 URL 也不自动触发初始导航、hash 的 `#` 之后那段从未被发送到服务器；`try_files` 兜底之后服务器不再报 404、得配万能路由，且官方两处示例写法不一致」（首题 `vue-router-149` 已考复用陷阱与两条解法、全局守卫顺序与 afterEach、返回式四路结论，其 hint 已送出 12 步的首尾与 setup 无 beforeRouteEnter、以及 `to.matched` 与合并后 `to.meta` 两种读法——**hint 里那三条别当自己的正确项**）
- [ ] distributed/intermediate/case-studies/28-refund — 第二题考「渠道退款的额度与时限那一档：退款有效期（如一年）、单笔/单日限额、超期走线下打款并以凭证入账且被对账覆盖；仅退款不退货怎么防（名单 + 规则，高风险用户或高价值商品限制仅退款、走退货退款）；以及钱/货/券三线**时长差**为什么决定它们不可能同步强一致」（首题 `dist-refund-047` 已考可退余额公式含处理中那几笔与唯一约束兜底、三线各有触发时机且到账与回仓差数量级、退款与发货的双向前置检查，其 hint 已送出「独立事实源、累计不超实付」与「库存线挂退货入库、券线只随整单取消」——正确项不得复述这三档；另须与 `dist-payment-045` hint 末句、`dist-coupon-042` 的券状态流转避开，那两处第 231 轮已登记撞车面）

### e 类：面试考点卡队列（第 215 轮落地形态，E 车道取点源）

> 口径见 `docs/evolution-recipes.md` §1 车道表与 §2「E 面试考点卡」、
> `docs/superpowers/specs/2026-09-28-interview-cards-design.md`：每轮 2 张，事实一律取自宿主笔记正文；
> 三段各管一件事（`intent` 这一问在筛什么 / `answer` 能直接说出口的答话 / `followup` 会被追问到哪），
> 缺一或写成关键词堆砌即视为潦草；`group` 用速答手册的主题名。**优先级（用户 2026-09-28 定向）：
> Java 后端与 AI 相关方向优先，前端（vue / react / typescript / js）排最后。**
> 剩余缺卡方向以 `node scripts/evolution-candidates.mjs` 的「E 车道｜带题库却零考点卡的方向」**现算为准**，
> 本处只登记**已定宿主与角度**的条目（清单会过期，取点前先跑命令；补卡后还要从
> `scripts/interview-verify.mjs` 的 `KNOWN_MISSING` 删掉该方向，否则下轮判红）。

- [x] 首批 6 张 · **done 2026-09-28（第 215 轮用户指令轮，覆盖 java / mysql / ai 三个方向）**：`java-aqs-ic-001`（把 AQS 拆成 state + 队列 + 骨架，区分度落在「挂起前先置 SIGNAL」那句）、`java-tl-ic-002`（Map 挂在 Thread 身上的反转 + 泄漏要两个条件同时成立 + 线程池放大）、`mysql-idx-ic-001`（联合索引 (a,b,c) 里 c 用不用得上：元组字典序、区间推进、ICP、explain 四个字段自证）、`mysql-mvcc-ic-001`（RC 与 RR 只差 ReadView 拍照时机，快照读与当前读分侧讲幻读）、`ai-vllm-ic-001`（瓶颈是显存带宽、两类碎片各指什么、PagedAttention 不减矩阵运算量）、`ai-hallu-ic-001`（先亮「只能管理不能消灭」的立场再按四层布防，并说清 RAG 不是解药）
- [x] redis/intermediate/usage/07-redisson — **done 2026-09-28（第 222 轮车道 E，redis 方向首批 2 张）**：`redis-redisson-ic-001` 按本条角度出——题面「用 Redis 做跨实例并发控制，除了互斥锁你还会用什么」，`intent` 三块的区分度落在「许可会不会过期、token 由谁校验」，`answer` 五块按形状的四个分支 + fencing 各给一条坑（读写锁每次申请释放都是一次 Redis 往返、普通信号量许可不过期、`trySetRate` 与 `setRate` 之别、GCRA 平滑非窗口计数、资源不认 token 即退化成普通锁），`followup` 接红锁官方弃用与「最后一道防线放资源侧」；**三清单复算**：该篇既有唯一一题 `redis-redisson-019` 的正确项是「信号量泄漏 + trySetRate」两条、错项是「客户端自己比 token」与「读锁本地判定」，其 hint 点名「资源侧校验」与「读写锁一次往返」——卡的答话与题共用同一批正文事实但任务不同（题判选项对错、卡要一口气说清选型与坑），实测卡题干与该题题干最长中文连续段 **9** 字（第 8 项判红线 12，且该项只比同 `noteId` 的卡对）、题干↔双方讲解侧最长 **2** 字，零撞车。同轮第二张 `redis-expire-ic-001` 宿主 `redis/intermediate/usage/01-expiration-eviction`（该篇唯一一题 `redis-expire-006` 是 d3 概念辨识，卡补「两套机制分开 + 定期删除抽样循环 + 八策略分池 + 近似 LRU 用 24 位采样实现」的成段答话（实测与该篇唯一一题题干最长中文连续段 **4** 字），与手册那条一行的结论分工不同）
- [x] spring-ai/intermediate/tools/01-tool-calling — **done 2026-09-29（第 228 轮车道 E，spring-ai 方向首批 2 张）**：`sa-toolcall-ic-001` 按本条角度出——`answer` 首块先把归属说出口（模型只输出要调什么、执行发生在我的 JVM 里），随后按「三条声明路 → ToolCallback 的 String 进 String 出 → Schema 两个真实坑 → 追加语义与 ToolContext」走完；**三清单复算**：该篇唯一一题 `sa-toolloop-005` 考的是「2.0 裸调 ChatModel 不自动执行工具」这一条行为，卡的答话主体取该题未触及的声明方式、Schema 坑与追加语义（`strict` 旧默认下带可选参数整次调用被 400 拒、`MethodToolCallbackProvider` 重名改抛 `IllegalArgumentException`、单次 `.tools(...)` 是追加不是替换），循环归属那一档只在 `followup` 让位给「MCP provider 不自动收集」与「2.0.1 只执行随请求附带的工具」；实测卡题干与该题题干最长中文连续段 **2** 字、卡讲解与该题选项 **3** 字、与 hint **2** 字，均远低于第 8 项 12／16 判红线（该项只比同 `noteId` 的卡对）。同轮第二张 `sa-mcp-ic-002` 宿主 `spring-ai/advanced/mcp/01-mcp-client-server`（该篇唯一一题 `sa-mcpsync-008` 考「SYNC 服务端静默忽略异步注解方法」，卡改答「协议边界双层 + toolcallback 那道开关 + 三层排障 + destructiveHint 默认 true」，实测题干↔题干 **2** 字、卡讲解↔选项 **3** 字、↔hint **3** 字）；两张卡互量讲解最长 **4** 字、题干 **2** 字，考点不重合
- [x] netty/basic/core/01-reactor-boss-worker — **done 2026-09-29（第 234 轮车道 E，随方向首批结案）**：该宿主经第 228 轮通读 + 三清单复算判定**不出卡**并「改推荐宿主」——该篇 66 行的两个可答考点「Boss 只 accept、新 Channel 注册给 Worker 的某个 EventLoop、Channel 终身绑一个 EventLoop、串行故无锁、也绝不能阻塞」已由 `netty-reactor-006` 的**正确项本身**整句给出（五档全在里面），`netty-boss-001` 再考阻塞后果那一侧，卡若要落「分工 + 一条铁律」只能复述 006 的正确项。**推荐的那一宿本轮兑现**（`netty-future-ic-001` 宿主 `netty/intermediate/core/04-future-promise`），并另取 `netty/intermediate/core/03-websocket` 出第二张，netty 方向脱离 `KNOWN_MISSING`，这条「改推荐宿主」的自述至此结清、不再占队列位
- [x] netty/intermediate/core/04-future-promise — **done 2026-09-29（第 234 轮车道 E 出 `netty-future-ic-001`·difficulty 4）**。原队列钉的可答面八档里取五档进 `answer`（凭证语义／投队列即返回／addListener 正道 + EventLoop 里 sync 自己等自己＝收银台前等自己排到／Future 只读 vs Promise 由执行方 setSuccess／与 JUC Future 只有阻塞 get 的能力差），`followup` 收 sync 与 await 的失败侧差别与「为何不用 CompletableFuture」的绑定语义；**「写失败默认静默的三个入口」本轮未进卡**（正文那一档是排障清单、说不出口也不构成答话）。`group` 按第 228 轮已核实的建议取「Java 并发」（速答手册无 netty 行，25 个主题名里只有「Java 并发」「网络协议」可选）。**三清单复算读数**：该篇 0 题（`quiz/netty.json` 9 题按 noteId 计数 0 命中）、不构成同篇撞车；与 netty 其余 8 题现算最长中文连续段——题干↔题目 **2** 字（`netty-reactor-006` 的「数据」）、讲解↔题目 **5** 字（同题的「这条线程上」），均远低于判红线（且闸门第 8 项只比同 `noteId` 卡对）；与既有 10 张卡跨方向复量题干↔题干 ≤**2**、讲解↔讲解 ≤**5**
- [ ] netty/intermediate/core/03-websocket — **拟出第二张候选**（第 234 轮首批 `netty-ws-ic-002` 已吃下「两段式握手 + 四件套各一职 + 聚合器为什么不能省 + 101 后摘掉 HTTP handler + Continuation 分片靠帧聚合器重组」五档，`followup` 已送出协议层 Ping/Pong 与应用层心跳的分工、以及 HandshakeComplete 那一档）：该篇 0 题、第二张卡的余面只剩「六种帧各自的业务分流」与「`HttpObjectAggregator(65536)` 这个阈值与 65536 的来由」——**本轮实测正文只给了帧表与一个构造参数、没给阈值依据，撑不起一段有出处的答话**，须待该篇补正文后再出，不许凭空进卡
- [ ] netty/basic/core/02-channel-pipeline — **拟出第一张候选（须先复算，判据未解除）**（第 234 轮现算：该篇 81 行、1 题 `netty-pipe-002`）：可答面是入站 head→tail 与出站 tail→head 的双向传播、`ctx.write` 从当前节点逆流所以它之前的出站 Handler 先被命中、以及 `@ChannelHandler.Sharable` 与 Handler 状态；**前置**：`netty-pipe-002` 的正确项已经吃下「逆流 + 命中 B」那一档、hint 又点名「入站 head→tail、出站 tail→head」，出卡前按三清单复算，若只剩「逆流」一档可讲则不出（与 netty 01 那篇同一判据，宁缺毋滥）
- [ ] spring-ai/intermediate/advisor/01-advisor-chain — **拟出第二张候选**（该篇 236 行、1 题 `sa-advisororder-003`）：题面只考「记忆 Advisor 的 order 小于 ToolCallingAdvisor 所以落在环外」那一档，卡可走「Advisor 类比谁 + 三个方法签名 + order 两条规则与一个栈 + 内置清单各解决什么 + 注册推荐构建期而追加在请求期」；**前置**：`answer` 若写到工具循环的归属，须先与本轮 `sa-toolcall-ic-001` 的 `followup` 双向复算，别让同一方向的第三张卡复述第一张
- [x] kafka/intermediate/core/06-transactions-eos — **done 2026-09-29（第 240 轮车道 E，kafka 方向首批 2 张）**：`kafka-txn-ic-001` 按本条角度出——题面「transactional.id 为什么不能随机生成？它到底在防什么？」，`intent` 三块的区分度落在「多个实例共用同一个 ID 的后果是彼此 fence，不是各自相安」，`answer` 五块先把「它是身份不是随机串」说出口，随后按 epoch 抬高 + 中止旧会话未结束的事务 → `ProducerFencedException` → 与幂等 PID 的能力差 → 一一对应与不可随机这两条纪律走完，`followup` 收「提交超时不等于失败、重试提交或重发都是错姿势」与「不带 ID 的事务仍有原子性、只丢跨会话保护」及 KIP-890 的 `TransactionAbortableException`；**三清单复算**：该篇唯一一题 `kafka-txn-016` 的三个正确项吃的是默认隔离级别可见中止数据、LSO 被悬挂事务堵住直到 `transaction.timeout.ms`、Streams 自动配 `read_committed`，hint 又点名「isolation.level 是消费者配置」与「read_committed 含非事务消息」——**卡的六档全部走该题未触及的身份/fencing 一侧**，实测卡题干↔该题题干 **2** 字、题目↔卡讲解 **3** 字、卡讲解↔该题选项 **3** 字、↔hint **2** 字（闸门第 8 项判红线 12／16 且只比同 `noteId` 卡对，此处为人工复算）。同轮第二张 `kafka-rebalance-ic-002` 宿主 `kafka/intermediate/core/05-rebalance`（该篇 2 题 `kafka-rebalance-005`／`kafka-rebalance-010`）：卡答「全组停摆的根因是默认 Eager 协议要求全员先交分区」+ 静态成员治发布 + 增量协作治大组 + Generation 拒旧代提交；**005 的 hint 整句就是「两个超时管两件事」，故本卡把那条从 `followup` 里撤出、改答「怎么发现线上在频繁重平衡」与「重平衡为什么带来重复消费」**，实测卡题干↔005 题干 3 字、卡讲解↔005 hint 2 字、卡题干↔010 选项 3 字、卡讲解↔010 选项 4 字，与手册「消息队列」那两行的最长重合仅「僵尸生产者」5 字（名词本身，非结论复述）
- [ ] kubernetes/intermediate/ops/05-java-on-k8s — 拟出第一张：考「K8s 上 Java 优雅停机」一问在筛的是有没有算过预算相加（preStop 计入宽限期），而不是只会答「加个 sleep」；**须先与 `k8s-cputhrottle-011` 复算**（那条考 CFS 限流与 requests/limits 归属，角度不重合）
- [ ] kafka/intermediate/core/03-reliability-idempotent — **kafka 方向第三张候选（宿主已钉，角度现算为净档）**（第 240 轮读正文时顺带复算：该篇 136 行、2 题 `kafka-reliability-006`／`kafka-pidboundary-013`）：可答面是「消费失败怎么收口」那一整档——重试队列延迟递增到 N 次、N 次后进死信、死信必须有人管（监控 + 告警 + 修数据后重放）、RocketMQ 自带 `%RETRY%`/`%DLQ%` 而 Kafka 要么自建 topic 要么交 Spring Kafka 的 `DeadLetterPublishingRecoverer`。**按 kafka 全库 17 题现算 `死信`／`DLQ`／`重试队列`／`RETRY`／`DeadLetterPublishingRecoverer`／`监控` 六个串命中题数均为 0**，两道宿主题吃的是「根治重复靠消费端幂等」与「幂等生产者的单会话边界」，与本档不重合；`group` 仍取「消息队列」
- [ ] E 车道下一轮的取点约束（不是某一张卡的宿主，是形状）：第 240 轮 kafka 补齐后 E 现算池 **27 → 26**、`KNOWN_MISSING` 同数，剩余 Java 后端侧带题库方向为 `rocketmq`／`seata`／`zookeeper`／`elasticsearch`／`mongodb`／`postgresql`／`distributed`／`middleware`／`kubernetes`／`rabbitmq`／`network`／`security`／`docker`／`etcd`／`nginx`／`mqtt`／`linux`／`git`／`tools`／`algorithm`／`python`／`langchain`（前端 `vue`／`react`／`typescript`／`js` 按用户定向排最后）。**因 §1 的 E ≤4 文件与 §4.6 三处同步相减后只剩 1 个自由格，每轮 2 张必须同方向落一份 JSON**（第 228 轮已成文），故下一轮要么在 kafka 出第三、四张（上条宿主已钉，另需现算第二宿主），要么整体换到另一个方向出该方向首批两张——不许跨两个方向各出一张，那是 5 文件越线

## 已完成记录

- 2026-09-29 · 第七十九轮（第 237 轮｜车道 C｜题库深化第 79 轮）：3 道题（`mongo-cstream-022` 第二题 + `dist-stocktime-048`、`dist-closetimeout-049` 两条 0 题补缺首题，均 multiple／difficulty 4／answer [0,1,2]，宿主 `mongodb/intermediate/usage/06-change-streams`、`distributed/intermediate/case-studies/16-stock-deduction`、`15-order-timeout`，三篇 `core: true`）· 取点：按 a 类队列头部顺序，跳过最前三条第 208/213 轮两次实测「撑不起 3 正确 + 2 干扰」的留队条目（vllm／payment／stream，本轮未三度通读），取其后三条可写项一次出清，与第 231 轮同形 · 复算：change-streams 一条按「正确项／干扰项／hint」三清单与 020 逐字段比对，部署那一轴因已由 020 正确项整句给出而不取，hint 初稿复述 020 讲解 9 字改成自己措辞后回落 6 字；另两条按 noteId 现算该篇 0 题、跨文件现算 `库存分桶|先查再改|缓冲记账|过期监听|keyspace|fire-and-forget|敏感词|AC 自动机` 在题目字段 0 命中 · 队列动作：a 类销 3 追 3（两条刚补首题的宿主的第二题余角 + 一条 0 题补缺 `06-sensitive-words`），a 类未勾条目 6 → 6 条 · 三条均 multiple，延续 b 类「multiple 占比偏低优先补多选」（补题前实读 `quiz/mongodb.json` 21 题 8 道 multiple、`quiz/distributed.json` 47 题 15 道，补后为 22/9 与 49/17，全站 714→717）· 验证：`pnpm build` 757 页、`pnpm verify:docs` 37 项全绿、题库 714 → **717** 题、id 全局唯一 717、同篇题对 255 → 256 组（增量恰为 020 × 022 一对）判红 2 对与观察 4 对一字未动；真机 1440×900 双主题三题各跑答错取讲解（299／325／318 字）与答对无讲解两趟，pageerror 各 0 处 · 一条队列历史缺口如实登记：本「已完成记录」缺第 225 轮（题库深化第 77 轮）与第 231 轮（第 78 轮）两行——那两轮做了销号追加却没写历史行，本轮不代写他轮条目，只在自己这一行标明二级序号接续为 79 · 本轮提交主题：feat(quiz): 演进第 237 轮车道 C 补 Change Streams 选型对照与库存扣减时机、延迟关单两篇首题

- 2026-09-28 · 第七十六轮（第 213 轮｜车道 C｜题库深化第 76 轮）：3 道核心笔记补题（`dist-bloom-046` d4 / `java-threadlocal-144` d3 / `java-chm-145` d4，均 multiple、answer 一律 [0,1,2,3]＝4 正确 + 1 干扰）· 宿主 `distributed/intermediate/case-studies/31-bloom-filter`、`java/intermediate/concurrent/06-threadlocal`、`java/basic/collection/03-concurrenthashmap`，三篇 `core: true`· 取点与改道：a 类头部逐条按「既有正确项 + 干扰项 + hint」三清单复算——头部第 1 条 vllm 仍未解除（复核确认正文 15~19 行与速答确实写清了内部/外部两类碎片且首题未考，但第三条正确项只能落回首题 `ai-vllm-050` 的正确项本身，第 9 项必判红，就地改写保留队列位）；第 2 条 bloom **改道后出成**（原指定的 RedisBloom 命令与三种删除方案大半在首题 hint 内，改取方向性、n 的容量规划含义、Counting 与 Cuckoo 取舍不等价、百万级以下走 Set 四条）；第 3、4 条 payment 与 stream **二次复算仍撑不起 3 正确 + 2 干扰**（正文逐句比对后剩余落点要么已被 hint 覆盖、要么只剩短句），就地改写保留原位；第 6、7 条 threadlocal 与 chm 按原指定第三题角度直取、未改道· 队列动作：a 类销 3（bloom/threadlocal/chm 标 done 并记实做角度与撞车复核）、改写 3（vllm/payment/stream 附本轮实测证据与解除路线）、追加 5（a 类 4：`06-threadlocal` 补满 3 题后的余角「两个条件同时满足」＋按 d 规则入队 `28-refund`、`04-form-inputs`、`routing/01` 三个**现算零题/单题宿主**，其中后两条系第 209/210 轮入口预告过却从未落进队列、本轮补登记以免再丢；b 类 1：hint↔hint 机械复述的白送分实测与修法）· 收尾现算：**队列未勾条目 26 → 28 条**（a 9／b 6／c 1／d 12），a 类勾掉待查的 done 条目 3 条· 三条均 multiple，延续 b 类「multiple 占比偏低优先补多选」：补题前实读 `quiz/java.json` 143 题 25 道 multiple、`quiz/distributed.json` 45 题 13 道，补后 145/27 与 46/14，全站 691→**694** 题· 追加候选现算池同场复跑（文档口径 `core: true` 笔记 371 篇 ∩ 全站题数恰为 1 ∩ 不在队列 = **158** 条，较第 208 轮的 164 减少，成因是本轮三宿主补题后脱离「恰 1 题」以及新入队三条把三篇从池里划走）· 一条写题纪律就地固化：三道题的 hint 一律按「第 X/Y/Z 项正确、第 A/B 项错」开句并与 answer 下标机器对账；追加改走**文本级插入**并按各文件既有缩进与 answer 排版风格落笔（distributed.json 单行 `[0, 1, 2, 3]`、java.json 多行），首版误用整文件 `JSON.stringify` 重排产生 **207/53** 的淹没式 diff，已回退重写为 16/0 与 42/0 的纯追加· 说明：本轮游标 `213 mod 5 = 3` 与实做车道一致、未越车道；第 212 轮入口对本轮车道与队列头部（vllm 待裁决 + bloom/payment/stream 三条撞车）的预判与实跑一致，差异仅在 bloom 一条按新角度出成、payment/stream 二次确认为不可写· 本轮提交主题：feat(quiz): 演进第 213 轮车道 C 补布隆过滤器选型、ThreadLocal 挂载反转与 CHM put 细节三道题并按三清单复算为 payment/stream 二次改判

- 2026-09-09 · 首轮：38 道旧题补 difficulty（2~5 按概念/原理/边界/生产权衡定级）+ 3 道核心笔记第二题（py-freethread-031 / pg-index-002 / docker-pid1-003）+ 状态文件初始化（本轮提交主题：feat: 题库深化首轮）

- 2026-09-09 · 第二轮：3 道核心笔记第二题（docker-latest-005 / py-mutparam-032 / java-metaspace-096，difficulty 3/3/4）· 本轮提交主题：feat: 题库深化第二轮

- 2026-09-09 · 第三轮：3 道核心笔记第二题（kafka-storage-012 / redis-watchdog-008 / java-classidentity-097，difficulty 3/4/4）· 本轮提交主题：feat: 题库深化第三轮

- 2026-09-09 · 第四轮：3 道核心笔记第二题（mysql-idxfail-005 / net-finwait-004 / es-writepath-007，difficulty 4/3/4；es 条目原定角度与 es-shard-002 撞车，就地换写路径四动作）· 本轮提交主题：feat: 题库深化第四轮

- 2026-09-09 · 第五轮：3 道核心笔记第二题（dist-flashrefund-035 / mongo-oplog-004 / java-adviceorder-098，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第五轮

- 2026-09-09 · 第六轮：3 道核心笔记第二题（redis-sds-009 / dist-term-036 / java-refqueue-099，difficulty 3/4/4）· 本轮提交主题：feat: 题库深化第六轮

- 2026-09-09 · 第七轮：3 道核心笔记第二题（linux-diskfull-007 / js-await-010 / java-treeify-100，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第七轮

- 2026-09-09 · 第八轮：3 道核心笔记第二题（nginx-location-004 / docker-voltrap-006 / java-fakedead-101，difficulty 3/4/4；docker 条目原定角度与 docker-vol-005 撞车，换行为细节与坑）· 本轮提交主题：feat: 题库深化第八轮

- 2026-09-09 · 第九轮：3 道核心笔记第二题（pg-rejoin-003 / seata-hotrow-003 / java-inline-102，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第九轮

- 2026-09-09 · 第十轮：3 道核心笔记第二题（mysql-rcrr-006 / tools-sedtrap-007 / java-zcp3gen-103，difficulty 4/4/4；tools 条目原定角度与 tools-gsa-001 撞车，换陷阱与安全姿势）· 本轮提交主题：feat: 题库深化第十轮

- 2026-09-09 · 第十一轮：3 道核心笔记第二题（rmq-silentdrop-005 / mq-cost-004 / net-dnsttl-006，difficulty 4/3/3）· 本轮提交主题：feat: 题库深化第十一轮

- 2026-09-09 · 第十二轮：3 道核心笔记第二题（java-casadder-104 / java-poolargs-105 / rabbit-confirmtack-006，difficulty 4/3/3）· 本轮提交主题：feat: 题库深化第十二轮

- 2026-09-09 · 第十三轮：3 道核心笔记第二题（js-tdz-011 / js-preflight-012 / git-ourstheirs-005，difficulty 3/3/4；git 条目原定角度与 git-remote-004 撞车，换 ours/theirs 语境反转）· 本轮提交主题：feat: 题库深化第十三轮

- 2026-09-09 · 第十四轮：3 道核心笔记第二题（java-framedec-104 / java-tricolor-105 / docker-stuckrun-007，difficulty 4/5/4；docker 与 GC 两条原定角度均与现有题撞车，分别换「起不来排查」与「三色标记修正流派」）· 本轮提交主题：feat: 题库深化第十四轮

- 2026-09-09 · 第十五轮：3 道核心笔记第二题（seata-roles-004 / java-dcl-106 / js-new-013，difficulty 3/4/3）；message-reliability 条目因并行会话新增 mq-reliability-004 覆盖同角度而弃置 · 本轮提交主题：feat: 题库深化第十五轮

- 2026-09-09 · 第十六轮：3 道核心笔记第二题（java-biocost-107 / linux-strictmode-008 / net-osimodel-007，difficulty 3/3/3）；剔除演进任务回填的 js prototype 重复条目（js-new-013 上轮已完成）· 本轮提交主题：feat: 题库深化第十六轮

- 2026-09-10 · 第十七轮：a 类 1 题（net-redirect-013，difficulty 3；net-http-009 已覆盖 502/504 故聚焦 3xx/304）+ b 类自查发现并修复上轮 3 题 hint/difficulty 字段错位（校验脚本已补类型检查）· 本轮提交主题：feat: 题库深化第十七轮

- 2026-09-10 · 第十八轮：3 道核心笔记第二题（mysql-updatewal-007 / java-threecache-111 / java-markword-112，difficulty 4/4/4；出题脚本新增 hint/difficulty 参数顺序自动纠正；三条原定角度均与并行会话新题不同程度撞车，分别换「WAL 更新时序」「为何必须三级」「Mark Word 位级分配」）· 本轮提交主题：feat: 题库深化第十八轮

- 2026-09-10 · 第十九轮：3 道核心笔记第二题（docker-multistage-008 / java-embedtomcat-113 / java-metasize-114，difficulty 3/3/4；etcd 条目弃置——笔记已被 3 题覆盖无独立角度；tomcat 条目原定「连接器演进」事实在 io-model 篇，换考嵌入式容器取舍）· 本轮提交主题：feat: 题库深化第十九轮

- 2026-09-10 · 第二十轮：3 道核心笔记第二题（rabbit-headblock-007 / net-connid-014 / java-propagation-115，difficulty 4/3/4；http-evolution 与 transaction 两条原定角度与并行新题撞车换角；剔除 jvm/07-tuning 回填残留——java-metasize-114 上轮已完成）· 本轮提交主题：feat: 题库深化第二十轮

- 2026-09-10 · 第二十一轮：3 道核心笔记第二题（redis-slowcmd-010 / java-stringpool-115 / docker-layertrap-013，difficulty 4/3/4；thread-model 条目原定角度与并行新题 redis-thread-005 撞车，换考单线程三瓶颈）· 本轮提交主题：feat: 题库深化第二十一轮

- 2026-09-10 · 第二十二轮：3 道核心笔记第二题（kafka-pidboundary-013 / java-ctxloader-115 / net-boundary-015，difficulty 4/4/3；tcp-vs-udp 条目原定角度与 net-udp-004 答案重合，换考边界维度）· 本轮提交主题：feat: 题库深化第二十二轮

- 2026-09-10 · 第二十三轮：3 道核心笔记第二题（mysql-2nf-014 / java-g1knob-118 / net-urldebug-016，difficulty 3/4/3；normal-forms 条目原定角度与 mysql-nf-007 完全撞车，换考 2NF 部分依赖判定与键层级）· 本轮提交主题：feat: 题库深化第二十三轮

- 2026-09-10 · 第二十四轮：3 道核心笔记第二题（java-cfall-119 / js-arrowbind-013 / docker-downvol-013，difficulty 4/3/3；compose 条目原定角度与 docker-compose-007 完全撞车，换考卷与项目生命周期）· 本轮提交主题：feat: 题库深化第二十四轮

- 2026-09-10 · 第二十五轮：3 道核心笔记第二题（java-contended-119 / java-arrgrow-120 / js-implicit-014，difficulty 4/3/3；longadder 条目原定角度与 java-longadder-019 完全撞车，换考伪共享填充与扩容上限）· 本轮提交主题：feat: 题库深化第二十五轮

- 2026-09-10 · 第二十六轮：3 道核心笔记第二题（kafka-semantics-014 / js-scavenge-015 / py-import-038，difficulty 3/4/3；kafka why-mq 原「代价清单」角度与 kafka-why-007 重合换选型维度；js modules-import 条目为入队笔误（js 无该笔记）改执行 python 同名笔记）· 本轮提交主题：feat: 题库深化第二十六轮

- 2026-09-10 · 第二十七轮：3 道核心笔记第二题（es-scrollafter-008 / docker-exec-013 / redis-lua-015，difficulty 4/3/3）；补记第二十六轮事故——未推送的 81a54ac 被并行会话历史整理抹除，内容已随其进入远端并核验完整 · 本轮提交主题：feat: 题库深化第二十七轮

- 2026-09-10 · 第二十八轮：3 道核心笔记第二题（java-biasedremove-121 / js-preventstop-015 / mysql-replfix-015，difficulty 4/3/3；dom-events 条目与 js-event-008 主题重合，换考 preventDefault/stopPropagation 正交与 passive）· 本轮提交主题：feat: 题库深化第二十八轮

- 2026-09-10 · 第二十九轮：3 道核心笔记第二题（py-closurebind-039 / es-analyzer-009 / java-reflection-123，difficulty 4/3/4）；packages-layout 条目弃置——并行会话 py-pkg-019 已完全覆盖 · 本轮提交主题：feat: 题库深化第二十九轮

- 2026-09-10 · 第三十一轮：3 道核心笔记第二题（mongo-agg-014 / sec-mybatis-007 / lc-layer-014，difficulty 4/4/3；上轮队列 3 条已被并行会话执行，双向消费正常）· 本轮提交主题：feat: 题库深化第三十一轮

- 2026-09-10 · 第三十二轮：3 道核心笔记第二题（k8s-declarative-003 / netty-bufptr-007 / java-dubbospi-124，difficulty 3/4/4；队列空按池重新选点执行）· 本轮提交主题：feat: 题库深化第三十二轮

- 2026-09-10 · 第三十三轮：3 道核心笔记第二题（vue-proxy-004 / java-dubbgov-124 / lc-pipe-015，difficulty 3/3/3；vue 条目原记 declarative-ui 实为 reactivity 笔记；lcel 与 langchain/java 两条各与现有题取不重叠面）· 本轮提交主题：feat: 题库深化第三十三轮

- 2026-09-10 · 第三十四轮：3 道核心笔记第二题（vue-dataflow-005 / lc-template-016 / k8s-undo-007，difficulty 3/4/3；vue-component-model 与 langchain prompts、k8s rollout 均为首题或与现有题取不重叠面）· 本轮提交主题：feat: 题库深化第三十四轮

- 2026-09-10 · 第三十五轮：3 道核心笔记第二题（vue-context-006 / py-magicmethod-039 / net-cors-016，difficulty 3/4/3；python class-basics 原定角度与 py-oop-020 重合换魔术方法协议；顺带清理状态文件重复小节与已执行残留条目）· 本轮提交主题：feat: 题库深化第三十五轮

- 2026-09-10 · 第三十六轮：3 道核心笔记第二题（lc-superstep-016 / java-jettyconn-126 / sec-csrfdef-008，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第三十六轮

- 2026-09-10 · 第三十七轮：3 道核心笔记第二题（mongo-cursor-008 / py-listgrow-041 / rmq-delaylvl-016，difficulty 4/3/4；rocketmq-features 原定「回查」角度与 rmq-tx-003 撞车，换考延迟消息定时轮）· 本轮提交主题：feat: 题库深化第三十七、三十八轮
- 2026-09-10 · 第三十八轮（定时触发两次合并执行）：3 道核心笔记第二题（py-mrocollab-042 / py-hashpair-043 / redis-sentinelconf-017，difficulty 4/4/4；js dict-set 条目为入队方向笔误改执行 python 同名笔记）

- 2026-09-10 · 第三十九轮：3 道核心笔记第二题（net-httponly-018 / js-debounce-015 / netty-heartbeat-008，difficulty 3/3/4）；password-storage 条目弃置（笔记尚不存在，并行会话计划中）· 本轮提交主题：feat: 题库深化第三十九轮

- 2026-09-10 · 第四十轮：3 道核心笔记第二题（sec-authzdisc-008 / k8s-probemisuse-008 / react-renderstage-003，difficulty 4/4/4）· 本轮提交主题：feat: 题库深化第四十轮

- 2026-09-10 · 第四十一轮：3 道核心笔记第二题（lc-ckpt2-011 / sec-sigflow-009 / k8s-svctypes-009，difficulty 4/3/3）· 本轮提交主题：feat: 题库深化第四十一轮

- 2026-09-10 · 第四十二轮：3 道首题（sec-sessionattack-010 / k8s-cfgsecret-010 / react-declarative-005，difficulty 4/4/3）；password-storage 条目确认笔记不存在正式弃置；清理队列残留与重复小节 · 本轮提交主题：feat: 题库深化第四十二轮

- 2026-09-10 · 第四十三轮：3 道核心笔记第二题（netty-leakpose-009 / mongo-workset-009 / react-jsxflow-006，difficulty 4/4/4；react/02-hooks-mental 已被并行会话加到 2 题（快照+依赖闭包）角度饱和弃置，react 改从 01-declarative-ui 出第二题）· 本轮提交主题：feat: 题库深化第四十三轮

- 2026-09-10 · 第四十四轮：3 道核心笔记第二题（lc-toolloop-011 / mqtt-varlen-006 / mqtt-acl-007，difficulty 4/4/4；langchain 条目 lc-agent-006 已考手搭四件套，换考工具定义质量与 create_agent 收敛）· 本轮提交主题：feat: 题库深化第四十四轮

- 2026-09-10 · 第四十五轮：3 道核心笔记第二题（py-fixture-044 / mysql-poolsize-016 / py-uvx-045，difficulty 4/4/3；pytest 条目原定角度与 py-pytest-014 重合，换考 fixture 依赖图与 scope）· 本轮提交主题：feat: 题库深化第四十五轮

- 2026-09-10 · 第四十六轮：3 道核心笔记第二题（py-descform-046 / py-fourgates-047 / py-awarearith-048，difficulty 4/3/4）· 本轮提交主题：feat: 题库深化第四十六轮

- 2026-09-10 · 第四十七轮：3 道核心笔记第二题（ai-paradigm-014 / algo-graphmark-040 / js-wsframe-018，difficulty 4/4/4）· 本轮提交主题：feat: 题库深化第四十七轮

- 2026-09-10 · 第四十八轮：3 道核心笔记第二题（ai-claimlock-032 / algo-topobuild-041 / kafka-pagecache-014，difficulty 4/4/4；task-system 条目 ai-task-014 已覆盖升级语义，换考并发认领锁与状态机）· 本轮提交主题：feat: 题库深化第四十八轮

- 2026-09-10 · 第四十九轮：3 道核心笔记第二题（ai-bgjudge-033 / ai-wtpose-034 / java-macode-124，difficulty 4/4/4；三条原定角度均与并行新题撞车换角）· 本轮提交主题：feat: 题库深化第四十九轮

- 2026-09-10 · 第五十轮：3 道核心笔记第二题（java-cassso-128 / net-pwdstore-018 / mysql-deeppage-017，difficulty 4/4/4）· 本轮提交主题：feat: 题库深化第五十轮

- 2026-09-10 · 第五十一轮：3 道核心笔记第二题（py-boundary-049 / java-transient-128 / java-deepcopy-129，difficulty 4/4/4）· 本轮提交主题：feat: 题库深化第五十一轮

- 2026-09-10 · 第五十二轮：3 道核心笔记第二题（algo-rotvar-041 / java-feignproxy-128 / ai-harnesspos-035，difficulty 4/4/4；comprehensive-agent 原定角度与 ai-harness-028 重合，换考位置感与分工）· 本轮提交主题：feat: 题库深化第五十二轮

- 2026-09-10 · 第五十三轮：3 道核心笔记第二题（java-threadstate-132 / algo-jumpclimb-043 / py-protocol-049，difficulty 4/4/4；jump-game 原定可达性角度与 algo-jump-020 撞车，换考版本 II 分层）· 本轮提交主题：feat: 题库深化第五十三轮

- 2026-09-10 · 第五十四轮：3 道核心笔记第二题（ai-msgbus-036 / py-gcpairs-051 / algo-diffedge-044，difficulty 4/4/4）· 本轮提交主题：feat: 题库深化第五十四轮

- 2026-09-18 · 第五十五轮：3 道核心笔记第二题（ai-autoclaim-037 / py-dcadv-052 / py-strencode-053，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第五十五轮

- 2026-09-18 · 第五十六轮：3 道第一题补缺（ai-transformer-038 / ai-embed-039 / js-collect-019，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第五十六轮

- 2026-09-18 · 第五十七轮：3 道第一题补缺（ai-tokenizer-040 / js-error-020 / linux-pipe-012，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第五十七轮

- 2026-09-18 · 第五十八轮：3 道第一题补缺（js-gen-021 / mongo-ttl-010 / net-httpcache-020，difficulty 3/4/3）· 本轮提交主题：feat: 题库深化第五十八轮

- 2026-09-18 · 第五十九轮：3 道第一题补缺（js-proxy-022 / ai-lora-041 / mongo-indexadv-011，difficulty 4/4/4；08-index-advanced 考点按笔记实况核准为部分/稀疏/通配符索引）· 本轮提交主题：feat: 题库深化第五十九轮

- 2026-09-18 · 第六十轮：3 道第一题补缺（ai-gpu-042 / js-promcombo-023 / linux-ssh-013，difficulty 4/3/4）· 本轮提交主题：feat: 题库深化第六十轮

- 2026-09-24 · 第六十一轮（第 173 轮｜车道 C｜题库深化第 61 轮）：3 道第一题补缺（dist-redpacket-038 / mongo-txn-012 / ai-structout-043，difficulty 4/4/3）；队列销 3 条、追加 4 条（含第 171 轮留账的 react/04 篇）· 本轮提交主题：feat(quiz): 演进第 173 轮车道 C 补红包/事务/结构化输出三篇首题

- 2026-09-25 · 第六十二轮（第 175 轮｜车道 C｜题库深化第 62 轮）：3 道第一题补缺（net-wsup-021 / mongo-auth-013 / js-coerce-024，difficulty 4/3/4）；队列销 3 条、追加 4 条；同轮为首批 3 篇补「速答手册」索引行（网络协议 / JavaScript / 检索与文档存储各 1 行）· 本轮提交主题：feat(quiz): 演进第 175 轮车道 C 补 WebSocket/Mongo 安全/隐式转换三篇首题并同步速答索引

- 2026-09-25 · 第六十三轮（第 179 轮｜车道 C｜题库深化第 63 轮）：3 道第一题补缺（linux-swap-015 / ai-agenteval-044 / mongo-readpref-014，difficulty 全 4）；队列销 3 条、追加 4 条（16-tool-design / 09-crypto / 04-enum-asconst / 13-push，角度一律取自各篇 description 不做无据入队）· 说明：本轮开工算 178、收尾时 178 已被并行会话（车道 A）占用，按配方 §6 顺延为 179；第 176 轮（车道 D）另按新硬约束附 1 道 linux-cap-014 · 本轮提交主题：feat(quiz): 演进第 179 轮车道 C 补 swap 水位/应用评估/读偏好三篇首题

- 2026-09-25 · 第六十四轮（第 181 轮｜车道 D 附 1 题｜题库深化第 64 轮）：1 道第一题补缺（`react-memo-007`，multiple，difficulty 4，宿主 `react/basic/core/04-rerender-perf`）；队列销 1 条（a 类头部 react 篇，考点角度即队列指定项）· 说明：本轮主产出在 D 车道（对比度审计闸门自校验），按配方 §1「每轮必含一项内容增量」附 1 道考题并允许超出车道文件上限 1 个文件；未做 C 车道的「追加 2~4 条」，a 类队列头部前移为 `distributed/intermediate/case-studies/08-lottery`，余 11 条 · 本轮提交主题：feat(quiz): 演进第 181 轮附 react 重渲染 memo 三件套首题

- 2026-09-25 · 第六十五轮（第 184 轮｜车道 C｜题库深化第 65 轮）：3 道第一题补缺（`dist-lottery-039` / `dist-recon-040` / `ai-quant-045`，difficulty 全 4；前两题为 multiple，按 b 类「multiple 占比偏低优先补多选」——实测 distributed 38 题仅 6 道 multiple、ai 44 题仅 6 道）；队列销 3 条、追加 4 条（`ai/intermediate/agent/11-rag-advanced`、`ai/intermediate/llm/06-vllm`、`linux/intermediate/system/05-performance`、`distributed/intermediate/case-studies/31-bloom-filter`），四条角度一律取自各篇 description 原文，且先经脚本核实为「core: true 且该笔记全站 0 题」（实测此类池余 71 篇，池子未枯竭）· a 类现余 12 条 · 说明：本轮开工按勘察命令算得「183 mod 5 = 3 → 车道 C」并据此做完，收尾复算时 183 已被并行会话（用户定向 spring-ai 新方向）占用，按配方 §6 顺延登记为 184、不重排对方记录 · 本轮提交主题：feat(quiz): 演进第 184 轮车道 C 补抽奖/对账/量化三篇首题

- 2026-09-25 · 第六十六轮（第 187 轮｜车道 B 附 1 题｜题库深化第 66 轮）：1 道第一题补缺（`dist-upload-041`，multiple，difficulty 4，宿主 `distributed/intermediate/case-studies/05-large-file-upload`，考点即队列指定的「分片 + 断点续传清单 + 秒传 hash 命中即引用，以及为什么生产要改对象存储直传」）· 队列销 1 条，a 类头部前移为 `distributed/intermediate/case-studies/10-coupon`，现余 11 条 · 说明：本轮主产出在 B 车道（`kafka-segment` 8 帧配音短片），按配方 §1「每轮必含一项内容增量」附 1 道考题，沿用第 181 轮先例只销号不追加 · 本轮提交主题：feat(viz): 演进第 187 轮车道 B 出 Kafka segment 配音短片并附大文件上传首题
- 2026-09-26 · 第六十七轮（第 189 轮｜车道 D 附 1 题｜题库深化第 67 轮）：1 道第一题补缺（`dist-coupon-042`，multiple，difficulty 4，宿主 `distributed/intermediate/case-studies/10-coupon`，考点即队列指定的「券模板与用户券两件事的建模、领券库存预扣与核销重复防护」；干扰项两处都取正文「高频追问速答」明确反对的说法——把超发归罪 Redis 预扣、把锁券当多余状态）· 队列销 1 条，a 类头部前移为 `ai/intermediate/llm/04-inference-params`，现余 10 条 · 说明：本轮主产出在 D 车道（修 RD-01 新篇的延迟消息死链 + `media-encode` 封面无损压缩），按配方 §1「每轮必含一项内容增量」附 1 道考题，沿用第 181/187 轮先例只销号不追加 · 本轮提交主题：fix(redis,quiz): 演进第 189 轮车道 D 修延迟消息死链并补领券中心首题
- 2026-09-26 · 第六十八轮（第 190 轮｜车道 C｜题库深化第 68 轮）：3 道第一题补缺（`ai-infparams-046` / `ai-tokencost-047` / `ai-tooldesign-048`，均 multiple、difficulty 4，宿主即 a 类头部三条 `ai/intermediate/llm/04-inference-params`、`ai/intermediate/llm/05-token-cost`、`ai/intermediate/agent/16-tool-design`；三篇均 `core: true`，开工实测该三篇全站 0 题、`quiz/ai.json` 45 题里无一条指向它们）· 队列销 3 条、追加 3 条（同三篇的第二题角度，一律取自各篇「高频追问速答」与小结正文，与首题考点不重叠）· a 类现余 10 条（7 条第一题补缺 + 本轮新入的 3 条第二题）· 三条均为 multiple，延续 b 类「multiple 占比偏低优先补多选」——补题前实测 `quiz/ai.json` 45 题仅 6 道 multiple，补后 9 道 · 说明：本轮开工按勘察命令算得「188 mod 5 = 3 → 车道 C」并据此做完，收尾复算时 188 已由第 187 轮「下一轮入口」指定给并行会话的 roadmap B1 第三批（`1e5abec`，车道 A）、189 已由并行会话在共享台账声明（车道 D），按配方 §6「不重排、不在两个会话里各算各号」顺延登记为 190 · 本轮提交主题：feat(quiz): 演进第 190 轮车道 C 补推理参数/Token 成本/工具设计三篇首题

- 2026-09-26 · 第六十九轮（第 191 轮｜车道 C｜题库深化第 69 轮）：3 道第一题补缺（`js-crypto-025` / `ts-enum-001` / `dist-push-043`，均 multiple、difficulty 4，宿主即 a 类头部三条 `js/intermediate/node/09-crypto`、`typescript/basic/core/04-enum-asconst`、`distributed/intermediate/case-studies/13-push`；三篇均 `core: true` 且开工实测全站 0 题）· 其中 `quiz/typescript.json` 是**本轮新建**：此前 34 个方向目录里只有 `panorama`（单张全景页、无知识点笔记）与 `typescript` 无题库文件，即 typescript 是**唯一有正经笔记（7 篇）却 0 题可刷**的方向，`/guide/quiz` 的方向列表里根本不会出现它 · 队列销 3 条、追加 4 条（`distributed/intermediate/case-studies/17-payment`、`js/intermediate/node/04-stream`、`linux/intermediate/system/07-cron-timer`、`mongodb/intermediate/usage/09-multikey-index`），四条角度一律取自各篇 description 原文，且先经脚本核实为「core: true 且该笔记全站 0 题」——此类池实测仍余 63 篇，未枯竭 · a 类现余 11 条（8 条第一题补缺 + 3 条第二题）· 三条均为 multiple，延续 b 类「multiple 占比偏低优先补多选」：补题前实测 `quiz/js.json` 25 题仅 5 道 multiple、`quiz/distributed.json` 42 题仅 10 道 · 说明：本轮游标本为 A（191 mod 5 = 1），因 `astro.config.mjs` 全程被并行会话以未提交态持有（roadmap MQ-01 在途，注册新篇必改该文件）按配方 §0.2/§3 退位，路径 A→B→C；B 车道头部 `es-write` 实测 10 帧、帧说明合计 1318 视觉列、单帧最长 228 列，对照已出片的 `kafka-segment`（8 帧、逐帧口播裁到 ≤36 列、成片 52.6s）要压进 ≤60s 闸门须先重写动画正文，不属 B 车道 ≤5 文件口径 · 本轮提交主题：feat(quiz): 演进第 191 轮车道 C 补 crypto/枚举/推送三篇首题并新建 typescript 题库

- 2026-09-26 · 第七十轮（第 192 轮｜车道 B 附 1 题｜题库深化第 70 轮）：1 道第一题补缺（`ai-ragadv-049`，multiple，difficulty 4，宿主 `ai/intermediate/agent/11-rag-advanced`，考点即队列指定的「纯向量检索的盲区、BM25+向量混合召回与 RRF 融合、rerank 两阶段精排」；两个错项都取正文明确反对的说法——把 RRF 说成「两路分数归一化后加权、权重靠人工反复调」，以及把检索问题归到生成端提示词与「chunk 越大上下文越完整」）· 队列销 1 条，a 类头部前移为 `ai/intermediate/llm/06-vllm`，现余 10 条 · 说明：本轮主产出在 B 车道（`es-write` 10 帧 → `es-write-video` 51.9s 配音短片），按配方 §1「每轮必含一项内容增量」附 1 道考题，沿用第 181/187/189 轮先例只销号不追加 · multiple 延续 b 类「multiple 占比偏低优先补多选」：补题前实测 `quiz/ai.json` 48 题 9 道 multiple，补后 49 题 10 道 · **一条队列历史的更正**：第 187/191 轮两处记载称 `es-write` 「须先精简动画正文才能压进 ≤60s 闸门」，本轮实测推翻——10 帧逐帧口播按中文为主写（单句 ≤30 字、合计 238 字）成片 51.9s，距闸门余 8.1s，`flows.ts` 正文一字未改；口播预算的瓶颈是**逐帧文稿写作**而非源动画帧说明长度 · 本轮提交主题：feat(viz): 演进第 192 轮车道 B 出 ES 写入到可搜索配音短片并附 RAG 混合检索首题

- 2026-09-26 · 第七十一轮（第 193 轮｜车道 C｜题库深化第 71 轮）：3 道第一题补缺（`ai-vllm-050` difficulty 4 / `linux-perf-016` difficulty 3 / `dist-bloom-044` difficulty 4，均为 multiple，宿主即 a 类头部三条 `ai/intermediate/llm/06-vllm`、`linux/intermediate/system/05-performance`、`distributed/intermediate/case-studies/31-bloom-filter`；三篇均 `core: true`，开工实测该三篇全站 0 题、各自方向题库里无一条指向它们）· 考点一律照队列指定角度，干扰项全部取该篇正文明确反对或明写过的反论——`ai-vllm-050` 把 continuous batching 说回「按批为单位」、把瓶颈说成算力不足（正文：瓶颈是显存带宽，且各家框架核心思想趋同）；`linux-perf-016` 用「负载高 CPU 低就重启应用」这道经典错答当干扰项；`dist-bloom-044` 写「k 越大越好、且能让『不存在』更可靠」与「几十万条也该用布隆、『存在』结论精确」（正文：最优 k=(m/n)·ln2；数据量小于百万用 Set）· 队列销 3 条、追加 3 条（同三篇的第二题角度，取自各篇正文其余章节与「高频追问速答」，与首题考点不重叠）· a 类现余 10 条（7 条第一题补缺 + 3 条第二题）· 三条均为 multiple，延续 b 类「multiple 占比偏低优先补多选」：补题前实测 `quiz/ai.json` 49 题 10 道、`quiz/linux.json` 18 题 4 道（全站最低配比方向之一）、`quiz/distributed.json` 43 题 11 道，补后为 50/11、19/5、44/12 · 本轮提交主题：feat(quiz): 演进第 193 轮车道 C 补 vLLM 吞吐/Linux 四象限/布隆过滤器三篇首题

- 2026-09-27 · 第七十二轮（第 197 轮｜车道 C｜题库深化第 72 轮）：3 道核心笔记第二题（`ai-infparams-052` / `ai-tokencost-053` / `ai-tooldesign-054`，均 multiple、difficulty 4，宿主即 a 类头部三条 `ai/intermediate/llm/04-inference-params`、`ai/intermediate/llm/05-token-cost`、`ai/intermediate/agent/16-tool-design`，三篇 `core: true`、首题由第 190 轮补齐）· 考点一律照队列指定角度，干扰项全部取该篇正文明确反对的说法——052 用「抽取/分类/结构化/代码放 0.8~1.2 高温档」与「线上默认取中高温度，第一诉求是文采」反掉速查表与「生产默认低温」；053 用「粗估口径已够写预算」（正文：不同分词器有偏差，精确要官方 tokenizer 计数器、做预算必须实测）与「分级路由按输入长度分流」（正文判据是任务复杂度：分类/抽取走小模型）；054 用「内部试用两周没选错就说明描述够用、评测集是厂商的事」与「写类幂等交给模型重试前先查一次兜底」· 队列销 3 条、追加 3 条（java 方向第二题角度：`java/intermediate/concurrent/06-threadlocal`、`java/basic/collection/03-concurrenthashmap`、`java/intermediate/concurrent/05-aqs`；勘察口径＝`core: true` ∩ 全站题数恰为 1 ∩ 不在队列，实测 161 条候选、其中 java 方向 33 条，取三篇高频且正文余量足的，角度取自各篇未被首题触及的章节）· a 类现余 10 条（4 条第一题补缺 + 6 条第二题），队列总条目维持 25 条（a 10 / b 2 / c 1 / d 12）· 三条均 multiple，延续 b 类「multiple 占比偏低优先补多选」：补题前实测 `quiz/ai.json` 51 题 12 道 multiple，补后 54 题 15 道 · 本轮提交主题：feat(quiz): 演进第 197 轮车道 C 补推理参数/Token 成本/工具设计三篇第二题

- 2026-09-27 · 第七十三轮（第 198 轮｜车道 C｜题库深化第 73 轮）：3 道第一题补缺（`dist-payment-045` difficulty 4 / `js-stream-026` difficulty 3 / `linux-cron-017` difficulty 4，均为 multiple，宿主即 a 类头部三条 `distributed/intermediate/case-studies/17-payment`、`js/intermediate/node/04-stream`、`linux/intermediate/system/07-cron-timer`；三篇 `core: true`，开工实测各篇全站 0 题、三个方向题库里无一条指向它们）· 考点一律照队列指定角度，干扰项全部取该篇正文明确反对或说反的说法——045 用「短款=渠道有本地无、长款=本地有渠道无」（正文恰好互换）与「把回调接口做高可用就可省掉查单与对账」（正文：回调为主 + 查单兜底 + 对账收口是三层）；026 用「几 MB 小文件也该改用流」（正文：小文件 readFile 更简单，复杂度要换回收益）与「TCP socket/WebSocket 属 Transform、gzip/加密属 Duplex」（正文两类对调）；017 用「cron 的 stdout 自动落系统日志不必重定向」（正文：走邮件且通常没人收）与「拿了分布式锁就不必考虑幂等」（正文：锁不等于幂等，重试与人工触发都算重复执行）· 队列销 3 条、追加 3 条（同三篇的**第二题角度**，取自各篇正文未被首题触及的章节：payment 的退款链路与网关封装用意、stream 的手写 data/drain 配对与三块舞台、cron 的三条表达式读法与日历型/间隔型分工；其中 Quartz 六字段与日周互斥一条已在 017 的 hint 里点名，入队时写明「改考表达式判别而非复述 hint」）· a 类现余 10 条（1 条第一题补缺 + 9 条第二题），队列总条目维持 25 条（a 10 / b 2 / c 1 / d 12）· 三条均 multiple，延续 b 类「multiple 占比偏低优先补多选」：补题前实测 `quiz/distributed.json` 44 题 12 道、`quiz/js.json` 26 题 6 道、`quiz/linux.json` 19 题 5 道，补后为 45/13、27/7、20/6 · 追加候选的现算口径同第 197 轮（`core: true` ∩ 全站题数恰为 1 ∩ 不在队列，本轮实测 core 笔记 371 篇、该池 164 条，方向分布 algorithm 30 / java 30 / ai 26 / distributed 23 / js 8 / linux 8 / mongodb 8 / python 8——本轮未从该池另取新篇，而是给刚补首题的三篇就地留第二题角度，角度已由通读正文支撑）· 说明：本轮游标 `198 mod 5 = 3` 与实做车道一致、未越车道；第 197 轮「下一轮入口」预告的「java 三篇第二题」并非队列头部（那三条在第 5~7 位，头部是本轮三条第一题补缺），按配方 §2「取队列头部 3 条」执行 · 本轮提交主题：feat(quiz): 演进第 198 轮车道 C 补支付/Stream/定时任务三篇首题

- 2026-09-28 · 第七十四轮（第 203 轮｜车道 C｜题库深化第 74 轮）：3 道核心笔记题（`mongo-multikey-015` / `java-threadlocal-140` / `java-chm-141`，均 multiple、difficulty 全 4；宿主即 a 类头部三条 `mongodb/intermediate/usage/09-multikey-index`〔第一题补缺〕、`java/intermediate/concurrent/06-threadlocal`〔第二题〕、`java/basic/collection/03-concurrenthashmap`〔第二题〕；三篇 `core: true`，开工按 33 份题库 681 题的 `noteId` 计数实读该三篇全站题数为 0 / 1 / 1）· 考点一律照队列指定角度，干扰项全部取该篇正文明确反对或说反的说法——015 用「`{tags:"a", categories:"b"}` 能同时用上两个多键索引求交集」（正文：一个查询只能用一个多键索引，另一个靠回表过滤）与「点路径可无限层自动多键」（正文：一层嵌套限制，数组套数组无法索引）；140 用「key 弱引用正是泄漏根源、换强引用即可根治」（正文：弱引用不是泄漏的原因，是止血带；强引用反而让 key 连同它带过的 value 一起陪葬到线程结束）与「ThreadLocalMap 用拉链法逐桶比对」（正文：开放寻址，不是拉链）；141 用「get 也要 synchronized 锁桶头只是持锁时间短」（正文：读不加锁，靠 val/next 的 volatile 加 tabAt 内的 Unsafe.getObjectVolatile）与「value 允许为 null、get 返回 null 时再用 containsKey 确认」（正文：putVal 第一行就禁 null，理由是并发下的二义性）· 队列销 3 条、追加 3 条（multikey 的第二题角度取「高频追问速答」里未被首题触及的写放大与覆盖查询受限；threadlocal / chm 补后各满 2 题，就地留**第三题**角度——分别取「Map 挂在 Thread 身上这条关键反转与 `tl.get()` 的读写定位路径」与「double check 防的是锁错对象 + 树化双条件（链长 ≥8 **且** table ≥64）」，均出自本轮通读正文、与已有两题不重叠）· a 类现余 10 条（1 条第一题补缺 + 6 条第二题 + 3 条第三题），队列总条目维持 25 条（a 10 / b 2 / c 1 / d 12）· 三条均 multiple，延续 b 类「multiple 占比偏低优先补多选」：补题前实测 `quiz/mongodb.json` 17 题仅 5 道 multiple、`quiz/java.json` 140 题仅 22 道，补后为 18/6、142/24（全站 681→684）· 追加候选的现算口径同第 197/198 轮（文档口径 `grep -rl "^core: true" src/content/docs` 实读 core 笔记 371 篇，∩ 全站题数恰为 1 ∩ 不在队列 = **159** 条，分布 java 30 / algorithm 30 / ai 26 / distributed 19 / python 8 / mongodb 8 / linux 8 / js 7 / network 6 / git 5——本轮未从该池另取新篇，理由同第 198 轮：刚通读的三篇角度有正文直接支撑，另取须先通读才能落角度）· 一条入队环节就地兜住的 hint 撞车：140 的 hint 逐条解释「止血带 vs 病因」「开放寻址而非拉链」「TTL 的捕获快照—执行前重放」，不复述首题 `java-threadlocal-004` hint 已点名的「get/set 只顺带清理碰到的过期项、根治靠 finally remove()」这一轴；其第三题角度据此改取「Map 挂在谁身上 + 读写定位路径」，与该篇已有两题不重合 · 说明：本轮游标 `203 mod 5 = 3` 与实做车道一致、未越车道；第 202 轮「下一轮入口」对本轮车道与队列头部（multikey 第一题 + java 三篇第二题）的预判与实跑一致 · 本轮提交主题：feat(quiz): 演进第 203 轮车道 C 补多键索引首题与 ThreadLocal/ConcurrentHashMap 第二题

- 2026-09-28 · 第七十五轮（第 208 轮｜车道 C｜题库深化第 75 轮）：3 道核心笔记第二题（`java-aqs-142` d4 / `linux-perf-018` d4 / `linux-cron-019` d3，均 multiple；宿主 `java/intermediate/concurrent/05-aqs`、`linux/intermediate/system/05-performance`、`linux/intermediate/system/07-cron-timer`，三篇 `core: true`，开工按 33 份题库 686 题的 `noteId` 计数实读各篇全站 1 题）· 考点一律照队列指定角度或其就地改道版，干扰项全部取该篇正文明确反对或说反的说法——142 用「park 对中断敏感、被 interrupt 立即抛 InterruptedException 并出队，故 acquire 是可中断模式」（正文：park 不敏感、只设标志、返回后 selfInterrupt 补上，才叫不可中断模式）与「公平与非公平差在队列结构、公平按等待时长排序」（正文：同一条 CLH 变体 FIFO 队列，只差一次 `hasQueuedPredecessors()` 检查）；018 用「b 列量运行队列、r 列量阻塞进程」（正文两列对调）与「日志删掉空间当即释放、`lsof | grep deleted` 只是历史记录」（正文：fd 还开着所以不释放，这条命令正是用来揪它的）；019 用「`*/5 * * * *` 每 5 小时」（正文：`*/5` 在分钟位，每 5 分钟）与「`OnCalendar` 与 `OnUnitActiveSec=1h` 是一回事、都表示每小时触发」（正文：日历型对齐墙上时刻 vs 间隔型从上次激活往后数）· **队列头部 3 条按实做对象销号，其中头部第 2 条 `ai/intermediate/llm/06-vllm` 本轮未出题、就地改写并保留在队列**：其四条指定角度（CoW 并行采样共享前缀 KV／前缀缓存的服务端复用／三家框架核心思想趋同／HF「能跑不等于能服务」）经逐条对账**已全部被首题 `ai-vllm-050` 的 hint 点名**，照原角度出第二题等于把首题讲解再考一遍，通读后残余可考角度仅「内部碎片 vs 外部碎片的归属」与「本篇管全体请求效率、推理参数篇管单请求效果的两层分工」两条，撑不起 3 正确 + 2 干扰，按「宁缺毋滥约束产出选谁」退到队列下一位可写的 `linux/intermediate/system/07-cron-timer`（头部第 7 条；其间第 4~6 条 bloom-filter / payment / stream 亦实测撞车，见本轮新增 b 类条目）· 同因改道的还有 performance 与 cron 两条：前者的指定角度里「available vs free、buff/cache 可回收、OOM Killer 用 dmesg 取证」三小条已被首题 `linux-perf-016` 的 hint 复述，本轮第二题改取该篇未被触及的「vmstat r/b/wa 三列分工、await 需与 %util 合判及换盘/降写入两条处置、CPU 高但 QPS 正常的四种可能、`lsof | grep deleted` 的成因」；后者按第 198 轮入队时就写好的「改考表达式判别而非复述 hint」执行，考三条表达式读法 + 日历型/间隔型分工· 队列销 3 条、追加 3 条（a 类 1 条：`05-aqs` 补后满 2 题、就地留**第三题**角度，取「五个模板方法清单与默认抛 UnsupportedOperationException、自研 MyMutex 的 setState 为何不必 CAS、虚拟哨兵头、节点只盯前驱不做全队列广播、waitStatus 四值归属」，均出自本轮通读正文；b 类 2 条：① a 类第二/三题入队前须按「首题选项 + 首题 hint」**双清单**复算角度，附本轮实测 4 条撞车与 1 条因就地标注躲过的对照，② 题目字段按纯文本渲染（`Quiz.tsx:519/540` 直接插值）而全站 689 题实测 25 题含反引号、4 题含 `**`，需逐题就地返修）· a 类现余 8 条（0 条第一题补缺 + 5 条第二题 + 3 条第三题）、队列总条目维持 25 条（a 8 / b 4 / c 1 / d 12）· 三条均 multiple，延续 b 类「multiple 占比偏低优先补多选」：补题前实测 `quiz/java.json` 142 题 24 道 multiple、`quiz/linux.json` 20 题 6 道（两数与第 203/198 轮记录逐项吻合），补后为 143/25、22/8，全站 686→689 题 · 追加候选的现算口径同第 197/198/203 轮（文档口径 `core: true` 笔记 371 篇 ∩ 全站题数恰为 1 ∩ 不在队列 = **164** 条，分布 algorithm 30 / java 30 / ai 27 / distributed 23 / js 8 / linux 8 / mongodb 8 / python 8 / network 6 / git 5 / nginx 3 / kubernetes 2 / mysql 2 / mqtt 1 / netty 1 / security 1 / vue 1——本轮未从该池另取新篇，理由同第 203 轮：另取须先通读才落得出角度，而刚通读的三篇角度有正文直接支撑；池数由第 203 轮的 159 回升到 164，系本轮三篇补满 2 题出池、与第 207 轮「现算口径提醒」同因的反向移动）· 一条新固化的写题纪律：三道题的 hint 一律按「第 X/Y/Z 项正确、第 A/B 项错」开句并与 `answer` 下标机器对账，写题脚本内置断言（序号不对账、含 markdown 记号、字段序异常、noteId 指向不存在的笔记即不落盘），不再靠人工数 · 说明：本轮游标 `208 mod 5 = 3` 与实做车道一致、未越车道；第 207 轮「下一轮入口」对本轮车道与队列头部（aqs + vllm + performance 三条第二题）的预判与实跑一致，差异仅在 vllm 一条按上述撞车证据改道 · 本轮提交主题：feat(quiz): 演进第 208 轮车道 C 补 AQS 与性能排查、定时任务第二题并按 hint 撞车证据为 vLLM 改道

## 经验与规则

- 第五十五轮全库重扫发现：96 篇 core 笔记 0 题、134 篇仅 1 题——早前覆盖成果疑似在并行会话历史改写事故中丢失。队列补缺规则：0 题笔记优先补第一题（标「0 题补缺」），再轮到第二题。扫描脚本需同时处理 .md 与 .mdx，否则尾点导致误报 0 题。

- core: true 共 234 篇：`grep -rl "^core: true" src/content/docs`；难度定级锚点——1~2 概念识别、3 原理理解、4 边界/易错点、5 生产权衡/深挖。
- 新题红线：考点必须与该笔记现有题不同（入队时写明差异角度）；judge 固定 ["正确","错误"]；字段沿用所在文件格式；新题一律带 difficulty。
- 校验脚本必须检查字段类型（hint 为 str、difficulty 为 1~5 整数），仅检查字段存在会漏掉参数顺序错位（第十六轮事故）。
- 追加题库时匹配原文件的 JSON 格式风格（紧凑数组 vs 缩进数组）：交替重排会让每次写入产生整文件 diff，淹没真实变更、干扰暂存核对。
- 出题 helper 内置 hint/difficulty 参数顺序自动纠正——写题时按「答案、难度、提示」的自然顺序传参也不会再产生字段错位。
- 已完成记录不内嵌自身提交 hash（自指问题），以「本轮提交主题」字段配合 git log --grep 反查。
- 与并行会话（cursor/自主演进）撞车时：内容并集去重合并，绝不覆盖对方改动；只暂存本轮自己改的文件。
- 事故记录（第十六轮提交 097a205）：演进任务的 cron 在本轮构建窗口内编辑了共享题库文件，git add 时将其已写完但未提交的 7 道题（java-dubboarch-108/dubbfail-109、linux-ctx-008/virt-009/epoll-010、net-http-009/finwait-010）一并扫入提交。已核验全部完整有效、build 通过，保留不回退；教训：add 前必须在同一命令里重新 git status 并 diff --cached 核对暂存内容，发现他人改动立即中止并改用 git add -p 或stash 分离。
