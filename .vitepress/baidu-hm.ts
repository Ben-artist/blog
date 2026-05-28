/** 百度统计默认站点 ID（hm.js? 后字符串）；可用环境变量 `VITE_BAIDU_HM_ID` 覆盖 */
export const BAIDU_HM_ID_DEFAULT = "564b9e1b926fa23d62b536eee71f9d16";

/**
 * 解析当前构建使用的百度统计 ID
 * @returns hm.js 查询参数中的站点 ID
 */
export function getBaiduHmId(): string {
  return process.env.VITE_BAIDU_HM_ID?.trim() || BAIDU_HM_ID_DEFAULT;
}
