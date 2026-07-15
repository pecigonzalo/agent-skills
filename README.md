# Agent Skills

The future canonical collection of reusable [Agent Skills][agent-skills] for Pi,
OpenCode, and other compatible agents. The initial migration from the `pi-config`
and `opencode-config` repositories is in progress.

## Repository layout

Each skill is a self-contained package under `skills/`:

```text
skills/
└── example-skill/
    ├── SKILL.md
    ├── references/  # Optional, loaded on demand
    ├── scripts/     # Optional, reusable automation
    ├── assets/      # Optional, templates and static resources
    └── evals/       # Optional, realistic evaluation cases
```

`SKILL.md` contains required YAML frontmatter and the instructions loaded when an
agent activates the skill. Supporting files stay inside the package so it can be
moved or linked without breaking relative references.

## Design principles

- Follow the strict Agent Skills specification, even when a client is lenient.
- Keep each skill focused on one coherent capability or workflow.
- Put only core instructions and high-value gotchas in `SKILL.md`.
- Use progressive disclosure for detailed or conditional material.
- Describe user intent and activation conditions precisely in `description`.
- Keep portable guidance independent of a specific agent harness.
- State host requirements explicitly when a skill depends on Pi or OpenCode.
- Prefer procedures, defaults, examples, and validation loops over generic advice.

## Client support

Pi implements the Agent Skills standard and recursively discovers packages
containing `SKILL.md` within its configured skill locations. OpenCode skills use
the same package structure. Some skills
may remain client-specific when they require host tools or APIs that have no
portable equivalent.

Install skills by linking individual package directories into each client's native
skills directory. Do not replace an entire client skills directory: per-skill links
preserve unmanaged skills and make collisions and rollback easier to handle.

Detailed cutover instructions will be added after the migrated collection passes
repository validation and client smoke tests.

## Contributing

Before adding or changing a skill:

1. Read [`AGENTS.md`](AGENTS.md).
2. Keep the directory name and frontmatter `name` identical.
3. Validate frontmatter, links, bundled resources, and compatibility claims.
4. Test the skill on realistic tasks and compare it with an unassisted baseline
   when behavior changes materially.
5. Update documentation in the same change as the skill.

The repository will provide a validation command after the initial migration.
Until then, use the official `skills-ref` validator where available:

```bash
skills-ref validate skills/<skill-name>
```

## Sources

- [Agent Skills overview][agent-skills]
- [Agent Skills specification][specification]
- [Skill creation best practices][best-practices]
- [Description optimization][descriptions]
- [Skill evaluation][evaluation]

[agent-skills]: https://agentskills.io/home
[best-practices]: https://agentskills.io/skill-creation/best-practices
[descriptions]: https://agentskills.io/skill-creation/optimizing-descriptions
[evaluation]: https://agentskills.io/skill-creation/evaluating-skills
[specification]: https://agentskills.io/specification
