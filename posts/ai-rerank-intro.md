---
collection: ai-agent
title: RAG 里的 Rerank 是什么？
date: 2026-05-27
description: 向量召回后的重排序：原理、在 RAG 中的位置、Cohere/LangChain TS 示例与参数建议。
tags: [AI, RAG, Rerank, TypeScript, 检索]
---


**Rerank（重排序）** = 向量库先 **粗召回** 一批 chunk，再用 **专门的排序模型** 按「和当前 query 的相关性」重新打分，只把 Top-N 交给 LLM。

向量检索擅长 **快 + 广**；Rerank 擅长 **准**。二者是串联关系，不是二选一。

```text
用户问题 → Embedding 召回 TopK(50~100) → Rerank → TopN(5~10) → 拼进 Prompt → LLM
```

---

## 一、为啥需要 Rerank？

| 阶段 | 模型 | 特点 |
|------|------|------|
| **召回（Recall）** | Bi-Encoder：query、doc 各 embed，比余弦相似度 | 快，可上百万量；语义相近但 **答非所问** 的也会进来 |
| **重排（Rerank）** | Cross-Encoder：query+doc **拼在一起** 进模型打分 | 慢一些、要计费； **细粒度相关度** 更好 |

典型翻车：query「花生过敏忌口」，召回里混进「花生种植技术」「过敏药广告」——向量距离都不远，Rerank 会把真正 **饮食禁忌** 排到前面。

---

## 二、核心概念

- **输入**：`query` + `documents[]`（字符串或 `{ text }`）
- **输出**：按 `relevanceScore` 降序的列表，带 **原数组下标 `index`**
- **参数**：
  - 召回 `topK`：50～200（看延迟与成本）
  - 重排 `topN`：3～10（进 context 的条数）
- **不适用**：全库暴力 Rerank（太贵）；应用 **先向量筛一小撮** 再 Rerank

