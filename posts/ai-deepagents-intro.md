---
collection: ai-agent
title: Deep Agents 入门：API 与 TypeScript 示例
date: 2026-05-27
description: Deep Agents 简介与 TS 示例：backend、permissions、skills、memory、checkpointer。
tags: [AI, Agent, DeepAgents, LangChain, TypeScript]
---

# Deep Agents 入门

**Deep Agents**（npm：`deepagents`）是 LangChain 的 **Agent Harness**：在 LangGraph 上打包好规划、文件系统、子 Agent、上下文压缩等能力，不用从零拼 prompt + 工具链。

- 仓库：[langchain-ai/deepagentsjs](https://github.com/langchain-ai/deepagentsjs)
- 文档：[Deep Agents JS Overview](https://docs.langchain.com/oss/javascript/deepagents/overview)

---

## 一、它解决什么

| 内置能力 | 对应工具/机制 |
|----------|----------------|
| 任务拆解 | `write_todos` |
| 上下文外置 | `ls` / `read_file` / `write_file` / `edit_file` / `glob` / `grep` |
| 子任务隔离 | `task` .spawn 子 Agent |
| 长会话 | 自动摘要 + 可插拔 Backend / Memory Store |
| 生产运行 | 返回 **已编译的 LangGraph**，支持 checkpoint、interrupt、stream |

适合：**多步、长上下文、要写文件/跑研究** 的任务；简单单轮工具调用用 LangChain `createAgent` 或自建 Graph 即可。

---

## 二、安装

```bash
pnpm add deepagents langchain @langchain/core zod
# 按需加模型包，例如：
pnpm add @langchain/openai
```

环境变量示例：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY` 等（与所选 `provider:model` 一致）。

---

## 三、核心 API：`createDeepAgent`

```ts
import { createDeepAgent } from "deepagents";

const agent = createDeepAgent({
  model?: string | BaseChatModel,     // 如 "openai:gpt-4o" 或 ChatOpenAI 实例
  tools?: StructuredTool[],           // 自定义工具，与内置工具并存
  systemPrompt?: string,              // 覆盖/补充默认系统提示
  subagents?: SubAgentConfig[],       // 专用子 Agent
  backend?: Backend,                  // 内存 / 本地盘 / sandbox 等文件后端
  checkpointer?: boolean | Checkpointer,
  interruptOn?: Record<string, boolean>, // 人机确认：哪些工具需审批
  memory?: string[],                  // 长期记忆路径等
  skills?: string[],                  // Skill 目录
  permissions?: FilesystemPermission[],
});
```

返回值是 **LangGraph CompiledGraph**，主要用法：

| 方法 | 用途 |
|------|------|
| `agent.invoke({ messages })` | 同步跑完一轮 |
| `agent.stream({ messages }, { streamMode: "values" })` | 流式（与 LangGraph 一致） |
| `agent.getState` / checkpoint | 持久化、恢复会话 |

**输入/输出形状**（最常见）：

```ts
type Input = {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
};

// result.messages 为完整消息列表，最后一条多为 assistant 回复
const result = await agent.invoke({
  messages: [{ role: "user", content: "..." }],
});
const answer = result.messages.at(-1)?.content;
```

---

## 四、TypeScript 示例

### 4.1 最小调用

```ts
import { createDeepAgent } from "deepagents";

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  systemPrompt: "你是简洁的技术助手。",
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "用三句话介绍 LangGraph" }],
});

console.log(result.messages.at(-1)?.content);
```

### 4.2 自定义工具

```ts
import { tool } from "langchain";
import { createDeepAgent } from "deepagents";
import { z } from "zod";

const getWeather = tool(
  async ({ city }) => {
    // 替换为真实 API
    return `City: ${city}, weather: sunny`;
  },
  {
    name: "get_weather",
    description: "查询指定城市天气",
    schema: z.object({ city: z.string() }),
  },
);

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  tools: [getWeather],
  systemPrompt: "需要天气时调用 get_weather，不要编造。",
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "东京天气怎么样？" }],
});
```

### 4.3 显式传入 Model 实例

```ts
import { ChatOpenAI } from "@langchain/openai";
import { createDeepAgent } from "deepagents";

const agent = createDeepAgent({
  model: new ChatOpenAI({ model: "gpt-4o", temperature: 0 }),
  systemPrompt: "You are a research assistant.",
});
```

### 4.4 流式输出

```ts
const agent = createDeepAgent({ model: "openai:gpt-4o" });

const stream = await agent.stream(
  { messages: [{ role: "user", content: "列出 React 18 三个变化" }] },
  { streamMode: "messages" },
);

