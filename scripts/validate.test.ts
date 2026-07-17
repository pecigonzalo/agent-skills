import {afterEach, describe, expect, test} from 'bun:test';
import {mkdtemp, mkdir, rm, symlink, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {parseFrontmatter, validateFrontmatter, validateHostBoundaries, validateLinks} from './validate';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, {force: true, recursive: true})));
});

function frontmatter(body: string): string {
  return `---\n${body}\n---\n\n# Skill\n`;
}

describe('frontmatter validation', () => {
  test('rejects unsupported fields and names over 64 characters', () => {
    const parsed = parseFrontmatter(frontmatter(`name: ${'a'.repeat(65)}\ndescription: Test skill.\nallowed_tools: Read`), 'SKILL.md');
    expect(validateFrontmatter(parsed, 'example', 'SKILL.md')).toEqual([
      'SKILL.md: unsupported frontmatter field allowed_tools',
      'SKILL.md: name must be at most 64 characters and use lowercase letters, numbers, and single hyphens',
    ]);
  });

  test('rejects empty optional strings and comma-delimited allowed tools', () => {
    const parsed = parseFrontmatter(frontmatter('name: example\ndescription: Test skill.\nlicense: ""\ncompatibility: ""\nallowed-tools: Read, Grep'), 'SKILL.md');
    expect(validateFrontmatter(parsed, 'example', 'SKILL.md')).toContain('SKILL.md: allowed-tools must be a non-empty space-separated string');
    expect(validateFrontmatter(parsed, 'example', 'SKILL.md')).toContain('SKILL.md: license must be a non-empty string');
    expect(validateFrontmatter(parsed, 'example', 'SKILL.md')).toContain('SKILL.md: compatibility must be a non-empty string of at most 500 characters');
  });
});

describe('local link validation', () => {
  test('accepts contained links with titles and rejects traversal', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agent-skill-'));
    temporaryDirectories.push(root);
    const references = join(root, 'references');
    await mkdir(references);
    await writeFile(join(references, 'guide.md'), '# Guide\n');
    const skillPath = join(root, 'SKILL.md');
    expect(await validateLinks('[Guide](<references/guide.md> "Details")', root, skillPath)).toEqual([]);
    expect(await validateLinks('[Outside](../outside.md)', root, skillPath)).toEqual([
      `${skillPath}: local link must remain inside its skill package: ../outside.md`,
    ]);
  });

  test('rejects symlinks that escape the package', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agent-skill-'));
    temporaryDirectories.push(root);
    const outside = join(root, '..', `outside-${crypto.randomUUID()}.md`);
    await writeFile(outside, '# Outside\n');
    await symlink(outside, join(root, 'outside.md'));
    try {
      expect(await validateLinks('[Outside](outside.md)', root, join(root, 'SKILL.md'))).toEqual([
        `${join(root, 'SKILL.md')}: local link resolves outside its skill package: outside.md`,
      ]);
    } finally {
      await rm(outside, {force: true});
    }
  });
});

test('host-specific APIs require compatibility', () => {
  const missing = parseFrontmatter(frontmatter('name: example\ndescription: Test skill.'), 'SKILL.md');
  expect(validateHostBoundaries('Task({})', missing, 'SKILL.md')).toEqual([
    'SKILL.md: host-specific APIs require compatibility',
  ]);
  const declared = parseFrontmatter(frontmatter('name: example\ndescription: Test skill.\ncompatibility: Requires native task delegation'), 'SKILL.md');
  expect(validateHostBoundaries('Task({})', declared, 'SKILL.md')).toEqual([]);
});
