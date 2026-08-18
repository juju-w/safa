# Research References

SAFA cites research and external design specifications where they materially informed a decision.
The current basis covers both the Agent-facing CLI and bounded infrastructure-topology projections.
These citations acknowledge the influence; they do not claim that SAFA reproduces another project's
models, datasets, benchmarks, or reported results.

The normative SAFA behavior remains in the public contracts and deterministic Broker tests. If a
future implementation copies or adapts source code, an algorithm implementation, dataset, or other
licensed artifact, its license and required attribution must be reviewed separately from this
scholarly bibliography.

## Agent CLI design

1. Kun Chen. “AXI: Agent eXperience Interface.” 2026.
   [Website](https://axi.md/) · [Source and Skill](https://github.com/kunchenguid/axi)

   **Influence on SAFA:** the Agent-only CLI adopts token-efficient output, minimal default schemas,
   bounded previews, precomputed aggregates, definitive empty states, structured failures,
   content-first roots, contextual next commands, and concise local help. SAFA narrows ambient
   context and `--full` behavior to preserve its security boundary.

2. Johann Schopplich and contributors. “Token-Oriented Object Notation (TOON), Specification v4.1.”
   2026. [Specification](https://toonformat.dev/reference/spec.html) ·
   [Implementations](https://toonformat.dev/ecosystem/implementations.html)

   **Influence on SAFA:** public Agent output uses canonical TOON at the presentation boundary while
   typed Runtime DTOs, private IPC, and persistence remain implementation details. Shipping requires
   strict conformance fixtures against the selected encoder version.

## Topology projection

1. Bahare Fatemi, Jonathan Halcrow, and Bryan Perozzi. “Talk like a Graph: Encoding Graphs for Large
   Language Models.” arXiv:2310.04560, 2023.
   [Paper](https://arxiv.org/abs/2310.04560)

   **Influence on SAFA:** graph serialization is task-dependent; SAFA does not declare one universal
   textual encoding.

2. Yuyao Ge, Shenghua Liu, Baolong Bi, Yiwei Wang, Lingrui Mei, Wenjie Feng, Lizhe Chen, and Xueqi
   Cheng. “Can Graph Descriptive Order Affect Solving Graph Problems with LLMs?” *Proceedings of the
   63rd Annual Meeting of the Association for Computational Linguistics*, 2025, pp. 6404–6420.
   [Paper](https://aclanthology.org/2025.acl-long.321/) ·
   [DOI](https://doi.org/10.18653/v1/2025.acl-long.321)

   **Influence on SAFA:** projections declare stable ordering and select an order appropriate to the
   requested task.

3. Zike Yuan, Ming Liu, Hui Wang, and Bing Qin. “GraCoRe: Benchmarking Graph Comprehension and
   Complex Reasoning in Large Language Models.” *Proceedings of the 31st International Conference
   on Computational Linguistics*, 2025, pp. 7925–7948.
   [Paper](https://aclanthology.org/2025.coling-main.531/)

   **Influence on SAFA:** longer context alone is not treated as better topology understanding;
   question-relevant projections remain bounded.

4. Xiaoxin He, Yijun Tian, Yifei Sun, Nitesh V. Chawla, Thomas Laurent, Yann LeCun, Xavier Bresson,
   and Bryan Hooi. “G-Retriever: Retrieval-Augmented Generation for Textual Graph Understanding and
   Question Answering.” *Advances in Neural Information Processing Systems 37*, 2024.
   [Paper](https://proceedings.neurips.cc/paper_files/paper/2024/hash/efaf1c9726648c8ba363a5c927440529-Abstract-Conference.html) ·
   [DOI](https://doi.org/10.52202/079017-4224)

   **Influence on SAFA:** a large topology is reduced to a connected, question-relevant subgraph with
   supporting nodes and edges instead of being flattened wholesale into the prompt.

5. Yanbin Wei, Shuai Fu, Weisen Jiang, Zejian Zhang, Zhixiong Zeng, Qi Wu, James T. Kwok, and Yu
   Zhang. “GITA: Graph to Visual and Textual Integration for Vision-Language Graph Reasoning.”
   *Advances in Neural Information Processing Systems 37*, 2024.
   [Paper](https://proceedings.neurips.cc/paper_files/paper/2024/hash/00295cede6e1600d344b5cd6d9fd4640-Abstract-Conference.html) ·
   [DOI](https://doi.org/10.52202/079017-0002)

   **Influence on SAFA:** a visual graph may accompany the canonical textual projection for people
   or multimodal systems, but it is never the only operational input.

6. Zahra Babaiee, Peyman Kiasari, Daniela Rus, and Radu Grosu. “Visual Graph Arena: Evaluating
   Visual Conceptualization of Vision and Multimodal Large Language Models.” *Proceedings of the
   42nd International Conference on Machine Learning*, PMLR 267, 2025, pp. 2081–2113.
   [Paper](https://proceedings.mlr.press/v267/babaiee25a.html)

   **Influence on SAFA:** visual layout is not treated as infrastructure truth. Exact reachability,
   impact, and cycle answers remain deterministic Broker computations.

## Repository citation file

A root `CITATION.cff` serves a different purpose: it tells users how to cite SAFA itself. It does not
replace citations to research that informed the design. SAFA has no tagged public release or DOI
during the publication hold, so a software citation file is intentionally deferred until authorship,
version, release date, and archival identifier can be stated accurately.
