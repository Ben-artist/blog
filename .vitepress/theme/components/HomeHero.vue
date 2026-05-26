<template>
  <div class="hero-wrap tsk-fade-in">
    <div class="hero-glow" aria-hidden="true" />
    <img
      :src="withBase(theme.logo)"
      width="112"
      height="112"
      alt="TSK"
      class="avatar"
    />
  </div>
</template>

<script setup lang="ts">
import { useData, withBase } from "vitepress";

const { theme } = useData();
</script>

<style scoped>
.hero-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--tsk-space-7) var(--tsk-space-4) var(--tsk-space-5);
  min-height: 200px;
}

.hero-glow {
  position: absolute;
  inset: 10% 20%;
  background: radial-gradient(
    circle,
    var(--tsk-accent-glow) 0%,
    transparent 70%
  );
  filter: blur(24px);
  opacity: 0.6;
  animation: tsk-float 6s ease-in-out infinite;
}

.avatar {
  position: relative;
  z-index: 1;
  border-radius: 50%;
  border: 3px solid var(--tsk-bg-elevated);
  box-shadow: var(--tsk-shadow-md);
  transition:
    transform var(--tsk-duration-normal) var(--tsk-ease-spring),
    box-shadow var(--tsk-duration-normal) var(--tsk-ease-out);
}

.avatar:hover {
  transform: scale(1.04);
  box-shadow: var(--tsk-shadow-lg);
}

@media (prefers-reduced-motion: reduce) {
  .hero-glow {
    animation: none;
  }
}
</style>
