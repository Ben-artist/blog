<template>
  <ShareCard />
  <section class="tsk-section recent tsk-fade-in" aria-labelledby="recent-title">
    <div class="tsk-section-header">
      <h2 id="recent-title" class="tsk-section-title">
        <Icon name="clock" :size="20" />
        最近更新
      </h2>
      <a :href="withBase('/archives')" class="tsk-section-link">
        查看归档
        <Icon name="arrow-right" :size="14" />
      </a>
    </div>
    <div class="post-list">
      <a
        v-for="(item, index) in recentPosts"
        :key="item.regularPath"
        class="post-card tsk-card"
        :href="withBase(item.regularPath)"
        :style="{ animationDelay: `${index * 60}ms` }"
      >
        <div class="post-main">
          <h3 class="post-title">{{ item.frontMatter.title }}</h3>
          <p v-if="getExcerpt(item)" class="post-excerpt">{{ getExcerpt(item) }}</p>
        </div>
        <time class="post-date">
          <Icon name="calendar" :size="14" />
          {{ transDate(item.frontMatter.date) }}
        </time>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import ShareCard from "./ShareCard.vue";
import Icon from "./Icon.vue";
import { useData, withBase } from "vitepress";
import type { Post } from "../utils";

const RECENT_LIMIT = 8;

const { theme } = useData();

const recentPosts = (theme.value.posts as Post[] || [])
  .filter((item) => !item.regularPath.includes("index"))
  .slice(0, theme.value.homeRecentCount ?? RECENT_LIMIT);

/**
 * 文章摘要：优先 frontmatter.description，否则截断正文首段。
 */
function getExcerpt(item: Post): string {
  const desc = item.frontMatter.description?.trim();
  if (desc) return desc.length > 120 ? `${desc.slice(0, 120)}…` : desc;
  return "";
}

function transDate(date?: string) {
  if (!date) return "";
  const [year, m, d] = date.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[Number(m) - 1] ?? m;
  return `${month} ${Number(d)}, ${year}`;
}
</script>

<style scoped>
.recent {
  padding-bottom: var(--tsk-space-8);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--tsk-space-3);
}

.post-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--tsk-space-5);
  animation: tsk-fade-up var(--tsk-duration-slow) var(--tsk-ease-out) both;
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-title {
  margin: 0;
  font-family: var(--tsk-font-display);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: var(--tsk-text);
  transition: color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.post-card:hover .post-title {
  color: var(--tsk-accent);
}

.post-excerpt {
  margin: 0.45rem 0 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--tsk-text-muted);
}

.post-date {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  font-size: var(--tsk-font-sm);
  font-variant-numeric: tabular-nums;
  color: var(--tsk-text-subtle);
  padding-top: 0.2rem;
}

@media (max-width: 560px) {
  .post-card {
    flex-direction: column;
    gap: var(--tsk-space-2);
  }

  .post-date {
    padding-top: 0;
  }
}
</style>
