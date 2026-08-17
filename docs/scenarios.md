# SAFA Agent Conversations

These transcripts demonstrate the intended Agent Skill experience. Every alias, relationship,
command result, process name, and metric is synthetic. They are product examples—not records from a
real machine and not claims that arbitrary shell access is available.

## 1. Diagnose an unavailable website

> **You**
>
> Find out why the production website is unavailable. Diagnose it, but do not change anything.

> **Agent**
>
> I’ll use SAFA to discover the registered service and run only bounded diagnostics. You do not need
> to send me connection details or a credential.

<details open>
<summary><strong>SAFA Skill activity</strong></summary>

| Step | Skill / Runtime call | Synthetic result |
|---:|---|---|
| 1 | `doctor` | Broker and vault are ready. |
| 2 | `resource list` | `web.production` matches the requested role. |
| 3 | `topology show web.production` | Bounded service context returned. |
| 4 | `exec web.production … systemctl is-active nginx` | `active` |
| 5 | `exec web.production … df -h /` | Root filesystem is 98% full. |

</details>

> **Agent**
>
> Nginx is running, but the root filesystem is at 98% usage. Capacity pressure is the strongest
> current explanation. I made no changes and did not receive a reusable credential.

## 2. Verify an application-to-database path

> **You**
>
> Can the production application reach its primary database? Show me the path you relied on.

> **Agent**
>
> I’ll ask SAFA for a Broker-computed path. I won’t infer connectivity from similar names, diagram
> placement, or an Agent-authored relationship.

<details open>
<summary><strong>SAFA Skill activity</strong></summary>

| Step | Skill / Runtime call | Synthetic result |
|---:|---|---|
| 1 | `resource list` | Found `app.production` and `database.primary`. |
| 2 | `topology path app.production database.primary` | Outcome: `confirmed`. |
| 3 | Broker proof | `app.production → network.private → database.primary` |

</details>

> **Agent**
>
> Yes. The Broker reports a verified path from `app.production` through `network.private` to
> `database.primary`. This answer comes from fresh trusted observations; the diagram is only a human
> view of the same bounded projection.

## 3. Investigate high CPU on a worker

> **You**
>
> The batch worker is reporting high CPU. Tell me what is using it, but do not stop anything.

> **Agent**
>
> I’ll select the registered worker and request an allowlisted process snapshot. SAFA does not give
> me a general remote shell.

<details open>
<summary><strong>SAFA Skill activity</strong></summary>

| Step | Skill / Runtime call | Synthetic result |
|---:|---|---|
| 1 | `resource show worker.batch` | Active Linux host; safe summary only. |
| 2 | `exec worker.batch … ps … --sort=-%cpu` | `python3` is using 82.4% CPU. |

</details>

> **Agent**
>
> A `python3` process is the dominant CPU consumer at 82.4% in this snapshot. I did not terminate or
> renice it. The current evidence does not identify its application owner, so I would report that
> limit rather than guess from process output.

## What these examples demonstrate

- the user asks in natural language instead of selecting a transport command;
- the Skill discovers logical aliases and chooses the smallest allowed operation;
- topology truth and credential use remain Broker-owned;
- the Agent reports uncertainty and lifecycle state instead of bypassing a denial;
- consequential changes require a separately authorized workflow and are not implied by diagnosis.
