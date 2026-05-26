<template>
  <div class="tags-page tsk-fade-in">
    <header class="page-header">
      <h1>
        <Icon name="tag" :size="28" />
        标签
      </h1>
      <p>按主题标签筛选文章</p>
    </header>

    <div class="tag-cloud" role="list">
      <button
        v-for="(item, key) in data"
        :key="key"
        type="button"
        class="tag-pill"
        :class="{ active: selectTag === key }"
        :style="getFontSize(data[key].length)"
        @click="toggleTag(key as string)"
      >
        {{ key }}
        <span class="tag-count">{{ data[key].length }}</span>
      </button>
    </div>

    <section v-show="selectTag" class="tag-results">
      <h2 class="results-heading">
        <Icon name="folder" :size="18" />
        {{ selectTag }}
      </h2>
      <ul class="article-list">
        <li
          v-for="(article, index) in data[selectTag]"
          :key="article.regularPath"
        >
          <a
            :href="withBase(article.regularPath)"
            class="article-row"
            :style="{ animationDelay: `${index * 40}ms` }"
          >
            <span class="article-title">{{ article.frontMatter.title }}</span>
            <time class="article-date">{{ article.frontMatter.date }}</time>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useData, withBase } from "vitepress";
import { initTags } from "../utils";
import Icon from "./Icon.vue";

const { theme } = useData();
const data = computed(() => initTags(theme.value.posts));
const selectTag = ref("");

function toggleTag(tag: string) {
  selectTag.value = selectTag.value === tag ? "" : tag;
}

/** 标签云字号：文章越多字号略大 */
function getFontSize(length: number) {
  const size = Math.min(1.15, length * 0.04 + 0.88);
  return { fontSize: `${size}rem` };
}
</script>

<style scoped>
.tags-page {
  margin: 0 auto;
  padding: var(--tsk-space-5) var(--tsk-space-5) var(--tsk-space-8);
  max-width: 44rem;
}

.page-header {
  margin-bottom: var(--tsk-space-6);
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
}

.page-header p {
  margin: 0;
  color: var(--tsk-text-muted);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: var(--tsk-space-6);
  padding-bottom: var(--tsk-space-6);
  border-bottom: 1px solid var(--tsk-border);
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  font-family: inherit;
  font-weight: 500;
  line-height: 1.3;
  color: var(--tsk-text-muted);
  background: var(--tsk-bg-elevated);
  border: 1px solid var(--tsk-border);
  border-radius: var(--tsk-radius-full);
  cursor: pointer;
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-out),
    color var(--tsk-duration-fast) var(--tsk-ease-out),
    background var(--tsk-duration-fast) var(--tsk-ease-out),
    border-color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.tag-pill:hover {
  color: var(--tsk-accent);
  border-color: var(--tsk-accent-glow);
  transform: translateY(-1px);
}

.tag-pill.active {
  color: var(--tsk-bg-elevated);
  background: var(--tsk-accent);
  border-color: var(--tsk-accent);
}

.tag-count {
  font-size: var(--tsk-font-sm);
  opacity: 0.75;
}

.results-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 var(--tsk-space-4);
  font-family: var(--tsk-font-display);
  font-size: 1.15rem;
  font-weight: 600;
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
