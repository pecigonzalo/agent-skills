---
name: standards-shell
description: Use this skill when writing or reviewing shell and Bash scripts, designing shell script architecture, or working on CI/CD pipeline scripts. Provides Google Shell Style Guide patterns, safety practices, and idiomatic Bash.
---

# Shell Standards

**Provides:** Idiomatic bash patterns, naming conventions, formatting rules, safety practices, and common pitfalls based on the [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html).

## Quick Reference

**Golden Rule**: Shell is for small utilities and simple wrappers: when in doubt, use a real language.

**Do** (✅):
- Use `#!/bin/bash` as the shebang for executables
- Use `[[ … ]]` over `[ … ]` or `test`
- Use `$(command)` over backticks
- Quote all variables: `"${var}"`
- Use `local` for function-scoped variables
- Send errors to STDERR: `echo "error" >&2`
- Run ShellCheck on all scripts
- Use arrays for argument lists
- Declare constants with `readonly`; exported vars with `declare -xr`

**Don't** (❌):
- Write scripts longer than ~100 lines: rewrite in Python/Go
- Use `eval`: it obscures what gets set and can't be audited
- Use `let`, `$[ … ]`, or `expr` for arithmetic: use `(( … ))`
- Pipe into `while read`: use process substitution `< <(cmd)` or `readarray`
- Use backticks: use `$(…)` instead
- Use `$*` for passing arguments: use `"$@"`
- Use SUID/SGID on shell scripts
- Define aliases in scripts: use functions
- Use `[ … ]` when `[[ … ]]` is available

**Key tools:**

```sh
shellcheck script.sh          # static analysis (required)
shellcheck -S warning *.sh    # run at warning severity
bash -n script.sh             # syntax check only
bash -x script.sh             # trace execution
```

---

## When to Use Shell

Shell should only be used for **small utilities or simple wrapper scripts**.

Switch to Python, Go, or another structured language when:
- The script exceeds ~100 lines
- Control flow is complex (non-trivial branching, recursion)
- Performance matters
- The script is not easily understood by others

---

## File Structure & Invocation

### Shebang

```bash
#!/bin/bash
```

Executables must start with `#!/bin/bash`. Use `set` to configure shell options so the script still works when called directly as `bash script.sh`.

Recommended safety options at the top of every non-trivial script:

```bash
#!/bin/bash
set -euo pipefail
```

| Option | Effect |
|--------|--------|
| `-e` | Exit immediately on error |
| `-u` | Treat unset variables as errors |
| `-o pipefail` | Pipe returns non-zero if any command fails |

### File Extensions

- **Executables**: `.sh` extension or no extension (no extension preferred when added to `PATH`)
- **Libraries**: must have `.sh` extension and should not be executable
- **Source filenames**: lowercase with underscores: `make_template.sh` or `maketemplate.sh` (not `make-template.sh`)

### SUID/SGID

SUID and SGID are **forbidden** on shell scripts. Use `sudo` to provide elevated access.

---

## Environment

### STDOUT vs STDERR

All error messages go to `STDERR`. Normal output goes to `STDOUT`.

```bash
# Standard error helper
err() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $*" >&2
}

if ! do_something; then
  err "Unable to do_something"
  exit 1
fi
```

---

## Comments

### File Header

Every file must have a top-level comment with a brief description:

```bash
#!/bin/bash
#
# Perform hot backups of Oracle databases.
```

### Function Comments

Any non-obvious or non-trivial function must have a header comment. Library functions always require one. Use this format:

```bash
#######################################
# Delete a file in a sophisticated manner.
# Globals:
#   BACKUP_DIR
# Arguments:
#   File to delete, a path.
# Outputs:
#   Writes status to STDOUT.
# Returns:
#   0 if deleted, non-zero on error.
#######################################
del_thing() {
  rm "$1"
}
```

### Implementation Comments

Comment tricky, non-obvious, or important parts of your code. Don't comment everything: only what isn't self-evident.

### TODO Comments

```bash
# TODO(username): Handle the unlikely edge cases (bug ####)
```

---

## Formatting

### Indentation

- **2 spaces**: no tabs
- Blank lines between blocks improve readability
- **Exception**: `<<-` here-documents may use tab indentation

### Line Length

Maximum **80 characters**. For longer strings, use here-documents or embedded newlines:

```bash
# DO: here document
cat <<END
I am an exceptionally long string.
END

# DO: embedded newline
long_string="I am an exceptionally
long string."
```

### Pipelines

If a pipeline fits on one line, keep it on one line. Otherwise, split with `\` and one pipe per line (pipe on the newline):

```bash
# Short: one line
command1 | command2

# Long: split per segment
command1 \
  | command2 \
  | command3 \
  | command4
```

### Control Flow

`; then` and `; do` go on the same line as `if`/`for`/`while`. `else` and closing `fi`/`done` on their own lines:

```bash
for dir in "${dirs[@]}"; do
  if [[ -d "${dir}" ]]; then
    rm -rf "${dir}"
  else
    mkdir -p "${dir}"
  fi
done
```

Always include `in "$@"` in `for` loops explicitly:

```bash
for arg in "$@"; do
  echo "argument: ${arg}"
