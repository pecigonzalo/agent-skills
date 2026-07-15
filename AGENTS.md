# Repository instructions

This repository is the canonical source for reusable Agent Skills shared across Pi, OpenCode, and compatible agent harnesses.

## Scope

- Store every skill at `skills/<name>/SKILL.md`.
- Keep all references, scripts, assets, and eval inputs within the skill package.
- Treat source copies in `~/.pi` and `~/.config/opencode` as migration inputs, not
  as files to edit from this repository.
- Do not modify client configuration repositories unless the task explicitly asks
  for a cutover.

## Skill structure

Every `SKILL.md` must contain YAML frontmatter followed by Markdown instructions. Follow these rules:

- `name` is required, uses lowercase letters, numbers, and hyphens, is at most 64
  characters, has no leading, trailing, or consecutive hyphens, and exactly matches
  the parent directory.
- `description` is required, is at most 1,024 characters, and states what the skill
  helps accomplish and when an agent should load it.
- Include `compatibility` only for real environment or client requirements.
- Keep `metadata` values as strings and use repository-specific keys only when they
  add operational value.
- Treat `allowed-tools` as experimental and use the specification's space-separated
  syntax. Confirm the target client supports every declared tool.
- Use relative paths from the skill root. Keep reference chains shallow.

Use the standard optional directories consistently:

- `references/` for detailed material loaded only under stated conditions.
- `scripts/` for tested, repeatable operations an agent would otherwise recreate.
- `assets/` for templates and static resources used in outputs.
- `evals/` for realistic prompts, expected outcomes, assertions, and fixtures.

## Writing skills

- Start from observed expertise, real tasks, corrections, and failure modes.
- Keep a skill to one coherent capability; split unrelated administration or domain
  concerns into separate skills.
- Keep `SKILL.md` below 500 lines and about 5,000 tokens when practical.
- Move conditional detail to focused reference files and state exactly when to read
  each one.
- Include only information the agent is likely to miss without the skill.
- Prefer concise procedures, a clear default, concrete examples, gotchas, and
  validation loops.
- Explain why a constraint matters when contextual judgment is safe. Use exact
  sequences only for fragile or destructive operations.
- Avoid menus of equivalent choices; provide one default and a brief escape hatch.
- Do not embed answers for one task where a reusable method will work.

## Portability

Classify guidance by capability rather than its source repository.

- Portable skills must not unconditionally invoke Pi- or OpenCode-specific tools,
  agent names, task schemas, storage APIs, or configuration paths.
- If the core procedure is portable but a client needs an adapter, keep the core in
  `SKILL.md` and put conditional client guidance in a clearly named reference.
- If the capability fundamentally depends on one host, say so in `compatibility`
  and in the instructions.
- Do not claim portability by replacing concrete tool calls with vague advice.
- Preserve useful intent during migration; normalization must not silently remove
  safety gates, verification steps, or domain-specific corrections.

## Editing and migration safety

- Inventory source and destination packages before importing.
- Preserve source files and uncommitted source-repository changes.
- Import packages without normalization first; make semantic changes in a later,
  reviewable phase.
- Keep each skill name unique across the repository.
- Move a skill together with every referenced file.
- Do not merge related skills solely because their topics overlap. Merge only when
  evidence shows redundant activation or substantial duplicated procedure.
- Never replace a client's entire skills directory during installation. Prefer
  collision-checked, per-skill links with an explicit rollback path.

## Validation

Before finalizing a skill change, verify:

- Frontmatter parses and required fields satisfy the Agent Skills specification.
- Directory and skill names match and are unique.
- Descriptions are concise and distinguish nearby skills.
- Compatibility and tool declarations are accurate.
- All relative links and referenced resources exist.
- Portable instructions contain no unconditional harness-specific operations.
- Scripts are self-contained or document dependencies and provide actionable
  errors.
- Large skills use progressive disclosure deliberately.
- Existing evaluations pass, and new behavior has realistic coverage when useful.

Use the repository task runner or validation script once present. Until then, use `skills-ref validate skills/<skill-name>` where available.

## Workflow

For migrations and broad refactors:

1. Plan the work in independently reviewable phases.
2. Implement one phase without changing later-phase concerns.
3. Review and correct that phase.
4. Commit it as a working state with a behavior-based conventional commit.
5. Continue only after the phase commit succeeds.

Do not create standalone summary or planning files unless the user requests them. Keep README and repository instructions current instead.
