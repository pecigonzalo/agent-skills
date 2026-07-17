---
name: role-orchestrator
description: Use this skill when a primary agent coordinates subagents. Provides delegation criteria, quality gates, TODO-Store linking, and communication patterns.
compatibility: Requires a host with native subagent delegation and TODO tools (Pi's task/todo tools or OpenCode-style Task()/todowrite); store tools are optional.
---

**Provides:** Subagent selection criteria, delegation format, quality gates, TODO-Store linking, and communication patterns for orchestrating agents.

## Host tool mapping

Before delegating in Pi, read [the Pi tool mapping](references/pi-tools.md) and use its native `task` and `todo` forms instead of the OpenCode-style examples below. If store tools are unavailable, omit store calls and preserve complete context in TODO descriptions or the conversation. Do not create substitute repository files.

## Quick Reference

**Subagent Selection:**
- **Explorer**: Read-only discovery, finding files/patterns
- **Thinker**: Deep analysis, planning, research (no writes)
- **Fast**: Simple edits, docs, tests (bounded, low-risk)
- **Balanced**: Standard implementation, refactors, non-trivial bugfixes
- **Deep**: Complex, multi-file work; uncertain scope or cross-cutting changes
- **Deep-L**: Deep work requiring large context (272k)

**Delegation Format:** Always include skills, requirements, and success criteria

**Quality Gates:** Review EVERY delegation output before proceeding

---

## Subagent Selection Criteria

### Use Explorer When:
- User asks "where is...", "find...", "show me..."
- Need to locate files, functions, or patterns
- Need to map codebase structure
- Any read-only information gathering
- Quick status checks

**Explorer output:** Always ask for summary + file paths + line ranges. Do not request full file contents: if you need specific content after discovery, read the identified ranges directly or delegate to an implementation agent.
**Explorer constraints:** Explorer is a read-only agent with bash **denied**. Do NOT include bash commands, shell scripts, or any execution instructions in explorer delegation prompts. Use only grep/glob/list/read tools. If you need shell commands run, delegate to an implementation agent instead.

Read [the Explorer delegation template](references/delegation-templates.md#explorer-delegation) for the exact call shape.

### Use Thinker When:
- User asks "how should I...", "what's the best way..."
- Need to plan multi-step work
- Need to break down complex feature
- Making architectural decisions
- Deep research or analysis needed
- Tasks estimated > 60 minutes
- Approach isn't immediately clear

### Use Fast When:
- Simple edit, documentation changes, or adding comments
- Writing tests for existing code
- Routine, well-defined tasks with minimal coordination needed

### Use Balanced When:
- Standard multi-file features and refactors
- Non-trivial bugfixes
- Implementation work with clear scope

### Use Deep When:
- Complex, multi-file work where scope is uncertain or cross-cutting
- Debugging complex issues
- Security-critical or performance-critical code
- Refactoring with architectural changes

### Use Deep-L When:
- Deep implementation requiring large context (272k): e.g. broad-scope analysis spanning many files

### Pattern Selection Triggers

**Before routing, check these triggers:**

| Condition | Action |
|-----------|--------|
| 2+ complexity/risk/size indicators present | **Load `pattern-orchestration-complex`** and follow its 4-phase workflow |
| Task requires multi-step breakdown or >60 min plan | **Delegate to Thinker with `pattern-task-breakdown`** |
| Storing a plan that will produce 3+ TODOs or >60 min effort | **Store `prompt_drafts`** in plan data: see `pattern-task-breakdown` |

**Complexity indicators** (size, complexity, or risk):
- 4+ files affected
- >60 minutes estimated
- Multiple sequential phases needed
- Cross-cutting or security-critical changes
- Approach isn't immediately clear
- Architectural decisions required

### Complexity Assessment

| Complexity | Indicators | Agent |
|------------|------------|-------|
| **Trivial** | Conversational only | Handle directly |
| **Simple** | Bounded, low-risk, clear scope | Fast |
| **Medium** | Multi-file, clear approach | Balanced |
| **Complex** | Uncertain scope, cross-cutting, >60 min | Load `pattern-orchestration-complex`; Thinker with `pattern-task-breakdown` first |
| **Very Large** | Broad scope spanning many files | Deep-L |

---

## Delegation Format

Every delegation must include skills to load, requirements, and verifiable success criteria. Read [the standard delegation template](references/delegation-templates.md#standard-delegation) for the exact call shape.

### Skill Selection for Delegation

Match task needs to skills:
- Code implementation → `role-developer`, `standards-code`
- Security-critical → `standards-security`, `role-security-auditor`
- Writing tests → `role-qa-engineer`, `standards-testing`
- Architecture decisions → `role-architect`
- Code review → `role-code-review`
- Documentation → `role-technical-writer`, `standards-documentation`
- Complex planning → `pattern-task-breakdown`
- Analysis → `standards-analysis`

### Multi-Phase Delegation

For tasks requiring context continuity:

1. Extract `session_id` from first delegation result
2. Pass `session_id` to subsequent delegations
3. Subagent sees full conversation history

Read [the multi-phase delegation shape](references/delegation-templates.md#multi-phase-delegation-session-continuity).

## Compaction Recovery for Subagents

Subagents may experience context compaction during long tasks. Orchestrators must detect and handle this to ensure task completion.

### Detection Criteria
Check for any of the following in subagent output:
- Presence of a `CompactionPart` (type: "compaction") in the task result.
- Explicit statements about missing context or "forgetting" the plan.
- Incomplete work despite reaching the response limit.
- Failure to follow previously established requirements.

### Recovery Delegation Template
When re-delegating after compaction, reuse the original `session_id`, restate progress and remaining work, and force a store reload. Read [the compaction recovery template](references/delegation-templates.md#compaction-recovery-delegation) for the exact call shape.

### Best Practices for Recovery
- **Reuse session_id**: Always pass the original `session_id` to maintain the surviving context.
- **Explicit Store Loading**: Subagents lose loaded store items after compaction. Force a reload in the recovery prompt.
- **Summarize Progress**: Do not just repeat the original prompt; tell the agent what is already done to avoid duplicated effort.
- **Limit Retries**: Max 2 automatic recovery attempts per task. If it fails a third time, escalate to the user or split the task.
- **Task Splitting**: If a task is large enough to cause frequent compaction, break it into smaller sub-tasks via `Task` parallel calls or sequential steps.

---

## Quality Gates

### Mandatory Review Checklist

After EVERY delegation, verify:

- [ ] All requirements met?
- [ ] All success criteria satisfied?
- [ ] Follows applicable standards?
- [ ] No obvious errors or gaps?
- [ ] Code is maintainable?
- [ ] Store items loaded if referenced?

**If ANY unchecked → Loop back with feedback**

### Loop Back Process

When quality gate fails:

1. **Attempt 1**: Provide enhanced guidance, same agent
2. **Attempt 2**: Escalate to more capable agent
3. **Attempt 3+**: Request user intervention

Retry inline: re-delegate with enhanced guidance (attempt 1), escalate to a more capable agent (attempt 2), then escalate to the user (attempt 3+).

---

## TODO-Store Linking

Use this section only when the host provides `storewrite` and `storeread`. Without store tools, put the complete requirements and acceptance criteria in the host's TODO descriptions or retain them in the conversation.

### When to Use

Use TODO-Store linking for:
- Complex tasks with detailed specifications
- Multi-step work requiring persistent context
- Architectural decisions that inform implementation
- Requirements that span multiple TODO items

### Workflow

Store detailed context, create a TODO with a `[store:id]` reference, then load it when working. Read [the store/TODO call shapes](references/delegation-templates.md#store-and-todo-call-shapes) for the exact code. See `pattern-task-breakdown` for the canonical `prompt_drafts` shape.

### Store Loading Enforcement

**CRITICAL**: Store items are NOT auto-loaded.

When you see `Load store:` or `[store:<id>]`:
1. IMMEDIATELY call `storeread({ id: "<id>" })`
2. DO NOT proceed without loading
3. Verify subagents also loaded store items

### Proactive Store Discovery

**When starting a session or after context compaction:**

Store items are NOT automatically reloaded after compaction. To maintain context continuity:

1. **List available items**: Call `storeread()` (LIST mode - no ID parameter)
2. **Review for relevance**: Scan summaries and tags for items related to current work
3. **Load selectively**: Call `storeread({ id: "..." })` only for relevant items

This prevents context bloat while ensuring critical context isn't lost after compaction.

**When to discover:**
- At the start of a new session
- After receiving notification of context compaction
- When user references past work or decisions
- Before planning complex, multi-session tasks

---

## TODO Management

### For Multi-Step Tasks

1. **Create at start**: List all expected steps
2. **Update immediately**: After each delegation
3. **Read before updating**: Always check current state first

Read [the TODO read/write shape](references/delegation-templates.md#store-and-todo-call-shapes).

### Best Practices

- Mark `in_progress` when starting a task
- Mark `completed` immediately after finishing
- Add new tasks if discovered during work
- Keep historical items (don't delete completed)
- Link complex tasks to store items

---

## Communication Patterns

### Before Starting

```
I'll help you with {task summary}.

**Approach:**
- {Step 1}
- {Step 2}
- {Step 3}

**Estimated effort:** {time}

Shall I proceed?
```

### After Delegation

```
{Task} complete.

**What was done:**
- {Change 1}
- {Change 2}

**Quality check:** {passed/issues found}

{Next steps or completion message}
```

### On Issues

```
I encountered an issue with {task}.

**Problem:** {description}

**Options:**
1. {Option 1}
2. {Option 2}

Which would you prefer?
```

### When Stuck (After 2 Attempts)

```
I've attempted {task} twice but haven't achieved the desired result.

**Attempts:**
1. {What was tried}
2. {What was tried}

**Current blockers:**
- {Blocker 1}

**Recommendations:**
- {Suggestion}

How would you like to proceed?
```

---

## Integration with Other Skills

### With pattern-orchestration-complex
- **Load when:** 2+ complexity/risk/size indicators are present (4+ files, >60 min, cross-cutting, security-critical)
- Provides 4-phase workflow (planning, execution, verification, cleanup)
- Overrides simple direct-delegation approach: follow its workflow instead

### With pattern-task-breakdown
- **Load when:** delegating to Thinker for any multi-step execution plan
- Include in Thinker delegation prompt: `Load skills: pattern-task-breakdown`
- Thinker's plan output feeds directly into TODOs and the `prompt_drafts` store entry
- For simple 1-2 step tasks, skip and delegate directly

### With tool-store
- Detailed guidance on store operations
- ADR patterns for architectural decisions
- Use alongside planning/orchestration skills when stored plans or TODO-linked execution are involved

---

## Self-Check Before Proceeding

Before EVERY action, verify:

- [ ] Did I select the right subagent for required capabilities?
- [ ] Did I include relevant skills in delegation?
- [ ] Did I specify clear, verifiable success criteria?
- [ ] Did I review output and run quality gate?
- [ ] Did I load all referenced store items?
- [ ] For multi-step tasks: Did I update TODO?
- [ ] For Explorer delegations: Does the prompt ask for summary + paths + line ranges only: **not full file contents**?

**If ANY unchecked → Fix before responding**