for await (const chunk of stream) {
  // chunk 结构随 streamMode 变化，常用 messages 看 token 增量
  console.log(chunk);
}
```

### 4.5 子 Agent（上下文隔离）

```ts
import { createDeepAgent } from "deepagents";

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  systemPrompt: "主 Agent：拆任务，重活交给子 Agent。",
  subagents: [
    {
      name: "researcher",
      description: "检索并整理资料，返回要点列表",
      systemPrompt: "只做调研，不写最终报告。",
      tools: [], // 可挂专用工具
    },
  ],
});

// 主 Agent 在需要时会通过内置 task 工具调用 researcher
await agent.invoke({
  messages: [
    {
      role: "user",
      content: "调研 VitePress 2 相对 1 的 breaking changes，写入 notes.md",
    },
  ],
});
```

> 子 Agent 字段以当前版本 [Customization](https://docs.langchain.com/oss/javascript/deepagents/customization) 为准；核心是 **主 Agent 保留规划，子 Agent 吃掉大块 context**。

---

## 五、进阶配置：backend / permissions / skills / memory / checkpointer

| 配置 | 作用 | 常见搭配 |
|------|------|----------|
| `checkpointer` | 按 `thread_id` 持久化图状态 | **memory、skills、interruptOn、多轮对话** 几乎都要 |
| `backend` | Agent 用的虚拟文件系统 | 默认 `StateBackend`；跨线程用 `StoreBackend` |
| `memory` | 注入 `AGENTS.md` 等长期说明 | 需 `checkpointer` + 首次 `invoke` 时灌 `files` |
| `skills` | 按需加载 `SKILL.md` 目录 | 虚拟路径 `["/skills/"]`；用前文件须已在 backend |
| `permissions` | 限制内置 FS 工具读写路径 | 仅 `ls/read_file/write_file/...`；**≥1.9.1** |

`invoke` 时带上 thread：

```ts
const config = { configurable: { thread_id: "user-42" } };
await agent.invoke({ messages: [...] }, config);
```

---

### 5.1 checkpointer（会话持久化）

```ts
import { createDeepAgent } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  checkpointer,
});

const thread = { configurable: { thread_id: "demo-thread-1" } };

await agent.invoke(
  { messages: [{ role: "user", content: "记住：项目用 pnpm" }] },
  thread,
);

// 同 thread_id 继续，状态在 checkpointer 里
const result = await agent.invoke(
  { messages: [{ role: "user", content: "包管理器是什么？" }] },
  thread,
);
```

`checkpointer: true` 可用默认内存实现；生产可换 SQLite / Postgres Saver（LangGraph 生态）。

---

### 5.2 backend（文件存在哪）

```ts
import {
  createDeepAgent,
  StateBackend,
  FilesystemBackend,
  StoreBackend,
  CompositeBackend,
} from "deepagents";
import { InMemoryStore } from "@langchain/langgraph";

// ① 默认：线程内状态，随 checkpointer 跨 turn，不跨 thread
const agentState = createDeepAgent({
  backend: new StateBackend(),
});

// ② 真写本地盘（慎用，建议 virtualMode + Composite 隔离 Agent 内部文件）
const agentLocal = createDeepAgent({
  backend: new FilesystemBackend({
    rootDir: process.cwd(),
    virtualMode: true,
  }),
});

// ③ 跨 thread 持久化：StoreBackend + store
const store = new InMemoryStore();
const agentStore = createDeepAgent({
  backend: new StoreBackend({
    namespace: () => ["memories"],
  }),
  store,
});

// ④ 路由：工作区用 State，/memories/ 走 Store
const agentComposite = createDeepAgent({
  backend: new CompositeBackend(new StateBackend(), {
    "/memories/": new StoreBackend({ namespace: () => ["memories"] }),
  }),
  store,
});
```

---

### 5.3 permissions（内置 FS 工具沙箱）

声明式规则，**先匹配先生效**；未命中默认 **allow**。

```ts
import { createDeepAgent, StateBackend } from "deepagents";

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  backend: new StateBackend(),
  permissions: [
    // 只允许读写 /workspace/
    { operations: ["read", "write"], paths: ["/workspace/**"], mode: "allow" },
    { operations: ["read", "write"], paths: ["/**"], mode: "deny" },
    // 禁止改 .env
    // { operations: ["write"], paths: ["/workspace/.env"], mode: "deny" }, // 要写在 allow 之前
  ],
});
```

| `operations` | 覆盖工具 |
|--------------|----------|
| `read` | `ls` `read_file` `glob` `grep` |
| `write` | `write_file` `edit_file` |

子 Agent 可单独 `permissions: []`（放开）或覆盖父规则。Sandbox backend 下 `execute` 不受此限制。

---

### 5.4 skills（按需加载 SKILL.md）

Skill 路径是 **backend 根下的虚拟 POSIX 路径**（如 `"/skills/"`），不是宿主机路径（除非 `FilesystemBackend`）。

**StateBackend：启动前把 SKILL 灌进 `files`**

```ts
import { createDeepAgent, StateBackend, type FileData } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";
import fs from "node:fs";

