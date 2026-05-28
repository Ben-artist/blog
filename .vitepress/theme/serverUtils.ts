import { globby } from "globby";
import matter from "gray-matter";
import fs from "fs-extra";

export type ServerPost = {
  frontMatter: Record<string, unknown> & {
    date?: string;
    title?: string;
    description?: string;
    tags?: string[];
    collection?: string;
  };
  regularPath: string;
  wordCount: number;
  readingMinutes: number;
};

/** 估算字数：中文按字、英文按词 */
function countWords(markdown: string): number {
  const body = markdown
    .replace(/^---[\s\S]*?---\n?/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/[#>*_~\-|]/g, " ");
  const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const en = (body.match(/[a-zA-Z0-9]+/g) || []).length;
  return cjk + en;
}

/** 阅读速度约 400 字/分钟 */
function toReadingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 400));
}

export async function getPosts(): Promise<ServerPost[]> {
  const paths = await getPostMDFilePaths();
  const posts = await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, "utf-8");
      const { data, content: body } = matter(content);
      data.date = _convertDate(data.date as string | undefined);
      const wordCount = countWords(body);
      return {
        frontMatter: data,
        regularPath: `/${item.replace(".md", ".html")}`,
        wordCount,
        readingMinutes: toReadingMinutes(wordCount),
      };
    }),
  );
  posts.sort(_compareDate);
  return posts;
}

function _convertDate(date = new Date().toString()) {
  const json_date = new Date(date).toJSON();
  return json_date.split("T")[0];
}

function _compareDate(obj1, obj2) {
  return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1;
}

async function getPostMDFilePaths() {
  let paths = await globby(["**.md"], {
    ignore: ["node_modules", "README.md"],
  });
  return paths.filter((item) => item.includes("posts/"));
}

/** 文章总数（供主题配置等使用） */
export async function getPostCount(): Promise<number> {
  return (await getPostMDFilePaths()).length;
}
