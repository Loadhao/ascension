// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';

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
      sidebar: [
        { label: '指南', items: [{ autogenerate: { directory: 'guide' } }] },
        { label: 'Linux', items: [{ autogenerate: { directory: 'linux' } }] },
        { label: 'Java', items: [{ autogenerate: { directory: 'java' } }] },
        { label: 'Python', items: [{ autogenerate: { directory: 'python' } }] },
        { label: 'AI', items: [{ autogenerate: { directory: 'ai' } }] },
        { label: '工具', items: [{ autogenerate: { directory: 'tools' } }] },
      ],
    }),
  ],
  markdown: {
    processor: unified({ rehypePlugins: [rehypeMermaid] }),
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
  },
});
