# Topology Projection v1

**Status**: Design approved; Runtime implementation pending.

SAFA models infrastructure topology as a directed, typed, attributed multigraph. A rendered
diagram, tree, Mermaid document, or prose description is never the authoritative representation.
Those formats lose direction, parallel edges, provenance, freshness, or security state and are
also sensitive to visual layout and textual ordering.

This contract defines the platform-neutral graph and the bounded projections that an Agent may
receive. It does not add a public CLI command. CLI and native IPC bindings require separate
conformance fixtures before they are exposed.

## 1. Trust layers

The graph has three non-interchangeable layers:

| Layer | Writer | Meaning | Execution authority |
|---|---|---|---|
| `desired` | trusted user or policy-bounded Agent proposal | Intended logical relationship | None |
| `observed` | signed Runtime adapter or Broker probe | Time-bounded evidence about the actual environment | Route evidence only |
| `derived` | Broker graph engine | Deterministic result computed from a graph revision | Route evidence only |

An Agent proposal starts as `desired/asserted`. It cannot mark itself `verified`, supply trusted
evidence, bind a credential, or create execution authority. Only the Broker may produce
`observed/verified` or `derived/verified` edges. Even a verified path does not authorize an action;
normal credential scope, policy, risk, and user-approval checks still apply.

## 2. Nodes

Every node has an immutable internal ID. Agent-visible projections use stable semantic aliases
rather than regenerated numeric labels. A node is one of:

```text
resource
site
security-domain
network-segment
runtime
route
```

`resource` nodes reference the resource directory and therefore cover hosts, databases, object
stores, caches, messaging systems, search systems, graph databases, and services. Context nodes
describe placement and connectivity without pretending that a site or network is an executable
resource.

Context aliases use reviewed namespaces such as `site.*`, `domain.*`, `network.*`, and `runtime.*`.
Aliases, node kinds, and allowlisted abstract attributes may be marked `agent-visible` through a
trusted local flow. CIDRs, IP addresses, ports, DNS names, usernames, route coordinates, host
identities, and credential bindings remain protected or Broker-only.

## 3. Edges

Every edge has an immutable ID, explicit `from`, `relation`, and `to`, and supports parallel edges.
Initial relation identifiers are:

```text
located-in
member-of
runs-on
depends-on
backed-by
replicates-to
routed-via
can-reach
```

Relation direction is normative. For example, `A can-reach B` says nothing about `B can-reach A`.
An edge also carries:

| Field | Meaning |
|---|---|
| `layer` | `desired`, `observed`, or `derived` |
| `verification` | `asserted`, `verified`, `stale`, or `failed` |
| `origin` | `user`, `agent`, `import`, `adapter`, or `broker` |
| `observed_at` / `valid_until` | Evidence freshness; absent for a purely desired claim |
| `visibility` | `agent`, `protected`, or `broker` |
| `evidence_ref` | Broker-only reference to bounded probe evidence |
| `revision` | Revision that changes whenever security-relevant edge state changes |

Routes are represented by explicit nodes and edges rather than a free-form `via` string. This
keeps multi-hop routes queryable and prevents a textual route description from becoming executable
configuration.

## 4. Agent projection

The base Agent projection is a bounded JSON node table plus typed edge table. It contains only
agent-visible aliases and attributes and is deterministically serialized.

```json
{
  "schema": "dev.safa.topology/v1",
  "graph_revision": 42,
  "task": "reachability",
  "ordering": "rooted-bfs-then-alias",
  "roots": ["host.compute-a", "service.data-api"],
  "nodes": [
    {"alias": "host.compute-a", "kind": "resource", "resource_kind": "host"},
    {"alias": "service.data-api", "kind": "resource", "resource_kind": "service"}
  ],
  "edges": [
    {
      "id": "edge-7f4a",
      "from": "host.compute-a",
      "relation": "can-reach",
      "to": "service.data-api",
      "layer": "derived",
      "verification": "verified",
      "freshness": "fresh"
    }
  ],
  "proofs": [
    {
      "question": "can-reach",
      "from": "host.compute-a",
      "to": "service.data-api",
      "result": true,
      "edge_ids": ["edge-7f4a"],
      "computed_by": "broker"
    }
  ],
  "truncated": false
}
```