done
```

### Case Statement

```bash
case "${expression}" in
  a)
    variable="…"
    ;;
  b) simple_action ;;
  *)
    error "Unexpected: '${expression}'"
    ;;
esac
```

- Indent alternatives by 2 spaces
- One-line alternatives: space after `)`, space before `;;`
- Multi-command alternatives: pattern, actions, and `;;` on separate lines

### Variable Expansion

Prefer `"${var}"` over `"$var"`. Always quote variables.

```bash
# Preferred
echo "PATH=${PATH}, mine=${some_var}"

# Braces required for 10th+ positional parameter
echo "${10}"

# Disambiguate concatenation
echo "${1}0${2}0${3}0"
```

### Quoting

- Always quote strings containing variables, substitutions, spaces, or shell meta characters
- Use `"$@"` (not `$*`) when passing all arguments
- Use arrays for safe quoting of argument lists
- Single quotes indicate no substitution: `'literal $string'`
- Double quotes allow substitution: `"hello ${name}"`

```bash
# Quote command substitutions
flag="$(some_command "$@")"

# Use arrays for argument lists
declare -a FLAGS
FLAGS=(--foo --bar='baz')
mybinary "${FLAGS[@]}"

# "$@" preserves argument boundaries; $* does not
run_cmd "$@"
```

---

## Features & Pitfalls

Read [shell features and pitfalls](references/features-and-pitfalls.md) when selecting shell constructs or reviewing portability hazards.

## Naming Conventions

### Function Names

Lowercase, words separated by underscores. No spaces around parentheses. Opening brace on the same line:

```bash
# Single function
my_func() {
  …
}

# Library function (package::function)
mypackage::my_func() {
  …
}
```

The `function` keyword is optional but must be used consistently within a project.

### Variable Names

Lowercase with underscores (same rules as function names):

```bash
for zone in "${zones[@]}"; do
  something_with "${zone}"
done
```

### Constants and Environment Variables

UPPER_SNAKE_CASE. Declare with `readonly` and/or `export` at the top of the file:

```bash
# Constant
readonly PATH_TO_FILES='/some/path'

# Exported constant
declare -xr ORACLE_SID='PROD'

# Runtime constant: set readonly after assignment
ZIP_VERSION="$(dpkg --status zip | sed -n 's/^Version: //p')"
readonly ZIP_VERSION
```

### Use Local Variables

Declare function-scoped variables with `local`. Keep declaration and assignment separate when the value comes from a command substitution: `local` does not propagate exit codes:

```bash
my_func() {
  local name="$1"

  # Separate declaration and command-substitution assignment
  local my_var
  my_var="$(my_other_func)"
  (( $? == 0 )) || return

  echo "${my_var}"
}
```

```bash
# ❌ $? reflects 'local', not my_other_func
my_func() {
  local my_var="$(my_other_func)"
  (( $? == 0 )) || return
}
```

### Function Location

Place all functions together, just below constants. Don't scatter executable code between function definitions. Only `source`/`.` statements, `set` options, and constant declarations may precede functions.

### main

For scripts with more than one function, define a `main` function and call it as the last non-comment line:

```bash
main() {
  local input="$1"
  process "${input}"
}

main "$@"
```

This keeps top-level variables local and makes the entry point obvious.

---

## Calling Commands

### Checking Return Values

Always check return values. Use `if !` or `$?` checks with informative error messages:

```bash
if ! mv "${file_list[@]}" "${dest_dir}/"; then
  echo "Unable to move files to ${dest_dir}" >&2
  exit 1
fi
```

For pipelines, capture `PIPESTATUS` immediately (it's overwritten by the next command):

```bash
tar -cf - ./* | ( cd "${dir}" && tar -xf - )
return_codes=( "${PIPESTATUS[@]}" )
if (( return_codes[0] != 0 )); then
  err "tar failed"
fi
if (( return_codes[1] != 0 )); then
  err "untar failed"
fi
```

### Builtins vs External Commands

Prefer shell builtins and parameter expansion over spawning external processes:

```bash
# ✅ Builtin parameter expansion
addition="$(( X + Y ))"
substitution="${string/#foo/bar}"

# ❌ Spawning external processes unnecessarily
addition="$(expr "${X}" + "${Y}")"
substitution="$(echo "${string}" | sed -e 's/^foo/bar/')"
```

Builtins are faster, more portable, and avoid subshell overhead.

---

## Checklist

Before committing a shell script:

- [ ] ShellCheck passes with no errors or warnings
- [ ] File has a header comment describing its purpose
- [ ] `#!/bin/bash` shebang present on executables
- [ ] Safety options set (`set -euo pipefail`) where appropriate
- [ ] All variables quoted: `"${var}"`
- [ ] Functions use `local` for internal variables
- [ ] Constants declared `readonly`
- [ ] `[[ … ]]` used instead of `[ … ]`
- [ ] `$(…)` used instead of backticks
- [ ] Arrays used for argument/element lists (not strings)
- [ ] No `eval`, `let`, `$[ … ]`, or `expr`
- [ ] Error messages sent to STDERR (`>&2`)
- [ ] Return values checked on all commands
- [ ] `"$@"` used (not `$*`) when passing arguments through
- [ ] Pipes to `while` replaced with process substitution or `readarray`
- [ ] Script is ≤ ~100 lines; longer scripts rewritten in a structured language
