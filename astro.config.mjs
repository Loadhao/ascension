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
                    { label: '文件与目录操作', link: '/linux/basic/commands/file-ops/' },
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
                  label: '集合框架',
                  collapsed: false,
                  items: [
                    { label: '概览', link: '/java/basic/collection/' },
                    { label: 'HashMap 源码分析', link: '/java/basic/collection/hashmap/' },
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
                    { label: '线程基础', link: '/java/intermediate/concurrent/thread-basics/' },
                    { label: '线程池详解', link: '/java/intermediate/concurrent/thread-pool/' },
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
                    { label: '运行时数据区', link: '/java/advanced/jvm/memory/' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Python',
          collapsed: true,
          items: [{ label: '学习路线', link: '/python/' }],
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
                    { label: 'Agent Loop 核心循环', link: '/ai/basic/agent/agent-loop/' },
                    { label: '工具调用与分发', link: '/ai/basic/agent/tool-use/' },
                    { label: '权限系统', link: '/ai/basic/agent/permission/' },
                    { label: '钩子机制', link: '/ai/basic/agent/hooks/' },
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
                    { label: '任务规划 TodoWrite', link: '/ai/intermediate/agent/todo-planning/' },
                    { label: '系统提示组装', link: '/ai/intermediate/agent/system-prompt/' },
                    { label: '上下文工程', link: '/ai/intermediate/agent/context-engineering/' },
                    { label: '记忆系统', link: '/ai/intermediate/agent/memory/' },
                    { label: '技能按需加载', link: '/ai/intermediate/agent/skill-loading/' },
                    { label: 'RAG 检索增强生成', link: '/ai/intermediate/agent/rag/' },
                    { label: '错误恢复', link: '/ai/intermediate/agent/error-recovery/' },
                    { label: 'MCP 协议', link: '/ai/intermediate/agent/mcp/' },
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
                    { label: '子智能体与多 Agent 协作', link: '/ai/advanced/agent/multi-agent/' },
                  ],
                },
              ],
            },
          ],
        },
        { label: '工具', collapsed: true, items: [{ label: '学习路线', link: '/tools/' }] },
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
