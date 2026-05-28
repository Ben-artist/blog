<template>
  <nav
    v-if="headers.length > 0"
    class="toc tsk-fade-in"
    aria-label="Table of contents"
  >
    <p class="toc-label">
      <Icon name="layers" :size="15" />
      On this page
    </p>
    <ul class="toc-list">
      <template v-for="item in headers" :key="item.link">
        <li v-if="item.level === 2" class="toc-item">
          <a :href="item.link" class="toc-link toc-h2">{{ item.title }}</a>
        </li>
        <li v-else-if="item.level === 3" class="toc-item toc-item-nested">
          <a :href="item.link" class="toc-link toc-h3">{{ item.title }}</a>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useData, onContentUpdated } from "vitepress";
import { shallowRef } from "vue";
import { getHeaders } from "../utils";
import Icon from "./Icon.vue";

const { frontmatter, theme } = useData();
const headers = shallowRef<{ title: string; link: string; level: number }[]>([]);

onContentUpdated(() => {
  headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
});
</script>

<style scoped>
.toc {
  width: 16rem;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  padding: var(--tsk-space-4);
  border-radius: var(--tsk-radius-md);
  border: 1px solid var(--tsk-border);
  background: var(--tsk-bg-elevated);
  box-shadow: var(--tsk-shadow-sm);
}

.toc-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 var(--tsk-space-3);
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--tsk-text-subtle);
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.toc-item-nested {
  padding-left: 0.85rem;
}

.toc-link {
  display: block;
  padding: 0.35rem 0.5rem;
  font-size: var(--tsk-font-sm);
  line-height: 1.4;
  color: var(--tsk-text-muted);
  text-decoration: none;
  border-radius: var(--tsk-radius-sm);
  border-left: 2px solid transparent;
  transition:
    color var(--tsk-duration-fast) var(--tsk-ease-out),
    background var(--tsk-duration-fast) var(--tsk-ease-out),
    border-color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.toc-link:hover {
  color: var(--tsk-accent);
  background: var(--tsk-accent-soft);
  text-decoration: none;
}

.toc-h2 {
  font-weight: 500;
}

.toc-h3 {
  font-size: var(--tsk-font-sm);
}

@media (min-width: 1400px) {
  .toc {
    position: fixed;
    top: 5.5rem;
    left: max(1rem, calc((100vw - 920px) / 2 - 18rem));
  }
}

@media (max-width: 1399px) {
  .toc {
    display: none;
  }
}
</style>
