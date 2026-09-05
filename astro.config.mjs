// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';

// Mermaid 图表风格：暖琥珀低饱和；这里写入亮色基准值，
// 暗色由 custom.css 的 CSS 变量覆盖（跟随 Starlight 主题切换）
const mermaidStyle = {
  theme: 'base',
  wrap: true,
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  themeVariables: {
    fontSize: '15px',
    background: '#faf8f5',
    // 流程图
    primaryColor: '#f6efe3',
    primaryBorderColor: '#c9a26b',
    primaryTextColor: '#3f3428',
    secondaryColor: '#f0e4d0',
    secondaryBorderColor: '#d3b98c',
    secondaryTextColor: '#3f3428',
    tertiaryColor: '#f9f4ea',
    tertiaryBorderColor: '#ddcdb0',
    lineColor: '#b09a7e',
    textColor: '#3f3428',
    clusterBkg: '#f4ecdd',
    clusterBorder: '#d8c5a5',
    edgeLabelBackground: '#faf8f5',
    nodeBorderRadius: '10px',
    // 时序图
    actorBkg: '#f6efe3',
    actorBorder: '#c9a26b',
    actorTextColor: '#3f3428',
    actorLineColor: '#b09a7e',
    signalColor: '#6b5b45',
    signalTextColor: '#3f3428',
    noteBkgColor: '#f3e8d3',
    noteBorderColor: '#d9bf94',
    noteTextColor: '#51422e',
    sequenceNumberColor: '#faf8f5',
    labelBoxBkgColor: '#f6efe3',
    labelBoxBorderColor: '#c9a26b',
    labelTextColor: '#3f3428',
    loopTextColor: '#8a6f4d',
    // 脑图：分支统一为暖琥珀渐进（替代默认的彩虹轮转）
    cScale0: '#dfae72',
    cScale1: '#d9a066',
    cScale2: '#cf9257',
    cScale3: '#c2844a',
    cScale4: '#b57740',
    cScale5: '#a86a38',
    cScaleLabel0: '#3f3428',
    cScaleLabel1: '#3f3428',
    cScaleLabel2: '#3f3428',
    cScaleLabel3: '#3f3428',
    cScaleLabel4: '#3f3428',
    cScaleLabel5: '#3f3428',
  },
  flowchart: {
    curve: 'basis', // 柔和曲线替代生硬折线
    padding: 18, // 节点内边距，文字不贴边
    nodeSpacing: 56, // 同层节点间距
    rankSpacing: 64, // 层间距离，留白更从容
    diagramPadding: 10,
    htmlLabels: true,
    useMaxWidth: true,
    subGraphTitleMargin: { top: 10, bottom: 8 },
  },
  sequence: {
    diagramMarginX: 24,
    diagramMarginY: 16,
    actorMargin: 64, // 参与者间距更宽
    width: 168,
    height: 44,
    boxMargin: 12,
    noteMargin: 12,
    messageMargin: 42,
    mirrorActors: false, // 去掉底部重复的参与者条，更干净
    wrap: true,
    useMaxWidth: true,
    actorFontSize: 15,
    actorFontWeight: 500,
    noteFontSize: 13,
    messageFontSize: 14,
    noteAlign: 'left',
    bottomMarginAdj: 8,
  },
};

