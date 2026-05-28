<template>
  <nav
    v-if="hasNav"
    class="post-nav tsk-fade-in"
    aria-label="文章导航"
  >
    <div v-if="nav.prev || nav.next" class="post-nav-series">
      <p v-if="nav.collection" class="post-nav-label">
        <a :href="withBase(`/collections?id=${nav.collection.id}`)">
          {{ nav.collection.icon }} {{ nav.collection.title }}
        </a>
      </p>
      <div class="post-nav-adjacent">
        <a
          v-if="nav.prev"
          :href="withBase(nav.prev.regularPath)"
          class="post-nav-card tsk-card prev"
        >
          <span class="post-nav-dir">
            <Icon name="arrow-left" :size="14" />
            上一篇
          </span>
          <span class="post-nav-title">{{ nav.prev.frontMatter.title }}</span>
        </a>
        <span v-else class="post-nav-spacer" aria-hidden="true" />
        <a
          v-if="nav.next"
          :href="withBase(nav.next.regularPath)"
          class="post-nav-card tsk-card next"
        >
          <span class="post-nav-dir">
            下一篇
            <Icon name="arrow-right" :size="14" />
          </span>
          <span class="post-nav-title">{{ nav.next.frontMatter.title }}</span>
        </a>
      </div>
    </div>

    <section v-if="nav.related.length" class="post-nav-related">
      <h2 class="post-nav-related-title">同合集推荐</h2>
      <ul class="post-nav-related-list">
        <li v-for="item in nav.related" :key="item.regularPath">
          <a :href="withBase(item.regularPath)" class="post-nav-related-link">
            {{ item.frontMatter.title }}
          </a>
        </li>
      </ul>
    </section>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useData, useRoute, withBase } from "vitepress";
import { collections } from "../collections";
import { getPostNav, regularPathFromRoute, type Post } from "../utils";
import Icon from "./Icon.vue";

const route = useRoute();
const { theme } = useData();

const nav = computed(() =>
  getPostNav(
    route.path,
    (theme.value.posts as Post[]) || [],
    collections,
  ),
);

const hasNav = computed(
  () =>
  !!regularPathFromRoute(route.path) &&
    (!!nav.value.prev ||
      !!nav.value.next ||
      nav.value.related.length > 0),
);
</script>

<style scoped>
.post-nav {
  margin: var(--tsk-space-8) 0 var(--tsk-space-6);
  padding-top: var(--tsk-space-6);
  border-top: 1px solid var(--tsk-border);
}

.post-nav-label {
  margin: 0 0 var(--tsk-space-3);
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  color: var(--tsk-text-muted);
}

.post-nav-label a {
  color: var(--tsk-text-muted);
  text-decoration: none;
}

.post-nav-label a:hover {
  color: var(--tsk-accent);
}

.post-nav-adjacent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--tsk-space-3);
}

@media (max-width: 640px) {
  .post-nav-adjacent {
    grid-template-columns: 1fr;
  }
}

.post-nav-spacer {
  display: none;
}

.post-nav-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: var(--tsk-space-4);
  text-decoration: none;
  min-width: 0;
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-out),
    border-color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.post-nav-card:hover {
  transform: translateY(-2px);
  border-color: var(--tsk-accent);
  text-decoration: none;
}

.post-nav-card.next {
  text-align: right;
}

.post-nav-dir {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--tsk-text-subtle);
}

.post-nav-title {
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  line-height: 1.4;
  color: var(--tsk-text);
}

.post-nav-related {
  margin-top: var(--tsk-space-6);
}

.post-nav-related-title {
  margin: 0 0 var(--tsk-space-3);
  font-family: var(--tsk-font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--tsk-text);
}

.post-nav-related-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--tsk-space-2);
}

.post-nav-related-link {
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text-muted);
  text-decoration: none;
}

.post-nav-related-link:hover {
  color: var(--tsk-accent);
}
</style>
