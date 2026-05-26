<script setup lang="ts">
/**
 * Inline SVG icons (Lucide-style strokes) for consistent UI chrome.
 */
const props = withDefaults(
  defineProps<{
    name:
      | "home"
      | "user"
      | "books"
      | "tag"
      | "archive"
      | "arrow-right"
      | "arrow-left"
      | "calendar"
      | "clock"
      | "sparkles"
      | "mail"
      | "folder"
      | "chevron-right"
      | "layers"
      | "arrow-up";
    size?: number;
    strokeWidth?: number;
  }>(),
  { size: 18, strokeWidth: 1.75 },
);

const paths: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z M9 21V12h6v9",
  user: "M20 21a8 8 0 1 0-16 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  books:
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z M8 7h8 M8 11h6",
  tag: "M12.586 2.586A2 2 0 0 1 14 2h5a1 1 0 0 1 1 1v5a2 2 0 0 1-.586 1.414L9.828 15.172a4 4 0 0 1-5.656 0l-.172-.172a4 4 0 0 1 0-5.656l8.586-8.586Z M7 7h.01",
  archive:
    "M21 8v13H3V8 M1 3h22v5H1z M10 12h4",
  "arrow-right": "M5 12h14 M13 6l6 6-6 6",
  "arrow-left": "M19 12H5 M11 6l-6 6 6 6",
  calendar:
    "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  clock: "M12 6v6l4 2 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20",
  sparkles:
    "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.964 0L9.937 15.5Z M20 3v4 M22 5h-4 M4 17v4 M5 18H1",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M22 6l-10 7L2 6",
  folder: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
  "chevron-right": "M9 18l6-6-6-6",
  layers: "M12 2 2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5",
  "arrow-up": "M12 19V5 M5 12l7-7 7 7",
};
</script>

<template>
  <svg
    class="tsk-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name]" />
  </svg>
</template>

<style scoped>
.tsk-icon {
  display: block;
  flex-shrink: 0;
}
</style>