常见托管 API： [Cohere Rerank](https://docs.cohere.com/reference/rerank)、Jina Rerank、Voyage Rerank；开源可用 `bge-reranker` 等自建。

---

## 三、安装

```bash
# 直连 Cohere
pnpm add cohere-ai

# 或在 LangChain RAG 链里
pnpm add @langchain/cohere @langchain/core
```
---

## 四、TypeScript 示例

### 4.1 Cohere SDK（最小）

```ts
import { CohereClient } from "cohere-ai";

const client = new CohereClient({ token: process.env.COHERE_API_KEY });

const query = "用户对花生过敏，餐厅推荐要注意什么？";

const documents = [
  "花生是重要的油料作物，主要分布在华北。",
  "本店招牌菜含花生酱，过敏客人请提前告知服务员。",
  "今天北京天气晴，适合户外活动。",
  "花生油可用于烹饪，风味浓郁。",
];

const { results } = await client.v2.rerank({
  model: "rerank-v4.0-pro",
  query,
  documents,
  topN: 2,
});

for (const row of results) {
  console.log(row.index, row.relevanceScore?.toFixed(3), documents[row.index]);
}
// 期望：含「过敏」「告知」那条分数最高
```

`results[].index` 对应 **传入 `documents` 的下标**，便于回表取 metadata（页码、文件名等）。

---

### 4.2 封装成 RAG 一步（召回 + Rerank）

```ts
type Chunk = { id: string; text: string; score?: number };

/** 假装是向量库返回的 TopK */
async function vectorSearch(query: string, topK: number): Promise<Chunk[]> {
  // 实际项目：Milvus / pgvector / Pinecone …
  return [
    { id: "1", text: "花生种植与收获技术…", score: 0.82 },
    { id: "2", text: "过敏客人请在点餐时说明忌口…", score: 0.79 },
    { id: "3", text: "本周促销：花生油买一送一…", score: 0.78 },
    { id: "4", text: "首都北京旅游资源介绍…", score: 0.71 },
  ].slice(0, topK);
}

async function rerank(
  query: string,
  chunks: Chunk[],
  topN: number,
): Promise<Chunk[]> {
  const client = new CohereClient({ token: process.env.COHERE_API_KEY! });
  const { results } = await client.v2.rerank({
    model: "rerank-v4.0-pro",
    query,
    documents: chunks.map((c) => c.text),
    topN,
  });
  return results.map((r) => ({
    ...chunks[r.index],
    score: r.relevanceScore,
  }));
}

export async function retrieveForRag(query: string) {
  const candidates = await vectorSearch(query, 50);
  return rerank(query, candidates, 5);
}
```

---

### 4.3 LangChain `CohereRerank`（接 Document 管道）

```ts
import { CohereRerank } from "@langchain/cohere";
import { Document } from "@langchain/core/documents";

const query = "Vue 3 script setup 和 Options API 怎么选？";

const docs = [
  new Document({
    pageContent: "script setup 是组合式语法糖，推荐新项目使用。",
    metadata: { source: "vue-doc.md", page: 12 },
  }),
  new Document({
    pageContent: "Vue 2 使用 Options API 定义 data 和 methods。",
    metadata: { source: "legacy.md", page: 3 },
  }),
];

const reranker = new CohereRerank({
  model: "rerank-v4.0-pro",
  topN: 3,
});

// 只要分数与下标
const ranked = await reranker.rerank(docs, query);
// ranked: { index, relevanceScore }[]

// 直接拿重排后的 Document[]
const compressed = await reranker.compressDocuments(docs, query);
```

典型链：**VectorStoreRetriever（k=50）→ CohereRerank（topN=5）→ ChatModel**。

---

### 4.4 分数阈值（可选）

```ts
const MIN_SCORE = 0.35;

const kept = results.filter(
  (r) => (r.relevanceScore ?? 0) >= MIN_SCORE,
);

if (kept.length === 0) {
  // 宁可少答，也别硬塞无关 chunk
  return { answer: "知识库未找到可靠依据。", sources: [] };
}
```

---

## 五、参数与工程建议

| 项 | 建议 |
|----|------|
| 召回 `topK` | 50～100 起步；召回太少 Rerank 无米下锅 |
| 输出 `topN` | 3～8；受 LLM context 与引用粒度限制 |
| Chunk 长度 | 单条不宜过长；Rerank 模型有 token 上限，超长会截断 |
| 延迟 | Rerank 多一次网络 RTT；高 QPS 可缓存热门 query 结果 |
| 多语言 | 选多语言 rerank 模型（如 `rerank-v4.0-pro` 等多语系列） |
| 元数据 | 用 `index` 回查 `id/source`，不要把整库塞进 `documents` |

---

## 六、和普通 RAG「取向量前几条」有啥区别？

**普通 RAG**：`similarity(query_embedding, doc_embedding)` 排序，取 Top-N 塞进 Prompt。  
**加 Rerank**：仍先向量取 TopK（如 50），再用 **Cross-Encoder** 对「query + 每条 doc 全文」打相关分，取 TopN（如 5）进 Prompt。

### 6.1 排序依据不同

| | 普通 Top-N | Rerank 后 Top-N |
|--|------------|-----------------|
| 算什么 | query、doc **各自** embed，比向量夹角/距离 | query 与 doc **拼在一起** 进模型，输出相关度 |
| 等价于 | 「语义空间上离 query 近」 | 「这段话能不能回答这个问题」 |
| 典型误差 | 同主题但无关（都含「花生」）排前面 | 会把「过敏忌口」排到「种植技术」前面 |

Embedding 召回是 **近似最近邻**；Rerank 是 **逐条精判**，所以能纠正召回里的顺序。

### 6.2 不是「多取几条」能替代的

```text
普通：topK=5  → 5 条进 LLM          （快，顺序=向量序）
普通：topK=50 → 50 条进 LLM         （更慢更贵，噪声更多，LLM 仍易被误导）

Rerank：topK=50 → 重排 → topN=5 进 LLM  （多一次 API，5 条里「更准」）
```

把向量 `topK` 从 5 调到 50 **不会**自动变成 Rerank：你只是把向量的第 6～50 名也塞进 context，**排序规则没变**，相关的不一定更靠前。

### 6.3 何时可以不要 Rerank？

- 文档少、chunk 质量高、query 和文档表述很接近（FAQ 字面匹配）
- 延迟/成本极敏感，能接受偶发答偏
- 已用 **混合检索**（向量 + BM25）且 `topK` 很小（3～5）有时够用

知识库大、同义词多、chunk 易撞主题时，**向量 Top-N 直接进 LLM** 和 **Rerank 后再 Top-N** 差距最明显。

---

## 七、小结

- Rerank 解决的是 **召回之后的排序质量**，不是替代向量库。
- TS 落地：`cohere-ai` 的 `client.v2.rerank`，或 `@langchain/cohere` 的 `CohereRerank`。
- 记住返回的 **`index` + `relevanceScore`**，用 `topN` 控制进 Prompt 的证据条数。

---


