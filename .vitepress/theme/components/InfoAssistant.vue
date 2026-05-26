<template>
  <div class="info-shell">
    <iframe
      class="info-frame"
      :src="infoAssistantUrl"
      title="TSK 信息助手"
      allow="clipboard-write"
      referrerpolicy="no-referrer-when-downgrade"
    />
  </div>
</template>

<script setup lang="ts">
import { useData } from "vitepress";

const { theme } = useData();

/** 嵌入的信息助手页面地址（与博客同域部署时 iframe 体验最佳） */
const infoAssistantUrl =
  (theme.value.infoAssistantUrl as string) || "https://1996tsk.top/info/";
</script>

