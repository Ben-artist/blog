/// <reference types="vite/client" />
/// <reference types="vitepress/client" />

interface Window {
  _hmt?: unknown[];
}

interface ImportMetaEnv {
  readonly VITE_BAIDU_HM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
