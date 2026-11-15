---
title: 'Markdown 렌더링 템플릿'
description: '제목, 표, 코드, 이미지 등 글 상세 화면의 Markdown 요소를 비교하는 예제.'
pubDate: 2026-11-15
category: ['블로그', '템플릿']
tags: ['markdown', 'template']
---

이 글에서 Markdown 요소의 글자 크기, 간격, 라이트·다크 모드의 렌더링을 비교할 수 있습니다.

# H1 큰 제목

## H2 소제목

### H3 하위 제목

#### H4 항목 제목

##### H5 작은 제목

###### H6 가장 작은 제목

## 문단과 텍스트 서식

일반 본문에 **굵게**, *기울임*, ***굵은 기울임***, ~~취소선~~, `인라인 코드`를 섞은 문장입니다. 한글과 영문, 숫자 12345가 함께 있을 때의 줄 간격도 볼 수 있습니다.

빈 줄을 넣으면 새 문단이 시작됩니다. 별표를 기호로 쓰려면 \*처럼 앞에 역슬래시를 붙입니다. `&copy;`는 &copy;로 표시됩니다.

이 문장은 끝에 역슬래시를 붙였습니다.\
같은 문단에서 다음 줄로 이어집니다.

## 링크와 이미지

- [일반 링크](/about/)
- [참조 링크][astro-markdown]
- [코드 블록으로 이동](#코드-블록)
- 자동 링크 <https://rthzip.github.io/>

![블로그 로고](/examples/markdown-image.svg "이미지 제목")

## 인용문과 구분선

> 첫 번째 인용문입니다. 긴 문장이 여러 줄에 걸쳐 나타날 때 들여쓰기와 줄 간격을 확인할 수 있습니다.
>
> > 인용문 안에 한 단계 더 넣은 인용문입니다.
>
> - 인용문 안에 목록도 넣을 수 있습니다.

---

## 목록과 체크리스트

- 순서 없는 목록
  - 한 단계 들여쓴 항목
  - 같은 깊이의 항목
- 다음 항목

1. 순서 있는 목록
   1. 중첩된 번호 목록
   2. 중첩된 두 번째 항목
2. 두 번째 항목

- [x] 완료한 일
- [ ] 남은 일

## 표

| 왼쪽 정렬 | 가운데 정렬 | 오른쪽 정렬 |
| :--- | :---: | ---: |
| 일반 텍스트 | **굵게** | 1,234 |
| [링크](/tags/) | `fit-content` | 56,789 |
| 여러 단어가 들어 있는 조금 긴 표 셀 | ~~취소선~~ | 0 |

## 코드 블록

언어를 지정한 코드에는 문법 강조가 적용됩니다.

```ts
type Note = { title: string; published: boolean };

const notes: Note[] = [
  { title: '첫 번째 글', published: true },
  { title: '작성 중인 글', published: false },
];

const publishedTitles = notes
  .filter((note) => note.published)
  .map((note) => note.title);
```

언어를 지정하지 않은 블록도 비교할 수 있습니다.

```
src/content/blog/
  markdown-template.md
  weekend-hiking.md
```

네 칸 들여쓰기로 만든 코드 블록입니다.

    글 제목과 날짜를 입력한다.
    빌드 결과에서 글을 확인한다.

## 각주와 HTML 요소

각주 번호를 누르면 아래의 설명으로 이동합니다.[^note] 키는 <kbd>Enter</kbd>로, 강조 표시는 <mark>형광펜</mark>처럼 나타납니다.

<details>
<summary>접힌 설명 펼치기</summary>
<p>이 문단은 HTML의 <code>details</code> 예제입니다.</p>
</details>

[astro-markdown]: https://docs.astro.build/en/guides/markdown-content/
[^note]: 각주 설명입니다. 끝의 돌아가기 링크로 본문에 복귀할 수 있습니다.
