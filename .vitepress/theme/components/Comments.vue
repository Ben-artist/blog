<template>
  <ClientOnly>
    <div ref="utterancesRoot" class="comments" aria-label="评论区" />
    <p v-if="loadError" class="comments-fallback">
      评论需先在 GitHub 仓库
      <a :href="repoUrl" target="_blank" rel="noopener noreferrer">{{ comments.repo }}</a>
      开启 Issues。也可直接在仓库提 Issue 交流。
    </p>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { onContentUpdated, useData } from "vitepress";

const { theme } = useData();
const utterancesRoot = ref<HTMLElement | null>(null);
const loadError = ref(false);

const comments = theme.value.comments ?? {
  repo: "Ben-artist/blog",
};

const repoUrl = `https://github.com/${comments.repo}`;

/**
 * 使用 Utterances 加载评论（无需 Client Secret，基于 GitHub Issues）。
 */
function mountUtterances() {
  const root = utterancesRoot.value;
  if (!root) return;

  root.innerHTML = "";
  loadError.value = false;

  const script = document.createElement("script");
  script.src = "https://utterances.client.js";
  script.async = true;
  script.setAttribute("repo", comments.repo);
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("theme", "preferred-color-scheme");
  script.setAttribute("crossorigin", "anonymous");
  script.setAttribute("label", "comment");
  script.setAttribute("lang", "zh-CN");

  script.onerror = () => {
    loadError.value = true;
  };

  root.appendChild(script);
}

onContentUpdated(() => {
  mountUtterances();
});
</script>

<style scoped>
.comments {
  margin-top: var(--tsk-space-6);
  max-width: 100%;
  padding: var(--tsk-space-5);
  border-radius: var(--tsk-radius-md);
  border: 1px solid var(--tsk-border);
  background: var(--tsk-bg-elevated);
}

.comments-fallback {
  margin-top: var(--tsk-space-4);
  padding: var(--tsk-space-4) var(--tsk-space-5);
  border-radius: var(--tsk-radius-sm);
  border: 1px dashed var(--tsk-border-strong);
  font-size: 0.9rem;
  color: var(--tsk-text-muted);
  line-height: 1.65;
  background: var(--tsk-accent-soft);
}

.comments-fallback a {
  color: var(--tsk-accent);
  font-weight: 500;
}
</style>
