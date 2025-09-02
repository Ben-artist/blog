<template>
  <div class="statistics">
    <div class="title-wrapper">
      <div class="title">
        <span>访问统计</span>
        <span class="title-hover">访问统计</span>
      </div>
      <svg class="chart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 17V9M12 17V5M6 17v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="statistics-main">
      <div class="statistics-wrapper">
        <span class="statistics-title">总访问量</span>
        <span class="statistics-pv" id="pv">{{ pv }}</span>
      </div>
      <div class="chart pv-wrapper">
        <div class="pv-num" id="pvProgress" style="width: 70%"></div>
      </div>
      <div class="statistics-wrapper">
        <span class="statistics-title">独立访客</span>
        <span class="statistics-uv" id="uv">{{ uv }}</span>
      </div>
      <div class="chart uv-wrapper">
        <div class="uv-num" id="uvProgress" style="width: 45%"></div>
      </div>
    </div>
    <span id="busuanzi_value_site_pv" style="display: none" />
    <span id="busuanzi_value_site_uv" style="display: none" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const getSessionStorage = (key: string = "") => {
  return sessionStorage.getItem(key);
};
const setSessionStorage = (key: string, value: any) => {
  sessionStorage.setItem(key, value);
};
const numberWithCommas = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

let sessionPv = getSessionStorage("pv");
let sessionUv = getSessionStorage("uv");
const pv = ref<string | number>(
  sessionPv ? numberWithCommas(parseInt(sessionPv)) : "loading"
);
const uv = ref<string | number>(
  sessionUv ? numberWithCommas(parseInt(sessionUv)) : "loading"
);

let timeoutPV = 0;
const getPV = () => {
  if (timeoutPV) clearTimeout(timeoutPV);
  timeoutPV = window.setTimeout(() => {
    const $PV = document.querySelector("#busuanzi_value_site_pv");
    const text = $PV?.innerHTML;
    if ($PV && text) {
      const start = getSessionStorage("pv") || "1000";
      pv.value = numberWithCommas(parseInt(text));
      setSessionStorage("pv", text);
      // 调用封装的函数
      animateNumberAndProgressBar({
        counterSelector: "#pv",
        fillBarSelector: "#pvProgress",
        start: parseFloat(start),
        end: parseInt(text),
        totalDuration: 2000,
        minPercentage: 5,
        targetPercentage: 75,
      });
    } else {
      getPV();
    }
  }, 500);
};

let timeoutUV = 0;
const getUV = () => {
  if (timeoutUV) clearTimeout(timeoutUV);
  timeoutUV = window.setTimeout(() => {
    const $UV = document.querySelector("#busuanzi_value_site_uv");
    const text = $UV?.innerHTML;
    if ($UV && text) {
      const text = $UV.innerHTML;
      const start = getSessionStorage("uv") || "1000";
      uv.value = numberWithCommas(parseInt(text));
      setSessionStorage("uv", text);
      // 调用封装的函数
      animateNumberAndProgressBar({
        counterSelector: "#uv",
        fillBarSelector: "#uvProgress",
        start: parseFloat(start),
        end: parseInt(text),
        totalDuration: 2000,
        minPercentage: 5,
        targetPercentage: 50,
      });
    } else {
      getUV();
    }
  }, 500);
};

// 统计数字动画
const animateNumberAndProgressBar = ({
  counterSelector,
  fillBarSelector,
  start = 0,
  end,
  totalDuration = 2000,
  minPercentage = 5,
  targetPercentage = 75,
}) => {
  // 如果开始和结束的数字相同，直接返回
  if (start == end) {
    return;
  }
  // 调整进度条起始位置，要基本符合进度条的长度
  const maxNum = (end * 100) / targetPercentage;
  let startPercentage = (start / maxNum) * 100;

  const counterElement = document.querySelector(counterSelector);
  const fillBarElement = document.querySelector(fillBarSelector);

  let startTime = null;
  const totalSteps = end - start;

  function animateCounter(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - (startTime ?? timestamp);

    const progress = Math.min(elapsed / totalDuration, 1);
    const currentNumber = Math.floor(start + progress * totalSteps);
    let stepPercentage = progress * (targetPercentage - startPercentage);
    // 保证肉眼能看到至少5%的变化
    if (targetPercentage - startPercentage < minPercentage) {
      stepPercentage = progress * minPercentage;
      startPercentage = targetPercentage - minPercentage;
    }

    const currentProgress = startPercentage + stepPercentage;

    counterElement.textContent = numberWithCommas(currentNumber);
    fillBarElement.style.width = currentProgress + "%";

    if (fillBarElement.style.display !== "block") {
      fillBarElement.style.display = "block";
    }

    if (progress < 1) {
      requestAnimationFrame(animateCounter);
    }
  }

  fillBarElement.style.width = startPercentage + "%";
  fillBarElement.style.display = "block";

  requestAnimationFrame(animateCounter);
};

onMounted(() => {
  getUV();
  getPV();
});
</script>

<style scoped>
.statistics {
  width: 100%;
  display: inline-block;
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-brand-light);
  font-weight: bold;
  padding: 15px;
  box-shadow: 3px 3px var(--vp-c-brand);
  border: 2px solid #3f4e4f;
  transition: all 0.3s ease;
}

.statistics:hover {
  color: var(--vp-c-brand-light);
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px var(--vp-c-brand);
}

.title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  font-size: 1em;
  line-height: 1.3;
  font-weight: bold;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  color: var(--vp-c-brand-light);
}

.title-hover {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  overflow: hidden;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-brand);
  transition: width 0.4s ease-in-out;
}

.statistics:hover .title-hover {
  width: 100%;
}

.statistics-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart {
  height: 12px;
  border-radius: 6px;
  background-color: #3f4e4f;
  margin-bottom: 12px;
  overflow: hidden;
}

.chart > div {
  height: 100%;
  border-radius: 6px;
  background-color: var(--vp-c-brand);
  transition: width 0.3s ease;
}

.pv-wrapper {
  margin-bottom: 12px;
}

.statistics-title {
  font-size: 0.9em;
  line-height: 1.3;
  font-weight: bold;
  color: var(--vp-c-brand-light);
}

.statistics-pv,
.statistics-uv {
  font-size: 1em;
  font-weight: bold;
  color: var(--vp-c-brand);
}

.chart-icon {
  width: 18px;
  height: 18px;
  color: var(--vp-c-brand);
  transition: all 0.3s ease;
}

.statistics:hover .chart-icon {
  transform: scale(1.05);
  color: var(--vp-c-brand);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics {
    padding: 12px;
    margin: 12px 0;
    max-width: 100%;
  }
  
  .title {
    font-size: 0.95em;
  }
  
  .statistics-title {
    font-size: 0.85em;
  }
  
  .statistics-pv,
  .statistics-uv {
    font-size: 0.9em;
  }
  
  .chart-icon {
    width: 16px;
    height: 16px;
  }
}
</style>