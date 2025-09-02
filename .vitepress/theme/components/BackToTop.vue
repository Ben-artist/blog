<template>
  <div v-if="isVisible" class="back-to-top" @click="scrollToTop">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-to-line"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
</div>  
</template>

<script>
export default {
  data() {
    return {
      isVisible: false,
    };
  },
  methods: {
    handleScroll() {
      this.isVisible = window.scrollY > 200; // 当滚动超过200px时显示按钮
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 平滑滚动到顶部
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
};
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 100px;
  right: 100px;
  font-size: 24px;
  color: #fff;
  background-color: #3aaacf;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 1000; /* 确保按钮在其他元素之上 */
  font-size: 24px; /* 增大箭头的字体大小 */
}
</style>