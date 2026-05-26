<template>
  <header class="article-header tsk-fade-in">
    <h1 class="article-title">{{ pageData.title }}</h1>
    <div class="article-meta">
      <a
        v-if="collectionMeta"
        :href="withBase(`/collections?id=${collectionMeta.id}`)"
        class="collection-badge"
        :style="{ '--collection-accent': collectionMeta.accent }"
      >
        <span aria-hidden="true">{{ collectionMeta.icon }}</span>
        {{ collectionMeta.title }}
      </a>
      <p class="publish-date">{{ publishDate }}</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useData, onContentUpdated, withBase } from "vitepress";
import { ref, computed } from "vue";
import { collections } from "../collections";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

type PageData = {
  description: string;
  title: string;
  frontmatter: { date?: string; collection?: string };
  headers: object[];
  lastUpdated: number;
  relativePath: string;
};

const { page: pageData } = useData();
const publishDate = ref("");

dayjs.extend(relativeTime);

const collectionMeta = computed(() => {
  const id = (pageData.value.frontmatter as PageData["frontmatter"]).collection;
  return collections.find((c) => c.id === id);
});

onContentUpdated(() => {
  const { frontmatter } = pageData.value;
  publishDate.value = dayjs().to(
    dayjs(frontmatter.date || Date.now()),
  );
});
</script>

<style scoped>
.article-header {
  margin-bottom: var(--tsk-space-6);
  padding-bottom: var(--tsk-space-4);
  border-bottom: 1px solid var(--tsk-border);
}

.article-title {
  margin: 0 0 var(--tsk-space-3);
  font-family: var(--tsk-font-display);
  font-size: clamp(1.65rem, 4vw, 2.15rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--tsk-text);
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tsk-space-3);
}

.collection-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  border-radius: var(--tsk-radius-full);
  border: 1px solid color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 30%, var(--tsk-border));
  background: color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 8%, var(--tsk-bg-elevated));
  color: var(--tsk-text);
  text-decoration: none;
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-out),
    border-color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.collection-badge:hover {
  transform: translateY(-1px);
  border-color: var(--collection-accent, var(--tsk-accent));
  text-decoration: none;
}

.publish-date {
  margin: 0;
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text-subtle);
}
</style>
