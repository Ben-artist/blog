/**
 * 百度统计 SPA 路由上报（构建时需设置 `VITE_BAIDU_HM_ID`）
 * @param path - 含 base 的完整路径，如 `/blog/posts/foo.html`
 */
export function trackBaiduPageview(path: string): void {
  const id = import.meta.env.VITE_BAIDU_HM_ID;
  if (!id || typeof window === "undefined") return;
  window._hmt = window._hmt || [];
  window._hmt.push(["_trackPageview", path]);
}
