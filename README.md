# rthzip.github.io

Astro 로 만든 개인 블로그. https://rthzip.github.io

## 글 쓰기

`src/content/blog/` 에 마크다운 파일을 하나 추가합니다. 파일 이름이 그대로 주소가 됩니다
(`my-post.md` → `/posts/my-post/`).

```markdown
---
title: '글 제목'
description: '목록과 검색, 공유 미리보기에 쓰입니다.'
pubDate: 2026-09-19
category: ['일상', '커피', '레시피']
tags: ['astro', 'blog']
draft: false
---

본문.
```

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `title` | 예 | 글 제목 |
| `description` | 아니오 | 한 문장 요약. 생략하거나 `null`이면 목록과 글머리에 표시되지 않습니다 |
| `pubDate` | 예 | 발행일 |
| `updatedDate` | 아니오 | 고친 날짜. 넣으면 글머리에 표시됩니다 |
| `tags` | 아니오 | 문자열 배열. 글에 표시되며 글 검색에 포함됩니다 |
| `category` | 아니오 | 폴더 이름 배열. `['일상', '커피', '레시피']`처럼 1~3단계로 지정합니다 |
| `draft` | 아니오 | `true` 면 빌드에서 제외됩니다 |

글 폴더는 공개 글의 `category`에서 생성됩니다. 상위 폴더에는 하위 폴더의 글도 표시됩니다.
프런트매터는 `src/content.config.ts` 의 스키마로 검증합니다.

## 명령어

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 (http://localhost:4321) |
| `npm run build` | `dist/` 로 정적 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |

## 구조

```
src/
  content/blog/        글 (마크다운)
  content.config.ts    프런트매터 스키마
  consts.ts            사이트 제목, 설명, 내비게이션
  styles/global.css    색·타이포 토큰과 본문 스타일
  components/          머리말, 꼬리말, 글 목록, 테마 토글
  layouts/             공통 레이아웃
  pages/               라우트
```

## 배포

`main` 에 push 하면 `.github/workflows/deploy.yml` 이 빌드해 GitHub Pages 에 올립니다.

레포 설정에서 한 번만 해 두어야 하는 것: **Settings → Pages → Source** 를 **GitHub Actions** 로.

## 색과 타이포

`src/styles/global.css` 상단의 커스텀 속성만 고치면 사이트 전체가 따라옵니다. 다크 모드 값은
같은 파일의 `:root[data-theme='dark']` 블록에 있습니다.
