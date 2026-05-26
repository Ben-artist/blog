<template>
  <section
    class="tsk-section collections tsk-fade-in"
    aria-labelledby="collections-preview-title"
  >
    <div class="tsk-section-header">
      <h2 id="collections-preview-title" class="tsk-section-title">
        <Icon name="layers" :size="20" />
        文章合集
      </h2>
      <a :href="withBase('/collections')" class="tsk-section-link">
        查看全部
        <Icon name="arrow-right" :size="14" />
      </a>
    </div>
    <div class="grid">
      <a
        v-for="(item, index) in collectionList"
        :key="item.id"
        :href="withBase(`/collections?id=${item.id}`)"
        class="collection-card tsk-card"
        :style="{
          '--collection-accent': item.accent,
          animationDelay: `${index * 50}ms`,
        }"
      >
        <span class="collection-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="collection-name">{{ item.title }}</span>
        <span class="collection-count">{{ item.posts.length }} 篇</span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { collections } from "../collections";
import { initCollections, type Post } from "../utils";
import Icon from "./Icon.vue";

const { theme } = useData();
const collectionList = computed(() =>
  initCollections((theme.value.posts as Post[]) || [], collections),
);
</script>

<style scoped>
.collections {
  margin-bottom: var(--tsk-space-6);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: var(--tsk-space-3);
}

.collection-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: var(--tsk-space-5) var(--tsk-space-3);
  text-align: center;
  animation: tsk-fade-up var(--tsk-duration-slow) var(--tsk-ease-out) both;
  border-color: color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 18%, var(--tsk-border));
}

.collection-card:hover {
  border-color: color-mix(in srgb, var(--collection-accent, var(--tsk-accent)) 40%, var(--tsk-border-strong));
}

.collection-icon {
  font-size: 1.65rem;
  line-height: 1;
  transition: transform var(--tsk-duration-normal) var(--tsk-ease-spring);
}

.collection-card:hover .collection-icon {
  transform: scale(1.1);
}

.collection-name {
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  line-height: 1.3;
  color: var(--tsk-text);
}

.collection-count {
  font-size: var(--tsk-font-sm);
  font-weight: 500;
  color: var(--collection-accent, var(--tsk-text-subtle));
}
</style>
