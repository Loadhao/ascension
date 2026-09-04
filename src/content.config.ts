import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** 进阶等级：笔记所属层级（目录路径 <方向>/<等级>/<分类>/ 中的等级段） */
        level: z.enum(['basic', 'intermediate', 'advanced']).optional(),
        /** 作者视角的整理状态（读者学习状态在浏览器 localStorage，不入 frontmatter） */
        status: z.enum(['planned', 'learning', 'mastered']).optional(),
        /** 是否核心知识点（分类目录页列表中显示「核心」标记） */
        core: z.boolean().optional(),
      }),
    }),
  }),
};