const checkpointer = new MemorySaver();

function toFileData(content: string): FileData {
  const now = new Date().toISOString();
  return { content, mimeType: "text/plain", created_at: now, modified_at: now };
}

const skillMd = fs.readFileSync(".cursor/skills/my-skill/SKILL.md", "utf8");

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  backend: new StateBackend(),
  checkpointer, // skills 需要
  skills: ["/skills/"],
});

await agent.invoke(
  {
    messages: [{ role: "user", content: "按 my-skill 规范生成 commit message" }],
    files: { "/skills/my-skill/SKILL.md": toFileData(skillMd) },
  },
  { configurable: { thread_id: "t1" } },
);
```

**FilesystemBackend：直接指本地目录**

```ts
import { createDeepAgent, FilesystemBackend } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  backend: new FilesystemBackend({ rootDir: process.cwd() }),
  checkpointer: new MemorySaver(),
  skills: ["./.cursor/skills/"], // 相对 rootDir
});
```

---

### 5.5 memory（AGENTS.md 长期上下文）

`memory` 传虚拟路径列表（如 `["/AGENTS.md"]`），内容同样要先进入 backend（与 skills 类似）。

```ts
import { createDeepAgent, type FileData } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();

function toFileData(content: string): FileData {
  const now = new Date().toISOString();
  return { content, mimeType: "text/plain", created_at: now, modified_at: now };
}

const agentsMd = `
# 项目约定
- 包管理：pnpm
- UI：shadcn-vue，禁止平行造组件
`;

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  memory: ["/AGENTS.md"],
  checkpointer,
});

await agent.invoke(
  {
    messages: [{ role: "user", content: "新建页面用什么 UI 库？" }],
    files: { "/AGENTS.md": toFileData(agentsMd) },
  },
  { configurable: { thread_id: "project-a" } },
);
```

跨 thread 共享记忆：用 `CompositeBackend` 把 `/memories/` 挂 `StoreBackend`，再配合 `permissions` 禁止 Agent 改写只读区（见 [Permissions](https://docs.langchain.com/oss/javascript/deepagents/permissions)）。

---

### 5.6 组合示例（生产向骨架）

```ts
import {
  createDeepAgent,
  CompositeBackend,
  StateBackend,
  StoreBackend,
  type FileData,
} from "deepagents";
import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

const store = new InMemoryStore();
const checkpointer = new MemorySaver();

const agent = createDeepAgent({
  model: "openai:gpt-4o",
  systemPrompt: "先规划再动手，大结果写文件。",
  backend: new CompositeBackend(new StateBackend(), {
    "/memories/": new StoreBackend({ namespace: () => ["org-mem"] }),
  }),
  store,
  checkpointer,
  memory: ["/AGENTS.md"],
  skills: ["/skills/"],
  permissions: [
    { operations: ["write"], paths: ["/memories/**"], mode: "deny" },
    { operations: ["read", "write"], paths: ["/workspace/**"], mode: "allow" },
    { operations: ["read", "write"], paths: ["/**"], mode: "deny" },
  ],
  interruptOn: {
    write_file: true, // 写文件前人工确认（需 checkpointer）
  },
});

const thread = { configurable: { thread_id: "prod-001" } };

await agent.invoke(
  {
    messages: [{ role: "user", content: "实现登录页" }],
    files: {
      "/AGENTS.md": {
        content: "# 栈\nVue3 + shadcn-vue + pnpm",
        mimeType: "text/plain",
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
    },
  },
  thread,
);
```

---

## 六、默认工具链（无需手写）

创建后 Agent **自带**（可在 systemPrompt 里约束用法）：

```text
write_todos          # 规划
ls / read_file / write_file / edit_file / glob / grep
task                 # 调子 Agent
# sandbox backend 下另有 execute
```

典型链路：`write_todos` → 搜索/读文件 → `write_file` 落盘大结果 → 必要时 `task` 子 Agent → 汇总回复。

---

## 七、和自建 Agent 怎么选

| | Deep Agents | 自建 LangGraph / createAgent |
|--|-------------|------------------------------|
| 上手 | 快，默认 prompt + 工具齐全 | 慢，全自己设计 |
| 控制 | 通过 middleware、backend、permissions 扩展 | 完全自定义 |
| 依赖 | LangChain + LangGraph 栈 | 可更轻 |
| 场景 | 编码助手、研究、多步工作流 | 单一工具、固定 DAG |

---

## 参考

- [Quickstart (JS)](https://docs.langchain.com/oss/javascript/deepagents/quickstart)
- [Customization](https://docs.langchain.com/oss/javascript/deepagents/customization)
- [Backends](https://docs.langchain.com/oss/javascript/deepagents/backends)
- [Permissions](https://docs.langchain.com/oss/javascript/deepagents/permissions)
- [npm: deepagents](https://www.npmjs.com/package/deepagents)
