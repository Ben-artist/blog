---
collection: ai-agent
title: 优秀的 Skill 应该怎么写
date: 2026-05-27
description: Agent Skill 写作要点：L1/L2/L3 渐进披露、description 触发、反模式清单。
tags: [AI, Agent, Skill, Cursor]
---

**Skill** = 给 Agent 的 **可检索工作手册**（`SKILL.md` + 可选引用文件），在匹配任务时注入 context。不是 MCP，不是插件；价值在于 **补 Agent 不知道的约束与流程**，且 **少占 token**。

---

## 一、先搞清：Skill 解决什么问题

| 该写进 Skill | 不必写进 Skill |
|--------------|----------------|
| 团队规范、仓库特有目录/命令 | Agent 已知的通用语法 |
| 固定工作流、输出模板 | 「什么是 REST」类百科 |
| 易错点、必须/禁止 | 冗长背景介绍 |

**默认假设**：模型已经够聪明，每一段文字都要过 **「不配这行会做错吗？」** 这一关。

---

## 二、文件结构与存放

```
skill-name/
├── SKILL.md          # 必需：frontmatter + 正文
├── reference.md      # 可选：细节，按需读
├── examples.md       # 可选：输入输出样例
└── scripts/          # 可选：脆弱/重复操作用脚本
```

| 范围 | 路径 |
|------|------|
| 个人 | `~/.cursor/skills/skill-name/` |
| 项目 | `.cursor/skills/skill-name/` |

**frontmatter 最少字段**：

```yaml
---
name: my-skill          # 小写+连字符，≤64
description: ...        # 第三人称，写清 WHAT + WHEN，≤1024
---
```

`description` 决定 **会不会被选中**——正文写得再好，描述含糊就等于没被加载。

---

## 三、Level 1 / 2 / 3：渐进披露

Agent Skills（[agentskills.io](https://agentskills.io) 开放标准，Cursor 等 IDE 均支持）靠 **三级加载** 控制 context：装 50 个 Skill，启动时也不会塞满窗口。

| Level | 加载内容 | 何时 | Token 量级 |
|-------|----------|------|------------|
| **L1 发现** | frontmatter 的 `name` + `description` | 会话启动，扫描**所有**已安装 Skill | 约 **~100 / Skill** |
| **L2 激活** | `SKILL.md` 正文全文 | Agent 判定与当前任务相关 | 建议 **< 5k**，理想更短 |
| **L3 执行** | `reference.md`、`scripts/`、`assets/` 等 | 正文 **显式引用** 或需要跑脚本时 | 按需，可很大 |

```text
启动 ──► L1：只看「书名+腰封」          （所有 Skill 的 metadata）
用户提问 ──► L2：翻开对应章节          （单个 SKILL.md）
任务需要 ──► L3：查附录 / 跑脚本        （references、scripts）
```

**写作时对照三级**：

| Level | 对应文件 | 你该写什么 |
|-------|----------|------------|
| **L1** | YAML `description` | **WHAT + WHEN**、触发词；相当于「腰封」，决定会不会被翻开 |
| **L2** | `SKILL.md` 正文 | 流程、MUST/禁止、模板、指向 L3 的链接；**当前任务够用即可** |
| **L3** | `reference.md` / `examples.md` / `scripts/` | API 表、长规则、确定性操作；**SKILL.md 里一行链过去** |

**原则**：

- L1 省不下：`description` 含糊 → L2 永远不会加载。
- L2 别堆百科：正文过长 = 一激活就吃掉大量 context。
- L3 从 `SKILL.md` **只链一层**（`a → b → c` 容易只读到半截）；脚本放 `scripts/` 让 Agent **执行** 而非 **读进 context**。

::: tip 和 Memory 的类比
L1≈目录索引，L2≈当前会话必读页，L3≈外置仓库——**发现 → 激活 → 按需深挖**。
:::

---

## 四、description：最重要的 3 行（= L1）

| 维度 | 差 | 好 |
|------|----|----|
| 人称 | 「我可以帮你…」 | 「Generates X from Y. Use when…」 |
| 触发 | 「帮助处理文档」 | 「…Use when user mentions PDF / forms / extraction」 |
| 范围 | 只写能力 | **能力 + 场景词**（文件名、技术栈、任务类型） |

```yaml
# ❌ 模糊
description: Helps with Vue development.

# ✅ 可发现
description: 
  Vue 3 Composition API + script setup conventions for this repo.
  Use for .vue files, Pinia, vue-router, or when user asks about Vue patterns.
```

---

## 五、正文怎么组织（= L2）

### 5.1 三条铁律

| 原则 | 做法 |
|------|------|
| **Concise** | `SKILL.md` 建议 **< 500 行**；百科下沉到 L3 |
| **渐进披露** | L2 只放必用步骤；细节进 `reference.md`（见第三节 L3） |
| **自由度分级** | 易碎流程用 L3 脚本；开放任务用文字指引 |


### 5.2 常用模式（按需一种为主）

**Workflow**——复杂多步任务：

```markdown
## 发布检查清单
- [ ] 版本号已 bump
- [ ] CHANGELOG 已更新
- [ ] `pnpm test` 通过
```

**Template**——输出格式固定：

```markdown
## PR 描述模板
## Summary
- …
## Test plan
- [ ] …
```

**Examples**——格式/语气难用文字说清：给 2～3 组 **输入 → 期望输出**，胜过十段说明。

---

## 六、L3 资源：`references` / `scripts` / `assets`

| 目录 | 用途 | 加载方式 |
|------|------|----------|
| `reference.md` | 长规范、API、边界 case | Agent **Read** 文件 |
| `examples.md` | 输入→输出样例 | 同上 |
| `scripts/` | 校验、生成、迁移 | Agent **执行**，结果回传，不必全文进 context |
| `assets/` | 模板、schema、静态资源 | 按需读取或填充 |

**用户原文 verbatim** 要求：放在 L2/L3 均可，但禁止 Agent 擅自改写。

---

## 七、反模式（写完自查）

| 反模式 | 后果 |
|--------|------|
| 把 Skill 当教程 | L2 占满 context，真规则被挤掉 |
| L2 塞满本应在 L3 的长文 | 一激活就爆 token |
| description 只写「what」不写「when」 | 该用不用、不该用乱用 |
| 深层嵌套引用 `a→b→c` | 只读到半截 |
| 一个 Skill 包打天下 | 触发冲突、描述不得不写很宽 |
| 重复 User Rules / 项目 README | 三处不一致，Agent 无所适从 |

---

## 八、发布前检查清单

- [ ] `name` 唯一、路径正确（个人 / 项目）
- [ ] **L1** `description`：第三人称 + 触发词 + 技术栈/文件类型
- [ ] **L2** 正文 **< 500 行**，重复段落已删
- [ ] **L3** 长材料在 `reference.md` / `scripts/`，且 SKILL.md 有直链
- [ ] 易错步骤有 **禁止/必须** 或脚本
- [ ] 用真实任务试跑一轮：是否 **过早加载** / **该用没用**

---

## 九、最小可用 Skill 骨架

```markdown
---
name: acme-pr-review
description: 
  Reviews PRs against ACME frontend standards (Vue 3, pnpm, a11y).
  Use when reviewing pull requests or when user asks for code review.
---

# ACME PR Review

## 必查
- Composition API + `<script setup lang="ts">`
- 无 `any`；公共 API 有 JSDoc
- 新 UI 走现有 shadcn 组件，不平行造轮子

## 输出
按 Template：Summary / Issues(blocker|nit) / Test plan

## 延伸阅读（L3）
- 详细规范见 [reference.md](reference.md)
```

