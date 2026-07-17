# Delegation call shapes

OpenCode-style `Task` code for each phase below. In Pi, use [the Pi tool mapping](pi-tools.md) instead.

## Phase 1: plan delegation

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

## Phase 2: task execution delegation

Same envelope as `role-orchestrator`'s Standard Delegation Template, scoped to `fast`/`balanced`/`deep` since execution never needs Explorer/Thinker/Deep-L:

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

## Phase 3: final verification delegation

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

## Plan persistence (store)

When persisting an approved plan (see the main skill for when to persist), load `pattern-task-breakdown` for the `data.prompt_drafts` shape. Do not improvise that structure here; it is defined once, there.
