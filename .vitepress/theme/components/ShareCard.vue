<template>
  <section class="intro tsk-fade-in" aria-label="Introduction">
    <p class="intro-eyebrow">
      <Icon name="sparkles" :size="16" />
      <span>Technical writing & deep dives</span>
    </p>
    <h1 class="intro-title">Hi, I'm <em>TSK</em></h1>
    <p class="intro-desc">
      前端开发者 · 框架原理 · 浏览器机制 · 网络与安全 · Web3
    </p>
    <a :href="withBase('/about')" class="intro-cta">
      <span>了解更多</span>
      <Icon name="arrow-right" :size="16" />
    </a>
  </section>
</template>

<script setup lang="ts">
import { withBase } from "vitepress";
import Icon from "./Icon.vue";
</script>

<style scoped>
.intro {
  text-align: center;
  padding: 0 var(--tsk-space-5) var(--tsk-space-6);
  max-width: 36rem;
  margin-inline: auto;
}

.intro-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 var(--tsk-space-4);
  padding: 0.35rem 0.85rem;
  font-size: var(--tsk-font-sm);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--tsk-text-muted);
  background: var(--tsk-accent-soft);
  border-radius: var(--tsk-radius-full);
  border: 1px solid var(--tsk-border);
}

.intro-title {
  margin: 0 0 var(--tsk-space-3);
  font-family: var(--tsk-font-display);
  font-size: clamp(2rem, 4.5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--tsk-text);
}

.intro-title em {
  font-style: italic;
  color: var(--tsk-accent);
}

.intro-desc {
  margin: 0 0 var(--tsk-space-5);
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--tsk-text-muted);
}

.intro-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tsk-bg-elevated);
  background: var(--tsk-accent);
  border-radius: var(--tsk-radius-full);
  text-decoration: none;
  box-shadow: 0 4px 14px var(--tsk-accent-glow);
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-spring),
    background var(--tsk-duration-fast) var(--tsk-ease-out),
    box-shadow var(--tsk-duration-fast) var(--tsk-ease-out);
}

.intro-cta:hover {
  background: var(--tsk-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--tsk-accent-glow);
  text-decoration: none;
}
</style>
