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

// 站点部署在 base 子路径下，Markdown/MDX 正文里以 / 开头的站内链接不会被
// 自动补 base 前缀，构建后原样输出导致线上 404（侧边栏等组件链接不受影响）。
// 统一在 mdast 阶段改写：跳过 // 开头的外链、# 锚点与已带 base 的路径。
const SITE_BASE = '/ascension/';

function remarkPrefixBase(base) {
  const bareBase = base.replace(/\/$/, '');
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') return;
    if (
      (node.type === 'link' || node.type === 'image' || node.type === 'definition') &&
      typeof node.url === 'string' &&
      node.url.startsWith('/') &&
      !node.url.startsWith('//') &&
      !node.url.startsWith(bareBase + '/') &&
      node.url !== bareBase
    ) {
      node.url = bareBase + node.url;
    }
    for (const child of Object.values(node)) {
      if (child && typeof child === 'object') visit(child);
    }
  };
  return () => (tree) => visit(tree);
}

// 正文里的外部链接统一新开标签页：延伸阅读等外链点击后不再顶掉当前阅读现场。
// 仅处理绝对地址（http(s):// 或协议相对 //）且非站点自身域名的 <a>，
// 锚点、相对路径与站内链接保持当前页跳转；须放在 rehypeMermaid 之后，
// 让 mermaid 图内 click 链接（SVG <a> 的 xlink:href）一并覆盖。
function rehypeExternalNewTab(siteUrl) {
  const siteHost = new URL(siteUrl).host;
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') return;
    if (node.type === 'element' && node.tagName === 'a') {
      const props = node.properties || (node.properties = {});
      const href =
        typeof props.href === 'string'
          ? props.href
          : typeof props.xLinkHref === 'string'
            ? props.xLinkHref
            : '';
      let host = '';
      try {
        host = href ? new URL(href, siteUrl).host : '';
      } catch {}
      if (/^(https?:)?\/\//i.test(href) && host !== siteHost) {
        props.target = '_blank';
        props.rel = props.rel ? `${props.rel} noopener noreferrer` : 'noopener noreferrer';
      }
    }
    for (const child of Object.values(node)) {
      if (child && typeof child === 'object') visit(child);
    }
  };
  return () => (tree) => visit(tree);
}

