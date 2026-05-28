<template>
  <div class="collections-page tsk-fade-in">
    <template v-if="!activeId">
      <header class="page-header">
        <h1>
          <Icon name="books" :size="28" />
          文章合集
        </h1>
        <p>
          按主题整理的系列文章，适合系统学习
        </p>
      </header>

      <div class="collections-grid">
        <button v-for="(item, index) in collectionList" :key="item.id" type="button" class="collection-card tsk-card"
          :style="{
            '--collection-accent': item.accent,
            animationDelay: `${index * 50}ms`,
          }" @click="openCollection(item.id)">
          <span class="collection-icon" aria-hidden="true">{{ item.icon }}</span>
          <div class="collection-body">
            <h2 class="collection-name">{{ item.title }}</h2>
            <p class="collection-desc">{{ item.description }}</p>
            <span class="collection-count">{{ item.posts.length }} 篇文章</span>
          </div>
          <Icon name="chevron-right" :size="20" class="collection-arrow" />
        </button>
      </div>
    </template>

    <template v-else>
      <nav class="collection-back">
        <button type="button" class="back-btn" @click="closeCollection">
          <Icon name="arrow-left" :size="16" />
          返回全部合集
        </button>
      </nav>

      <header v-if="activeCollection" class="detail-hero" :style="{ '--collection-accent': activeCollection.accent }">
        <span class="detail-icon" aria-hidden="true">{{ activeCollection.icon }}</span>
        <div>
          <h1 class="detail-title">{{ activeCollection.title }}</h1>
          <p class="detail-desc">{{ activeCollection.description }}</p>
          <span class="detail-count">{{ activeCollection.posts.length }} 篇</span>
        </div>
      </header>

      <div v-if="activeCollection" class="article-list">
        <a v-for="(article, index) in activeCollection.posts" :key="article.regularPath"
          :href="withBase(article.regularPath)" class="article-card tsk-card"
          :style="{ animationDelay: `${index * 40}ms` }">
          <span class="article-index">{{ String(index + 1).padStart(2, "0") }}</span>
          <div class="article-main">
            <h3 class="article-title">{{ article.frontMatter.title }}</h3>
            <time class="article-date">{{ formatDate(article.frontMatter.date) }}</time>
          </div>
          <Icon name="arrow-right" :size="18" class="article-arrow" />
        </a>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useData, useRoute, withBase } from "vitepress";
import { collections } from "../collections";
import { initCollections, type Post } from "../utils";
import Icon from "./Icon.vue";

const { theme } = useData();
const route = useRoute();

const collectionList = computed(() =>
  initCollections((theme.value.posts as Post[]) || [], collections),
);

const activeId = ref("");

const activeCollection = computed(() =>
  collectionList.value.find((c) => c.id === activeId.value),
);

function syncFromRoute() {
  const id = typeof route.data?.params?.id === "string" ? route.data.params.id : "";
  const queryId =
    typeof route.query?.id === "string"
      ? route.query.id
      : Array.isArray(route.query?.id)
        ? route.query.id[0]
        : "";
  activeId.value = id || queryId || "";
}

watch(() => route.path + route.query?.id, syncFromRoute, { immediate: true });

function openCollection(id: string) {
  activeId.value = id;
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.replaceState({}, "", url.toString());
  }
}

function closeCollection() {
  activeId.value = "";
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.replaceState({}, "", url.pathname);
  }
}

function formatDate(date?: string) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${y} · ${Number(m)}/${Number(d)}`;
}
</script>

<style scoped>
.collections-page {
  margin: 0 auto;
  padding: var(--tsk-space-5) var(--tsk-space-5) var(--tsk-space-8);
  max-width: 52rem;
}

.page-header {
  margin: var(--tsk-space-4) 0 var(--tsk-space-7);
  text-align: center;
}

.page-header h1 {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 var(--tsk-space-3);
  font-family: var(--tsk-font-display);
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--tsk-text);
}

.page-header p {
  margin: 0 auto;
  max-width: 32rem;
  line-height: 1.65;
  color: var(--tsk-text-muted);
}

.page-header a {
  color: var(--tsk-accent);
  font-weight: 500;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--tsk-space-4);
}

.collection-card {
  display: flex;
  align-items: flex-start;
  gap: var(--tsk-space-3);
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  animation: tsk-fade-up var(--tsk-duration-slow) var(--tsk-ease-out) both;
  border-color: color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 18%, var(--tsk-border));
}

.collection-card:hover {
  border-color: color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 35%, var(--tsk-border-strong));
}

.collection-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.collection-body {
  flex: 1;
  min-width: 0;
}

.collection-name {
  margin: 0 0 0.35rem;
  font-family: var(--tsk-font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--tsk-text);
}

.collection-desc {
  margin: 0 0 0.5rem;
  font-size: var(--tsk-font-sm);
  line-height: 1.5;
  color: var(--tsk-text-muted);
}

.collection-count {
  font-size: var(--tsk-font-sm);
  font-weight: 500;
  color: var(--collection-accent, var(--tsk-warm));
}

.collection-arrow {
  flex-shrink: 0;
  align-self: center;
  color: var(--tsk-text-subtle);
  transition: transform var(--tsk-duration-fast) var(--tsk-ease-out);
}

.collection-card:hover .collection-arrow {
  transform: translateX(3px);
  color: var(--collection-accent, var(--tsk-accent));
}

.collection-back {
  margin: var(--tsk-space-3) 0 var(--tsk-space-5);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--tsk-accent);
  cursor: pointer;
  font-family: inherit;
  transition: gap var(--tsk-duration-fast) var(--tsk-ease-out);
}

.back-btn:hover {
  gap: 0.55rem;
}

.detail-hero {
  display: flex;
  align-items: flex-start;
  gap: var(--tsk-space-4);
  padding: var(--tsk-space-5);
  margin-bottom: var(--tsk-space-5);
  border-radius: var(--tsk-radius-md);
  border: 1px solid color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 22%, var(--tsk-border));
  background: color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 6%, var(--tsk-bg-elevated));
  box-shadow: var(--tsk-shadow-sm);
}

.detail-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.detail-title {
  margin: 0 0 0.35rem;
  font-family: var(--tsk-font-display);
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--tsk-text);
}

.detail-desc {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: var(--tsk-text-muted);
  line-height: 1.55;
}

.detail-count {
  font-size: var(--tsk-font-sm);
  font-weight: 500;
  color: var(--collection-accent, var(--tsk-warm));
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: var(--tsk-space-3);
}

.article-card {
  display: flex;
  align-items: center;
  gap: var(--tsk-space-4);
  animation: tsk-fade-up var(--tsk-duration-slow) var(--tsk-ease-out) both;
}

.article-index {
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--tsk-text-subtle);
  min-width: 2rem;
}

.article-main {
  flex: 1;
  min-width: 0;
}

.article-title {
  margin: 0 0 0.2rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--tsk-text);
  transition: color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.article-card:hover .article-title {
  color: var(--tsk-accent);
}

.article-date {
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text-subtle);
}

.article-arrow {
  flex-shrink: 0;
  color: var(--tsk-text-subtle);
  transition: transform var(--tsk-duration-fast) var(--tsk-ease-out);
}

.article-card:hover .article-arrow {
  transform: translateX(3px);
  color: var(--tsk-accent);
}

@media (max-width: 640px) {
  .collections-grid {
    grid-template-columns: 1fr;
  }

  .detail-hero {
    flex-direction: column;
  }
}
</style>
