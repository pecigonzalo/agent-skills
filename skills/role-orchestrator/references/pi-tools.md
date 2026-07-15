# Pi tool mapping

Use Pi's native tools instead of copying the OpenCode-style `Task` and TODO examples from the core skill.

## Delegate work

Call `task` with one or more entries in `steps`:

```json
{
  "mode": "single",
  "steps": [
    {
      "agent": "reviewer",
      "effort": "balanced",
      "skills": ["role-code-review"],
      "task": "Review the completed phase against its acceptance criteria."
    }
  ]
}
```

Use only agents and effort presets exposed by the active session. Use parallel mode for independent work and chain mode only when a later step consumes `{previous}`.

## Track work

Use Pi's `todo` tool to add, update, link, and complete work items. If store tools are not installed, omit all `storewrite`, `storeread`, and `[store:<id>]` steps. Keep the context needed to resume work in TODO descriptions or the conversation.
