# Agent Skills

The canonical collection of reusable [Agent Skills][agent-skills] for Pi, OpenCode, and other compatible agents. It consolidates skills previously maintained in the `pi-config` and `opencode-config` repositories.

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

`SKILL.md` contains required YAML frontmatter and the instructions loaded when an agent activates the skill. Supporting files stay inside the package so it can be moved or linked without breaking relative references.

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

Pi implements the Agent Skills standard and recursively discovers packages containing `SKILL.md` within its configured skill locations. OpenCode skills use the same package structure. Some skills may remain client-specific when they require host tools or APIs that have no portable equivalent.

Install skills by linking individual package directories into each client's native skills directory. Do not replace an entire client skills directory: per-skill links preserve unmanaged skills and make collisions and rollback easier to handle.

## Safe cutover

Validate the canonical collection before changing either client:

```bash
bun install --frozen-lockfile
bun run validate
```

Choose one low-risk skill as a canary. Before linking it, inspect the destination and stop if it is a real directory, file, or unexpected symlink:

```bash
skill=standards-analysis
repo=$(git rev-parse --show-toplevel)

if [ ! -f "$repo/skills/$skill/SKILL.md" ]; then
  printf 'Run this from the agent-skills checkout: %s\n' "$repo" >&2
  exit 1
fi

for target in "$HOME/.pi/agent/skills/$skill" "$HOME/.config/opencode/skills/$skill"; do
  if [ -e "$target" ] || [ -L "$target" ]; then
    printf 'Destination already exists: %s\n' "$target" >&2
    exit 1
  fi
done
```

Create only the client link you are testing. For Pi:

```bash
mkdir -p "$HOME/.pi/agent/skills"
ln -s "$repo/skills/$skill" "$HOME/.pi/agent/skills/$skill"
```

Restart Pi, confirm the canary appears exactly once, and force-load it with `/skill:standards-analysis` on a representative task. You can instead start Pi with `--skill "$repo/skills/standards-analysis"` for a test that does not change discovery paths.

After the Pi canary passes or has been rolled back, repeat the collision check and create the OpenCode canary:

```bash
mkdir -p "$HOME/.config/opencode/skills"
ln -s "$repo/skills/$skill" "$HOME/.config/opencode/skills/$skill"
```

Restart OpenCode, confirm `standards-analysis` appears once in its available skills, and use a complex analysis prompt that should activate it. Verify the session trace shows that OpenCode loaded the linked `SKILL.md` before linking the remaining packages.

For rollback, remove only a symlink whose stored target exactly matches the package path created above:

```bash
target="$HOME/.pi/agent/skills/$skill"
expected="$repo/skills/$skill"

if [ -L "$target" ] && [ "$(readlink "$target")" = "$expected" ]; then
  rm "$target"
else
  printf 'Refusing to remove unmanaged destination: %s\n' "$target" >&2
  exit 1
fi
```

Before cutover, run `git status --short` in both `~/.pi` and `~/.config/opencode`. Preserve every uncommitted change by committing it to the appropriate repository or by making an explicit backup; do not use a destructive clean or reset. Do not remove the source packages until both clients have loaded the complete expected set without missing skills or duplicate-name warnings. Remove Pi's configured dependency on `~/.config/opencode/skills` only after equivalent Pi-native links are active and verified. Keep the pre-cutover commits and backups available until rollback has been exercised.

## Contributing

Before adding or changing a skill:

1. Read [`AGENTS.md`](AGENTS.md).
2. Keep the directory name and frontmatter `name` identical.
3. Validate frontmatter, links, bundled resources, and compatibility claims.
4. Test the skill on realistic tasks and compare it with an unassisted baseline when behavior changes materially.
5. Update documentation in the same change as the skill.

Install the pinned development dependencies and run the repository checks:

```bash
bun install --frozen-lockfile
bun run validate
```

The validation command type-checks the validator, runs its tests, and checks every skill's frontmatter, referenced package-local resources, size, duplicate names, and declared host capabilities. You can also run the official validator against an individual package:

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
