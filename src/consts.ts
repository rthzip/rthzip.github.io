export const SITE = {
  title: 'sejeong park',
  description: '추천개발을 담당하면서 공부한 내용을 정리합니다.',
  author: 'sejeong park',
  handle: 'rthzip',
  github: 'https://github.com/rthzip',
  linkedin: 'https://www.linkedin.com/in/sejeong-park1005/',
} as const;

export const BLOG_ROOT_FOLDERS = ['recsys', '회고'] as const;

export const NAV = [
  { href: '/', label: 'Posts' },
  { href: '/tags/', label: 'Tags' },
  { href: '/about/', label: 'About' },
] as const;
