<template>
  <Transition name="tsk-back-top">
    <button
      v-show="isVisible"
      type="button"
      class="back-top"
      aria-label="Back to top"
      @click="scrollToTop"
    >
      <Icon name="arrow-up" :size="20" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Icon from "./Icon.vue";

const isVisible = ref(false);

function handleScroll() {
  isVisible.value = window.scrollY > 320;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.back-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 1px solid var(--tsk-border);
  border-radius: var(--tsk-radius-full);
  background: var(--tsk-bg-elevated);
  color: var(--tsk-accent);
  cursor: pointer;
  box-shadow: var(--tsk-shadow-md);
  transition:
    transform var(--tsk-duration-fast) var(--tsk-ease-spring),
    background var(--tsk-duration-fast) var(--tsk-ease-out),
    color var(--tsk-duration-fast) var(--tsk-ease-out);
}

.back-top:hover {
  background: var(--tsk-accent-soft);
  color: var(--tsk-accent);
}

.tsk-back-top-enter-active,
.tsk-back-top-leave-active {
  transition:
    opacity var(--tsk-duration-normal) var(--tsk-ease-out),
    transform var(--tsk-duration-normal) var(--tsk-ease-out);
}

.tsk-back-top-enter-from,
.tsk-back-top-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}

@media (max-width: 640px) {
  .back-top {
    bottom: 1.25rem;
    right: 1.25rem;
  }
}
</style>
