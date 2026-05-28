<template>
  <article class="about tsk-fade-in">
    <header class="about-hero">
      <img
        :src="withBase(theme.logo)"
        width="104"
        height="104"
        alt="TSK"
        class="about-avatar"
      />
      <h1>Hi，我是 TSK</h1>
      <p class="about-tagline">全栈 · AI / Agent · Web3</p>
      <ul class="about-roles" aria-label="能力方向">
        <li>全栈交付</li>
        <li>AI / RAG</li>
        <li>Web3</li>
      </ul>
      <p class="about-lead">
        全栈开发者，覆盖前端工程、Node 后端、<strong>AI Agent / RAG</strong> 与 Web3。
        博客用<strong>深入浅出</strong>的方式记录学习笔记，每篇尽量配有示例与图示。
      </p>
      <div class="about-links">
        <a
          :href="personalSiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="about-link about-link-primary"
        >
          <Icon name="home" :size="16" />
          个人主页
        </a>
        <a :href="withBase('/info')" class="about-link">
          <Icon name="sparkles" :size="16" />
          信息助手
        </a>
        <a
          href="https://github.com/tangtts"
          target="_blank"
          rel="noopener noreferrer"
          class="about-link"
        >
          <Icon name="user" :size="16" />
          GitHub
        </a>
        <a href="mailto:tskwangyi@gmail.com" class="about-link">
          <Icon name="mail" :size="16" />
          Email
        </a>
        <a :href="withBase('/collections')" class="about-link">
          <Icon name="books" :size="16" />
          全部合集
        </a>
        <a
          href="https://1996tsk.top/blog/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          class="about-link"
        >
          <Icon name="arrow-right" :size="16" />
          RSS
        </a>
      </div>
    </header>

    <section class="about-section about-intro">
      <h2>
        <Icon name="user" :size="20" />
        关于我
      </h2>
      <p
        v-for="(paragraph, i) in aboutIntroParagraphs"
        :key="i"
        class="about-paragraph"
      >
        {{ paragraph }}
      </p>
    </section>

    <section class="about-section about-stack">
      <h2>
        <Icon name="layers" :size="20" />
        技术栈
      </h2>
      <p class="section-hint">
        从前端、后端到 AI 与 Web3，图标即常用技术；全栈可独立负责需求到上线。
      </p>
      <div
        v-for="(group, gi) in techStackGroups"
        :key="group.id"
        class="stack-group"
        :style="{ animationDelay: `${Number(gi) * 50}ms` }"
      >
        <header class="stack-group-head">
          <h3>{{ group.title }}</h3>
          <p>{{ group.description }}</p>
        </header>
        <ul class="stack-icons">
          <li
            v-for="item in group.items"
            :key="`${group.id}-${item.name}`"
            class="stack-chip tsk-card"
          >
            <span class="stack-chip-icon" aria-hidden="true">
              <img
                v-if="techIconSrc(item)"
                :src="techIconSrc(item)!"
                :alt="item.name"
                width="28"
                height="28"
                loading="lazy"
                decoding="async"
              />
              <span v-else class="stack-chip-fallback">{{
                item.name.charAt(0)
              }}</span>
            </span>
            <span class="stack-chip-label">{{ item.name }}</span>
          </li>
        </ul>
      </div>
    </section>

   
  </article>
</template>

<script setup lang="ts">
import { useData, withBase } from "vitepress";
import {
  aboutIntroParagraphs,
  techIconSrc,
  techStackGroups,
} from "../about-tech-stack";
import Icon from "./Icon.vue";

const { theme } = useData();

const personalSiteUrl =
  (theme.value.personalSiteUrl as string) || "https://1996tsk.top/";
</script>

<style scoped>
.about {
  margin: 0 auto;
  padding: var(--tsk-space-5) var(--tsk-space-5) var(--tsk-space-8);
  max-width: 52rem;
}

.about-hero {
  text-align: center;
  margin-bottom: var(--tsk-space-8);
}

.about-avatar {
  border-radius: 50%;
  border: 3px solid var(--tsk-bg-elevated);
  box-shadow: var(--tsk-shadow-md);
  margin-bottom: var(--tsk-space-5);
  transition: transform var(--tsk-duration-normal) var(--tsk-ease-spring);
}

.about-avatar:hover {
  transform: scale(1.03);
}

.about-hero h1 {
  margin: 0 0 var(--tsk-space-2);
  font-family: var(--tsk-font-display);
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--tsk-text);
}

.about-tagline {
  margin: 0 0 var(--tsk-space-3);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--tsk-accent);
}

.about-roles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--tsk-space-2);
  margin: 0 0 var(--tsk-space-4);
  padding: 0;
  list-style: none;
}

