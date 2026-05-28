<template>
  <ClientOnly>
    <section v-if="isPost" class="comments-wrap" aria-label="评论区">
      <p v-if="status === 'loading'" class="comments-status">评论加载中…</p>

      <div
        ref="utterancesRoot"
        class="comments"
        :class="{ 'is-ready': status === 'ready' }"
      />

      <p v-if="status === 'error'" class="comments-fallback">
        评论区未能加载。请确认仓库
        <a :href="repoUrl" target="_blank" rel="noopener noreferrer">{{
          comments.repo
        }}</a>
        为 Public、已开 Issues，且已安装
        <a
          href="https://github.com/apps/utterances"
          target="_blank"
          rel="noopener noreferrer"
          >Utterances</a
        >。
        <br />
        标签 <code>{{ comments.label }}</code> 须已存在。也可到
        <a :href="`${repoUrl}/issues`" target="_blank" rel="noopener noreferrer"
          >Issues</a
        >
        直接讨论。
        <br />
        <button type="button" class="comments-retry" @click="remount">
          重新加载
        </button>
      </p>
    </section>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useData, useRoute, withBase } from "vitepress";
import { regularPathFromRoute } from "../utils";

interface CommentsConfig {
  repo: string;
  label?: string;
  issueTerm?: string;
}

const { theme } = useData();
const route = useRoute();
const utterancesRoot = ref<HTMLElement | null>(null);
const status = ref<"loading" | "ready" | "error">("loading");

const comments: CommentsConfig = {
  repo: "Ben-artist/blog",
  label: "Comment",
  issueTerm: "pathname",
  ...(theme.value.comments as CommentsConfig | undefined),
};

const repoUrl = `https://github.com/${comments.repo}`;
const isPost = computed(() => !!regularPathFromRoute(route.path));

let mountedPath = "";
let failTimer = 0;
let observer: MutationObserver | null = null;

function clearWatchers() {
  if (failTimer) {
    window.clearTimeout(failTimer);
    failTimer = 0;
  }
  observer?.disconnect();
  observer = null;
}

/** Utterances 会在挂载容器内插入 .utterances > iframe */
function detectUtterances(root: HTMLElement): boolean {
  return !!(
    root.querySelector(".utterances iframe") ||
    root.querySelector("iframe.utterances-frame") ||
    root.querySelector("iframe[src*='utterances']")
  );
}

function markReady() {
  clearWatchers();
  status.value = "ready";
}

function markError() {
  clearWatchers();
  status.value = "error";
}

function watchForIframe(root: HTMLElement) {
  if (detectUtterances(root)) {
    markReady();
    return;
  }

  observer = new MutationObserver(() => {
    if (detectUtterances(root)) markReady();
  });
  observer.observe(root, { childList: true, subtree: true });

  failTimer = window.setTimeout(() => {
    if (status.value === "loading") markError();
  }, 10_000);
}

/**
 * 挂载 Utterances。同一 pathname 不重复销毁，避免一直停在加载中。
 */
function mountUtterances(force = false) {
  if (!isPost.value) return;

  const root = utterancesRoot.value;
  if (!root) return;

  const path = window.location.pathname;
  if (!force && path === mountedPath && detectUtterances(root)) {
    markReady();
    return;
  }

  clearWatchers();
  mountedPath = path;
  status.value = "loading";
  root.innerHTML = "";

  const script = document.createElement("script");
  // 官方 utterances.client.js / utteranc.es 在部分网络下会被墙，用 jsDelivr + 本地备份
  const utterancesSources = [
    withBase("/utterances.client.js"),
    "https://utteranc.es/client.js",
  ];
  let sourceIndex = 0;

  const tryNextSource = () => {
    sourceIndex += 1;
    if (sourceIndex >= utterancesSources.length) {
      markError();
      return;
    }
    script.src = utterancesSources[sourceIndex]!;
  };

  script.onerror = tryNextSource;
  script.async = true;
  script.setAttribute("repo", comments.repo);
  script.setAttribute("issue-term", comments.issueTerm ?? "pathname");
  script.setAttribute("theme", "github-light");
  script.setAttribute("lang", "zh-CN");
  if (comments.label) script.setAttribute("label", comments.label);

  script.onload = () => {
    watchForIframe(root);
  };

  script.src = utterancesSources[0]!;
  root.appendChild(script);
  watchForIframe(root);
}

function remount() {
  mountedPath = "";
  mountUtterances(true);
}

/** Utterances iframe 通过 postMessage 通知就绪与高度变化 */
function onUtterancesMessage(event: MessageEvent) {
  const data = event.data;
  if (data && typeof data === "object" && "type" in data) {
    if (data.type === "resize" && status.value === "loading") markReady();
    return;
  }
  if (typeof data === "string" && data.startsWith("utterances:")) {
    if (status.value === "loading") markReady();
  }
}

async function setup() {
  if (!isPost.value) return;
  await nextTick();
  mountUtterances();
}

onMounted(() => {
  window.addEventListener("message", onUtterancesMessage);
  setup();
});

onUnmounted(() => {
  window.removeEventListener("message", onUtterancesMessage);
  clearWatchers();
});

watch(
  () => route.path,
  () => {
    setup();
  },
);
</script>

<style scoped>
.comments-wrap {
  margin-top: var(--tsk-space-6);
}

.comments-status {
  margin: 0 0 var(--tsk-space-3);
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text-subtle);
}

.comments {
  min-height: 0;
  max-width: 100%;
}

.comments.is-ready {
  padding: var(--tsk-space-2) 0;
}

.comments :deep(.utterances) {
  max-width: 100%;
}

.comments-fallback {
  margin: 0;
  padding: var(--tsk-space-4) var(--tsk-space-5);
  border-radius: var(--tsk-radius-sm);
  border: 1px dashed var(--tsk-border-strong);
  font-size: 0.9rem;
  color: var(--tsk-text-muted);
  line-height: 1.75;
  background: var(--tsk-bg-elevated);
}

.comments-fallback a {
  color: var(--tsk-accent);
  font-weight: 500;
}

.comments-fallback code {
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  background: var(--tsk-bg);
  font-size: 0.85em;
}

.comments-retry {
  margin-top: var(--tsk-space-3);
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--tsk-border);
  border-radius: var(--tsk-radius-sm);
  background: var(--tsk-bg);
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text);
  cursor: pointer;
}

.comments-retry:hover {
  border-color: var(--tsk-accent);
  color: var(--tsk-accent);
}
</style>
