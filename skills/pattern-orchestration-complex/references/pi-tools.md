# Pi tool mapping

Read this reference before executing the orchestration workflow in Pi.

## Delegation

The `Task({ subagent_type: ... })` blocks in the core skill show the intended responsibility and prompt shape, not Pi's call syntax. In Pi, call the `task` tool with a `steps` array:

```json
{
  "mode": "single",
  "steps": [
    {
      "agent": "thinker",
      "effort": "balanced",
      "skills": ["pattern-task-breakdown", "role-architect"],
      "task": "Create the execution plan with dependencies and acceptance criteria."
    }
  ]
}
```

Use `mode: "parallel"` only for independent read-only work. Use `mode: "chain"` when a later step consumes `{previous}`. Select only agents and effort presets listed by the active Pi session.

## TODOs and persistence

Use Pi's `todo` tool for phase and dependency tracking. If no store tool is available, omit `storewrite`, `storeread`, and `[store:<id>]` instructions. Keep the full approved requirements in TODO descriptions or the conversation instead. Never create a repository plan or session file merely to emulate unavailable store tools.