The example uses fictitious aliases and does not prescribe a real inventory.

Canonical storage order is irrelevant. Before projection, nodes and edges are normalized by stable
identity. The projector then chooses an ordering and representation for the question:

| Task | Primary projection | Ordering |
|---|---|---|
| inventory, ownership, placement | node table + typed edge list | kind, then canonical alias |
| reachability or route explanation | adjacency list + Broker-computed proof paths | source-rooted breadth-first order |
| dependency impact | reverse adjacency list + affected-set proof | target-rooted reverse breadth-first order |
| small homogeneous dense comparison | bounded relation matrix plus node legend | stable alias order |
| human overview | generated diagram plus the same textual projection | presentation only |

No format is universal. The projection declares its task and ordering so the Agent does not have to
infer how the sequence was produced.

## 5. Query and retrieval rules

The Broker, not the LLM, computes exact neighborhood, reachability, path, cycle, and dependency-set
operations. The Agent receives the result and the supporting node/edge IDs.

Queries operate on explicit roots, relation allowlists, direction, maximum hops, maximum nodes, and
maximum edges. Large graphs are reduced to a connected, question-relevant subgraph. MVP retrieval
uses deterministic traversal and path algorithms; embedding retrieval may locate candidate roots
later, but cannot establish connectivity or execution authority. Any omitted material sets
`truncated: true` and reports the applied bounds.

Projection output must be invariant to persistence order. Tests must permute stored node and edge
order and require identical normalized projections, graph-query results, and proof paths.

## 6. Disclosure and mutation

Agent-visible logical topology is an explicit, reviewed subset. It may include aliases, abstract
site/network names, resource placement, service dependencies, and sanitized reachability state. It
never includes physical coordinates, CIDRs, endpoint details, usernames, credential roles or
locators, host fingerprints, raw probe output, or policy internals.

An Agent may propose additions or corrections to desired logical edges. The Broker validates the
relation vocabulary, endpoint existence, visibility, cycles where prohibited, and revision before
commit. Connectivity becomes verified only after a trusted adapter or bounded probe produces fresh
evidence. Stale or failed evidence is visible as state, never silently treated as success.

## 7. Visual representations

SVG, Mermaid, and other diagrams are derived artifacts for human review. A multimodal Agent may
receive one as an auxiliary view only when it also receives the canonical textual projection and
the exact Broker proof. Layout, color, proximity, arrow routing, and node placement carry no
authority. A diagram parse or model interpretation can never produce a verified edge.

## 8. Research basis

- [Talk like a Graph](https://arxiv.org/abs/2310.04560) finds that graph-task accuracy varies with
  encoding, task, and graph structure rather than having one universal textual format.
- [Can Graph Descriptive Order Affect Solving Graph Problems with LLMs?](https://aclanthology.org/2025.acl-long.321/)
  shows that description order materially affects graph comprehension and that the effect is
  task-dependent.
- [G-Retriever](https://proceedings.neurips.cc/paper_files/paper/2024/hash/efaf1c9726648c8ba363a5c927440529-Abstract-Conference.html)
  supports retrieving a small connected subgraph and returning supporting nodes and edges instead
  of flattening an entire large graph into the context window.
- [GITA](https://proceedings.neurips.cc/paper_files/paper/2024/hash/00295cede6e1600d344b5cd6d9fd4640-Abstract-Conference.html)
  shows that visual and textual graph integration can help a purpose-trained multimodal system;
  this supports an auxiliary visual view, not a screenshot-only authority boundary.
- [Visual Graph Arena](https://openreview.net/forum?id=BCJPAmlfxv) reports strong layout sensitivity
  in current multimodal models, reinforcing that visual layout must not determine operational
  truth.

## 9. Compatibility analysis

This is an additive design contract. It changes no existing `dev.safa.cli/v1` command, field,
status, exit code, or Runtime manifest. Existing resource relationships remain protected by default;
Agent visibility requires an explicit trusted-local classification. Runtime DTO bindings and
representative conformance fixtures are intentionally pending together so no implementation may
claim topology support from this document alone.
