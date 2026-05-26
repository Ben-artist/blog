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
      <p class="about-lead">
        前端开发者，专注框架原理、浏览器机制、网络与安全、Web3 等技术深度写作。
        这个博客用<strong>深入浅出</strong>的方式记录学习笔记，每篇文章都尽量配有示例与图示。
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
      </div>
    </header>

    <section class="about-section">
      <h2>
        <Icon name="sparkles" :size="20" />
        推荐阅读路径
      </h2>
      <p class="section-hint">按主题合集循序渐进，比单篇随机阅读更系统。</p>
      <ol class="reading-path">
        <li v-for="(item, index) in collections" :key="item.id">
          <a
            :href="withBase(`/collections?id=${item.id}`)"
            class="path-card tsk-card"
            :style="{ animationDelay: `${Number(index) * 50}ms` }"
          >
            <span class="path-index">{{ Number(index) + 1 }}</span>
            <span class="path-icon" aria-hidden="true">{{ item.icon }}</span>
            <span class="path-text">
              <strong>{{ item.title }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <Icon name="chevron-right" :size="18" class="path-arrow" />
          </a>
        </li>
      </ol>
    </section>
  </article>
</template>

<script setup lang="ts">
import { useData, withBase } from "vitepress";
import { collections } from "../collections";
import Icon from "./Icon.vue";

const { theme } = useData();

const personalSiteUrl =
  (theme.value.personalSiteUrl as string) || "https://1996tsk.top/";
</script>

<style scoped>
.about {
  margin: 0 auto;
  padding: var(--tsk-space-5) var(--tsk-space-5) var(--tsk-space-8);
  max-width: 42rem;
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
  margin: 0 0 var(--tsk-space-3);
  font-family: var(--tsk-font-display);
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--tsk-text);
}

.about-lead {
  margin: 0 auto var(--tsk-space-5);
  max-width: 34rem;
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
