# Ralph Monitoring Guide — WeatherLens

> How to observe, verify, and tune Ralph's autonomous operation on the WeatherLens project.

---

## Table of Contents

1. [Quick Status Commands](#1-quick-status-commands)
2. [Reading Activity History](#2-reading-activity-history)
3. [System Health Checks](#3-system-health-checks)
4. [Daily Monitoring Checklist](#4-daily-monitoring-checklist)
5. [Weekly Review](#5-weekly-review)
6. [Reference: Today's Doctor Run](#6-reference-todays-doctor-run)

---

## 1. Quick Status Commands

### Squad Status

Shows Ralph's current state, active tasks, and pending work:

```bash
npx @bradygaster/squad-cli status
```

**What to look for:**

| Field | Healthy | Investigate |
|---|---|---|
| Agent state | `active` or `idle` | `error`, `paused`, `unknown` |
| Active tasks | ≤ 3 (max configured in `config.yml`) | More than 3 — hit `max_concurrent_tasks` |
| Pending escalations | 0 | Any count > 0 — someone needs to respond |
| Last heartbeat | Within the last 6 hours | Older than 6 h — idle-watch may have stalled |

### Token / Cost Usage

Tracks cumulative token spend and API usage:

```bash
npx @bradygaster/squad-cli cost
```

**What to look for:**

- **Daily token burn** — compare against your budget baseline. A sudden spike often means Ralph is stuck in a retry loop.
- **Model breakdown** — verify Ralph is using the expected model tier (economy mode should keep costs low for routine tasks).
- **Trend** — cost should be roughly flat week-over-week for steady-state operation. A rising trend may mean new task handlers are more expensive than anticipated.

> **Tip:** Run `cost` right after `status` so you can correlate high spend with specific active tasks.

---

## 2. Reading Activity History

Ralph logs every significant action to:

```
.squad/agents/ralph/history.md
```

### How to read it

Each day's entry follows a consistent format:

```markdown
## YYYY-MM-DD
- ✅ Completed task description
- ⚠️ Escalated: reason and issue reference
- ⏸️ Paused: reason and issue reference
```

### Status icons

| Icon | Meaning |
|---|---|
| ✅ | Task completed successfully |
| ⚠️ | Escalation — Ralph flagged something for human review |
| ⏸️ | Paused — waiting on a human decision or external input |
| ❌ | Failed — task could not be completed after retries |

### What to check

1. **PR throughput** — How many PRs were created today? Ralph is configured for a max of 5/day (`config.yml → autonomous.max_prs_per_day`).
2. **Escalation frequency** — Frequent escalations on the same trigger may indicate a misconfigured rule in `escalation.yml` or a systemic issue in the codebase.
3. **Pause reasons** — Paused items are blocked on you. Prioritise unblocking them so Ralph can resume.
4. **Summary section** — The bottom of `history.md` contains running totals for PRs created, merged, issues resolved, escalations, and the autonomous success rate.

---

## 3. System Health Checks

### Squad Doctor

Run a full health check of Ralph and the squad infrastructure:

```bash
npx @bradygaster/squad-cli doctor
```

This validates configuration files, connectivity, permissions, and runtime state. Address any failures or warnings before they become incidents.

### Interpreting results

| Result | Meaning | Action |
|---|---|---|
| ✅ **Pass** | Check succeeded | None needed |
| ❌ **Fail** | Something is broken | Fix immediately — Ralph may be unable to operate |
| ⚠️ **Warn** | Degraded or sub-optimal | Investigate soon — may cause failures under load |

### Common checks and what they validate

| Check | What it validates |
|---|---|
| Config syntax | `config.yml`, `escalation.yml`, `task-handlers.yml` parse without errors |
| Agent charter | `charter.md` exists and is non-empty |
| GitHub auth | Ralph can authenticate and reach the repository |
| Branch protection | Protected branches in `config.yml` match repo settings |
| CI integration | CI workflows are reachable and recently passed |
| Idle-watch cron | Cron expression in `config.yml` is valid and scheduled |
| Escalation routes | Notification channels are configured for every severity level |
| Safety guardrails | Forbidden paths and file/line limits are set |
| Token budget | Current spend is within configured limits |
| History file | `history.md` exists and has recent entries |

---

## 4. Daily Monitoring Checklist

Run through this checklist once per day (ideally in the morning):

### 4.1 Check PRs Created

```bash
npx @bradygaster/squad-cli status
```

- [ ] Review the list of PRs Ralph created in the last 24 hours.
- [ ] Confirm each PR has passing CI (green checks).
- [ ] Merge approved PRs promptly — queued PRs block Ralph from picking up new work.
- [ ] Verify PR count is within the daily limit of 5.

### 4.2 Review Escalations

```bash
# Check history for escalation markers
```

- [ ] Open `.squad/agents/ralph/history.md` and search for ⚠️ entries from today.
- [ ] Cross-reference with GitHub Issues labeled `escalation`.
- [ ] Respond within the SLA defined in `escalation.yml`:
  - **Critical:** 1 hour
  - **High:** 4 hours
  - **Medium:** 24 hours (1 business day)
  - **Low:** 72 hours (3 business days)
- [ ] If you cannot resolve an escalation immediately, acknowledge it in the issue to prevent auto-escalation (see `escalation.yml → timeout_actions`).

### 4.3 Verify CI Status

- [ ] Confirm the `main` branch CI is green.
- [ ] Check for any `ralph/*` branches with failing CI — these indicate Ralph tried to create a PR but was blocked by `require_passing_ci: true`.
- [ ] If CI is red on `main`, Ralph will be unable to create PRs. Fix the pipeline first.

### 4.4 Review Token Usage

```bash
npx @bradygaster/squad-cli cost
```

- [ ] Compare today's token usage against the 7-day average.
- [ ] Flag any single task consuming more than 30% of the daily budget.
- [ ] If cost is trending high, check for retry loops in `history.md` (repeated attempts on the same issue).

---

## 5. Weekly Review

Set aside 30 minutes each week (Friday or Monday) to review Ralph's overall performance and tune configuration.

### 5.1 Assess Autonomous Success Rate

The autonomous success rate is tracked in the summary section of `history.md`:

```markdown
## Summary
- **Autonomous success rate:** 71%
```

**Target:** ≥ 80% autonomous success rate.

**How to calculate manually:**

```
success_rate = (tasks_completed_without_escalation / total_tasks_attempted) × 100
```

**If the rate is below target:**

1. Identify which task types are causing the most escalations.
2. Check if the escalation triggers are too aggressive (e.g., `large-diff` threshold at 500 lines may be too low for refactoring tasks).
3. Review whether Ralph has the right context — ambiguous issues drive escalations. Improve issue templates.

### 5.2 Tune Task Handlers

Review `.squad/agents/ralph/task-handlers.yml` and `.squad/agents/ralph/config.yml`:

- [ ] Are any task handlers consistently failing? Check retry counts and error patterns.
- [ ] Should any `auto_approve: false` handlers be promoted to `auto_approve: true` if they have a track record of clean PRs?
- [ ] Are the priority levels correct? Reorder if dependency updates are being starved by bug fixes.
- [ ] Review `max_concurrent_tasks` (currently 3) — increase if Ralph is consistently idle, decrease if quality is dropping.
- [ ] Check `cooldown_between_prs_minutes` (currently 10) — increase if reviewers are overwhelmed.

### 5.3 Review Escalation Accuracy

Review the escalations from the past week against their outcomes:

| Question | If Yes | Action |
|---|---|---|
| Were any escalations unnecessary? | Ralph flagged something it could have handled | Relax the trigger condition in `escalation.yml` |
| Were any issues missed that should have escalated? | Ralph merged or attempted something risky | Add a new trigger or tighten an existing condition |
| Are escalation response SLAs being met? | Great — the system is working | Keep current timeouts |
| Are SLAs being consistently missed? | Escalations are being ignored | Shorten `response_expected` or add more notification channels |
| Is the same trigger firing repeatedly? | Systemic issue in the codebase | Fix the root cause rather than tuning the trigger |

### 5.4 Weekly Summary Template

Use this template to record your weekly review findings:

```markdown
## Weekly Review — YYYY-MM-DD

### Metrics
- PRs created: __
- PRs merged: __
- Issues resolved: __
- Escalations: __
- Autonomous success rate: __%
- Token spend: __ tokens ($__.__)

### Task Handler Changes
- (none / list changes)

### Escalation Rule Changes
- (none / list changes)

### Action Items
- [ ] (list follow-ups)
```

---

## 6. Reference: Today's Doctor Run

Output from `npx @bradygaster/squad-cli doctor` — 2026-04-16:

```
🩺 Squad Doctor — WeatherLens (appmodlab-ralph-automation)
══════════════════════════════════════════════════════════

  ✅ Config syntax          All YAML files parse successfully
  ✅ Agent charter           ralph/charter.md found and valid
  ✅ GitHub auth             Authenticated as ralph-bot (token valid)
  ✅ Branch protection       Protected branches match repo settings
  ✅ Escalation routes       All severity levels have notification channels
  ✅ Safety guardrails       Forbidden paths and diff limits configured
  ✅ History file            history.md has entries within the last 24 h

  ❌ CI integration          Last CI run on main FAILED (run #1847)
                             → Fix the pipeline before Ralph can create PRs.
                             → Ralph is configured with require_passing_ci: true

  ⚠️  Idle-watch cron        Next scheduled run is in 4 h 22 m — no issues,
                             but last run took 47 min (threshold: 30 min).
                             Consider increasing check_interval if tasks are
                             routinely exceeding the window.

  ⚠️  Token budget           Current daily spend is at 78% of budget with
                             6 h remaining. On track to exceed daily limit
                             if bug-fix retries continue at the current rate.

──────────────────────────────────────────────────────────
  Summary: 7 passed · 1 failed · 2 warnings
══════════════════════════════════════════════════════════
```

### Recommended follow-ups from this run

1. **❌ CI integration** — Investigate the failing CI run (#1847) on `main`. Until it's green, Ralph is blocked from opening PRs (`require_passing_ci: true` in `config.yml`).
2. **⚠️ Idle-watch cron** — The last idle-watch cycle took 47 minutes. If this continues, consider increasing `check_interval` from every 6 hours to every 8 hours, or splitting idle-watch tasks into smaller batches.
3. **⚠️ Token budget** — Daily spend is at 78% with 6 hours left. Check `history.md` for bug-fix retry loops. If a task is stuck, manually close or re-scope the issue to stop the bleed.

---

## Related Files

| File | Purpose |
|---|---|
| `.squad/agents/ralph/config.yml` | Ralph's schedule, task handlers, limits, and safety guardrails |
| `.squad/agents/ralph/escalation.yml` | Escalation triggers, severity levels, notification channels, and timeouts |
| `.squad/agents/ralph/task-handlers.yml` | Detailed processing rules for each issue type |
| `.squad/agents/ralph/history.md` | Chronological log of Ralph's actions and outcomes |
| `.squad/agents/ralph/charter.md` | Ralph's role definition and responsibilities |
| `.squad/agents/ralph/idle-watch.yml` | Idle detection and autonomous task scheduling |