export default defineConfig({
  site: 'https://loadhao.github.io',
  base: '/ascension/',
  integrations: [
    react(),
    starlight({
      title: 'Ascension',
      description: '个人学习知识库',
      defaultLocale: 'zh-cn',
      social: [
        { label: 'GitHub', href: 'https://github.com/Loadhao/ascension', icon: 'github' },
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        // 笔记页页脚自动注入学习状态标记（ProgressMark）
        Footer: './src/components/starlight/Footer.astro',
      },
      head: [
        {
          // 默认深色（F2）：首次访问无偏好时预设 starlight-theme，
          // 该脚本先于 Starlight 的 ThemeProvider（head 末尾）执行
          tag: 'script',
          content:
            "try{if(!localStorage.getItem('starlight-theme'))localStorage.setItem('starlight-theme','dark')}catch(e){}",
        },
        {
          // Mermaid 流程图悬停交互（仅 DOM 增强，图表仍为构建时 SVG）
          tag: 'script',
          attrs: { type: 'module', src: '/ascension/scripts/mermaid-interact.js' },
        },
      ],
      sidebar: [
        { label: '指南', items: [{ autogenerate: { directory: 'guide' } }] },
        {
          label: 'Linux',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/linux/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: '基础命令',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/linux/basic/commands/' },
                    { label: '文件与目录操作', link: '/linux/basic/commands/01-file-ops/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Java',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/java/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: 'Java 基础',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/basic/syntax/' },
                    { label: '面向对象：封装、继承、多态', link: '/java/basic/syntax/01-oop/' },
                    { label: 'String 与字符串常量池', link: '/java/basic/syntax/02-string/' },
                    { label: '==、equals 与 hashCode', link: '/java/basic/syntax/03-equals-hashcode/' },
                    { label: '泛型与类型擦除', link: '/java/basic/syntax/04-generics/' },
                    { label: 'Java 异常体系', link: '/java/basic/syntax/05-exception/' },
                    { label: '反射与注解', link: '/java/basic/syntax/06-reflection-annotation/' },
                  ],
                },
                {
                  label: '集合框架',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/basic/collection/' },
                    { label: 'ArrayList 源码与扩容', link: '/java/basic/collection/01-arraylist/' },
                    { label: 'HashMap 源码分析', link: '/java/basic/collection/02-hashmap/' },
                    { label: 'ConcurrentHashMap 详解', link: '/java/basic/collection/03-concurrenthashmap/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: '并发编程',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/intermediate/concurrent/' },
                    { label: '线程基础', link: '/java/intermediate/concurrent/01-thread-basics/' },
                    { label: '线程池详解', link: '/java/intermediate/concurrent/02-thread-pool/' },
                    { label: 'volatile 与 Java 内存模型', link: '/java/intermediate/concurrent/03-volatile/' },
                    { label: 'synchronized 与锁升级', link: '/java/intermediate/concurrent/04-synchronized/' },
                    { label: 'AQS 抽象队列同步器', link: '/java/intermediate/concurrent/05-aqs/' },
                    { label: 'ThreadLocal 原理与内存泄漏', link: '/java/intermediate/concurrent/06-threadlocal/' },
                  ],
                },
                {
                  label: 'Spring 框架',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/intermediate/spring/' },
                    { label: 'IoC 容器与 Bean 生命周期', link: '/java/intermediate/spring/01-ioc-bean-lifecycle/' },
                    { label: 'AOP 与动态代理', link: '/java/intermediate/spring/02-aop/' },
                    { label: '循环依赖与三级缓存', link: '/java/intermediate/spring/03-circular-dependency/' },
                    { label: '事务与传播机制', link: '/java/intermediate/spring/04-transaction/' },
                    { label: 'Spring Boot 自动配置原理', link: '/java/intermediate/spring/05-springboot-autoconfig/' },
                  ],
                },
                {
                  label: '设计模式',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/intermediate/design-pattern/' },
                    { label: 'SOLID 设计原则', link: '/java/intermediate/design-pattern/01-principles/' },
                    { label: '创建型模式', link: '/java/intermediate/design-pattern/02-creational/' },
                    { label: '结构型模式', link: '/java/intermediate/design-pattern/03-structural/' },
                    { label: '行为型模式', link: '/java/intermediate/design-pattern/04-behavioral/' },
                    { label: '框架源码中的模式地图', link: '/java/intermediate/design-pattern/05-patterns-in-frameworks/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: 'JVM',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/advanced/jvm/' },
                    { label: '类加载机制与双亲委派', link: '/java/advanced/jvm/01-class-loading/' },
                    { label: '运行时数据区', link: '/java/advanced/jvm/02-memory/' },
                    { label: '垃圾回收算法与收集器', link: '/java/advanced/jvm/03-garbage-collection/' },
                  ],
                },
                {
                  label: 'Spring Cloud 微服务',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/advanced/springcloud/' },
                    { label: '微服务与 Spring Cloud 总览', link: '/java/advanced/springcloud/01-microservices-overview/' },
                    { label: '注册中心：服务注册与发现', link: '/java/advanced/springcloud/02-registry/' },
                    { label: '服务网关 Spring Cloud Gateway', link: '/java/advanced/springcloud/03-gateway/' },
                    { label: '服务通信：OpenFeign 与负载均衡', link: '/java/advanced/springcloud/04-openfeign-loadbalancer/' },
                    { label: '熔断限流：Sentinel', link: '/java/advanced/springcloud/05-sentinel/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '数据库',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/database/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: 'MySQL 基础',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/database/basic/mysql/' },
                    { label: '一条 SQL 的执行流程', link: '/database/basic/mysql/01-sql-execution/' },
                    { label: '索引与 B+ 树', link: '/database/basic/mysql/02-index-btree/' },
                  ],
                },
                {
                  label: 'Redis 基础',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/database/basic/redis/' },
                    { label: '数据结构与底层编码', link: '/database/basic/redis/01-data-structures/' },
                    { label: '持久化：RDB 与 AOF', link: '/database/basic/redis/02-persistence/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: 'MySQL 进阶',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/database/intermediate/mysql/' },
                    { label: '事务与 MVCC', link: '/database/intermediate/mysql/01-transaction-mvcc/' },
                    { label: '锁机制', link: '/database/intermediate/mysql/02-locks/' },
                    { label: '三大日志与两阶段提交', link: '/database/intermediate/mysql/03-redo-undo-binlog/' },
                  ],
                },
                {
                  label: 'Redis 进阶',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/database/intermediate/redis/' },
                    { label: '过期删除与内存淘汰', link: '/database/intermediate/redis/01-expiration-eviction/' },
                    { label: '缓存穿透、击穿与雪崩', link: '/database/intermediate/redis/02-cache-problems/' },
                    { label: '分布式锁的演进', link: '/database/intermediate/redis/03-distributed-lock/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: 'MySQL 高级',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/database/advanced/mysql/' },
                    { label: 'SQL 优化与执行计划', link: '/database/advanced/mysql/01-optimization/' },
                    { label: '主从复制与分库分表', link: '/database/advanced/mysql/02-replication-sharding/' },
                  ],
                },
                {
                  label: 'Redis 高级',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/database/advanced/redis/' },
                    { label: '高可用：主从、哨兵与集群', link: '/database/advanced/redis/01-replication-sentinel-cluster/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '分布式',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/distributed/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: '理论基石',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/distributed/basic/theory/' },
                    { label: 'CAP 与 BASE', link: '/distributed/basic/theory/01-cap-base/' },
                    { label: '一致性哈希', link: '/distributed/basic/theory/02-consistent-hashing/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: '共识算法',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/distributed/intermediate/consensus/' },
                    { label: 'Paxos 与 Raft', link: '/distributed/intermediate/consensus/01-paxos-raft/' },
                  ],
                },
                {
                  label: '分布式事务',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/distributed/intermediate/transaction/' },
                    { label: '分布式事务五种方案', link: '/distributed/intermediate/transaction/01-distributed-transaction/' },
                    { label: '分布式 ID', link: '/distributed/intermediate/transaction/02-distributed-id/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: '数据一致性',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/distributed/advanced/consistency/' },
                    { label: '数据一致性：从强一致到最终一致', link: '/distributed/advanced/consistency/01-consistency-patterns/' },
                  ],
                },
                {
                  label: '高可用与容灾',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/distributed/advanced/availability/' },
                    { label: '容灾与多活：RTO/RPO 与切换策略', link: '/distributed/advanced/availability/01-dr-multi-active/' },
                  ],
                },
                {
                  label: '可观测性',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/distributed/advanced/observability/' },
                    { label: '分布式链路追踪', link: '/distributed/advanced/observability/01-distributed-tracing/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '中间件',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/middleware/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: '消息队列基础',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/middleware/basic/mq/' },
                    { label: '为什么需要消息队列', link: '/middleware/basic/mq/01-why-mq/' },
                    { label: 'Kafka、RocketMQ 与 RabbitMQ 选型', link: '/middleware/basic/mq/02-mq-comparison/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: 'Kafka 核心',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/middleware/intermediate/kafka/' },
                    { label: 'Kafka 架构与存储模型', link: '/middleware/intermediate/kafka/01-kafka-architecture/' },
                    { label: '副本与 ISR 机制', link: '/middleware/intermediate/kafka/02-replica-isr/' },
                    { label: '不丢消息与幂等消费', link: '/middleware/intermediate/kafka/03-reliability-idempotent/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: 'RocketMQ 专题',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/middleware/advanced/rocketmq/' },
                    { label: 'RocketMQ 核心特性', link: '/middleware/advanced/rocketmq/01-rocketmq-features/' },
                    { label: '顺序性与高性能原理', link: '/middleware/advanced/rocketmq/02-order-performance/' },
                    { label: '消息积压治理', link: '/middleware/advanced/rocketmq/03-backlog/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Python',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/python/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: '语法基础',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/python/basic/syntax/' },
                    { label: '一切皆对象：变量、引用与可变性', link: '/python/basic/syntax/01-objects/' },
                    { label: '流程控制与推导式', link: '/python/basic/syntax/02-control-flow/' },
                    { label: '字符串与编码', link: '/python/basic/syntax/03-strings/' },
                    { label: '异常处理与 EAFP', link: '/python/basic/syntax/04-exceptions/' },
                  ],
                },
                {
                  label: '数据结构',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/python/basic/data-structures/' },
                    { label: 'list 与 tuple：动态数组', link: '/python/basic/data-structures/01-list-tuple/' },
                    { label: 'dict 与 set：哈希表实现', link: '/python/basic/data-structures/02-dict-set/' },
                  ],
                },
                {
                  label: '函数与装饰器',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/python/basic/functions/' },
                    { label: '函数：参数、作用域与闭包', link: '/python/basic/functions/01-functions-closures/' },
                    { label: '迭代器与生成器', link: '/python/basic/functions/02-iterators-generators/' },
                    { label: '装饰器', link: '/python/basic/functions/03-decorators/' },
                  ],
                },
                {
                  label: '面向对象',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/python/basic/oop/' },
                    { label: '类、实例与魔术方法', link: '/python/basic/oop/01-class-basics/' },
                    { label: '继承、super 与 MRO', link: '/python/basic/oop/02-inheritance-mro/' },
                    { label: 'dataclass 与 __slots__', link: '/python/basic/oop/03-dataclass-slots/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: '常用标准库',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/python/intermediate/stdlib/' },
                    { label: 'collections：容器扩展', link: '/python/intermediate/stdlib/01-collections/' },
                    { label: 'functools 与 itertools', link: '/python/intermediate/stdlib/02-functools-itertools/' },
                    { label: 'pathlib 与文件 IO', link: '/python/intermediate/stdlib/03-pathlib-io/' },
                    { label: 'typing 类型标注', link: '/python/intermediate/stdlib/04-typing/' },
                  ],
                },
                {
                  label: '第三方生态',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/python/intermediate/libs/' },
                    { label: 'requests 与 httpx', link: '/python/intermediate/libs/01-requests-httpx/' },
                    { label: 'Pydantic 数据校验', link: '/python/intermediate/libs/02-pydantic/' },
                    { label: 'FastAPI', link: '/python/intermediate/libs/03-fastapi/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: '工程化',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/python/advanced/eng/' },
                    { label: '环境管理与 uv', link: '/python/advanced/eng/01-venv-uv/' },
                    { label: 'pytest 测试', link: '/python/advanced/eng/02-pytest/' },
                    { label: 'ruff 与 mypy', link: '/python/advanced/eng/03-ruff-mypy/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'AI',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/ai/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: 'Agent',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/ai/basic/agent/' },
                    { label: 'Agent Loop 核心循环', link: '/ai/basic/agent/01-agent-loop/' },
                    { label: '工具调用与分发', link: '/ai/basic/agent/02-tool-use/' },
                    { label: '权限系统', link: '/ai/basic/agent/03-permission/' },
                    { label: '钩子机制', link: '/ai/basic/agent/04-hooks/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: 'Agent',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/ai/intermediate/agent/' },
                    { label: '任务规划 TodoWrite', link: '/ai/intermediate/agent/01-todo-planning/' },
                    { label: '系统提示组装', link: '/ai/intermediate/agent/02-system-prompt/' },
                    { label: '上下文工程', link: '/ai/intermediate/agent/03-context-engineering/' },
                    { label: '记忆系统', link: '/ai/intermediate/agent/04-memory/' },
                    { label: '技能按需加载', link: '/ai/intermediate/agent/05-skill-loading/' },
                    { label: 'RAG 检索增强生成', link: '/ai/intermediate/agent/06-rag/' },
                    { label: '错误恢复', link: '/ai/intermediate/agent/07-error-recovery/' },
                    { label: 'MCP 协议', link: '/ai/intermediate/agent/08-mcp/' },
                    { label: '子代理 Subagent', link: '/ai/intermediate/agent/09-subagent/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: 'Agent',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/ai/advanced/agent/' },
                    { label: '多 Agent 协作总览', link: '/ai/advanced/agent/01-multi-agent/' },
                    { label: '任务系统 Task System', link: '/ai/advanced/agent/02-task-system/' },
                    { label: '后台任务', link: '/ai/advanced/agent/03-background-tasks/' },
                    { label: '定时调度 Cron', link: '/ai/advanced/agent/04-cron-scheduler/' },
                    { label: 'Agent 团队', link: '/ai/advanced/agent/05-agent-teams/' },
                    { label: '团队协议', link: '/ai/advanced/agent/06-team-protocols/' },
                    { label: '自主智能体', link: '/ai/advanced/agent/07-autonomous-agents/' },
                    { label: 'Worktree 隔离', link: '/ai/advanced/agent/08-worktree-isolation/' },
                    { label: '综合 Harness', link: '/ai/advanced/agent/09-comprehensive-agent/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Docker',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/docker/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: '基础概念与命令',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/docker/basic/fundamentals/' },
                    { label: '容器与镜像核心概念', link: '/docker/basic/fundamentals/01-concepts/' },
                    { label: '镜像与容器常用命令', link: '/docker/basic/fundamentals/02-commands/' },
                    { label: '容器生命周期与调试', link: '/docker/basic/fundamentals/03-lifecycle/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: '实战进阶',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/docker/intermediate/practice/' },
                    { label: 'Dockerfile 编写指南', link: '/docker/intermediate/practice/01-dockerfile/' },
                    { label: '数据卷与持久化', link: '/docker/intermediate/practice/02-volume/' },
                    { label: '容器网络', link: '/docker/intermediate/practice/03-network/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: '编排与原理',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/docker/advanced/orchestration/' },
                    { label: 'Docker Compose 编排', link: '/docker/advanced/orchestration/01-compose/' },
                    { label: '容器底层原理', link: '/docker/advanced/orchestration/02-principles/' },
                    { label: '镜像优化与安全实践', link: '/docker/advanced/orchestration/03-image-optimization/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Git',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/git/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: '基础入门',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/git/basic/foundations/' },
                    { label: '核心心智模型与对象存储', link: '/git/basic/foundations/01-core-model/' },
                    { label: '日常高频命令', link: '/git/basic/foundations/02-daily-commands/' },
                  ],
                },
              ],
            },
            {
              label: '中级',
              collapsed: false,
              items: [
                {
                  label: '协作开发',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/git/intermediate/collaboration/' },
                    { label: '分支与合并', link: '/git/intermediate/collaboration/01-branch-merge/' },
                    { label: '远程协作', link: '/git/intermediate/collaboration/02-remote-collab/' },
                    { label: '撤销与找回', link: '/git/intermediate/collaboration/03-undo-recovery/' },
                  ],
                },
              ],
            },
            {
              label: '高级',
              collapsed: false,
              items: [
                {
                  label: '高级工作流',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/git/advanced/workflow/' },
                    { label: '历史改写', link: '/git/advanced/workflow/01-history-rewrite/' },
                    { label: '进阶工具箱', link: '/git/advanced/workflow/02-advanced-tools/' },
                    { label: '团队规范与常见坑', link: '/git/advanced/workflow/03-team-standards/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '工具',
          collapsed: true,
          items: [
            { label: '学习路线', link: '/tools/' },
            {
              label: '基础',
              collapsed: false,
              items: [
                {
                  label: '命令行工具',
                  badge: '分类',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/tools/basic/cli/' },
                    { label: 'grep / sed / awk：文本处理三件套', link: '/tools/basic/cli/01-grep-sed-awk/' },
                    { label: 'curl：命令行 HTTP 请求', link: '/tools/basic/cli/02-curl/' },
                    { label: 'jq：命令行 JSON 处理', link: '/tools/basic/cli/03-jq/' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
  markdown: {
    processor: unified({ rehypePlugins: [[rehypeMermaid, { mermaidConfig: mermaidStyle }]] }),
    // 代码块双主题：跟随站点明暗切换（github-light / github-dark）
    syntaxHighlight: {
      type: 'shiki',
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      excludeLangs: ['mermaid'],
    },
  },
});
