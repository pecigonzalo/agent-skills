# Delegation call shapes

OpenCode-style `Task`/`todo` code. In Pi, use [the Pi tool mapping](pi-tools.md) instead.

## Explorer delegation

```
Task({
  subagent_type: "explorer",
  description: "<5-10 word discovery summary>",
  prompt: `
Task: <what to find/discover>

Return:
- A short summary of findings
- Exact file paths and line ranges for every relevant location
- Minimal excerpts only (cap ~60 lines total across all snippets)
- Do NOT return full file contents
- Do NOT run bash/shell commands: use only grep/glob/list/read tools
  `
})
```

## Standard delegation

```
Task({
  subagent_type: "<explorer|fast|balanced|deep|deep-l|thinker>",
  description: "<5-10 word summary>",
  prompt: `
Load skills: <skill1>, <skill2>
Load store: <store-id-1>, <store-id-2>

Task: <specific, actionable description>

Context:
- <relevant context 1>
- <relevant context 2>

Requirements:
- <requirement 1>
- <requirement 2>

Success Criteria:
- <criterion 1 - must be verifiable>
- <criterion 2 - must be verifiable>
  `
})
```

## Multi-phase delegation (session continuity)

Extract `session_id` from the first delegation result and pass it to subsequent delegations so the subagent sees full conversation history:

```
Task({
  subagent_type: "deep",
  session_id: extractedSessionId,  // Reuse for continuity
  prompt: `Continue implementation...`
})
```

## Compaction recovery delegation

Use this shape when re-delegating after detecting context compaction (see the Compaction Recovery section in the main skill for detection criteria):

```javascript
Task({
  subagent_type: "deep",
  session_id: "original-session-id", // CRITICAL: Reuse session_id
  prompt: `
[CONTEXT RECOVERY]
Your context was compacted. We are continuing with: <task description>

Load skills: <skills>
Load store: <store-ids> // CRITICAL: Store items must be reloaded

**Progress So Far:**
- <summarize what was completed before compaction>

**Remaining Work:**
- <specifically list what still needs to be done>

Requirements & Success Criteria:
- <restate critical requirements>
`
})
```

## Store and TODO call shapes

Use this section only when the host provides `storewrite` and `storeread`. Without store tools, put complete requirements and acceptance criteria in TODO descriptions or the conversation.

Store detailed context, then create a TODO with a `[store:id]` reference, then load it when working:

```javascript
storewrite({
  summary: "Feature X specification",
  tags: ["feature", "spec", "todo-context"],
  status: "active",
  data: {
    requirements: [...],
    acceptance_criteria: [...],
    technical_notes: [...],
    // If plan is multi-step (3+ TODOs, >60 min, or multi-phase), add prompt_drafts:
    // load `pattern-task-breakdown` for that shape; do not improvise it here.
  }
})
// Returns: { id: "store-abc-123" }
// Replace <plan-id> placeholder with returned id before presenting to user
```

```javascript
todowrite({
  todos: [{
    id: "1",
    content: "Implement feature X [store:store-abc-123]",
    status: "pending",
    priority: "high"
  }]
})
```

```javascript
// Parse [store:id] from TODO content
storeread({ id: "store-abc-123" })
```

For multi-step tasks, read current TODO state before updating it:

```javascript
// Read current state
todoread()

// Update after completing step
todowrite({
  todos: [
    { id: "1", status: "completed", ... },
    { id: "2", status: "in_progress", ... },
    { id: "3", status: "pending", ... }
  ]
})
```
