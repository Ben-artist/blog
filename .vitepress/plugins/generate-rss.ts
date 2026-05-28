import { Feed } from "feed";
import fs from "fs-extra";
import path from "node:path";

export type RssPost = {
  frontMatter: {
    title?: string;
    date?: string;
    description?: string;
  };
  regularPath: string;
};

export interface RssOptions {
  outDir: string;
  siteUrl: string;
  title: string;
  description: string;
  authorName?: string;
  authorEmail?: string;
  authorLink?: string;
}

/**
 * 构建结束时写入 RSS / Atom 到站点根目录。
 */
export async function writeRssFeed(
  posts: RssPost[],
  opts: RssOptions,
): Promise<void> {
  const siteUrl = opts.siteUrl.replace(/\/$/, "");
  const feed = new Feed({
    title: opts.title,
    description: opts.description,
    id: siteUrl,
    link: siteUrl,
    language: "zh-CN",
    image: `${siteUrl}/avator.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `Copyright ${new Date().getFullYear()} ${opts.authorName ?? "TSK"}`,
    feedLinks: {
      rss2: `${siteUrl}/rss.xml`,
      atom: `${siteUrl}/atom.xml`,
    },
    author: {
      name: opts.authorName ?? "TSK",
      email: opts.authorEmail ?? "tskwangyi@gmail.com",
      link: opts.authorLink ?? "https://1996tsk.top",
    },
  });

  for (const post of posts) {
    const link = `${siteUrl}${post.regularPath}`;
    feed.addItem({
      title: post.frontMatter.title ?? "Untitled",
      id: link,
      link,
      description: post.frontMatter.description,
      date: new Date(post.frontMatter.date ?? Date.now()),
    });
  }

  await fs.ensureDir(opts.outDir);
  await fs.writeFile(path.join(opts.outDir, "rss.xml"), feed.rss2());
  await fs.writeFile(path.join(opts.outDir, "atom.xml"), feed.atom1());
}
