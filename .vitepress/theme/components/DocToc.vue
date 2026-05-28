<template>
  <nav
    v-if="showToc"
    class="doc-toc tsk-card"
    aria-label="文章目录"
  >
    <button
      type="button"
      class="doc-toc-toggle"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Icon name="layers" :size="18" />
      <span>目录</span>
      <span class="doc-toc-count">{{ tocItems.length }} 节</span>
      <Icon
        name="chevron-right"
        :size="16"
        class="doc-toc-chevron"
        :class="{ open }"
      />
    </button>
    <ol v-show="open" class="doc-toc-list">
      <li
        v-for="item in tocItems"
        :key="item.link"
        :class="`level-${item.level}`"
      >
        <a :href="item.link">{{ item.title }}</a>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onContentUpdated, useData } from "vitepress";
import Icon from "./Icon.vue";

interface TocItem {
  title: string;
  link: string;
  level: number;
}

const open = ref(true);
const { page } = useData();

const tocItems = computed((): TocItem[] => {
  const headers = page.value.headers ?? [];
  return headers
    .filter((h: { level: number }) => h.level >= 2 && h.level <= 4)
    .map((h: { level: number; title: string; slug?: string; link?: string }) => ({
      title: h.title,
      link: h.link ?? `#${h.slug}`,
      level: h.level,
    }));
});

const showToc = computed(() => tocItems.value.length >= 3);

onContentUpdated(() => {
  if (tocItems.value.length >= 3) open.value = true;
});
</script>

<style scoped>
.doc-toc {
  margin-bottom: var(--tsk-space-5);
  padding: 0;
  overflow: hidden;
}

.doc-toc-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: var(--tsk-space-3) var(--tsk-space-4);
  border: none;
  background: transparent;
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  color: var(--tsk-text);
  cursor: pointer;
  text-align: left;
}

.doc-toc-count {
  margin-left: auto;
  font-weight: 500;
  font-size: 0.75rem;
  color: var(--tsk-text-subtle);
}

.doc-toc-chevron {
  flex-shrink: 0;
  color: var(--tsk-text-subtle);
  transition: transform var(--tsk-duration-fast) var(--tsk-ease-out);
}

.doc-toc-chevron.open {
  transform: rotate(90deg);
}

.doc-toc-list {
  margin: 0;
  padding: 0 var(--tsk-space-4) var(--tsk-space-4);
  list-style: none;
  border-top: 1px solid var(--tsk-border);
}

.doc-toc-list li {
  margin: 0;
  padding: 0.35rem 0;
  line-height: 1.45;
}

.doc-toc-list a {
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text-muted);
  text-decoration: none;
}

.doc-toc-list a:hover {
  color: var(--tsk-accent);
}

.doc-toc-list .level-3 {
  padding-left: 1rem;
}

.doc-toc-list .level-4 {
  padding-left: 2rem;
}
</style>
