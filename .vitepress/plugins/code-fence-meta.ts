import type MarkdownIt from "markdown-it";

/**
 * 解析 ```lang:startLine:endLine:file/path 形式的代码块信息。
 * 例如 ```js:271:302:fiber/react-dom.js → 语言 js，标题 fiber/react-dom.js:271-302
 */
const CODE_FENCE_META_RE = /^([\w+#-]+):(\d+):(\d+):(.+)$/;

/**
 * 注册 markdown-it 插件，使带行号/文件路径的 fence 仍能获得 Shiki 高亮。
 * @param md markdown-it 实例
 */
export function codeFenceMetaPlugin(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence;
  if (!defaultFence) return;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const rawInfo = token.info.trim();

    const match = rawInfo.match(CODE_FENCE_META_RE);
    if (match) {
      const [, lang, startLine, endLine, filePath] = match;
      token.info = `${lang} [${filePath}:${startLine}-${endLine}]`;
    }

    return defaultFence(tokens, idx, options, env, self);
  };
}