.about-roles li {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--tsk-text-muted);
  background: var(--tsk-bg-elevated);
  border: 1px solid var(--tsk-border);
  border-radius: var(--tsk-radius-full);
}

.about-roles li:first-child {
  color: var(--tsk-accent);
  border-color: color-mix(in srgb, var(--tsk-accent) 40%, var(--tsk-border));
  background: color-mix(in srgb, var(--tsk-accent) 8%, var(--tsk-bg-elevated));
}

.about-lead {
  margin: 0 auto var(--tsk-space-5);
  max-width: 36rem;
  line-height: 1.75;
  color: var(--tsk-text-muted);
}

.about-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tsk-space-2);
  justify-content: center;
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: var(--tsk-font-sm);
  font-weight: 500;
  color: var(--tsk-text);
  background: var(--tsk-bg-elevated);
  border: 1px solid var(--tsk-border);
  border-radius: var(--tsk-radius-full);
  text-decoration: none;
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-out),
    border-color var(--tsk-duration-fast) var(--tsk-ease-out),
    box-shadow var(--tsk-duration-fast) var(--tsk-ease-out);
}

.about-link:hover {
  transform: translateY(-2px);
  border-color: var(--tsk-accent);
  box-shadow: var(--tsk-shadow-sm);
  text-decoration: none;
}

.about-link-primary {
  border-color: color-mix(in srgb, var(--tsk-accent) 35%, var(--tsk-border));
  color: var(--tsk-accent);
}

.about-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 var(--tsk-space-2);
  font-family: var(--tsk-font-display);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--tsk-text);
  border: none;
  padding: 0;
}

.section-hint {
  margin: 0 0 var(--tsk-space-5);
  font-size: 0.95rem;
  color: var(--tsk-text-muted);
}

.about-intro {
  margin-bottom: var(--tsk-space-8);
}

.about-paragraph {
  margin: 0 0 var(--tsk-space-4);
  line-height: 1.75;
  color: var(--tsk-text-muted);
}

.about-paragraph:last-child {
  margin-bottom: 0;
}

.about-stack {
  margin-bottom: var(--tsk-space-8);
}

.stack-group {
  margin-bottom: var(--tsk-space-6);
  animation: tsk-fade-up var(--tsk-duration-slow) var(--tsk-ease-out) both;
}

.stack-group:last-child {
  margin-bottom: 0;
}

.stack-group-head {
  margin-bottom: var(--tsk-space-3);
}

.stack-group-head h3 {
  margin: 0 0 0.2rem;
  font-family: var(--tsk-font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--tsk-text);
}

.stack-group-head p {
  margin: 0;
  font-size: var(--tsk-font-sm);
  color: var(--tsk-text-subtle);
}

.stack-icons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tsk-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.stack-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  min-width: 5.5rem;
  padding: var(--tsk-space-3) var(--tsk-space-3) var(--tsk-space-2);
  text-align: center;
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-out),
    border-color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.stack-chip:hover {
  transform: translateY(-2px);
  border-color: var(--tsk-accent);
}

.stack-chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--tsk-radius-md);
  background: var(--tsk-bg);
  border: 1px solid var(--tsk-border);
}

.stack-chip-icon img {
  display: block;
  width: 1.75rem;
  height: 1.75rem;
  object-fit: contain;
}

/* 深色模式下部分黑色 logo 仍可见 */
html.dark .stack-chip-icon img[src*="nextdotjs"],
html.dark .stack-chip-icon img[src*="openai"],
html.dark .stack-chip-icon img[src*="cursor"],
html.dark .stack-chip-icon img[src*="langchain"],
html.dark .stack-chip-icon img[src*="prisma"] {
  filter: invert(1) brightness(1.15);
}

.stack-chip-fallback {
  font-size: 1rem;
  font-weight: 700;
  color: var(--tsk-accent);
}

.stack-chip-label {
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.25;
  color: var(--tsk-text-muted);
  max-width: 6.5rem;
}

.reading-path {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--tsk-space-3);
}

.path-card {
  display: flex;
  align-items: center;
  gap: var(--tsk-space-3);
  animation: tsk-fade-up var(--tsk-duration-slow) var(--tsk-ease-out) both;
}

.path-index {
  font-size: var(--tsk-font-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--tsk-text-subtle);
  min-width: 1.25rem;
}

.path-icon {
  font-size: 1.35rem;
  line-height: 1;
}

.path-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.path-text strong {
  font-weight: 600;
  color: var(--tsk-text);
}

.path-text small {
  color: var(--tsk-text-muted);
  line-height: 1.45;
}

.path-arrow {
  flex-shrink: 0;
  color: var(--tsk-text-subtle);
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-out),
    color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.path-card:hover .path-arrow {
  transform: translateX(3px);
  color: var(--tsk-accent);
}
</style>
