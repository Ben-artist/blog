import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { getPosts, getPostLength } from "./theme/serverUtils";
import { defineConfig } from "vitepress";
import vitepressMermaidConfig from "@unify-js/vitepress-mermaid/config";
import { codeFenceMetaPlugin } from "./plugins/code-fence-meta";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.resolve(__dirname, "../posts");
const configFile = path.resolve(__dirname, "config.ts");

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
const postLength = await getPostLength();

export default defineConfig({
  extends: vitepressMermaidConfig,
  vite: {
    plugins: [postsConfigHmr()],
  },
  lang: "en-US",
  title: "TSK",
  base: "/blog/",
  description: "Home of TSK",
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
        href: "/favicon.ico",
      },
    ],
    [
      "meta",
      {
        name: "author",
        content: "TSK",
      },
    ],
    [
      "meta",
      {
        property: "og:title",
        content: "Home",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content: "Home of TSK",
      },
    ],
  ],
  lastUpdated: false,
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
    postLength,
    /** Utterances 评论（基于 GitHub Issues，无需 Client Secret） */
    comments: {
      repo: "Ben-artist/blog",
    },
    /** TSK 信息助手（独立站点，问答式个人介绍） */
    infoAssistantUrl: "https://1996tsk.top/info/",
    nav: [
      { text: "首页", link: "/" },
      { text: "关于", link: "/about" },
      { text: "信息助手", link: "/info" },
      { text: "合集", link: "/collections" },
      { text: "标签", link: "/tags" },
      { text: "归档", link: "/archives" },
    ],
    socialLinks: [
      { icon: "home", link: "https://1996tsk.top/" },
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
