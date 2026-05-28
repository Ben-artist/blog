---
collection: ai-agent
title: RAG 重排算法实战：RRF、RankLLM、CrossEncoder
date: 2026-05-27
description: 三种 RAG 重排方法原理与 TS 完整样例：多查询 RRF 融合、LLM 打分、CrossEncoder 精排。
tags: [AI, RAG, Rerank, TypeScript, LangChain]
---

# RAG 重排算法实战

通过重排序策略对初始检索的候选文档重新打分排序，将最相关的内容提升到前列，从而提升大模型的上下文质量。

RAG 里的 **重排序（Reranking）** 是对初始检索结果的 **二次排序**：第一轮通常靠向量相似度或关键词匹配，结果里会有语义噪声；重排用更细的相关性判断，把真正该进 Prompt 的 chunk 顶上来。

```text
用户问题 → 初始检索 TopK → 重排 → TopN → 拼 context → LLM 生成
```

下面三种方法各走一条路：**RRF** 融合多路排名、**RankLLM** 用大模型打分、**CrossEncoder** 用排序模型逐对算分。示例统一用 **悦享餐饮财报** 场景。

---

## 一、RRF 重排（多查询 + 排名融合）

### 1.1 是什么

**RRF（Reciprocal Rank Fusion）** 把 **多个检索列表** 按名次融合成一个排序，不比较各路的原始分数（向量 0.82 和 BM25 8.3 无法直接比）。

**常见流程（RAG Fusion）**：

1. 用户一个问题 → LLM 生成 **多个不同角度的子查询**
2. 每个子查询各检索一次
3. RRF 合并列表：`score(d) += 1 / (rank + k)`，默认 `k = 60`

| 优势 | 劣势 |
|------|------|
| 实现简单、极快、无额外模型算力 | 不懂深层语义，精度弱于模型类重排 |
| 适合多路召回合并 | 效果依赖子查询和各路召回质量 |

### 1.2 TypeScript 样例

```ts
import "dotenv/config";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const llm = new ChatOpenAI({
  model: process.env.GLM_CHAT_MODEL ?? "glm-4",
  temperature: 0,
  apiKey: process.env.GLM_API_KEY,
  configuration: { baseURL: process.env.GLM_BASE_URL },
});

const embeddings = new OpenAIEmbeddings({
  model: process.env.GLM_EMBEDDING_MODEL ?? "embedding-3",
  apiKey: process.env.GLM_API_KEY,
  configuration: { baseURL: process.env.GLM_BASE_URL },
});

function buildFinanceDocs(): Document[] {
  const texts = [
    "悦享餐饮2020-2023财务综合分析报告：短期偿债能力分析。2020~2023年间，悦享餐饮速动比率分别为2.85、2.07、1.48和1.53，流动比率分别为2.12、2.24、1.61和1.68，整体呈先降后升趋势。2022年受非流动资产增加影响，流动比率大幅回落；2023年加强应付账款管控，流动资产增加，短期偿债能力略有改善。",
    "悦享餐饮2020-2023财务综合分析报告：长期偿债能力分析。资产负债率先升后降（21.56%->22.03%->28.15%->26.87%），产权比率同步变动。2022年受外部冲击，应付账款大增，资产负债率攀升至28.15%；2023年优化资产结构，总资产增至188652.47万元，负债回落。",
    "悦享餐饮2020-2023财务综合分析报告：营运能力分析。应收账款周转率从25.12次降至15.34次后回升至18.65次；存货周转率波动较大（10.87->8.23->12.35->11.68）。",
    "悦享餐饮2020-2023财务综合分析报告：盈利能力分析。2020~2021年毛利率稳定在60%左右，2022年大幅下滑至-10.23%，2023年回升至8.65%。净资产收益率同步下降，主要受门店扩张成本和疫情影响。",
    "悦享餐饮2020-2023财务综合分析报告：发展能力分析。2022年新增5家门店，成本3256.87万元，加剧资金压力；2023年暂停扩张。营业收入增长率从2021年的15.2%下降至2022年的-8.3%，2023年恢复至5.1%。",
  ];
  return texts.map((pageContent) => new Document({ pageContent }));
}

/**
 * RRF：同一文档出现在多列表中时累加 1/(rank+k)
 */
export function reciprocalRankFusion(
  resultLists: Document[][],
  k = 60,
): { doc: Document; score: number }[] {
  const fused = new Map<string, { doc: Document; score: number }>();

  for (const docs of resultLists) {
    docs.forEach((doc, rank) => {
      const key = doc.pageContent;
      const inc = 1 / (rank + k);
      const prev = fused.get(key);
      if (prev) prev.score += inc;
      else fused.set(key, { doc, score: inc });
    });
  }

  return [...fused.values()].sort((a, b) => b.score - a.score);
}

async function main() {
  // 1. 构造原始财报文档数组
  const raw = buildFinanceDocs();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
  });
  const splits = await splitter.splitDocuments(raw);

  // MemoryVectorStore.fromDocuments 会把所有切分后的“文档块 splits”通过 embedding 编码，存入一个内存向量检索器，实现一个本地的“小型向量数据库”，便于后续相似性检索
  // 即：传入待索引的文本块（splits），加上 embedding 模型，得到可以“按语义检索”的 vectorstore。
  const vectorstore = await MemoryVectorStore.fromDocuments(splits, embeddings);

  // retriever 是一个“检索器”对象，负责根据查询（query）返回相关性最高的文档块
  // 这里 vectorstore.asRetriever({ k: 3 }) 表示：每次检索时，返回相关性最高的 3 条内容（k=3）
  const retriever = vectorstore.asRetriever({ k: 3 });

  const fusionPrompt = ChatPromptTemplate.fromTemplate(
    `你是搜索查询扩展助手。根据原问题生成 4 个不同角度的检索 query（每行一个，不要编号）：\n\n原问题：{question}`,
  );
  
  const generateQueries = fusionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())
    .pipe((text) => text.split("\n").map((q) => q.trim()).filter(Boolean));

  const question = "悦享餐饮的短期偿债能力怎么样？";
  const queries = await generateQueries.invoke({ question });
  console.log("子查询：", queries);

  const allResults: Document[][] = [];
  for (const q of queries) {
    allResults.push(await retriever.invoke(q));
  }

  const reranked = reciprocalRankFusion(allResults);
  console.log("\nRRF 重排 Top3：");
  reranked.slice(0, 3).forEach((item, i) => {
    console.log(`\n#${i + 1} score=${item.score.toFixed(4)}`);
    console.log(item.doc.pageContent.slice(0, 200) + "…");
  });
}

