import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.array(
      z.string().trim().normalize().min(1).refine((name) => !/[\\/]/.test(name) && name !== '.' && name !== '..', {
        message: '카테고리 이름은 경로 구분자나 점 경로를 포함할 수 없습니다.',
      }),
    ).min(1).max(2).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
