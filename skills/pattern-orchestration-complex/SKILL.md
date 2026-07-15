---
name: pattern-orchestration-complex
description: Use this skill when a task has at least two complexity indicators, such as affecting 4+ files, requiring more than 60 minutes, spanning sequential phases, or involving architectural risk. Do not use it for simple tasks. Executes planning, execution, verification, and cleanup.
license: MIT
metadata:
  role: coordinator
  focus: complex-execution
---

## Quick Reference

**Host tools:** Before delegating in Pi, read [the Pi tool mapping](references/pi-tools.md) and use its native `task` forms instead of the OpenCode-style `Task` examples below. If store tools are unavailable, keep the approved plan in repository TODOs or the conversation and omit store calls. Do not create a substitute plan file unless the user requests one.

**4 Phases**: Planning → Execution → Verification → Cleanup

**Always get user approval** before starting execution

**One task at a time** - complete before moving to next

**Atomic commits** per task for rollback safety

---

## When to Use Complex Orchestration

### Indicators You Need This

**Size indicators:**
- [ ] 4+ files need modification or creation
- [ ] Estimated time > 60 minutes
- [ ] Multiple components affected
- [ ] Cross-cutting changes

**Complexity indicators:**
- [ ] Approach isn't immediately clear
- [ ] Multiple sequential steps required
- [ ] Dependencies between tasks
- [ ] Requires architectural decisions

**Risk indicators:**
- [ ] Security-critical changes
- [ ] Data migration involved
- [ ] Breaking changes to APIs
- [ ] Production system impact

**If 2+ indicators present → Use pattern-orchestration-complex**

### When NOT to Use

**Simple tasks:**
- 1-3 files, < 30 minutes
- Clear, straightforward approach
- Single delegation sufficient

**For simple tasks → Delegate directly, skip orchestration**

---

## Phase 1: Planning

### Step 1: Delegate to Thinker for Plan

**Create execution plan using pattern-task-breakdown skill:**

```
Task({
  subagent_type: "thinker",
  description: "Create execution plan for complex task",
  prompt: `
Load skills: pattern-task-breakdown, role-architect

