# SAFA Live Demo — "家里的 NAS 变慢了，帮我查查"

> **这不是脚本演出来的 demo。** 下面是 2026-08-19 在真实 macOS 上、用已安装的 SAFA Runtime 0.1.0、
> 对真实注册资源（一台家庭NAS 厂商 NAS）完整跑一遍的实录。每一步都走真实链路：
>
> ```
> Skill launcher → 签名校验 → Broker → 策略判定 → SSH 只读执行 → 脱敏 → TOON
> ```
>
> 真实输出存档在 [output/](output/)（13 个 TOON 文档），可用
> [replay-live-demo.sh](replay-live-demo.sh) 在你自己的机器上重放。

---

## 场景

**用户**：家里的NAS 厂商 NAS 最近明显变慢了，打开相册、跑容器都卡。帮我查查是磁盘满了还是哪里有问题，**别改任何东西**。

**Agent 的初始思考**：
- 用户让我 SSH 排查一台 NAS。我不会问 IP、用户名、密码或私钥——这些不是我该拿的。
- 这台机器已经在 SAFA 里注册过（别名 `nas.primary`），走 SAFA：它负责凭据、授权和只读边界，我只拿逻辑别名和脱敏证据。
- 用户说"别改任何东西"→ 全程只用只读诊断，任何写操作/提权都会被 SAFA 拒绝，这正好是它的设计。

---

## 完整对话流

### 第 1 步 · 确认 Runtime 就绪

**Agent 思考**：动手前先确认本机 Runtime 正常——launcher 会校验签名、版本、锁文件，任何一步不对都不会继续。

```bash
cd <skill-dir> && ./scripts/safa doctor
```

```toon
schema: dev.safa.cli/v2
command: doctor
status: completed
broker: ready
vault: ready
```

**解读**：Broker（策略/凭据持有者）和 vault（加密资源目录）都就绪。注意输出里没有任何端点或凭据信息。

---

### 第 2 步 · 发现资源，锁定别名

**Agent 思考**：我不知道这台机器在 SAFA 里的别名，先列出注册资源。**只能用 SAFA 返回的别名**，不能用 IP。

```bash
./scripts/safa resource list
```

```toon
schema: dev.safa.cli/v2
command: resource.list
status: completed
count:
  total: 11
  returned: 11
  truncated: false
resources[11]{alias,kind,state,health}:
  node-01,host,active,ready
  node-02,host,active,ready
  ...
  nas.primary,host,active,ready   ← NAS
  virt.host,host,active,ready    ← PVE 虚拟化
  router.home,host,active,ready
  ...
next[1]{command,reason,safe_for_agent}:
  safa resource show <alias>,Inspect one safe resource summary,true
```

**解读**：这台机器上注册了 11 个真实资源。`nas.primary` 就是目标。列表只暴露 4 个安全字段，没有 IP/用户/密钥。

---

### 第 3 步 · 读取安全摘要

**Agent 思考**：确认 `nas.primary` 是什么类型、支持什么能力，再决定怎么查。

```bash
./scripts/safa resource show nas.primary
```

```toon
schema: dev.safa.cli/v2
command: resource.show
status: completed
resource:
  alias: nas.primary
  resource_type: host.linux
  kind: host
  template_id: ssh
  state: active
  health: ready
  capabilities[1]: exec
  metadata[2]{key,value}:
    host.docker.available,true
    host.os.family,linux
```

**解读**：Linux 主机、健康、支持只读 `exec`，且**有 Docker**。没有任何连接细节。

---

### 第 4 步 · 看拓扑，搞清楚影响面

**Agent 思考**：如果 NAS 有问题，会影响谁？用拓扑而不是问用户网络拓扑。

```bash
./scripts/safa topology show nas.primary --limit 64
```