export default defineConfig({
  site: 'https://loadhao.github.io',
  base: SITE_BASE,
  integrations: [
    react(),
    starlight({
      title: 'Ascension',
      description: '个人学习知识库',
      defaultLocale: 'zh-cn',
      social: [
        { label: 'GitHub', href: 'https://github.com/Loadhao/ascension', icon: 'github' },
      ],
      customCss: ['./src/styles/custom.css', './src/styles/viz-structures.css'],
      components: {
        // 笔记页页脚自动注入学习状态标记（ProgressMark）
        Footer: './src/components/starlight/Footer.astro',
        // 侧边栏目录树工具条（全部展开/收起）
        Sidebar: './src/components/starlight/Sidebar.astro',
        // 自测作答页右侧栏换刷题导航器，其余页面保持默认目录
        TableOfContents: './src/components/starlight/TableOfContents.astro',
        MobileTableOfContents: './src/components/starlight/MobileTableOfContents.astro',
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
        {
          // 侧边栏目录树交互（子树联动/批量开合/localStorage 持久化）
          tag: 'script',
          attrs: { type: 'module', src: '/ascension/scripts/sidebar-tree.js' },
        },
      ],
      sidebar: [
        {
          label: '指南',
          items: [
            { link: '/guide/resources/', label: '资源导航' },
            { link: '/guide/interview-cheatsheet/', label: '速答手册' },
            { link: '/guide/quiz/', label: '自测作答' },
          ],
        },
        { label: '知识全景', link: '/panorama/' },
        {
          label: '系统与运维',
          collapsed: true,
          items: [
            {
              label: 'Linux',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/linux/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '基础命令',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/linux/basic/commands/' },
                        { label: '文件与目录操作', link: '/linux/basic/commands/01-file-ops/' },
                        { label: '文本处理与管道：grep、sed、awk 三剑客', link: '/linux/basic/commands/02-text-pipeline/' },
                      ],
                    },
                    {
                      label: '文件系统',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/linux/basic/filesystem/' },
                        { label: '文件系统与磁盘管理', link: '/linux/basic/filesystem/01-filesystem/' },
                      ],
                    },
                    {
                      label: '用户与权限',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/linux/basic/permission/' },
                        { label: '用户与权限体系', link: '/linux/basic/permission/01-users-permissions/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '系统管理',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/linux/intermediate/system/' },
                        { label: 'Shell 脚本', link: '/linux/intermediate/system/01-shell-script/' },
                        { label: '进程管理', link: '/linux/intermediate/system/02-process-management/' },
                        { label: '系统服务与 systemd', link: '/linux/intermediate/system/03-system-service/' },
                        { label: '网络', link: '/linux/intermediate/system/04-network/' },
                        { label: '性能排查：CPU、内存、磁盘 IO 与负载', link: '/linux/intermediate/system/05-performance/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Nginx',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/nginx/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '配置基础',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/nginx/basic/config/' },
                        { label: '工作模型与配置核心', link: '/nginx/basic/config/01-working-model/' },
                        { label: '静态服务与日志', link: '/nginx/basic/config/02-static-server/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '代理进阶',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/nginx/intermediate/proxy/' },
                        { label: '反向代理与负载均衡', link: '/nginx/intermediate/proxy/01-reverse-proxy-lb/' },
                        { label: 'HTTPS、缓存与限流', link: '/nginx/intermediate/proxy/02-https-cache-ratelimit/' },
                        { label: 'keepalived 与 Nginx 高可用', link: '/nginx/intermediate/proxy/03-keepalived-ha/' },
                        { label: 'CDN 原理：调度、缓存与安全', link: '/nginx/intermediate/proxy/04-cdn/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: '网络',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/network/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '网络基础',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/network/basic/foundation/' },
                        { label: 'OSI 七层与 TCP/IP 四层', link: '/network/basic/foundation/01-osi-tcpip/' },
                        { label: 'DNS 解析全过程', link: '/network/basic/foundation/02-dns/' },
                        { label: '从输入 URL 到页面展示', link: '/network/basic/foundation/03-from-url-to-page/' },
                      ],
                    },
                    {
                      label: 'TCP 协议',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/network/basic/tcp/' },
                        { label: '三次握手与四次挥手', link: '/network/basic/tcp/01-three-way-handshake/' },
                        { label: 'TCP 可靠传输四件套', link: '/network/basic/tcp/02-reliable-transfer/' },
                        { label: 'TCP 与 UDP 对比', link: '/network/basic/tcp/03-tcp-vs-udp/' },
                      ],
                    },
                    {
                      label: 'HTTP 协议',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/network/basic/http/' },
                        { label: 'HTTP 基础：报文、方法与状态码', link: '/network/basic/http/01-http-basics/' },
                        { label: 'HTTPS 与 TLS 握手', link: '/network/basic/http/02-https-tls/' },
                        { label: 'HTTP 演进：1.0 / 1.1 / 2 / 3', link: '/network/basic/http/03-http-evolution/' },
                        { label: '登录态：Cookie、Session、JWT 与 OAuth2', link: '/network/basic/http/04-auth-state/' },
                        { label: '同源策略与 CORS', link: '/network/basic/http/05-cors/' },
                        { label: 'HTTP 缓存：强缓存与协商缓存', link: '/network/basic/http/06-http-cache/' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '编程语言',
          collapsed: true,
          items: [
            {
              label: 'Java',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/java/' },
                {
                  label: '基础',
                  collapsed: true,
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
                        { label: '位运算与原码、反码、补码', link: '/java/basic/syntax/07-bit-operations/' },
                        { label: '序列化与 serialVersionUID', link: '/java/basic/syntax/08-serialization/' },
                        { label: '深浅拷贝与包装类型缓存', link: '/java/basic/syntax/09-object-copy/' },
                        { label: 'SPI 机制：ServiceLoader', link: '/java/basic/syntax/10-spi/' },
                        { label: '常用接口与抽象类地图', link: '/java/basic/syntax/11-common-interfaces/' },
                        { label: 'JNI 与 JNDI：本地调用与命名查找', link: '/java/basic/syntax/12-jni-jndi/' },
                        { label: 'Lombok 与注解处理器', link: '/java/basic/syntax/13-lombok-apt/' },
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
                        { label: '红黑树：从 BST 到 TreeMap', link: '/java/basic/collection/04-red-black-tree/' },
                        { label: 'LinkedHashMap 与 LRU 缓存', link: '/java/basic/collection/05-linkedhashmap-lru/' },
                        { label: 'CopyOnWriteArrayList 读写分离', link: '/java/basic/collection/06-copyonwritearraylist/' },
                      ],
                    },
                    {
                      label: 'Tomcat 与 Web 容器',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/basic/tomcat/' },
                        { label: 'Web 容器的本质', link: '/java/basic/tomcat/01-web-container/' },
                        { label: 'Jetty 架构与 Tomcat 对比', link: '/java/basic/tomcat/02-jetty-architecture/' },
                      ],
                    },
                    {
                      label: 'Java IO',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/basic/io/' },
                        { label: 'IO 模型：BIO、NIO、AIO', link: '/java/basic/io/01-io-model/' },
                        { label: '零拷贝', link: '/java/basic/io/02-zero-copy/' },
                        { label: 'TCP 粘包拆包与 Netty 解码', link: '/java/basic/io/03-tcp-sticky-packets/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: 'Stream 与函数式',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/stream/' },
                        { label: 'Stream 原理与并行流', link: '/java/intermediate/stream/01-stream-principle/' },
                      ],
                    },
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
                        { label: 'LongAdder 高并发计数', link: '/java/intermediate/concurrent/07-longadder/' },
                        { label: '阻塞队列与 ArrayBlockingQueue', link: '/java/intermediate/concurrent/08-blocking-queue/' },
                        { label: 'CAS 与原子类', link: '/java/intermediate/concurrent/09-cas-atomics/' },
                        { label: '并发工具类与读写锁', link: '/java/intermediate/concurrent/10-concurrent-tools/' },
                        { label: 'CompletableFuture 异步编排', link: '/java/intermediate/concurrent/11-completablefuture/' },
                        { label: '死锁与活锁', link: '/java/intermediate/concurrent/12-deadlock/' },
                      ],
                    },
                    {
                      label: 'Spring 核心',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/spring/' },
                        { label: 'Spring 家族全景：关系与依赖', link: '/java/intermediate/spring/00-family-map/' },
                        { label: 'IoC 容器与 Bean 生命周期', link: '/java/intermediate/spring/01-ioc-bean-lifecycle/' },
                        { label: 'AOP 与动态代理', link: '/java/intermediate/spring/02-aop/' },
                        { label: '循环依赖与三级缓存', link: '/java/intermediate/spring/03-circular-dependency/' },
                        { label: '事务与传播机制', link: '/java/intermediate/spring/04-transaction/' },
                        { label: 'MyBatis 集成：SqlSessionTemplate', link: '/java/intermediate/spring/05-mybatis-sqlsession/' },
                        { label: 'Spring 扩展点全景', link: '/java/intermediate/spring/06-extension-points/' },
                        { label: 'ApplicationContext：容器体系与内置组件', link: '/java/intermediate/spring/07-application-context/' },
                        { label: '常用注解地图：Java / Spring / Spring Boot', link: '/java/intermediate/spring/08-annotations-map/' },
                      ],
                    },
                    {
                      label: 'Spring MVC',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/spring-mvc/' },
                        { label: 'Spring MVC 请求处理全流程', link: '/java/intermediate/spring-mvc/01-springmvc-flow/' },
                        { label: '统一异常处理：@RestControllerAdvice', link: '/java/intermediate/spring-mvc/02-exception-advice/' },
                        { label: '参数校验：@Valid 与 JSR-303', link: '/java/intermediate/spring-mvc/03-validation/' },
                      ],
                    },
                    {
                      label: 'Spring Boot',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/spring-boot/' },
                        { label: '自动配置原理', link: '/java/intermediate/spring-boot/01-autoconfig/' },
                        { label: '认证与单点登录：JWT/OAuth2/SSO/CAS', link: '/java/intermediate/spring-boot/02-auth-sso/' },
                        { label: '配置体系：外部化配置', link: '/java/intermediate/spring-boot/03-configuration/' },
                        { label: '内嵌容器与打包部署', link: '/java/intermediate/spring-boot/04-embedded-deploy/' },
                        { label: 'Actuator：生产级运维端点', link: '/java/intermediate/spring-boot/05-actuator/' },
                      ],
                    },
                    {
                      label: '设计模式',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/design-pattern/' },
                        { label: 'SOLID 设计原则', link: '/java/intermediate/design-pattern/01-principles/' },
                        { label: '单例模式', link: '/java/intermediate/design-pattern/02-singleton/' },
                        { label: '工厂模式', link: '/java/intermediate/design-pattern/03-factory/' },
                        { label: '建造者与原型', link: '/java/intermediate/design-pattern/04-creational/' },
                        { label: '适配器模式', link: '/java/intermediate/design-pattern/05-adapter/' },
                        { label: '代理模式', link: '/java/intermediate/design-pattern/06-proxy/' },
                        { label: '装饰器模式', link: '/java/intermediate/design-pattern/07-decorator/' },
                        { label: '外观、组合、桥接与享元', link: '/java/intermediate/design-pattern/08-structural/' },
                        { label: '策略模式', link: '/java/intermediate/design-pattern/09-strategy/' },
                        { label: '模板方法', link: '/java/intermediate/design-pattern/10-template-method/' },
                        { label: '观察者模式', link: '/java/intermediate/design-pattern/11-observer/' },
                        { label: '责任链模式', link: '/java/intermediate/design-pattern/12-chain-of-responsibility/' },
                        { label: '状态、迭代器、命令与备忘录', link: '/java/intermediate/design-pattern/13-behavioral/' },
                        { label: '访问者、中介者与解释器', link: '/java/intermediate/design-pattern/14-visitor-mediator/' },
                        { label: '框架源码中的模式地图', link: '/java/intermediate/design-pattern/15-patterns-in-frameworks/' },
                      ],
                    },
                    {
                      label: '单元测试',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/test/' },
                        { label: 'JUnit 5：生命周期与参数化', link: '/java/intermediate/test/01-junit5/' },
                        { label: 'Mockito：打桩与验证', link: '/java/intermediate/test/02-mockito/' },
                        { label: 'Spring Boot 测试：切片与全量', link: '/java/intermediate/test/03-springboot-test/' },
                      ],
                    },
                    {
                      label: '日志体系',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/log/' },
                        { label: '门面绑定、MDC 与异步日志', link: '/java/intermediate/log/01-logging-system/' },
                      ],
                    },
                    {
                      label: 'Java 版本演进',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/intermediate/version/' },
                        { label: 'Java 8：函数式革命的起点', link: '/java/intermediate/version/01-java8/' },
                        { label: 'Java 9~11：模块化与语法糖', link: '/java/intermediate/version/02-java9-11/' },
                        { label: 'Java 14~17：语言现代化', link: '/java/intermediate/version/03-java14-17/' },
                        { label: 'Java 18~21：虚拟线程时代', link: '/java/intermediate/version/04-java18-21/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: 'JVM',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/advanced/jvm/' },
                        { label: '类加载机制与双亲委派', link: '/java/advanced/jvm/01-class-loading/' },
                        { label: '运行时数据区', link: '/java/advanced/jvm/02-memory/' },
                        { label: '垃圾回收算法与收集器', link: '/java/advanced/jvm/03-garbage-collection/' },
                        { label: '四种引用：强、软、弱、虚', link: '/java/advanced/jvm/04-references/' },
                        { label: '对象内存布局与指针压缩', link: '/java/advanced/jvm/05-object-layout/' },
                        { label: 'JIT 即时编译与逃逸分析', link: '/java/advanced/jvm/06-jit/' },
                        { label: 'JVM 参数与调优', link: '/java/advanced/jvm/07-tuning/' },
                        { label: '线上故障排查实战', link: '/java/advanced/jvm/08-troubleshooting/' },
                        { label: '类文件结构与字节码', link: '/java/advanced/jvm/09-bytecode/' },
                      ],
                    },
                    {
                      label: 'Spring Cloud 微服务',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/java/advanced/springcloud/' },
                        { label: '微服务与 Spring Cloud 总览', link: '/java/advanced/springcloud/01-microservices-overview/' },
                        { label: '注册中心：服务注册与发现', link: '/java/advanced/springcloud/02-registry/' },
                        { label: '服务网关 Spring Cloud Gateway', link: '/java/advanced/springcloud/03-gateway/' },
                        { label: '服务通信：OpenFeign 与负载均衡', link: '/java/advanced/springcloud/04-openfeign-loadbalancer/' },
                        { label: '熔断限流：Sentinel', link: '/java/advanced/springcloud/05-sentinel/' },
                        { label: '配置中心：Nacos 动态刷新', link: '/java/advanced/springcloud/06-config-center/' },
                        { label: 'Spring Cloud Stream 消息驱动', link: '/java/advanced/springcloud/07-stream/' },
                        { label: '链路追踪：从 MDC 到分布式', link: '/java/advanced/springcloud/08-tracing/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'JS',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/js/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '语言核心',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/js/basic/core/' },
                        { label: 'JS 语言核心速览', link: '/js/basic/core/01-js-fundamentals/' },
                        { label: '作用域与闭包', link: '/js/basic/core/02-scope-closure/' },
                        { label: '原型链与继承', link: '/js/basic/core/03-prototype-class/' },
                        { label: 'this 与箭头函数', link: '/js/basic/core/04-this-binding/' },
                        { label: '事件循环与异步演进', link: '/js/basic/core/05-event-loop/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: 'Node.js 运行时',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/js/intermediate/node/' },
                        { label: 'GC 与内存管理', link: '/js/intermediate/node/01-node-gc-memory/' },
                      ],
                    },
                    {
                      label: '网络与通信',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/js/intermediate/web/' },
                        { label: 'WebSocket 原理', link: '/js/intermediate/web/01-websocket/' },
                        { label: '同源策略与九种跨域方案', link: '/js/intermediate/web/02-cors/' },
                        { label: 'DOM 事件机制与委托', link: '/js/intermediate/web/03-dom-events/' },
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
                  collapsed: true,
                  items: [
                    {
                      label: '语法基础',
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
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/basic/data-structures/' },
                        { label: 'list 与 tuple：动态数组', link: '/python/basic/data-structures/01-list-tuple/' },
                        { label: 'dict 与 set：哈希表实现', link: '/python/basic/data-structures/02-dict-set/' },
                      ],
                    },
                    {
                      label: '函数与装饰器',
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
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/basic/oop/' },
                        { label: '类、实例与魔术方法', link: '/python/basic/oop/01-class-basics/' },
                        { label: '继承、super 与 MRO', link: '/python/basic/oop/02-inheritance-mro/' },
                        { label: 'dataclass 与 __slots__', link: '/python/basic/oop/03-dataclass-slots/' },
                      ],
                    },
                    {
                      label: '模块与包',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/basic/modules/' },
                        { label: '模块与 import：代码组织单元', link: '/python/basic/modules/01-modules-import/' },
                        { label: '包与项目布局', link: '/python/basic/modules/02-packages-layout/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '常用标准库',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/intermediate/stdlib/' },
                        { label: 'collections：容器扩展', link: '/python/intermediate/stdlib/01-collections/' },
                        { label: 'functools 与 itertools', link: '/python/intermediate/stdlib/02-functools-itertools/' },
                        { label: 'pathlib 与文件 IO', link: '/python/intermediate/stdlib/03-pathlib-io/' },
                        { label: 'typing 类型标注', link: '/python/intermediate/stdlib/04-typing/' },
                        { label: 'datetime：时间与日期', link: '/python/intermediate/stdlib/05-datetime/' },
                      ],
                    },
                    {
                      label: '数据处理与日志',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/intermediate/data/' },
                        { label: 're 正则表达式', link: '/python/intermediate/data/01-re-regex/' },
                        { label: 'json 与 csv：数据序列化', link: '/python/intermediate/data/02-json-csv/' },
                        { label: 'logging 日志体系', link: '/python/intermediate/data/03-logging/' },
                      ],
                    },
                    {
                      label: '并发编程',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/intermediate/concurrency/' },
                        { label: '多线程与 GIL：IO 密集的正确工具', link: '/python/intermediate/concurrency/01-threading/' },
                        { label: 'asyncio：单线程异步并发', link: '/python/intermediate/concurrency/02-asyncio/' },
                        { label: 'multiprocessing：多核并行', link: '/python/intermediate/concurrency/03-multiprocessing/' },
                      ],
                    },
                    {
                      label: '第三方生态',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/intermediate/libs/' },
                        { label: 'requests 与 httpx', link: '/python/intermediate/libs/01-requests-httpx/' },
                        { label: 'Pydantic 数据校验', link: '/python/intermediate/libs/02-pydantic/' },
                        { label: 'FastAPI', link: '/python/intermediate/libs/03-fastapi/' },
                        { label: 'SQLAlchemy：数据库访问', link: '/python/intermediate/libs/04-sqlalchemy/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '工程化',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/advanced/eng/' },
                        { label: '环境管理与 uv', link: '/python/advanced/eng/01-venv-uv/' },
                        { label: 'pytest 测试', link: '/python/advanced/eng/02-pytest/' },
                        { label: 'ruff 与 mypy', link: '/python/advanced/eng/03-ruff-mypy/' },
                        { label: '打包与发布', link: '/python/advanced/eng/04-packaging/' },
                      ],
                    },
                    {
                      label: '运行时内幕',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/python/advanced/internals/' },
                        { label: 'GIL 深入：为什么有它、如何绕开', link: '/python/advanced/internals/01-gil/' },
                        { label: '内存管理与垃圾回收', link: '/python/advanced/internals/02-memory-gc/' },
                        { label: '描述符与元类：属性访问的底层协议', link: '/python/advanced/internals/03-descriptors-metaclass/' },
                        { label: '性能剖析与优化', link: '/python/advanced/internals/04-profiling/' },
                      ],
                    },
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
            {
              label: 'MySQL',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/mysql/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '核心机制',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mysql/basic/core/' },
                        { label: '一条 SQL 的执行流程', link: '/mysql/basic/core/01-sql-execution/' },
                        { label: '索引与 B+ 树', link: '/mysql/basic/core/02-index-btree/' },
                      ],
                    },
                    {
                      label: '原理与范式',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mysql/basic/theory/' },
                        { label: '函数依赖与三范式', link: '/mysql/basic/theory/01-normal-forms/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '事务与锁',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mysql/intermediate/transaction-lock/' },
                        { label: '事务与 MVCC', link: '/mysql/intermediate/transaction-lock/01-transaction-mvcc/' },
                        { label: '锁机制', link: '/mysql/intermediate/transaction-lock/02-locks/' },
                        { label: '三大日志与两阶段提交', link: '/mysql/intermediate/transaction-lock/03-redo-undo-binlog/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '性能与高可用',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mysql/advanced/performance-ha/' },
                        { label: 'SQL 优化与执行计划', link: '/mysql/advanced/performance-ha/01-optimization/' },
                        { label: '主从复制与分库分表', link: '/mysql/advanced/performance-ha/02-replication-sharding/' },
                        { label: '大表变更与 Online DDL', link: '/mysql/advanced/performance-ha/03-online-ddl/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'PostgreSQL',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/postgresql/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: 'PostgreSQL 基础',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/postgresql/basic/core/' },
                        { label: 'PostgreSQL 与 MySQL：一张差异地图', link: '/postgresql/basic/core/01-pg-vs-mysql/' },
                        { label: '事务隔离与 MVCC', link: '/postgresql/basic/core/02-mvcc-isolation/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '高可用与集群',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/postgresql/intermediate/ha/' },
                        { label: 'Pgpool-II 与 Postgres-XL', link: '/postgresql/intermediate/ha/01-pgpool-postgres-xl/' },
                        { label: 'pgpool 容灾高可用', link: '/postgresql/intermediate/ha/02-pgpool-dr/' },
                      ],
                    },
                    {
                      label: '索引与执行计划',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/postgresql/intermediate/indexes/' },
                        { label: '索引类型与 EXPLAIN', link: '/postgresql/intermediate/indexes/01-index-types-explain/' },
                      ],
                    },
                    {
                      label: 'WAL 与持久化',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/postgresql/intermediate/wal/' },
                        { label: 'WAL、checkpoint 与时间点恢复', link: '/postgresql/intermediate/wal/01-wal/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '性能优化',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/postgresql/advanced/performance/' },
                        { label: 'PostgreSQL 性能优化笔记', link: '/postgresql/advanced/performance/01-tuning/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Redis',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/redis/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '核心',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/redis/basic/core/' },
                        { label: '数据结构与底层编码', link: '/redis/basic/core/01-data-structures/' },
                        { label: '持久化：RDB 与 AOF', link: '/redis/basic/core/02-persistence/' },
                        { label: '线程模型：单线程为什么快', link: '/redis/basic/core/03-thread-model/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '使用进阶',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/redis/intermediate/usage/' },
                        { label: '过期删除与内存淘汰', link: '/redis/intermediate/usage/01-expiration-eviction/' },
                        { label: '缓存穿透、击穿与雪崩', link: '/redis/intermediate/usage/02-cache-problems/' },
                        { label: '分布式锁的演进', link: '/redis/intermediate/usage/03-distributed-lock/' },
                        { label: '缓存架构模式', link: '/redis/intermediate/usage/04-cache-patterns/' },
                        { label: '管道、事务与 Lua', link: '/redis/intermediate/usage/05-pipeline-transaction-lua/' },
                        { label: '大 key 与热 key 治理', link: '/redis/intermediate/usage/06-bigkey-hotkey/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '高可用',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/redis/advanced/ha/' },
                        { label: '高可用：主从、哨兵与集群', link: '/redis/advanced/ha/01-replication-sentinel-cluster/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'MongoDB',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/mongodb/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: 'MongoDB 基础',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mongodb/basic/core/' },
                        { label: '文档模型与选型', link: '/mongodb/basic/core/01-document-model/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '复制集',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mongodb/intermediate/replication/' },
                        { label: '复制集原理', link: '/mongodb/intermediate/replication/01-replication-set/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '分片集群',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mongodb/advanced/sharding/' },
                        { label: '分片集群：架构与配置', link: '/mongodb/advanced/sharding/01-sharding-cluster/' },
                      ],
                    },
                    {
                      label: '运维与容量',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mongodb/advanced/operations/' },
                        { label: '容量规划与硬件配置', link: '/mongodb/advanced/operations/01-capacity-planning/' },
                        { label: '性能优化与启动加载', link: '/mongodb/advanced/operations/02-performance/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Elasticsearch',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/elasticsearch/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '基础核心',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/elasticsearch/basic/core/' },
                        { label: '倒排索引：ES 的提速引擎', link: '/elasticsearch/basic/core/01-inverted-index/' },
                        { label: '文档、分片与副本', link: '/elasticsearch/basic/core/02-shard-replica/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '查询与聚合',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/elasticsearch/intermediate/usage/' },
                        { label: 'Query DSL：match、term 与 bool', link: '/elasticsearch/intermediate/usage/01-query-dsl/' },
                        { label: '聚合分析：度量、桶与管道', link: '/elasticsearch/intermediate/usage/02-aggregation/' },
                        { label: '深翻页方案与查询性能优化', link: '/elasticsearch/intermediate/usage/03-pagination/' },
                      ],
                    },
                    {
                      label: '集群与高可用',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/elasticsearch/intermediate/cluster/' },
                        { label: '节点角色、master 选举与脑裂', link: '/elasticsearch/intermediate/cluster/01-cluster-split-brain/' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '中间件与分布式',
          collapsed: true,
          items: [
            {
              label: '分布式',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/distributed/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '理论基石',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/basic/theory/' },
                        { label: 'CAP 与 BASE', link: '/distributed/basic/theory/01-cap-base/' },
                        { label: '一致性哈希', link: '/distributed/basic/theory/02-consistent-hashing/' },
                        { label: '集群与分布式：概念与形态', link: '/distributed/basic/theory/03-cluster-vs-distributed/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '共识算法',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/consensus/' },
                        { label: 'Paxos 与 Raft', link: '/distributed/intermediate/consensus/01-paxos-raft/' },
                        { label: 'Gossip 协议：流感式传播', link: '/distributed/intermediate/consensus/02-gossip/' },
                      ],
                    },
                    {
                      label: '三高与性能优化',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/performance/' },
                        { label: '三高架构：高并发、高性能、高可用', link: '/distributed/intermediate/performance/01-triple-high/' },
                        { label: '接口性能优化：从耗时量级出发', link: '/distributed/intermediate/performance/02-interface-optimization/' },
                        { label: '容量规划与全链路压测', link: '/distributed/intermediate/performance/03-capacity-planning/' },
                      ],
                    },
                    {
                      label: '分布式事务',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/transaction/' },
                        { label: '分布式事务五种方案', link: '/distributed/intermediate/transaction/01-distributed-transaction/' },
                        { label: '分布式 ID', link: '/distributed/intermediate/transaction/02-distributed-id/' },
                      ],
                    },
                    {
                      label: '数据分片',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/sharding/' },
                        { label: '分库分表方法论：路由、扩容与不停机迁移', link: '/distributed/intermediate/sharding/01-sharding-methods/' },
                      ],
                    },
                    {
                      label: '集群架构',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/cluster/' },
                        { label: '负载均衡：从 DNS 到四层七层', link: '/distributed/intermediate/cluster/01-load-balancing/' },
                        { label: '分布式会话：集群下的登录态', link: '/distributed/intermediate/cluster/02-session-sharing/' },
                      ],
                    },
                    {
                      label: '分布式协调',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/coordination/' },
                        { label: '分布式锁选型：Redis / ZooKeeper / etcd / 数据库', link: '/distributed/intermediate/coordination/01-distributed-lock-compare/' },
                        { label: '接口幂等性设计', link: '/distributed/intermediate/coordination/02-idempotency/' },
                        { label: '分布式定时任务：从单机 cron 到分片调度', link: '/distributed/intermediate/coordination/03-distributed-scheduler/' },
                      ],
                    },
                    {
                      label: '服务治理',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/governance/' },
                        { label: 'RPC 原理：一次远程调用发生了什么', link: '/distributed/intermediate/governance/01-rpc-principles/' },
                      ],
                    },
                    {
                      label: '流量治理',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/traffic/' },
                        { label: '分布式限流：从单机到全局', link: '/distributed/intermediate/traffic/01-distributed-rate-limiting/' },
                        { label: '超时与重试：预算、退避与重试风暴', link: '/distributed/intermediate/traffic/02-timeout-retry/' },
                      ],
                    },
                    {
                      label: '综合设计',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/intermediate/case-studies/' },
                        { label: '秒杀系统设计', link: '/distributed/intermediate/case-studies/01-flash-sale/' },
                        { label: '短链接系统设计', link: '/distributed/intermediate/case-studies/02-short-url/' },
                        { label: 'Feed 流设计：推模式、拉模式与推拉结合', link: '/distributed/intermediate/case-studies/03-feed-stream/' },
                        { label: '系统设计题的答题框架', link: '/distributed/intermediate/case-studies/04-design-interview/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '数据一致性',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/advanced/consistency/' },
                        { label: '数据一致性：从强一致到最终一致', link: '/distributed/advanced/consistency/01-consistency-patterns/' },
                        { label: '缓存与数据库双写一致性', link: '/distributed/advanced/consistency/02-cache-consistency/' },
                        { label: 'Quorum 与 NWR：一致性调节旋钮', link: '/distributed/advanced/consistency/03-quorum-nwr/' },
                        { label: '分布式时钟与顺序', link: '/distributed/advanced/consistency/04-time-order/' },
                      ],
                    },
                    {
                      label: '高可用与容灾',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/advanced/availability/' },
                        { label: '容灾与多活：RTO/RPO 与切换策略', link: '/distributed/advanced/availability/01-dr-multi-active/' },
                        { label: '脑裂与仲裁：quorum 与 fencing', link: '/distributed/advanced/availability/02-split-brain/' },
                        { label: '发布策略：滚动、蓝绿与金丝雀', link: '/distributed/advanced/availability/03-release-strategies/' },
                        { label: '全链路灰度：泳道与流量染色', link: '/distributed/advanced/availability/04-full-link-gray/' },
                        { label: '混沌工程：主动制造故障', link: '/distributed/advanced/availability/05-chaos-engineering/' },
                        { label: '单元化部署：异地多活的终态', link: '/distributed/advanced/availability/06-cell-based/' },
                      ],
                    },
                    {
                      label: '可观测性',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/distributed/advanced/observability/' },
                        { label: '分布式链路追踪', link: '/distributed/advanced/observability/01-distributed-tracing/' },
                        { label: '可观测性三支柱与告警设计', link: '/distributed/advanced/observability/02-metrics-alerting/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'ZooKeeper',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/zookeeper/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '核心机制',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/zookeeper/basic/core/' },
                        { label: 'ZooKeeper 核心机制', link: '/zookeeper/basic/core/01-zookeeper-core/' },
                        { label: '高频追问：ZAB、Watcher 与 Session', link: '/zookeeper/basic/core/02-zk-deep-dive/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '协调配方',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/zookeeper/intermediate/coordination/' },
                        { label: '临时顺序节点与选主', link: '/zookeeper/intermediate/coordination/01-ephemeral-election/' },
                      ],
                    },
                    {
                      label: '生产注意点',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/zookeeper/intermediate/ops/' },
                        { label: 'ZAB 生产注意点', link: '/zookeeper/intermediate/ops/01-zab-production/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'etcd',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/etcd/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '核心机制',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/etcd/basic/core/' },
                        { label: 'etcd 核心机制', link: '/etcd/basic/core/01-etcd-core/' },
                        { label: '深入：Lease、事务与一致性读', link: '/etcd/basic/core/02-etcd-lease-txn-watch/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '运维与故障',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/etcd/intermediate/ops/' },
                        { label: '空间配额、Compaction 与 Defrag', link: '/etcd/intermediate/ops/01-quota-compaction-defrag/' },
                        { label: 'Leader 切换对客户端的影响', link: '/etcd/intermediate/ops/02-leader-failover/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Seata',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/seata/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '核心机制',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/seata/basic/core/' },
                        { label: 'Seata 核心机制', link: '/seata/basic/core/01-seata-core/' },
                        { label: '高频追问：全局锁与失效场景', link: '/seata/basic/core/02-seata-deep-dive/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '事务模式',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/seata/intermediate/modes/' },
                        { label: 'AT、TCC、Saga 怎么选', link: '/seata/intermediate/modes/01-at-tcc-saga/' },
                        { label: 'undo_log 脏写边界与本地事务陷阱', link: '/seata/intermediate/modes/02-undo-local-tx/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: '消息中间件',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/middleware/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '消息队列基础',
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
                  collapsed: true,
                  items: [
                    {
                      label: '消息可靠性',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/middleware/intermediate/reliability/' },
                        { label: '消息可靠性三问：不丢、不重、不乱序', link: '/middleware/intermediate/reliability/01-message-reliability/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Kafka',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/kafka/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '消息队列基础',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/kafka/basic/core/' },
                        { label: '消息队列三问：是什么、为什么、代价是什么', link: '/kafka/basic/core/01-why-mq/' },
                        { label: 'offset：消费位移的语义', link: '/kafka/basic/core/02-offset/' },
                        { label: '生产者：一条消息怎么发出去', link: '/kafka/basic/core/03-producer-path/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '核心机制',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/kafka/intermediate/core/' },
                        { label: 'Kafka 架构与存储模型', link: '/kafka/intermediate/core/01-kafka-architecture/' },
                        { label: '副本与 ISR 机制', link: '/kafka/intermediate/core/02-replica-isr/' },
                        { label: '不丢消息与幂等消费', link: '/kafka/intermediate/core/03-reliability-idempotent/' },
                        { label: 'Kafka 高吞吐之谜：从顺序写到零拷贝', link: '/kafka/intermediate/core/04-high-throughput/' },
                        { label: '消费组 Rebalance 全解', link: '/kafka/intermediate/core/05-rebalance/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'RocketMQ',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/rocketmq/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: 'RocketMQ 基础',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/rocketmq/basic/core/' },
                        { label: 'RocketMQ 架构与消息模型', link: '/rocketmq/basic/core/01-rocketmq-architecture/' },
                        { label: '消费语义：模式、重试与位移', link: '/rocketmq/basic/core/02-consumer-semantics/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '过滤与路由',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/rocketmq/intermediate/core/' },
                        { label: 'Tag 与 SQL92 过滤', link: '/rocketmq/intermediate/core/01-tag-sql92/' },
                        { label: 'NameServer 路由与队列选择', link: '/rocketmq/intermediate/core/02-nameserver-route/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '核心专题',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/rocketmq/advanced/core/' },
                        { label: 'RocketMQ 核心特性', link: '/rocketmq/advanced/core/01-rocketmq-features/' },
                        { label: '顺序性与高性能原理', link: '/rocketmq/advanced/core/02-order-performance/' },
                        { label: '消息积压治理', link: '/rocketmq/advanced/core/03-backlog/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'MQTT',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/mqtt/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '协议核心',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mqtt/basic/core/' },
                        { label: 'MQTT 协议模型：发布订阅与报文', link: '/mqtt/basic/core/01-mqtt-protocol/' },
                        { label: 'QoS、会话与遗嘱机制', link: '/mqtt/basic/core/02-qos-session/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '使用实战',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/mqtt/intermediate/usage/' },
                        { label: 'Broker 选型与 EMQX 部署', link: '/mqtt/intermediate/usage/01-broker-emqx/' },
                        { label: '保活、重连与保留消息', link: '/mqtt/intermediate/usage/02-keepalive-reconnect/' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'RabbitMQ',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/rabbitmq/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: 'AMQP 模型',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/rabbitmq/basic/core/' },
                        { label: 'AMQP 模型：交换机、队列与绑定', link: '/rabbitmq/basic/core/01-amqp-model/' },
                        { label: '可靠投递：确认与持久化', link: '/rabbitmq/basic/core/02-reliable-delivery/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '可靠与进阶',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/rabbitmq/intermediate/usage/' },
                        { label: '死信队列与延迟消息', link: '/rabbitmq/intermediate/usage/01-deadletter-delay/' },
                        { label: '集群、镜像队列与高可用', link: '/rabbitmq/intermediate/usage/02-cluster-ha/' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '算法',
          collapsed: true,
          items: [
            {
              label: '算法',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/algorithm/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '排序算法',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/basic/sorting/' },
                        { label: '冒泡排序', link: '/algorithm/basic/sorting/01-bubble-sort/' },
                        { label: '快速排序', link: '/algorithm/basic/sorting/02-quick-sort/' },
                        { label: '插入排序', link: '/algorithm/basic/sorting/03-insertion-sort/' },
                        { label: '选择排序', link: '/algorithm/basic/sorting/04-selection-sort/' },
                        { label: '归并排序', link: '/algorithm/basic/sorting/05-merge-sort/' },
                        { label: '堆排序', link: '/algorithm/basic/sorting/06-heap-sort/' },
                        { label: '希尔排序', link: '/algorithm/basic/sorting/07-shell-sort/' },
                        { label: '计数排序', link: '/algorithm/basic/sorting/08-counting-sort/' },
                        { label: '三路分区（荷兰国旗）', link: '/algorithm/basic/sorting/09-three-way-partition/' },
                      ],
                    },
                    {
                      label: '查找算法',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/basic/searching/' },
                        { label: '二分查找', link: '/algorithm/basic/searching/01-binary-search/' },
                        { label: '双指针', link: '/algorithm/basic/searching/02-two-pointers/' },
                        { label: '滑动窗口', link: '/algorithm/basic/searching/03-sliding-window/' },
                        { label: '快速选择', link: '/algorithm/basic/searching/04-quickselect/' },
                        { label: '搜索旋转排序数组', link: '/algorithm/basic/searching/05-rotated-array-search/' },
                      ],
                    },
                    {
                      label: '数组技巧',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/basic/techniques/' },
                        { label: '前缀和', link: '/algorithm/basic/techniques/01-prefix-sum/' },
                        { label: '差分', link: '/algorithm/basic/techniques/02-difference-array/' },
                        { label: '单调栈', link: '/algorithm/basic/techniques/03-monotonic-stack/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '链表',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/intermediate/linked-list/' },
                        { label: '反转链表', link: '/algorithm/intermediate/linked-list/01-reverse-list/' },
                        { label: '环形链表与快慢指针', link: '/algorithm/intermediate/linked-list/02-cycle-detection/' },
                        { label: '合并有序链表', link: '/algorithm/intermediate/linked-list/03-merge-lists/' },
                      ],
                    },
                    {
                      label: '栈与队列',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/intermediate/stack-queue/' },
                        { label: '有效的括号', link: '/algorithm/intermediate/stack-queue/01-valid-parentheses/' },
                        { label: '最小栈', link: '/algorithm/intermediate/stack-queue/02-min-stack/' },
                        { label: '双栈实现队列', link: '/algorithm/intermediate/stack-queue/03-queue-via-stacks/' },
                      ],
                    },
                    {
                      label: '二叉树',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/intermediate/tree/' },
                        { label: '二叉树遍历', link: '/algorithm/intermediate/tree/01-tree-traversal/' },
                        { label: '二叉搜索树', link: '/algorithm/intermediate/tree/02-bst/' },
                        { label: '翻转二叉树', link: '/algorithm/intermediate/tree/03-invert-tree/' },
                        { label: '最近公共祖先', link: '/algorithm/intermediate/tree/04-lca/' },
                      ],
                    },
                    {
                      label: '动态规划',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/intermediate/dp/' },
                        { label: '爬楼梯', link: '/algorithm/intermediate/dp/01-climbing-stairs/' },
                        { label: '打家劫舍', link: '/algorithm/intermediate/dp/02-house-robber/' },
                        { label: '最大子数组和', link: '/algorithm/intermediate/dp/03-max-subarray/' },
                        { label: '最长公共子序列', link: '/algorithm/intermediate/dp/04-lcs/' },
                      ],
                    },
                    {
                      label: '递归与回溯',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/intermediate/backtracking/' },
                        { label: '子集', link: '/algorithm/intermediate/backtracking/01-subsets/' },
                        { label: '全排列', link: '/algorithm/intermediate/backtracking/02-permutations/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '图论',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/advanced/graph/' },
                        { label: '图的遍历', link: '/algorithm/advanced/graph/01-graph-traversal/' },
                        { label: '拓扑排序', link: '/algorithm/advanced/graph/02-topological-sort/' },
                      ],
                    },
                    {
                      label: '贪心',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/advanced/greedy/' },
                        { label: '跳跃游戏', link: '/algorithm/advanced/greedy/01-jump-game/' },
                      ],
                    },
                    {
                      label: '二分答案',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/advanced/binary-answer/' },
                        { label: '科科吃香蕉', link: '/algorithm/advanced/binary-answer/01-koko-eating-bananas/' },
                      ],
                    },
                    {
                      label: '设计思想',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/algorithm/advanced/principles/' },
                        { label: '时间与空间的交换', link: '/algorithm/advanced/principles/01-time-space-tradeoff/' },
                        { label: '算法思想全景', link: '/algorithm/advanced/principles/02-paradigm-landscape/' },
                        { label: '复杂度分析入门', link: '/algorithm/advanced/principles/03-complexity-analysis/' },
                      ],
                    },
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
            {
              label: 'AI',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/ai/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: 'AI 基础',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/ai/basic/foundation/' },
                        { label: '机器学习基础', link: '/ai/basic/foundation/01-machine-learning/' },
                        { label: '深度学习', link: '/ai/basic/foundation/02-deep-learning/' },
                        { label: 'Transformer 与自注意力', link: '/ai/basic/foundation/03-transformer/' },
                      ],
                    },
                    {
                      label: 'Agent',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/ai/basic/agent/' },
                        { label: 'Agent Loop 核心循环', link: '/ai/basic/agent/01-agent-loop/' },
                        { label: '工具调用与分发', link: '/ai/basic/agent/02-tool-use/' },
                        { label: '权限系统', link: '/ai/basic/agent/03-permission/' },
                        { label: '钩子机制', link: '/ai/basic/agent/04-hooks/' },
                        { label: 'Agent 护栏：注入、越权与失控费用', link: '/ai/basic/agent/05-guardrails/' },
                      ],
                    },
                  ],
                },
                {
                  label: '中级',
                  collapsed: true,
                  items: [
                    {
                      label: '大模型',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/ai/intermediate/llm/' },
                        { label: '大模型 LLM', link: '/ai/intermediate/llm/01-llm/' },
                        { label: '提示工程', link: '/ai/intermediate/llm/02-prompt-engineering/' },
                        { label: '落地选型：提示工程、RAG 还是微调', link: '/ai/intermediate/llm/03-adapter-selection/' },
                        { label: '推理参数：temperature、top_p 与输出控制', link: '/ai/intermediate/llm/04-inference-params/' },
                      ],
                    },
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
                        { label: 'Agent 应用评估', link: '/ai/intermediate/agent/10-agent-evaluation/' },
                      ],
                    },
                  ],
                },
                {
                  label: '高级',
                  collapsed: true,
                  items: [
                    {
                      label: '评测与对齐',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/ai/advanced/eval/' },
                        { label: '评测与对齐', link: '/ai/advanced/eval/01-evaluation-align/' },
                      ],
                    },
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
                        { label: 'Agent 框架版图', link: '/ai/advanced/agent/10-agent-frameworks/' },
                        { label: 'OpenClaw 个人助理', link: '/ai/advanced/agent/11-openclaw/' },
                      ],
                    },
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
            {
              label: 'Docker',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/docker/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '基础概念与命令',
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
                  collapsed: true,
                  items: [
                    {
                      label: '实战进阶',
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
                  collapsed: true,
                  items: [
                    {
                      label: '编排与原理',
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
                  collapsed: true,
                  items: [
                    {
                      label: '基础入门',
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
                  collapsed: true,
                  items: [
                    {
                      label: '协作开发',
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
                  collapsed: true,
                  items: [
                    {
                      label: '高级工作流',
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
              label: '命令行工具',
              collapsed: true,
              items: [
                { label: '学习路线', link: '/tools/' },
                {
                  label: '基础',
                  collapsed: true,
                  items: [
                    {
                      label: '命令行工具',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/tools/basic/cli/' },
                        { label: 'grep / sed / awk：文本处理三件套', link: '/tools/basic/cli/01-grep-sed-awk/' },
                        { label: 'curl：命令行 HTTP 请求', link: '/tools/basic/cli/02-curl/' },
                        { label: 'jq：命令行 JSON 处理', link: '/tools/basic/cli/03-jq/' },
                      ],
                    },
                    {
                      label: '效率工具',
                      collapsed: false,
                      items: [
                        { label: '概览', link: '/tools/basic/efficiency/' },
                        { label: '编辑器与 IDE', link: '/tools/basic/efficiency/01-editor-ide/' },
                        { label: '终端效率', link: '/tools/basic/efficiency/02-terminal/' },
                        { label: '正则表达式', link: '/tools/basic/efficiency/03-regex/' },
                        { label: '网络调试', link: '/tools/basic/efficiency/04-network-debug/' },
                      ],
                    },
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
    processor: unified({
      remarkPlugins: [remarkPrefixBase(SITE_BASE)],
      rehypePlugins: [
        [rehypeMermaid, { mermaidConfig: mermaidStyle }],
        rehypeExternalNewTab('https://loadhao.github.io'),
      ],
    }),
    // 代码块双主题：跟随站点明暗切换（github-light / github-dark）
    syntaxHighlight: {
      type: 'shiki',
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      excludeLangs: ['mermaid'],
    },
  },
});