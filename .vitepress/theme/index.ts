import Theme from "vitepress/theme";
import Archives from "./components/Archives.vue";
import Tags from "./components/Tags.vue";
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
    if (inBrowser) {
      router.onAfterRouteChange = (to) => {
        busuanzi.fetch();
      };
    }
    app.component("Archives", Archives);
    app.component("Tags", Tags);
    app.use(TwoslashFloatingVue);
  },
  setup() {
    const initZoom = () => {
      mediumZoom(".main img", { background: "var(--vp-c-bg)" });
    };
    onMounted(() => {
      console.log("onMounted");
      initZoom();
    });
  },
};
