import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { getPosts, getPostCount } from "./theme/serverUtils";
import { defineConfig } from "vitepress";
import vitepressMermaidConfig from "@unify-js/vitepress-mermaid/config";
import { codeFenceMetaPlugin } from "./plugins/code-fence-meta";
import { writeRssFeed } from "./plugins/generate-rss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.resolve(__dirname, "../posts");
const configFile = path.resolve(__dirname, "config.ts");

const SITE_URL = "https://1996tsk.top/blog";
const SITE_TITLE = "TSK 技术博客";
const SITE_DESCRIPTION =
  "全栈 · AI Agent · Web3 · 前端深度笔记，深入浅出记录学习与工程实践。";

/** 新增/修改 posts 时重载 config，刷新 themeConfig.posts */
function postsConfigHmr(): Plugin {
  return {
    name: "vitepress-posts-config-hmr",
    configureServer(server) {
      const reloadConfig = (file: string) => {
        if (!file.endsWith(".md") || !file.startsWith(postsDir)) return;
        const mod = server.moduleGraph.getModuleById(configFile);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reloadConfig);
      server.watcher.on("unlink", reloadConfig);
      server.watcher.on("change", reloadConfig);
    },
  };
}

const posts = await getPosts();
const postCount = await getPostCount();

export default defineConfig({
  extends: vitepressMermaidConfig,
  vite: {
    plugins: [postsConfigHmr()],
  },
  lang: "zh-CN",
  title: "TSK",
  base: "/blog/",
  description: SITE_DESCRIPTION,
  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&display=swap",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/blog/favicon.ico",
      },
    ],
    [
      "link",
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: "/blog/favicon.ico",
      },
    ],
    [
      "link",
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "TSK Blog RSS",
        href: `${SITE_URL}/rss.xml`,
      },
    ],
    [
      "meta",
      {
        name: "author",
        content: "TSK",
      },
    ],
  ],
  lastUpdated: true,
  transformHead({ pageData }) {
    const head: [string, Record<string, string>][] = [];
    const pageTitle = pageData.title ? `${pageData.title} | TSK` : SITE_TITLE;
    const desc =
      pageData.description ||
      (pageData.frontmatter?.description as string) ||
      SITE_DESCRIPTION;
    const isPost = pageData.relativePath?.startsWith("posts/");

    if (!pageData.relativePath) return head;

    const pageUrl = new URL(
      pageData.relativePath.replace(/\.md$/, ".html"),
      SITE_URL.endsWith("/") ? SITE_URL : `${SITE_URL}/`,
    ).href;

    head.push(["meta", { property: "og:type", content: isPost ? "article" : "website" }]);
    head.push(["meta", { property: "og:title", content: pageTitle }]);
    head.push(["meta", { property: "og:description", content: desc }]);
    head.push(["meta", { property: "og:url", content: pageUrl }]);
    head.push(["meta", { property: "og:site_name", content: SITE_TITLE }]);
    head.push(["meta", { name: "twitter:card", content: "summary" }]);
    head.push(["meta", { name: "twitter:title", content: pageTitle }]);
    head.push(["meta", { name: "twitter:description", content: desc }]);

    if (isPost && pageData.frontmatter?.date) {
      head.push([
        "meta",
        { property: "article:published_time", content: String(pageData.frontmatter.date) },
      ]);
    }

    return head;
  },
  async buildEnd({ outDir }) {
    await writeRssFeed(posts, {
      outDir,
      siteUrl: SITE_URL,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    });
  },
  themeConfig: {
    search: {
      provider: "local",
    },
    logo: "/avator.png",
    /** 点击左上角 Logo / 站点名回到个人主页 */
    logoLink: "https://1996tsk.top/",
    personalSiteUrl: "https://1996tsk.top/",
    posts,
    pageSize: 5,
    homeRecentCount: 6,
    postLength: postCount,
    /** Utterances 评论（基于 GitHub Issues，无需 Client Secret） */
    comments: {
      repo: "Ben-artist/blog",
      /** 须与 utteranc.es 及仓库 Labels 完全一致（区分大小写） */
      label: "Comment",
      issueTerm: "pathname",
    },
    /** TSK 信息助手（独立站点，问答式个人介绍） */
    infoAssistantUrl: "https://1996tsk.top/info/",
    nav: [
      { text: "首页", link: "/" },
      { text: "合集", link: "/collections" },
      { text: "标签", link: "/tags" },
      { text: "归档", link: "/archives" },
      { text: "信息助手", link: "/info" },
      { text: "关于我", link: "/about" },
    ],
    socialLinks: [
      {
        icon: {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z"/><path d="M9 21V12h6v9"/></svg>`,
        },
        link: "https://1996tsk.top/",
        ariaLabel: "个人主页",
      },
      { icon: "github", link: "https://github.com/tangtts" },
      { icon: "twitter", link: "https://x.com/home?locale=zh-cn" },
      {
        icon: {
          svg: `<svg role="img" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20">
          <path d="M874.666667 375.189333V746.666667a64 64 0 0 1-64 64H213.333333a64 64 0 0 1-64-64V375.189333l266.090667 225.6a149.333333 149.333333 0 0 0 193.152 0L874.666667 375.189333zM810.666667 213.333333a64.789333 64.789333 0 0 1 22.826666 4.181334 63.616 63.616 0 0 1 26.794667 19.413333 64.32 64.32 0 0 1 9.344 15.466667c2.773333 6.570667 4.48 13.696 4.906667 21.184L874.666667 277.333333v21.333334L553.536 572.586667a64 64 0 0 1-79.893333 2.538666l-3.178667-2.56L149.333333 298.666667v-21.333334a63.786667 63.786667 0 0 1 35.136-57.130666A63.872 63.872 0 0 1 213.333333 213.333333h597.333334z" ></path>
          </svg>`,
        },
        link: "mailto:tskwangyi@gmail.com",
      },
    ],
    aside: false,
  },
  markdown: {
    theme: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
    config(md) {
      codeFenceMetaPlugin(md);
    },
  },
});
