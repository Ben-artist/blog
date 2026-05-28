---
collection: ai-agent
title: Memory 超限
date: 2026-05-26
description: Memory 超限：淘汰策略、短中长期分层、治理流水线、面试三步答法。
tags: [AI, Agent, Memory, 面试, 上下文]
---

> 整理自 [《Memory 超限处理怎么办？》](https://mp.weixin.qq.com/s/dOkDqx3eJJVo0FT7QMageQ)

**Memory 超限** = Context Window 装不下。核心矛盾：LLM 无状态，每次全量喂 context，Token 是硬约束

---

## 一、三种淘汰策略

| 维度 | FIFO 滑动窗口                               | LRU                                     | importance × recency（主流）           |
| ---- | ------------------------------------------- | --------------------------------------- | -------------------------------------- |
| 代表 | LangChain `ConversationBufferWindowMemory`  | 按检索/访问频次                         | `final_score = importance × 0.95^days` |
| 坑   | 开头强约束（过敏、合规）超 `k` 轮即永久丢失 | 高频≠高价值：「天气」留下、「过敏」丢失 | 打分有成本 → 规则兜底 + 仅对候选集打分 |
| 场景 | 短对话 Demo                                 | 纯检索                                  | 长会话 Agent                           |

**importance 落地**：规则命中「过敏/必须/合规」等直接高分；其余走短 Prompt 打 0–10 分。从低分到高分淘汰，直到 token ≤ 安全线（如窗口 70%）。

```python
# 打分标准摘要：9-10 硬约束/偏好，6-8 项目背景/决策，3-5 一般事实，0-2 闲聊
SCORE_PROMPT = """…对话内容: {message}"""  # 只返回整数
```

---

## 二、分层：压缩 / 丢弃 / 提取

按价值密度分三层，别混为一种 Memory：

| 层级     | 策略                            | 要点                                                                       |
| -------- | ------------------------------- | -------------------------------------------------------------------------- |
| **短期** | 最近 N 轮（6–12）原文进 context | 不压缩                                                                     |
| **中期** | 更早历史 → `[SUMMARY]`          | 5:1～10:1；可丢工具细节/代码全文，留决策与约束                             |
| **长期** | extraction → fact 落盘          | `user_preference` / `hard_constraint` / `project_context` / `key_decision` |

**原则**：压缩可丢实现细节（git/产物还在）；Memory 必须留**无法自动推导的关键决策**。

**30 轮前的约束**：靠长期 fact 检索注入；未提取则只能靠摘要 → **压缩前必须先 Flush**。

---