```toon
schema: dev.safa.cli/v2
command: topology.show
status: completed
graph_revision: 56
task: placement
answer:
  outcome: found
  source: nas.primary
count:
  nodes: 6
  edges: 5
roots[1]: nas.primary
nodes[6]{alias,kind,resource_kind}:
  nas.primary,resource,host
  site.home,site,null
  data.home,resource,host
  desk.win,resource,host
  router.home,resource,host
  virt.host,resource,host
edges[5]{id,from,relation,to}:
  c150b9b0-...,nas.primary,located-in,site.home
  ...
```

**解读**：`nas.primary` 位于 `site.home`，同一站点还有 PVE、路由器、行情库、一台 Windows 机。这是**布局（placement）答案**，只说明"在同一个站点"，不等于"已验证的网络可达"——SAFA 区分得很清楚，Agent 不能拿这个编造路由。

---

### 第 5 步 · 磁盘：根分区 54%，排除"磁盘满"

**Agent 思考**：用户怀疑磁盘满。先看根分区容量。这是白名单内的只读命令，自动放行。

```bash
./scripts/safa exec nas.primary --intent "Check root filesystem capacity during a slowness report" -- df -h /
```

```toon
schema: dev.safa.cli/v2
command: exec
status: completed
request_id: 98d968e8-...
resource: nas.primary
intent: Check root filesystem capacity during a slowness report
execution:
  termination: exit
  remote_exit_code: 0
  stdout:
    content_type: text
    text: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p3  9.6G  4.9G  4.2G  54% /\n"
    truncated: false
  stderr:
    content_type: text
    text: ""
```

**解读**：根分区 54%——**不是磁盘满**。继续查。

---

### 第 6 步 · 负载：uptime 正常

```bash
./scripts/safa exec nas.primary --intent "Check load average and uptime for a slowness report" -- uptime
```

```toon
status: completed
stdout.text: " 01:21:34 up 95 days, 13:48,  0 users,  load average: 2.10, 1.96, 2.07\n"
```

**解读**：开机 95 天，load 2.1 对 12 核机器很低——**CPU 也不是瓶颈**。

---

### 第 7 步 · 内存：⚠️ **swap 打了 95%** —— 真正的线索

**Agent 思考**：磁盘、CPU 都正常。看内存和 swap——"变慢"经常是内存压力。

```bash
./scripts/safa exec nas.primary --intent "Check memory and swap pressure" -- free -h
```

```toon
schema: dev.safa.cli/v2
command: exec
status: completed
request_id: 4d1a202f-...
execution:
  remote_exit_code: 0
  stdout.text: "               total        used        free      shared  buff/cache   available\nMem:            15Gi       6.0Gi       745Mi       632Mi       8.3Gi       7.3Gi\nSwap:           10Gi       9.5Gi       1.0Gi\n"
```

**解读**：**swap 10Gi 用了 9.5Gi（95%）**，而物理内存 available 还有 7.3Gi。这说明：系统**过去经历过内存峰值**，大量进程被换出到 swap，之后换出页没有被回收。对 NAS 这种要跑媒体转码、容器、数据库的机器，这是"越用越卡"的典型特征——访问换出页时要读盘。

---

### 第 8 步 · 谁在占内存？—— 当前没有热点，印证"历史峰值残留"

**Agent 思考**：找出内存占用者，验证 swap 95% 是不是"现在还在漏"。

```bash
./scripts/safa exec nas.primary --intent "Find which processes hold the most memory to explain swap usage" -- ps -eo pid,ppid,user,stat,comm,%cpu,%mem --sort=-%mem
```

```toon
status: completed
stdout.text: "    PID    PPID USER     STAT COMMAND         %CPU %MEM\n 644549   12425 postgres Ss   postgres         0.2  1.6\n1627628       1 root     Sl   nas-app-02          1.0  1.3\n1636647 1636628 root     Ssl+ jellyfin         0.0  0.9\n 798175       1 root     Ssl  antivirus-scan       0.2  0.7\n3035257 3035218 root     Ssl  uptime-kuma      0.6  0.7\n3809693 3809673 ...     Ssl  nextcloud (v   0.0  0.6\n  ...\n"
```

