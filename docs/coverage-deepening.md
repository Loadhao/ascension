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





















- [ ] ai/intermediate/agent/11-rag-advanced — 第一题考「纯向量检索的盲区、BM25+向量混合召回与 RRF 融合、rerank 两阶段精排」（0 题补缺，角度取自该篇 description）
- [ ] ai/intermediate/llm/06-vllm — 第一题考「PagedAttention 显存分页与 continuous batching 迭代级调度，以及吞吐与时延的权衡」（0 题补缺，角度取自该篇 description）
- [ ] linux/intermediate/system/05-performance — 第一题考「load average 的真实含义、CPU 飙高四步定位法与 iostat 关键列的四象限排查」（0 题补缺，角度取自该篇 description）
- [ ] distributed/intermediate/case-studies/31-bloom-filter — 第一题考「位数组与 k 个哈希函数、误判率的参数选择、不能删除的限制与 Counting/cuckoo 变体」（0 题补缺，角度取自该篇 description）
- [ ] ai/intermediate/llm/04-inference-params — 第二题考「重复惩罚调过头会误伤专有名词、max_tokens 与 stop 序列是防跑飞必配、seed 与 temperature=0 的「近似确定」差别在哪」（首题已考「temperature 动分布形状 vs top_k/top_p 裁候选集的分工，以及两个旋钮不该同时猛调」）
- [ ] ai/intermediate/llm/05-token-cost — 第二题考「降本四招各自落点（滑动窗口+摘要裁历史、系统提示表格化或外置按需取、max_tokens 限输出、分级路由的量级收益）与为什么粗估口径不能替代实测预算」（首题已考「输入量大 vs 输出单价高谁才是账单大头、O(n²) 根源、提示缓存的固定前缀条件」）
- [ ] ai/intermediate/agent/16-tool-design — 第二题考「工具选择准确率怎么用评测集量化（标注任务→应选工具、改描述前后跑对比）、写类工具为何必须幂等、MCP 生态参差为什么要审描述与错误行为后包一层再暴露」（首题已考「一个工具一件事的拆分判据、「何时不用」比「何时用」更防错、错误分类触发不同模型行为」）
- [ ] distributed/intermediate/case-studies/17-payment — 第一题考「支付状态机与掉单治理、回调幂等纪律、渠道对账单与差错处理」（0 题补缺，角度取自该篇 description）
- [ ] js/intermediate/node/04-stream — 第一题考「为什么不能把 10GB 文件读进内存、四种流类型、pipe 与背压、pipeline API 的错误传播」（0 题补缺，角度取自该篇 description）
- [ ] linux/intermediate/system/07-cron-timer — 第一题考「crontab 五字段与经典坑、systemd timer 的补跑能力、分布式环境下防重复执行的三个思路」（0 题补缺，角度取自该篇 description）
- [ ] mongodb/intermediate/usage/09-multikey-index — 第一题考「数组字段自动多键化、一个查询一次一个多键的限制、多键+复合索引的边界与 $elemMatch 配合」（0 题补缺，角度取自该篇 description）

### b 类：旧题返修

- [ ] 抽查 hint 质量：hint 复述答案、干扰项不成立的就地返修（每条记录原因）
- [ ] 全库题型配比盘点：multiple 占比偏低的方向优先补多选

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

## 已完成记录

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
