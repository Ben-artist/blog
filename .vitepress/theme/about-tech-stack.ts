/**
 * 关于页技术栈：Simple Icons CDN（https://simpleicons.org）
 * slug 见 https://github.com/simple-icons/simple-icons/blob/develop/slugs.md
 */

export interface TechItem {
  name: string;
  /** Simple Icons slug（cdn.simpleicons.org）；无则显示首字母占位 */
  icon?: string;
  /** 完整图标 URL，用于 CDN 无该品牌时（优先于 icon） */
  iconSrc?: string;
  /** 品牌色，不含 # */
  color?: string;
}

export interface TechStackGroup {
  id: string;
  title: string;
  description: string;
  items: TechItem[];
}

export const aboutIntroParagraphs: string[] = [
  "我是全栈开发者：前端用 Vue3 / React / TypeScript / Vite 做业务与组件体系，后端用 Node.js + NestJS + MySQL / Redis + Prisma 打通接口与数据层，并能独立完成 Docker 部署与 CI/CD 交付。",
  "在 AI 方向，我持续实践 LLM 应用、Agent Harness、RAG 检索与重排、Skill 工程与上下文治理，用 LangChain、向量库与可观测链路把「能跑」做成「可维护、可迭代」。同时保持 Web3（Solidity / Hardhat / Ethers.js）与前端性能（Core Web Vitals、WASM、Worker）的长期投入。",
];

const SIMPLE_ICONS_NPM =
  "https://cdn.jsdelivr.net/npm/simple-icons@14.6.0/icons";

/** CDN 上缺失、需走 jsDelivr 的 Simple Icons slug */
const JSDELIVR_ICON_SLUGS = new Set(["openai"]);

/**
 * 解析技术栈图标地址。
 * @param item - 技术项配置
 */
export function techIconSrc(item: TechItem): string | null {
  if (item.iconSrc) return item.iconSrc;
  if (!item.icon) return null;
  if (JSDELIVR_ICON_SLUGS.has(item.icon)) {
    return `${SIMPLE_ICONS_NPM}/${item.icon}.svg`;
  }
  const base = `https://cdn.simpleicons.org/${item.icon}`;
  return item.color ? `${base}/${item.color}` : base;
}

export const techStackGroups: TechStackGroup[] = [
  {
    id: "frontend",
    title: "前端",
    description: "界面、状态与工程化构建",
    items: [
      { name: "Vue", icon: "vuedotjs", color: "4FC08D" },
      { name: "React", icon: "react", color: "61DAFB" },
      { name: "TypeScript", icon: "typescript", color: "3178C6" },
      { name: "Vite", icon: "vite", color: "646CFF" },
      { name: "Next.js", icon: "nextdotjs", color: "000000" },
      { name: "Nuxt", icon: "nuxt", color: "00DC82" },
      { name: "Webpack", icon: "webpack", color: "8DD6F9" },
    ],
  },
  {
    id: "backend",
    title: "后端 · 全栈",
    description: "API、数据与交付",
    items: [
      { name: "Node.js", icon: "nodedotjs", color: "339933" },
      { name: "NestJS", icon: "nestjs", color: "E0234E" },
      { name: "MySQL", icon: "mysql", color: "4479A1" },
      { name: "Redis", icon: "redis", color: "FF4438" },
      { name: "Prisma", icon: "prisma", color: "2D3748" },
      { name: "Docker", icon: "docker", color: "2496ED" },
    ],
  },
  {
    id: "ai",
    title: "AI / Agent",
    description: "LLM 应用、RAG 与 Agent 工程",
    items: [
      { name: "OpenAI", icon: "openai", color: "412991" },
      { name: "LangChain", icon: "langchain", color: "1C3C3C" },
      { name: "LangGraph" },
      { name: "RAG" },
      { name: "Qdrant", icon: "qdrant", color: "DC382D" },
      { name: "Python", icon: "python", color: "3776AB" },
      { name: "Cursor", icon: "cursor", color: "000000" },
    ],
  },
  {
    id: "web3",
    title: "Web3",
    description: "链上合约与 DApp",
    items: [
      { name: "Ethereum", icon: "ethereum", color: "3C3C3D" },
      { name: "Solidity", icon: "solidity", color: "363636" },
      {
        name: "Hardhat",
        iconSrc:
          "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/hardhat/hardhat-original.svg",
      },
      { name: "Ethers.js", icon: "ethereum", color: "627EEA" },
      { name: "IPFS", icon: "ipfs", color: "65C2C8" },
    ],
  },
  {
    id: "engineering",
    title: "工程化",
    description: "质量、协作与自动化",
    items: [
      { name: "Git", icon: "git", color: "F05032" },
      { name: "GitHub Actions", icon: "githubactions", color: "2088FF" },
      { name: "Jest", icon: "jest", color: "C21325" },
      { name: "Cypress", icon: "cypress", color: "69D3A7" },
      { name: "pnpm", icon: "pnpm", color: "F69220" },
    ],
  },
];
