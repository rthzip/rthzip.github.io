import { getCollection, type CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'blog'>;

interface Folder {
  name: string;
  path: string[];
  posts: Post[];
  children: Folder[];
}

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function folderSlug(path: readonly string[]) {
  // Escape punctuation that Astro or the browser may interpret as URL syntax.
  return path.map((name) => name.replace(/[^\p{L}\p{M}\p{N}._ -]/gu, (char) => (
    `~${char.codePointAt(0)!.toString(16)}~`
  ))).join('/');
}

export function folderHref(path: readonly string[]) {
  return `/categories/${encodeURI(folderSlug(path))}/`;
}

export function getFolders(posts: Post[]) {
  const roots: Folder[] = [];

  for (const post of posts) {
    let siblings = roots;
    const path: string[] = [];

    for (const name of post.data.category ?? []) {
      path.push(name);
      let folder = siblings.find((candidate) => candidate.name === name);
      if (!folder) {
        folder = { name, path: [...path], posts: [], children: [] };
        siblings.push(folder);
      }

      folder.posts.push(post);
      siblings = folder.children;
    }
  }

  const byName = (a: Folder, b: Folder) => a.name.localeCompare(b.name, 'ko');
  for (const folder of roots) folder.children.sort(byName);
  return roots.sort(byName);
}
