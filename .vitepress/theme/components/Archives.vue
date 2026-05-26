<template>
  <div class="archives tsk-fade-in">
    <header class="page-header">
      <h1>
        <Icon name="archive" :size="28" />
        归档
      </h1>
      <p>按年份浏览全部文章</p>
    </header>

    <section v-for="yearList in data" :key="yearList[0].frontMatter.date" class="year-block">
      <h2 class="year">{{ yearList[0].frontMatter.date.split("-")[0] }}</h2>
      <ul class="article-list">
        <li v-for="(article, index) in yearList" :key="article.regularPath">
          <a
            :href="withBase(article.regularPath)"
            class="article-row"
            :style="{ animationDelay: `${index * 40}ms` }"
          >
            <span class="article-title">{{ article.frontMatter.title }}</span>
            <time class="article-date">{{ article.frontMatter.date.slice(5) }}</time>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useData, withBase } from "vitepress";
import { computed } from "vue";
import { useYearSort } from "../utils";
import Icon from "./Icon.vue";

const { theme } = useData();
const data = computed(() => useYearSort(theme.value.posts));
</script>

<style scoped>
.archives {
  margin: 0 auto;
  padding: var(--tsk-space-5) var(--tsk-space-5) var(--tsk-space-8);
  max-width: 44rem;
}

.page-header {
  margin-bottom: var(--tsk-space-7);
  text-align: center;
}

.page-header h1 {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 var(--tsk-space-2);
  font-family: var(--tsk-font-display);
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--tsk-text);
}

.page-header p {
  margin: 0;
  color: var(--tsk-text-muted);
}

.year-block {
  margin-bottom: var(--tsk-space-6);
  padding-bottom: var(--tsk-space-5);
  border-bottom: 1px solid var(--tsk-border);
}

.year-block:last-child {
  border-bottom: none;
}

.year {
  margin: 0 0 var(--tsk-space-4);
  font-family: var(--tsk-font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--tsk-accent);
}

.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.article-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--tsk-space-4);
  padding: 0.75rem 0.5rem;
  margin: 0 -0.5rem;
  border-radius: var(--tsk-radius-sm);
  color: var(--tsk-text-muted);
  text-decoration: none;
  animation: tsk-fade-up var(--tsk-duration-slow) var(--tsk-ease-out) both;
  transition:
    color var(--tsk-duration-fast) var(--tsk-ease-out),
    background var(--tsk-duration-fast) var(--tsk-ease-out);
}

.article-row:hover {
  color: var(--tsk-accent);
  background: var(--tsk-accent-soft);
  text-decoration: none;
}

.article-title {
  flex: 1;
  min-width: 0;
  font-weight: 500;
}

.article-date {
  flex-shrink: 0;
  font-size: var(--tsk-font-sm);
  font-variant-numeric: tabular-nums;
  color: var(--tsk-text-subtle);
}
</style>