Task: Create execution plan for: {user's request}

Create a structured breakdown with:
- Phases (logical groupings of related work)
- Tasks per phase (1-2 hour chunks, clear and actionable)
- Dependencies (what must happen first)
- Risks (potential issues or blockers)
- Estimates (time for each phase)

Output as markdown following pattern-task-breakdown skill format.
  `
})
```

**Thinker will return structured plan with:**
- Overview of work
- Phases broken into tasks
- Dependencies mapped
- Time estimates
- Risk assessment

### Step 2: Present Plan to User

**Format the plan clearly:**

```markdown
## Execution Plan: {Feature Name}

**Summary**: {1-2 sentence overview of what will be built}

**Total Estimate**: {X} hours across {N} phases

---

### Phases

**Phase 1: {Phase Name}** ({time estimate})
- Task 1.1: {Description}
  - Files: {files to modify/create}
  - Dependencies: {none or task X}
- Task 1.2: {Description}
  - Files: {files}
  - Dependencies: {task 1.1}

**Phase 2: {Phase Name}** ({time estimate})
- Task 2.1: {Description}
  - Files: {files}
  - Dependencies: {Phase 1 complete}

**Phase 3: {Phase Name}** ({time estimate})
- Task 3.1: {Description}
  - Files: {files}
  - Dependencies: {Phase 2 complete}

---

### Dependencies
- {Critical dependency 1}
- {Critical dependency 2}

### Risks
- {Potential risk 1 and mitigation}
- {Potential risk 2 and mitigation}

---

**Proceed with this plan? (yes/no)**
```

### Step 3: Wait for User Approval

**DO NOT proceed without explicit user approval**

**User may:**
- Approve as-is → Proceed to execution
- Request modifications → Revise plan and re-present
- Change scope → Update plan
- Reject → Don't proceed

**Only continue after user says "yes" or "proceed" or "approved"**

### Step 4: Track Session Context

**Once approved, record progress using the store** (preferred) or a short in-chat summary:

- Persist the approved plan via `storewrite` if not already done (see Step 5)
- For shorter tasks, a brief in-chat summary of approved phases and current status is sufficient
- Do NOT create `.opencode/sessions/` artifact files

**Session is now ready for execution**

### Step 5: Persist the plan when durable storage is available

Use this step when store tools are available and any persistence condition below applies. Otherwise, keep the approved plan in TODO descriptions or the conversation and continue without store references.

**Load tool-store skill:**
```
skill(name: "tool-store")
```

**When to persist:**
- [ ] Feature will take >4 hours
- [ ] Architectural decisions made during planning
- [ ] Multiple phases or agents involved
- [ ] Want plan to survive session cleanup or compaction

**What to store — include `prompt_drafts` for compaction-safe execution:**

Since this is a complex task (3+ TODOs, >60 min), the stored plan **MUST** include `data.prompt_drafts` with:
- `universal_handoff_prompt`: a plain copy-paste message (e.g. `@orchestrator Load store: <id>\n\nTask: Execute the plan.`) for the user to resume execution — **not** a `Task({ ... })` wrapper, since `orchestrator`/`universal` are primary agents, not `Task()` targets
- `todo_tasks[]`: one entry per planned step, each with `todo_content` (for `todowrite`) and `task_block` (the full delegation `Task({ ... })` targeting fast/balanced/deep/etc.)

Minimal shape:

```json
{
  "prompt_drafts": {
    "universal_handoff_prompt": "@orchestrator Load store: <plan-id>\n\nTask: Execute the stored plan.",
    "todo_tasks": [
      {
        "todo_title": "Step title",
        "todo_content": "Step title [store:<plan-id>]",
        "task_block": "Task({ ... })"
      }
    ]
  }
}
```

This ensures that if context is compacted between planning and execution, the agent can load the store item and immediately start delegating using the stored prompts — no context reconstruction needed.

**Benefits:**
- Plan and decisions survive session cleanup and compaction
- Prompt drafts are always available — no reconstruction from memory
- Can be referenced via `[store:id]` syntax in TODO items

---

## Phase 2: Execution

### Execute Task-by-Task

**For EACH task in the plan:**

#### 1. Delegate Task

**Select appropriate subagent:**
- Fast: Simple edits, documentation, tests
- Balanced: Standard multi-file work
- Deep: Complex logic, security-critical, cross-cutting changes

**Delegate with context:**
```
Task({
  subagent_type: "{fast|balanced|deep}",
  description: "{5-10 word summary}",
  prompt: `
Load skills: {relevant domain skills/standards/patterns}

Task: {specific task from plan}

Requirements:
- {requirement 1 from plan}
- {requirement 2 from plan}

Success Criteria:
- {criterion 1 - must be verifiable}
- {criterion 2 - must be verifiable}
  `
})
```

#### 2. Quality Gate Review

**Check delegated work against success criteria:**

- [ ] All requirements met?
- [ ] All success criteria satisfied?
- [ ] Code follows standards?
- [ ] Tests included and passing?
- [ ] No obvious errors or security issues?
- [ ] Documentation updated if needed?

**If ALL checked → Proceed to next step**
**If ANY unchecked → Loop back with specific feedback**

#### 3. Loop Back if Quality Gate Fails

**If work doesn't meet criteria:**

1. Re-delegate with enhanced guidance, same agent (attempt 1)
2. Escalate to a more capable agent (attempt 2)
3. After 2 autonomous retries, escalate to the user (attempt 3+)

**Don't proceed to next task until current task passes quality gate**

#### 4. Commit Work

**Create an atomic commit for each completed task** (ask the user to commit, or commit directly if the task included write permissions):

- Stage only the files changed in this task
- Use a clear commit message describing what was done and why
- Each commit should represent a working state

**Why atomic commits:**
- Easy to rollback if needed
- Clear history of what changed when
- Bisect-friendly for debugging

### Phase Management

**Between phases:**
1. Review phase completion
2. Update session progress
3. Verify phase goals met
4. Brief user on progress (optional but recommended)

**Example update to user:**
```
Phase 1 complete: User model and database schema implemented
- Created user model with bcrypt password hashing
- Database migrations working
- Unit tests passing (95% coverage)

Starting Phase 2: Authentication endpoints
```

---

## Phase 3: Verification

### After All Tasks Complete

**Perform comprehensive verification:**

### Step 1: Delegate Final Verification

```
Task({
  subagent_type: "fast",
  description: "Final verification of completed work",
  prompt: `
Load skills: role-code-review, role-qa-engineer

Task: Verify all work from {feature name} meets requirements

Review ALL files modified in this feature.

Verification Checklist:
- [ ] All requirements from original request met
- [ ] All acceptance criteria satisfied
- [ ] Code follows standards (`skill:standards-code`)
- [ ] Security best practices applied (`skill:standards-security`)
- [ ] Tests comprehensive and passing (`skill:standards-testing`)
- [ ] Documentation updated where needed
- [ ] No obvious bugs or issues

Success Criteria:
- ALL checklist items verified
- Report any issues found
- Confirm ready for deployment or flag concerns
  `
})
```

### Step 2: Review Verification Results

**If issues found:**
1. Prioritize by severity
2. For critical issues: loop back with enhanced guidance (up to 2 autonomous retries), then escalate to user
3. For minor issues: document as follow-up tasks or fix immediately

**If all good:**
- Proceed to cleanup

**Don't skip this step - final verification catches:**
- Integration issues
- Inconsistencies across changes
- Missing edge cases
- Documentation gaps

---

## Phase 4: Cleanup

### Step 1: Run Final Tests

**Ensure everything works end-to-end using the project's task runner** (e.g., `task test`, `make test`, or equivalent — check the repo's `Taskfile`, `Makefile`, or `package.json` scripts first):

