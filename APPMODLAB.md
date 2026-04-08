---
title: "Ralph Automation"
description: "Configure Ralph for autonomous backlog processing and continuous development"
authors: ["marconsilva"]
category: "Agentic Software Development"
industry: "Cross-Industry"
services: []
languages: ["TypeScript", "JavaScript"]
frameworks: ["React", "Express", "PostgreSQL"]
modernizationTools: []
agenticTools: ["SQUAD"]
tags: ["ralph", "automation", "backlog-management", "autonomous-agent", "weather-dashboard"]
extensions: ["github.copilot"]
thumbnail: ""
video: ""
version: "1.0.0"
---

# Ralph Automation

## Overview

This lab teaches you how to configure Ralph — SQUAD's autonomous coordinator agent — for continuous work monitoring, idle-watch, and automated backlog processing. Ralph watches for idle periods, monitors team health, processes backlog items autonomously, and escalates blockers. This demonstrates the "always-on" agentic development model where Ralph keeps the development pipeline flowing even when humans aren't actively managing it.

**Business Domain:** Open-source weather dashboard project for "WeatherLens"

## Learning Objectives

By completing this lab, you will:
- Configure Ralph's work schedules and idle-watch triggers
- Define task type handlers for different backlog item categories
- Set up escalation rules with human oversight checkpoints
- Monitor Ralph's activity through logs and reports
- Balance automation autonomy with human control

## Prerequisites

- Completed "Getting Started with SQUAD" lab
- GitHub Actions experience
- React and Node.js familiarity
- Understanding of CI/CD pipelines

## Architecture

The WeatherLens project is a React + Node.js weather dashboard with a healthy backlog of 20+ issues. Ralph is configured to autonomously process these items based on task type, priority, and risk level.

### Ralph Configuration Components

1. **Work Schedules** - When Ralph should be active
2. **Idle Watch** - Auto-start when pipeline is idle for 6+ hours
3. **Task Handlers** - How to process each issue type
4. **Escalation Rules** - When to notify humans
5. **Activity Logging** - Track Ralph's autonomous work

## Lab Instructions

### Step 1: Review Backlog

**Objective:** Examine the 20+ pre-loaded issues and understand task types.

1. Review the backlog at `docs/BACKLOG.md`:
   - 5 dependency updates (high priority)
   - 3 bug fixes (medium priority)
   - 4 documentation tasks (medium priority)
   - 2 performance optimizations (low priority)
   - 3 feature requests (low priority)
   - 3 maintenance tasks (low priority)

2. Identify which tasks Ralph can handle autonomously:
   - ✅ Dependency updates - Safe, automated
   - ✅ Documentation - Delegate to Mouth
   - ⚠️ Bug fixes - Some need human review
   - ❌ Features - Require product decisions
   - ⚠️ Performance - Need architecture review

### Step 2: Configure Work Schedules

**Objective:** Define when Ralph should be active.

1. Review Ralph's configuration at `.squad/agents/ralph/config.yml`

2. Work schedule settings:
   ```yaml
   schedule:
     active_hours:
       start: "00:00"
       end: "23:59"
     days_of_week: [1, 2, 3, 4, 5, 6, 7]
     timezone: "UTC"
   ```

3. Adjust for your team's working hours if needed

### Step 3: Define Task Handlers

**Objective:** Configure how Ralph handles each issue type.

1. Review task handlers in `config.yml`:

```yaml
task_handlers:
  dependency-update:
    priority: high
    auto_approve: true
    actions:
      - npm audit fix
      - npm update
      - create-pr
    
  bug-fix:
    priority: medium
    auto_approve: false  # Requires review
    actions:
      - analyze-issue
      - create-plan
      - delegate-to: hands
      - request-review: eyes
    
  documentation:
    priority: medium
    auto_approve: true
    actions:
      - delegate-to: mouth
      - create-pr
```

2. Each handler specifies:
   - **Priority** - How urgently to process
   - **Auto-approve** - Can Ralph merge without human review
   - **Actions** - Steps to take

### Step 4: Set Up Idle-Watch

**Objective:** Configure triggers for auto-start when pipeline is idle.

1. Idle-watch configuration:
   ```yaml
   idle_watch:
     enabled: true
     threshold_hours: 6
     check_interval: "0 */6 * * *"
   ```

2. Ralph checks pipeline activity every 6 hours
3. If no commits for 6+ hours, Ralph starts processing backlog
4. Prevents pipeline from staying idle when work is available

### Step 5: Configure Escalation

**Objective:** Define when Ralph should notify humans.

1. Review escalation rules at `.squad/agents/ralph/escalation.yml`

2. Ralph escalates when:
   - High-risk changes (database, breaking API)
   - Task failures after 2 attempts
   - Ambiguous requirements
   - Daily limits reached

