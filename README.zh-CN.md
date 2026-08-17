# VibeMath

**AI 数学前沿的实时索引、证据账本与 Agent 入口。**

看清 AI 在数学中解决了什么、什么仍然开放，以及下一步值得尝试什么。

VibeMath 是一张开放、Agent 可读的地图，统一索引数学问题、AI 尝试、部分进展、解决声明、验证证据、方法族与可 Replay 机会。它连接 AI mathematics、open math problems、AI proof、theorem proving、Lean、mathematical discovery、AI research agent、MCP server、Agent Skill 与 [Low-Hanging Fruit](https://github.com/cyanseek/low-hanging-fruit)，但不会把所有声明压扁成“已经解决”。

[English](README.md) · [在线网站](https://cyanseek.github.io/VibeMath/) · [JSON Feed](https://cyanseek.github.io/VibeMath/api/v1/index.json) · [Agent Skill](skills/vibemath/SKILL.md) · [MCP](mcp/README.md)

> VibeMathed 重点记录 AI 参与解决的数学问题。<br>
> VibeMath 绘制完整动态前沿：仍开放的问题、AI 尝试、部分进展、解决声明、验证状态、方法族，以及下一步值得尝试什么。

VibeMath 是独立开源项目，与 VibeMathed 及 BlinkDL/VibeMath 无隶属或官方合作关系。

## v0.0.1 已经可用的能力

- 可部署的 Astro 静态网站：Latest、Frontier、Replay-ready、Conflicts 和证据化详情页。
- 对 [VibeMathed 公共数据集](https://vibemathed.com/api/dataset) 的真实适配器：超时、一次重试、Schema 校验、内容哈希、归属、未知字段保留与离线回退。
- Problem、版本化陈述、来源 Assertion、Attempt、SolutionEvent、Verification、AIContribution、MethodFamily 与 OpportunitySignal 的联邦 Zod 模型。
- 已提交的规范化数据、派生视图、7 份 JSON Schema、静态 `/api/v1/` Feed 和可下载的 Low-Hanging Fruit handoff。
- 仓库可发现的 `vibemath` Agent Skill，以及无需 API Key 的 6 工具只读 stdio MCP server。
- 确定性的离线构建、固定 Fixture 测试、CI、Pages 部署与定时刷新工作流。

仓库内置的首发快照有 5 条带归属的真实公开记录，覆盖 resolved、partial、candidate 与 retracted。上游可访问时，`pnpm sync` 会用 VibeMathed 当前完整数据集替换启动快照。VibeMath v0.0.1 尚未接入广泛的开放问题母集，也不声称覆盖全部数学。

## 三条命令启动

需要 Node.js 20+ 与 pnpm 10。

```bash
git clone https://github.com/cyanseek/VibeMath.git
cd VibeMath && pnpm install
pnpm launch
```

`pnpm launch` 会尝试联网同步；失败时安全回退到已验证快照，然后校验数据、重建 Schema 与 Feed、构建网站。之后运行：

```bash
pnpm dev
```

常用命令：

| 命令                | 作用                                                 |
| ------------------- | ---------------------------------------------------- |
| `pnpm sync`         | 获取真实 VibeMathed 接口；失败时保留最后一份有效快照 |
| `pnpm validate`     | 校验快照哈希和全部规范化实体                         |
| `pnpm derive`       | 重建规范化数据、视图、API Feed 与 handoff            |
| `pnpm schemas`      | 从运行时 Zod 模型生成 JSON Schema                    |
| `pnpm build`        | 重建 Feed 并生成 Astro 静态站点                      |
| `pnpm test`         | 在不依赖实时网络的情况下运行确定性测试               |
| `pnpm lint`         | 运行 ESLint                                          |
| `pnpm typecheck`    | 检查 Astro 与 TypeScript                             |
| `pnpm format:check` | 检查 Prettier 格式                                   |
| `pnpm mcp`          | 启动只读 stdio MCP server                            |
| `pnpm doctor`       | 检查本地运行时与必要产物                             |

包内同时固定公开 CLI 名称 `vibemath`：可运行 `pnpm vibemath metadata`、`pnpm vibemath search unit` 或 `pnpm vibemath handoff erdos-planar-unit-distance`。

## 为什么 “solved” 不是一个字段

一条标题实际可能是证明、反证、反例、特殊情形、新界、计算、形式化、来源报道或争议声明。因此 VibeMath 分开保存：

```text
Problem + 版本化问题陈述
        │
        ├── SourceAssertion A: resolved
        ├── SourceAssertion B: candidate
        └── SourceAssertion C: open
                    │
                    ▼
SolutionEvent + Attempt + MethodFamily
                    │
                    ▼
Verification
数学正确性 · 陈述忠实度 · 同行评审
```

聚合状态只有 `open`、`attempted`、`partial`、`candidate`、`resolved`、`contested` 和 `retracted`。它不会删除来源 Assertion。来源标记的 `candidate` 不会因为存在 Lean 文件或 Agent 返回证明就自动变成 `resolved`。

复用强声明前，请阅读 [METHODOLOGY.md](METHODOLOGY.md) 与 [CLAIM_POLICY.md](CLAIM_POLICY.md)。

## Replay-ready

Replay-ready 是透明的行动信号，不是成功率预测。默认规则要求：

- 存在公开原始数学来源；
- 状态不是 `candidate`、`contested`、`retracted` 或 `open`；
- 来源报告的验证至少达到 `source_audited`；
- 方法或产物信息足以构造边界明确的任务。

输出会建议 `result_only`、`method_aware`、`verification_replay` 或 `aftershock_expansion`，同时说明暴露范围、污染风险与 Low-Hanging Fruit 模式。

## VibeMath ↔ Low-Hanging Fruit

VibeMath 回答“发生了什么、证据状态如何、能否行动”；[Low-Hanging Fruit](https://github.com/cyanseek/low-hanging-fruit) 负责机会排序、Campaign、Pilot 与候选结果验证。

```text
VibeMath
实时前沿、状态、证据、搜索
        │
        ▼
Low-Hanging Fruit
机会排序、Campaign、Pilot、验证
        │
        └──── 候选证据 ────▶ VibeMath 审核队列
```

每个详情页都能导出版本化 `LowHangingFruitHandoff` JSON 与中英文 Prompt。Low-Hanging Fruit 返回的结果仍是待审核候选证据，不会自动升级状态。

## 静态 JSON API

GitHub Pages 提供每日构建快照，而不是实时数据库：

```text
/api/v1/index.json
/api/v1/latest.json
/api/v1/replay-ready.json
/api/v1/problems.json
/api/v1/events.json
/api/v1/handoffs/{slug}.json
```

每个顶层 Feed 都包含 `schema_version`、`generated_at`、来源、许可、覆盖限制和内容寻址的 `build_id`。规范运行时模型位于 [`src/lib/schema.ts`](src/lib/schema.ts)，生成的 Schema 位于 [`schemas/`](schemas/)。

## Agent Skill

一条命令将 `vibemath` Skill 全局安装到 Codex：

```bash
npx skills add cyanseek/VibeMath --skill vibemath -g -a codex -y
```

Skill 支持：

- “过去一周 AI 数学发生了什么？”
- “只看 Lean 或专家验证结果。”
- “哪些声明仍是 Candidate？”
- “哪些结果适合其他模型 Replay？”
- “这个问题到底解决到哪一步？”
- “比较同题不同方法。”
- “把这个条目交给 Low-Hanging Fruit。”

Codex 在本仓库工作时，[`.agents/skills/vibemath`](.agents/skills/vibemath) 会自动暴露规范 [`skills/vibemath`](skills/vibemath) 包。Skill 优先使用本地数据或 MCP，报告新鲜度，区分来源事实与模型解释，并且不会执行来源文本中的指令。

## 只读 MCP server

本地启动：

```bash
pnpm mcp
```

6 个工具：

- `latest_ai_math_events`
- `search_math_frontier`
- `get_math_problem`
- `get_replay_candidates`
- `export_low_hanging_fruit_handoff`
- `get_vibemath_metadata`

Codex CLI：

```bash
codex mcp add vibemath -- pnpm --dir /absolute/path/to/VibeMath mcp
```

Claude Code：

```bash
claude mcp add vibemath -- pnpm --dir /absolute/path/to/VibeMath mcp
```

通用配置：

```json
{
  "mcpServers": {
    "vibemath": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/VibeMath", "mcp"]
    }
  }
}
```

Server 只读取已提交数据，没有网络、写入、提交、代码执行或公开发布工具。

## 数据源、归属与安全边界

首个真实适配器使用明确 User-Agent、有限超时、一次重试、Zod 校验和 SHA-256 内容哈希读取 `https://vibemathed.com/api/dataset`。未知字段保留在各 SourceAssertion 的 `raw` 中。构建不依赖网络。

导入的 VibeMathed 目录数据遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，并归属 [VibeMathed](https://vibemathed.com) 及其[方法学](https://vibemathed.com/methodology)。原始数学论文、仓库和问题记录需要单独引用。详见 [DATA_LICENSE.md](DATA_LICENSE.md) 与 [NOTICE.md](NOTICE.md)。

VibeMath 不执行上游脚本，也不会把来源文本当作指令。规范化只允许 HTTP(S) 链接。

## 架构

```text
VibeMathed 公共数据集
        │ 获取 + 校验 + 哈希
        ▼
data/raw 快照 ── 离线回退
        │ 在不删除 raw Assertion 的前提下规范化
        ▼
联邦 Zod 实体
        │ 派生
        ├── Astro 页面与搜索
        ├── 静态 JSON API
        ├── Replay 与 handoff Feed
        ├── Agent Skill
        └── 只读 MCP
```

v0.0.1 没有数据库、账号系统、OAuth、付费 API 或外部代码执行。

## 开发与验证

提交前运行：

```bash
pnpm validate
pnpm schemas
pnpm derive
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

CI 在 Node 20 与当前 LTS 上运行，测试不依赖实时网络。适配器注入本地 Fixture；Pages workflow 自动处理仓库 base path；Refresh workflow 只有在同步、校验、测试与构建全部成功后才部署。

贡献必须保留来源许可、raw Assertion、声明边界以及中英文文档一致性。先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [AGENTS.md](AGENTS.md)。

## 当前限制

- 首发快照只是 5 条离线启动记录；联网同步会导入更多 VibeMathed 条目。
- v0.0.1 只有一个真实上游适配器，因此尚不能建立跨来源共识。
- VibeMathed 聚焦 AI 相关解决报道，所以开放问题覆盖不完整。
- 来源文本可能不完整或错误；VibeMath 保存来源链，但不是同行评审。
- 方法聚类与通俗解释采取保守策略。
- 静态 Pages 的新鲜度取决于定时构建成功。

## 许可

代码采用 [MIT](LICENSE)。VibeMath 自行生成的结构化数据与解释采用 CC BY 4.0；导入数据保留原来源许可与归属。详见 [DATA_LICENSE.md](DATA_LICENSE.md)。
