<template>
  <div class="home">
    <header class="home-hero">
      <img
        :src="withBase(theme.logo)"
        width="80"
        height="80"
        alt="TSK"
        class="home-avatar"
      />
      <div class="home-intro">
        <h1 class="home-title">TSK</h1>
        <p class="home-tagline">
          前端 · 框架原理 · 浏览器 · 网络与安全 · Web3
        </p>
        <div class="home-actions">
          <a
            :href="personalSiteUrl"
            class="home-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            个人主页
          </a>
          <span class="home-dot" aria-hidden="true">·</span>
          <a :href="withBase('/about')" class="home-link">关于我</a>
          <span class="home-dot" aria-hidden="true">·</span>
          <a :href="withBase('/info')" class="home-link">信息助手</a>
        </div>
      </div>
    </header>

    <section class="home-block" aria-labelledby="recent-title">
      <div class="home-block-head">
        <h2 id="recent-title">最近更新</h2>
        <a :href="withBase('/archives')" class="home-block-link">归档</a>
      </div>
      <ul class="post-list">
        <li v-for="item in recentPosts" :key="item.regularPath">
          <a :href="withBase(item.regularPath)" class="post-row">
            <span class="post-title">{{ item.frontMatter.title }}</span>
            <time class="post-date">{{ formatDate(item.frontMatter.date) }}</time>
          </a>
        </li>
      </ul>
    </section>

    <section class="home-block" aria-labelledby="collections-title">
      <div class="home-block-head">
        <h2 id="collections-title">合集</h2>
        <a :href="withBase('/collections')" class="home-block-link">全部</a>
      </div>
      <ul class="collection-list">
        <li v-for="item in collectionList" :key="item.id">
          <a
            :href="withBase(`/collections?id=${item.id}`)"
            class="collection-row"
          >
            <span class="collection-name">{{ item.title }}</span>
            <span class="collection-count">{{ item.posts.length }}</span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { collections } from "../collections";
import { initCollections, type Post } from "../utils";

const RECENT_LIMIT = 6;

const { theme } = useData();

const personalSiteUrl =
  (theme.value.personalSiteUrl as string) || "https://1996tsk.top/";

const recentPosts = computed(() =>
  ((theme.value.posts as Post[]) || [])
    .filter((item) => !item.regularPath.includes("index"))
    .slice(0, theme.value.homeRecentCount ?? RECENT_LIMIT),
);

const collectionList = computed(() =>
  initCollections((theme.value.posts as Post[]) || [], collections),
);

/** @param date ISO date string from frontmatter */
function formatDate(date?: string) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${y}.${m}.${d}`;
}
</script>

<style scoped>
.home {
  width: min(100% - 2.5rem, 36rem);
  margin: 0 auto;
  padding: var(--tsk-space-6) 0 var(--tsk-space-8);
}

.home-hero {
  display: flex;
  align-items: center;
  gap: var(--tsk-space-5);
  margin-bottom: var(--tsk-space-8);
  padding-bottom: var(--tsk-space-6);
  border-bottom: 1px solid var(--tsk-border);
}

.home-avatar {
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--tsk-border);
}

.home-intro {
  min-width: 0;
}

.home-title {
  margin: 0 0 0.35rem;
  font-family: var(--tsk-font-display);
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--tsk-text);
}

.home-tagline {
  margin: 0 0 0.65rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--tsk-text-muted);
}

.home-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.home-link {
  font-size: var(--tsk-font-sm);
  font-weight: 500;
  color: var(--tsk-text-muted);
  text-decoration: none;
}

.home-link:hover {
  color: var(--tsk-text);
  text-decoration: underline;
}

.home-dot {
  color: var(--tsk-text-subtle);
  user-select: none;
}

.home-block + .home-block {
  margin-top: var(--tsk-space-7);
}

.home-block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--tsk-space-4);
  margin-bottom: var(--tsk-space-3);
}

.home-block-head h2 {
  margin: 0;
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--tsk-text-subtle);
}

.home-block-link {
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text-muted);
  text-decoration: none;
}

.home-block-link:hover {
  color: var(--tsk-accent);
}

.post-list,
.collection-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-row,
.collection-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--tsk-space-4);
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--tsk-border);
  color: inherit;
  text-decoration: none;
  transition: color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.post-row:last-child,
.collection-row:last-child {
  border-bottom: none;
}

.post-row:hover,
.collection-row:hover {
  color: var(--tsk-accent);
  text-decoration: none;
}

.post-title,
.collection-name {
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.45;
}

.post-date {
  flex-shrink: 0;
  font-size: var(--tsk-font-sm);
  font-variant-numeric: tabular-nums;
  color: var(--tsk-text-subtle);
}

.collection-count {
  flex-shrink: 0;
  font-size: var(--tsk-font-sm);
  font-variant-numeric: tabular-nums;
  color: var(--tsk-text-subtle);
}

@media (max-width: 480px) {
  .home-hero {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
}
</style>
