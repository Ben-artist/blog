import Theme from "vitepress/theme";
import { MermaidTheme } from "@unify-js/vitepress-mermaid";
import "@unify-js/vitepress-mermaid/style.css";
import Archives from "./components/Archives.vue";
import Tags from "./components/Tags.vue";
import Collections from "./components/Collections.vue";
import About from "./components/About.vue";
import InfoAssistant from "./components/InfoAssistant.vue";
import MyLayout from "./components/MyLayout.vue";
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "@shikijs/vitepress-twoslash/style.css";
import type { EnhanceAppContext } from "vitepress";
import mediumZoom from "medium-zoom";
import busuanzi from "busuanzi.pure.js";
import { onMounted } from "vue";
import "./custom.css";
import { inBrowser } from "vitepress";
export default {
  extends: Theme,
  Layout: MyLayout,
  enhanceApp({ app, router }: EnhanceAppContext) {
    MermaidTheme.enhanceApp({ app, router } as EnhanceAppContext);
    if (inBrowser) {
      router.onAfterRouteChange = (to) => {
        busuanzi.fetch();
      };
    }
    app.component("Archives", Archives);
    app.component("Tags", Tags);
    app.component("Collections", Collections);
    app.component("About", About);
    app.component("InfoAssistant", InfoAssistant);
    app.use(TwoslashFloatingVue);
  },
  setup() {
    const initZoom = () => {
      mediumZoom(".main img", { background: "var(--vp-c-bg)" });
    };
    onMounted(() => {
      initZoom();
    });
  },
};