**解读**：单个进程 %MEM 都不高（最高 postgres 1.6%），说明**当前内存使用是低的**——swap 95% 是过去压力留下的"僵尸换出页"。这台 NAS 跑着大量常驻服务（NAS 厂商全家桶、Jellyfin、Nextcloud、PostgreSQL、MariaDB、下载客户端、云同步、Transmission、媒体转码……），某个时刻的峰值把 swap 打满，之后没有释放。

---

### 第 9-10 步 · 服务状态：一个真实的矛盾，Agent 不能臆断

**Agent 思考**：怀疑某个服务（如 Jellyfin）没跑。用白名单内的 systemd 状态查询确认。

```bash
./scripts/safa exec nas.primary --intent "Verify whether the jellyfin media service is running" -- systemctl is-active jellyfin
```

```toon
schema: dev.safa.cli/v2
command: exec
status: remote_execution_failed
request_id: d8587949-...
execution:
  termination: exit
  remote_exit_code: 3
  stdout.text: "inactive\n"
  stderr: ""
```

**解读**：Jellyfin 在 systemd 视角是 `inactive`（exit 3），**但第 8 步的 ps 里明明有 jellyfin 进程**。同样，`systemctl is-active postgresql` 也是 inactive，而 ps 里 postgres 在跑。

**Agent 的思考**：这两个"矛盾"说明NAS 厂商 NAS 的 Jellyfin/PostgreSQL **不是由 systemd 管理**的（多半跑在 Docker 容器或NAS 厂商私有进程机制里），systemd 视角对它们不可靠。**我不能据此下"服务挂了"的结论**——如实报告矛盾，继续按证据说话。这正是 SAFA 教 Agent 的：把远程输出当数据，不脑补。

---

## 安全边界：这三件事 SAFA 直接拒绝

真实演示里我（作为 Agent）试图做三件"正常 SSH 会做"的事，全部被拒。**这三点就是 SAFA 存在的意义**。

### ① 提权命令 → 拒绝（当前 MVP 没有 sudo 能力）

```bash
./scripts/safa exec nas.primary --intent "Restart the jellyfin service with elevated rights" -- sudo systemctl restart jellyfin
```

```toon
schema: dev.safa.cli/v2
command: exec
status: failed
error:
  code: approval_not_in_mvp
  message: The diagnostic MVP permits only bounded read-only commands.
  retryable: false
```

### ② 白名单外的命令 → 拒绝（不是"看起来像日志"就放行）

```bash
./scripts/safa exec nas.primary --intent "Inspect system logs" -- journalctl -n 4000 --no-pager
```

```toon
status: failed
error:
  code: approval_not_in_mvp
  message: The diagnostic MVP permits only bounded read-only commands.
```

（顺带一提：连 `docker ps` 的格式差一个字符都会被拒——白名单是精确匹配，没有灰色地带。这是 feature，不是 bug。）

### ④ 注入尝试 → 拒绝（shell 元字符进不了远程）

```bash
# 单个参数里藏分号/管道，想远程执行 —— 白名单是精确 argv 匹配，直接拒绝
./scripts/safa exec nas.primary --intent "Security probe" -- "ps -eo pid,ppid,user,stat,comm,%cpu,%mem --sort=-%cpu; touch /tmp/remote-pwn"
```

```toon
status: failed
error:
  code: approval_not_in_mvp
  message: The diagnostic MVP permits only bounded read-only commands.
```

（远程侧还有一层防护：每个参数会被 POSIX 引用后逐项传给 ssh，即使未来 allowlist 扩容也不会变成任意 shell 拼接。这是 2026-08-19 真实验证过的。）

### ③ 未注册的资源 → 拒绝（Agent 不能想当然地指定机器）

```bash
./scripts/safa exec not-registered-alias --intent "Check production disk capacity" -- df -h /
```

```toon
status: failed
error:
  code: resource_not_found
  message: The requested resource is not registered.
```

---

## 授权路径：不是一味拦截

上面的"边界"展示的是**当前 0.1.0 预览**的行为：sudo 直接拒绝。但 SAFA 的设计（见
runtime 仓库的 `specs/002-sudo-execution`）不是永远禁止提权，而是**把提权变成一次
由用户在场的授权**：