3. Escalation process:
   ```
   Ralph detects trigger
   → Assess severity (Critical/High/Medium)
   → Create issue or comment
   → Notify appropriate team (on-call/tech lead/PO)
   → Wait for human response
   → Continue with other safe tasks
   ```

### Step 6: Enable Ralph

**Objective:** Start Ralph and observe initial backlog processing.

1. The Ralph workflow runs automatically:
   - Every 6 hours (scheduled)
   - On issue creation/labeling (event-triggered)
   - Manual trigger via workflow_dispatch

2. Trigger Ralph manually:
   - GitHub → Actions → Ralph Automation → Run workflow

3. Ralph will:
   - Check idle time
   - Select tasks from backlog
   - Process based on task handlers
   - Create PRs for completed work

### Step 7: Monitor Activity

**Objective:** Review Ralph's activity log and PR creation.

1. Check Ralph's activity log: `.squad/agents/ralph/history.md`

2. Review created PRs:
   - Dependency updates
   - Documentation improvements
   - Bug fixes

3. Observe Ralph's decision-making:
   - Which tasks were processed autonomously
   - Which were escalated
   - Reasons for each decision

### Step 8: Handle Escalations

**Objective:** Respond to Ralph's escalation notifications.

1. Ralph creates escalation issues for:
   - Feature requests (#15-17) - Need product input
   - Performance tasks (#13-14) - Need architecture review
   - Complex bugs (#8) - Need careful analysis

2. Review escalation issue and:
   - Provide additional context
   - Make necessary decisions
   - Approve or modify Ralph's suggested approach

3. Ralph resumes work after receiving guidance

### Step 9: Review Results

**Objective:** Assess quality of Ralph's autonomous work.

1. Metrics to evaluate:
   - **Success rate:** PRs merged / PRs created
   - **Quality:** Issues actually resolved
   - **Escalation accuracy:** Did Ralph correctly identify high-risk items?
   - **Time savings:** Hours saved vs manual processing

2. Sample success criteria:
   - ✅ 5+ backlog items processed
   - ✅ 3+ PRs merged
   - ✅ Proper escalation for high-risk items
   - ✅ No broken builds from Ralph's PRs

### Step 10: Tune Configuration

**Objective:** Adjust based on results.

1. If Ralph is too conservative:
   - Increase auto_approve for more task types
   - Reduce escalation triggers

2. If Ralph is too aggressive:
   - Decrease auto_approve
   - Add more escalation triggers
   - Reduce daily PR limit

3. Iterate on task handlers based on outcomes

## Key Concepts

### Autonomous vs Supervised

| Mode | When to Use | Example |
|------|------------|---------|
| **Autonomous** | Safe, repeatable tasks | Dependency updates, docs |
| **Supervised** | Changes requiring judgment | Bug fixes, features |
| **Human-Only** | Strategic decisions | Architecture changes |

### Task Handler Patterns

**Pattern 1: Fully Autonomous**
```yaml
dependency-update:
  auto_approve: true
  actions: [update, test, create-pr, merge]
```

**Pattern 2: Delegate + Review**
```yaml
bug-fix:
  auto_approve: false
  actions: [delegate-to: hands, request-review: eyes]
```

**Pattern 3: Plan + Approve**
```yaml
feature:
  auto_approve: false
  actions: [create-plan, get-human-approval]
```

### Idle-Watch Strategy

Ralph optimizes team productivity by:
1. Detecting idle periods (no commits for X hours)
2. Processing low-risk backlog items
3. Creating PRs for review when team returns
4. Preventing backlog accumulation

## Success Criteria

✅ WeatherLens runs with all existing features  
✅ 20+ issues pre-loaded covering various task types  
✅ Ralph configuration defines work schedules and task handlers  
✅ Idle-watch triggers Ralph when pipeline is idle  
✅ Ralph processes at least 5 backlog items autonomously  
✅ Escalation rules notify humans for critical changes  
✅ Ralph activity log tracks all actions taken  

## Resources

- [SQUAD Ralph Documentation](https://squad.dev/docs/ralph)
- [GitHub Actions Scheduled Workflows](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Autonomous Agent Best Practices](https://squad.dev/docs/autonomous-agents)

## Troubleshooting

**Issue:** Ralph not processing any tasks  
**Solution:** Check idle threshold - may need to lower from 6 hours

**Issue:** Ralph creates too many PRs  
**Solution:** Reduce max_prs_per_day in config

**Issue:** Ralph isn't escalating risky changes  
**Solution:** Review and expand escalation triggers in escalation.yml

---

**Estimated Duration:** 3-4 hours  
**Difficulty:** Intermediate  
**Category:** Agentic Software Development
