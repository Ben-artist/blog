<template>
  <Layout>
    <template #doc-before>
      <template v-if="!isMinimalPage">
        <Title />
        <Category />
        <DocToc v-if="isPostPage" />
      </template>
    </template>
    <template #doc-after>
      <template v-if="!isMinimalPage">
        <PostNav v-if="isPostPage" />
        <ClientOnly>
          <WStatistics />
        </ClientOnly>
        <Comments />
        <BackToTop />
      </template>
    </template>
    <template #home-features-after>
      <Home />
    </template>
    <template #layout-bottom>
      <MermaidPreview />
    </template>
  </Layout>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Comments from "./Comments.vue";
import Home from "./Home.vue";
import Category from "./Category.vue";
import Title from "./Title.vue";
import DocToc from "./DocToc.vue";
import PostNav from "./PostNav.vue";
import BackToTop from "./BackToTop.vue";
import WStatistics from "./WStatistics.vue";
import { regularPathFromRoute } from "../utils";

const { Layout } = DefaultTheme;
const route = useRoute();

/** 信息助手等定制页，不展示文章头/评论等 */
const isInfoPage = computed(() => /\/info\/?$/.test(route.path));
const isMinimalPage = computed(() => isInfoPage.value);
const isPostPage = computed(() => !!regularPathFromRoute(route.path));
</script>
<style scoped>
button {
  display: inline-block;
  position: relative;
  color: var(--vp-c-color-d);
  cursor: pointer;
  font-size: 1.2em;
  font-weight: bold;
}

button::after {
  content: "";
  position: absolute;
  width: 100%;
  transform: scaleX(0);
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--vp-c-color-d);
  transform-origin: bottom right;
  transition: transform 0.25s ease-out;
}
button:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}
</style>