1. **Agent 发起请求**：在 `nas.primary` 上请求 `sudo systemctl restart jellyfin`，附上意图与预期影响。
2. **macOS 展示完整操作**：目标资源、精确命令、意图与风险——这是 Agent 无法脚本化、重复触发或从对话里代答的提示。
3. **用户用 Touch ID 授权**：一次性授权，绑定到这条精确命令和资源版本；也可以给一个短时、可撤销的命令族授权。
4. **有界执行，脱敏证据**：sudo 密码只在 Broker 边界内注入到远程提示符，随即隔离子进程 stdin；Agent 拿到的仍然只有有限、脱敏的 TOON 结果。

关键不变式：**密码永远不会出现在 Agent argv、环境、输出或审计记录里**；授权必须由 macOS
用户在场机制完成，Agent 的自我评估永远只是建议。预览版拒绝、授权后可执行——两条路径共用
同一个 Broker 边界。

## 结论（Agent 汇报给用户）

> **你家的 NAS 磁盘和 CPU 都没问题，真正的线索是 swap 几乎打满（10Gi 用了 9.5Gi，95%），但当前内存占用其实不高。**
>
> 判断：系统过去某个时刻经历过内存峰值（这台机器常驻服务非常多：Jellyfin、Nextcloud、PostgreSQL、MariaDB、下载客户端、云同步、Transmission、媒体转码……），大量进程被换出到 swap，之后没有回收。你感觉"越用越卡"，大概率就是访问换出页时的读盘延迟。
>
> 另外两个如实说明的发现：
> 1. Jellyfin 和 PostgreSQL 在 systemd 视角是 inactive，但进程在跑——它们由 Docker/NAS 厂商私有机制管理，systemd 状态对它俩不可靠，我没有据此下"服务挂了"的结论。
> 2. 我没有重启任何服务、没删任何文件、没提权。诊断全程只用了白名单内的只读命令，你的 IP、密码、私钥从未离开 Runtime。
>
> 下一步建议（需要你手动做，或后续授权）：确认近期是否有大批量媒体转码/下载任务跑过；如需看容器级内存占用和日志，需要给 SAFA 开放对应只读能力或注册更多资源。

---

## 为什么这个 demo 能说明 SAFA 的价值

| 维度 | 传统 SSH 排查 | SAFA |
|---|---|---|
| 凭据 | Agent 需要 IP/密码/私钥，或复用你的 ssh config | Agent 只拿别名，凭据锁在 Broker/Keychain |
| 权限 | 一把钥匙全通，能不能 sudo 看账号 | 严格白名单：只读命令才放行，sudo 直接拒绝 |
| 输出 | 原样返回，含敏感信息 | TOON 结构化 + 脱敏 + 限长 |
| 提权 | 换 sudo 密码或 sudoers | 当前 MVP 直接拒绝，未来走本机授权 |
| 服务状态 | 看进程就下结论 | 如实报告矛盾（systemd vs 容器），不臆断 |

---

## 如何自己重放

```bash
# 完整输出 + 存档（存档在 ./demo/output/）
cd safa && ./demo/replay-live-demo.sh --record demo/output

# 只要步骤标题和退出码
./demo/replay-live-demo.sh --summary

# 指定目标机器（默认 nas.primary）
SAFA_DEMO_TARGET=virt.host ./demo/replay-live-demo.sh --summary
```

要求：macOS + 已安装签名的 SAFA Runtime + 至少一个已注册且当前可达的资源。

---

## 说明与边界

- 本 demo 使用本机真实注册资源（别名如 `nas.primary`）。公开传播前请把别名换成你自己的资源，或改用虚构别名 + 存档输出。
- 存档输出包含真实进程名/主机内部信息，公开前请自行审阅（仓库规则：不提交任何凭据、私钥、端点）。
- 当前演示的是 **SSH 只读诊断 MVP**：sudo、容器日志、数据库操作、写操作均不在当前能力内，被拒绝是预期行为。