main();
```

生产环境把 `MemoryVectorStore` 换成 **Milvus / pgvector** 即可，RRF 与多查询逻辑不变。

---

## 二、RankLLM 重排（LLM 逐条打分）

### 2.1 是什么

用 **LLM + Prompt** 对每个候选文档打相关性分（如 0–10），再按分数排序。语义与推理最强，也可要求简短理由，**可解释性好**。

| 优势 | 劣势 |
|------|------|
| 理解深、能处理复杂问法 | API 成本高、延迟大（候选越多越慢） |

### 2.2 TypeScript 样例

```ts
import "dotenv/config";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const llm = new ChatOpenAI({
  model: process.env.GLM_CHAT_MODEL ?? "glm-4",
  temperature: 0,
  apiKey: process.env.GLM_API_KEY,
  configuration: { baseURL: process.env.GLM_BASE_URL },
});

const embeddings = new OpenAIEmbeddings({
  model: process.env.GLM_EMBEDDING_MODEL ?? "embedding-3",
  apiKey: process.env.GLM_API_KEY,
  configuration: { baseURL: process.env.GLM_BASE_URL },
});

const docs = [
  new Document({
    pageContent:
      "悦享餐饮…短期偿债能力…速动比率2.85、2.07、1.48和1.53…",
  }),
  new Document({
    pageContent:
      "悦享餐饮…盈利能力…2022年毛利率大幅下滑至-10.23%…门店扩张成本和疫情…",
  }),
  new Document({
    pageContent:
      "悦享餐饮…发展能力…2022年新增5家门店，成本3256.87万元…",
  }),
  new Document({
    pageContent: "悦享餐饮…营运能力…应收账款周转率…存货周转率…",
  }),
  new Document({
    pageContent:
      "悦享餐饮…长期偿债…2022年资产负债率攀升至28.15%…",
  }),
];

const gradePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "你是文档相关性评分员。只输出一个 0-10 的整数，10 表示高度相关，0 表示完全无关。",
  ],
  ["human", "用户问题：{question}\n\n文档内容：{document}\n\n相关性分数（0-10）："],
]);

const grader = gradePrompt.pipe(llm).pipe(new StringOutputParser());