- Full test suite must pass
- Linter must pass
- Build must succeed (if applicable)

**All should pass before finalizing**

### Step 2: Final Commit (if needed)

**If any cleanup changes are needed, create a final atomic commit** with a clear message describing what was cleaned up.

### Step 3: Summarize Work

**Provide a brief summary to the user in chat** (do NOT write a summary file unless explicitly requested):

- What was built and key decisions
- Files created or modified (count + purpose)
- Test coverage / pass status
- Known limitations and follow-up items

### Step 4: Notify User

**Confirm completion in chat:**

```
Task complete! 

Summary of work:
- {Brief summary}
- {Key accomplishments}
```

---

## Best Practices

### Planning Phase
✅ Get detailed plan before starting
✅ Present plan to user for approval
✅ Wait for explicit approval
✅ Setup session with complete context

❌ Don't skip planning for "quick" implementation
❌ Don't assume plan is approved
❌ Don't start without session for complex work

### Execution Phase
✅ Execute one task at a time
✅ Quality gate after each task
✅ Retry with graduated escalation if needed
✅ Atomic commits per task
✅ Update session after each task

❌ Don't jump ahead to later tasks
❌ Don't skip quality reviews
❌ Don't commit multiple tasks together
❌ Don't forget to update session state

### Verification Phase
✅ Comprehensive final review
✅ Load role-code-review + role-qa-engineer skills
✅ Verify all original requirements
✅ Fix issues before cleanup

❌ Don't skip final verification
❌ Don't overlook minor issues
❌ Don't assume "tests pass" means "done"

### Cleanup Phase
✅ Run all tests before finalizing
✅ Create summary of work
✅ Ask before deleting session
✅ Document follow-up items

❌ Don't leave broken tests
❌ Don't skip documentation
❌ Don't delete session without asking

---

## Common Patterns

Read [common orchestration patterns](references/common-patterns.md) when adapting the workflow to a feature, refactor, or security-hardening project.

## Integration with Other Skills

### With pattern-task-breakdown
- Pattern-task-breakdown creates the plan
- Pattern-orchestration-complex executes the plan
- Use both together for planning phase

### With retry logic
- Quality gate failures are handled inline: re-delegate with enhanced guidance (attempt 1), escalate agent (attempt 2), escalate to user (attempt 3+)
- Both quality gates and retry logic work together for quality assurance

---

## Troubleshooting

Read [orchestration troubleshooting](references/troubleshooting.md) when planning is repeatedly rejected, estimates drift, quality gates fail, or progress context is lost.

## Quick Checklist

### Before Starting
- [ ] Task indicators suggest complexity (4+ files, >60 min, unclear approach)
- [ ] Delegated to thinker for plan
- [ ] Plan presented to user
- [ ] User explicitly approved
- [ ] Session created with full context

### During Execution
- [ ] Executing one task at a time
- [ ] Quality gate after each task
- [ ] Retry with graduated escalation if needed
- [ ] Atomic commits per task
- [ ] Session state updated

### Before Finishing
- [ ] All tasks in plan complete
- [ ] Final verification performed
- [ ] All tests passing
- [ ] Summary created
- [ ] User notified of completion

### Cleanup
- [ ] Summarized work to user in chat
- [ ] Follow-up items documented
