import {readdir, readFile, realpath, stat} from 'node:fs/promises';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';

interface SkillFrontmatter {
  readonly name?: unknown;
  readonly description?: unknown;
  readonly license?: unknown;
  readonly compatibility?: unknown;
  readonly metadata?: unknown;
  readonly allowedTools?: unknown;
  readonly keys: readonly string[];
}

const SKILLS_DIRECTORY = resolve('skills');
const ALLOWED_FRONTMATTER_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const NAME_PATTERN = /^(?!-)(?!.*--)[a-z0-9-]+(?<!-)$/;
const MARKDOWN_LINK_PATTERN = /\[[^\]]+\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g;
const MAX_SKILL_LINES = 500;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_COMPATIBILITY_LENGTH = 500;

export function parseFrontmatter(content: string, path: string): SkillFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error(`${path}: missing YAML frontmatter`);

  const parsed = Bun.YAML.parse(match[1]);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${path}: frontmatter must be a YAML mapping`);
  }
  const values = parsed as Record<string, unknown>;
  return {
    name: values.name,
    description: values.description,
    license: values.license,
    compatibility: values.compatibility,
    metadata: values.metadata,
    allowedTools: values['allowed-tools'],
    keys: Object.keys(values),
  };
}

export function validateFrontmatter(frontmatter: SkillFrontmatter, directoryName: string, path: string): string[] {
  const errors: string[] = [];
  for (const key of frontmatter.keys) {
    if (!ALLOWED_FRONTMATTER_KEYS.has(key)) errors.push(`${path}: unsupported frontmatter field ${key}`);
  }
  if (typeof frontmatter.name !== 'string' || frontmatter.name.length > MAX_NAME_LENGTH || !NAME_PATTERN.test(frontmatter.name)) {
    errors.push(`${path}: name must be at most ${MAX_NAME_LENGTH} characters and use lowercase letters, numbers, and single hyphens`);
  } else if (frontmatter.name !== directoryName) {
    errors.push(`${path}: name must match parent directory ${directoryName}`);
  }

  if (typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
    errors.push(`${path}: description must be a non-empty string`);
  } else if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`${path}: description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  for (const [field, value, maximum] of [
    ['license', frontmatter.license, undefined],
    ['compatibility', frontmatter.compatibility, MAX_COMPATIBILITY_LENGTH],
  ] as const) {
    if (value !== undefined && (typeof value !== 'string' || value.trim() === '' || (maximum !== undefined && value.length > maximum))) {
      errors.push(`${path}: ${field} must be a non-empty string${maximum === undefined ? '' : ` of at most ${maximum} characters`}`);
    }
  }

  if (frontmatter.metadata !== undefined) {
    if (typeof frontmatter.metadata !== 'object' || frontmatter.metadata === null || Array.isArray(frontmatter.metadata)) {
      errors.push(`${path}: metadata must be a string-to-string mapping`);
    } else if (Object.values(frontmatter.metadata).some((value) => typeof value !== 'string')) {
      errors.push(`${path}: every metadata value must be a string`);
    }
  }

  if (frontmatter.allowedTools !== undefined && (typeof frontmatter.allowedTools !== 'string' || frontmatter.allowedTools.trim() === '' || frontmatter.allowedTools.includes(','))) {
    errors.push(`${path}: allowed-tools must be a non-empty space-separated string`);
  }
  return errors;
}

function isContained(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

function linkDestinations(content: string): string[] {
  return [...content.matchAll(MARKDOWN_LINK_PATTERN)].map((match) => match[1] ?? match[2]);
}

export async function validateLinks(content: string, skillRoot: string, path: string): Promise<string[]> {
  const errors: string[] = [];
  const canonicalRoot = await realpath(skillRoot);
  for (const rawTarget of linkDestinations(content)) {
    if (/^(?:https?:|mailto:|#|\/\/)/.test(rawTarget)) continue;
    const target = rawTarget.split('#', 1)[0].split('?', 1)[0];
    const targetPath = resolve(dirname(path), target);
    if (!isContained(skillRoot, targetPath)) {
      errors.push(`${path}: local link must remain inside its skill package: ${rawTarget}`);
      continue;
    }
    try {
      await stat(targetPath);
      const canonicalTarget = await realpath(targetPath);
      if (!isContained(canonicalRoot, canonicalTarget)) errors.push(`${path}: local link resolves outside its skill package: ${rawTarget}`);
    } catch {
      errors.push(`${path}: referenced file does not exist: ${rawTarget}`);
    }
  }
  return errors;
}

export function validateHostBoundaries(content: string, frontmatter: SkillFrontmatter, path: string): string[] {
  const usesHostApi = /Task\(\{|\b(?:storewrite|storeread|host\.mcp)\b/.test(content);
  if (!usesHostApi) return [];
  const hasCompatibility = typeof frontmatter.compatibility === 'string' && frontmatter.compatibility.trim() !== '';
  if (!hasCompatibility) {
    return [`${path}: host-specific APIs require compatibility`];
  }
  return [];
}

export async function validateRepository(skillsDirectory = SKILLS_DIRECTORY): Promise<string[]> {
  const entries = await readdir(skillsDirectory, {withFileTypes: true});
  const directories = entries.filter((entry) => entry.isDirectory()).sort((left, right) => left.name.localeCompare(right.name));
  const errors: string[] = [];
  const names = new Set<string>();

  for (const directory of directories) {
    const skillRoot = join(skillsDirectory, directory.name);
    const path = join(skillRoot, 'SKILL.md');
    let content: string;
    try {
      content = await readFile(path, 'utf8');
    } catch {
      errors.push(`${relative(process.cwd(), path)}: missing SKILL.md`);
      continue;
    }

    const displayPath = relative(process.cwd(), path);
    try {
      const frontmatter = parseFrontmatter(content, displayPath);
      errors.push(...validateFrontmatter(frontmatter, directory.name, displayPath));
      errors.push(...validateHostBoundaries(content, frontmatter, displayPath));
      if (typeof frontmatter.name === 'string') {
        if (names.has(frontmatter.name)) errors.push(`${displayPath}: duplicate skill name ${frontmatter.name}`);
        names.add(frontmatter.name);
      }
    } catch (error: unknown) {
      errors.push(error instanceof Error ? error.message : `${displayPath}: unknown frontmatter error`);
    }

    const lineCount = content.split('\n').length;
    if (lineCount > MAX_SKILL_LINES) errors.push(`${displayPath}: ${lineCount} lines exceeds the ${MAX_SKILL_LINES}-line recommendation`);
    errors.push(...await validateLinks(content, skillRoot, path));
  }
  return errors;
}

async function main(): Promise<void> {
  const errors = await validateRepository();
  if (errors.length > 0) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    throw new Error(`Validation failed with ${errors.length} error(s)`);
  }
  const entries = await readdir(SKILLS_DIRECTORY, {withFileTypes: true});
  console.log(`Validated ${entries.filter((entry) => entry.isDirectory()).length} skills.`);
}

if (import.meta.main) await main();