export async function llmRerank(
  query: string,
  candidates: Document[],
  topN = 3,
): Promise<{ doc: Document; score: number }[]> {
  const scored: { doc: Document; score: number }[] = [];

  for (const doc of candidates) {
    const raw = await grader.invoke({
      question: query,
      document: doc.pageContent,
    });
    const score = Number.parseInt(raw.trim(), 10);
    scored.push({ doc, score: Number.isFinite(score) ? score : 0 });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}

async function main() {
  const vectorstore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const retriever = vectorstore.asRetriever({ k: 5 });

  const query = "2022年毛利率为什么下滑？";
  const candidates = await retriever.invoke(query);
  const reranked = await llmRerank(query, candidates, 3);

  console.log(`查询: ${query}\n`);
  reranked.forEach((item, i) => {
    console.log(`\n排名 ${i + 1} (${item.score}/10)`);
    console.log(item.doc.pageContent.slice(0, 150) + "…");
  });
}

// main();
```

---

## 三、CrossEncoder 重排（query + doc 联合编码）

### 3.1 是什么

**CrossEncoder** 把 query 和 document **拼成一对** 送进 BERT 类模型（`[CLS] query [SEP] doc`），输出 **一个相关分**。比向量召回的 Bi-Encoder 更准，但 **每条候选都要跑一遍 forward**，只适合做 **少量候选精排**，不适合全库第一轮检索。

| 优势 | 劣势 |
|------|------|
| 语义匹配准、相关性判别强 | 逐对编码，候选多时耗时与算力线性涨 |

```bash
pnpm add cohere-ai
```

```ts
import "dotenv/config";
import { CohereClient } from "cohere-ai";

const client = new CohereClient({ token: process.env.COHERE_API_KEY! });

/**
 * 输入输出语义：分数越高越相关
 */
export async function crossEncoderRerank(
  query: string,
  documents: string[],
): Promise<{ text: string; score: number }[]> {
  const { results } = await client.v2.rerank({
    model: "rerank-v4.0-pro",
    query,
    documents,
    topN: documents.length,
  });

  return results
    .map((r) => ({
      text: documents[r.index],
      score: r.relevanceScore ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
}

async function main() {
  const query = "悦享餐饮2022年毛利率为什么下滑？";
  const documents = [
    "2020~2021年毛利率稳定在60%左右，2022年大幅下滑至-10.23%，2023年回升至8.65%。净资产收益率同步下降，主要受门店扩张成本和疫情影响。",
    "2022年新增5家门店，成本3256.87万元，加剧资金压力；2023年暂停扩张。营业收入增长率从2021年的15.2%下降至2022年的-8.3%。",
    "2020~2023年间，速动比率分别为2.85、2.07、1.48和1.53，流动比率分别为2.12、2.24、1.61和1.68。",
    "资产负债率先升后降，2022年应付账款大增，资产负债率攀升至28.15%。",
  ];

  const ranked = await crossEncoderRerank(query, documents);

  console.log(`查询: ${query}\n`);
  ranked.forEach((item, i) => {
    console.log(`\n排名 ${i + 1} (分数: ${item.score.toFixed(4)})`);
    console.log(item.text.slice(0, 100) + "…");
  });
}

// main();
```

---

## 四、总结

| 重排算法 | 核心原理 | 核心优势 | 主要劣势 | 典型使用场景 |
|----------|----------|----------|----------|----------------|
| **RRF** | 多路检索，按 `1/(rank+k)` 融合名次 | 实现简单、速度快、无算力成本 | 无深层语义，精度偏低，依赖查询质量 | 多路召回合并、高并发快速检索 |
| **RankLLM** | LLM + Prompt 逐文档打分排序 | 语义理解强、可推理、可解释 | 成本高、延迟大 | 专业问答、复杂推理、要解释排序 |
| **CrossEncoder** | query+doc 联合编码，双向交互算分 | 语义匹配准、判别力强 | 逐对编码，算力开销大 | 搜索精排、RAG **少量候选**排序 |

```text
常见组合：

  向量 TopK ──┐
              ├── RRF 融合 ── CrossEncoder TopN ── LLM     （多查询 + 精排）
  BM25 TopK ──┘

  向量 TopK ── CrossEncoder TopN ── LLM                   （最常见）

  向量 TopK ── CrossEncoder Top20 ── RankLLM Top5 ── LLM  （质量优先）
```

总的来说，重排是把 **初始检索的粗结果** 打磨成 **高质量上下文**：RRF 解决「多路怎么合并」，CrossEncoder 解决「单路怎么精排」，RankLLM 在候选少、要求极高时补上最强语义判断。按场景选一种或串联即可，不必三套全上。