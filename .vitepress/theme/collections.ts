/**
 * 文章合集配置：slug 对应 posts 目录下的文件名（不含 .md）
 */
export interface CollectionConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  /** posts 目录下的文件名，不含扩展名 */
  slugs: string[];
}

export const collections: CollectionConfig[] = [
  {
    id: "frontend-frameworks",
    title: "前端框架",
    description: "React Fiber、Vue 响应式与虚拟 DOM、Diff 等框架内核",
    icon: "⚛️",
    accent: "#c45c26",
    slugs: [
      "react-implementation",
      "fiber-scheduler",
      "vue2-reactive-system",
      "dependency-collection",
      "virtualDomToRealDom",
      "diff",
    ],
  },
  {
    id: "browser-javascript",
    title: "浏览器与 JavaScript",
    description: "渲染流程、缓存、事件循环、Promise 与语言细节",
    icon: "🌐",
    accent: "#2a7f8e",
    slugs: [
      "browser-rendering",
      "browser-cache",
      "composite-layers",
      "event-loop",
      "houdini",
      "js-confuse-concept",
      "destructuring",
      "promise-deep-dive",
    ],
  },
  {
    id: "network-security",
    title: "网络与云安全",
    description: "TCP/IP、HTTPS、Nginx、AWS VPC 与网络安全",
    icon: "🔐",
    accent: "#5c4d9e",
    slugs: [
      "network-basics",
      "network-address",
      "http-to-https",
      "nginx",
      "aws",
    ],
  },
  {
    id: "web3",
    title: "Web3 与区块链",
    description: "区块链原理、DeFi、钱包与链上机制",
    icon: "⛓️",
    accent: "#8b6914",
    slugs: ["web3-concept", "block-chain"],
  },
  {
    id: "algorithms",
    title: "算法与数据结构",
    description: "经典算法题与回溯、链表等专题",
    icon: "🧮",
    accent: "#3d6b4f",
    slugs: ["algorithm-linked-list-addition", "backtracking-algorithm"],
  },
  {
    id: "engineering",
    title: "工程化与编程素养",
    description: "包管理、GraphQL、TypeScript、设计模式与代码质量",
    icon: "🛠️",
    accent: "#a15000",
    slugs: [
      "pnpm-deep-dive",
      "GraphQL",
      "function_program",
      "programming-skills",
      "code-quality",
      "dependency-inversion",
      "ts-design",
    ],
  },
  {
    id: "career",
    title: "面试与实战",
    description: "大厂前端面试与实战知识点梳理",
    icon: "🎯",
    accent: "#b84a62",
    slugs: ["面试"],
  },
  {
    id: "ai-agent",
    title: "AI 与 Agent",
    description: "大模型、Agent、Deep Agents、Skill 与 AI 实践",
    icon: "🤖",
    accent: "#5b6eae",
    slugs: [
      "ai-interview-memory-overflow",
      "ai-skills-authoring",
      "ai-deepagents-intro",
      "ai-rerank-intro",
      "ai-rerank-algorithms",
    ],
  },
];

/** 根据 slug 在 posts 列表中解析文章 */
export function slugToPath(slug: string): string {
  return `/posts/${slug}.html`;
}
