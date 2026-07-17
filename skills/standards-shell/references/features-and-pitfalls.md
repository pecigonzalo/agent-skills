# Shell features and pitfalls

## Features & Pitfalls

### ShellCheck

Run [ShellCheck](https://www.shellcheck.net/) on **all** scripts. It catches common bugs and style issues:

```sh
shellcheck script.sh
```

Add ShellCheck to CI as a required gate.

### Command Substitution

Use `$(command)`: **never backticks**:

```bash
# ✅
var="$(command "$(command1)")"

# ❌
var="`command \`command1\``"
```

### Tests: `[[ … ]]` vs `[ … ]`

Always use `[[ … ]]`: it prevents word splitting and pathname expansion, and supports regex and pattern matching:

```bash
# ✅ Pattern match
if [[ "filename" =~ ^[[:alnum:]]+name ]]; then …; fi

# ✅ Glob match (RHS unquoted)
if [[ "${f}" == *.sh ]]; then …; fi

# ❌ Avoid: no regex, no ==, risk of word splitting
if [ "filename" == f* ]; then …; fi
```

### Testing Strings

Use `-z` (zero length) and `-n` (non-zero length) for empty/non-empty checks:

```bash
# ✅
if [[ -z "${my_var}" ]]; then …; fi
if [[ -n "${my_var}" ]]; then …; fi

# ✅ Equality
if [[ "${my_var}" == "some_string" ]]; then …; fi

# ❌ Avoid filler characters
if [[ "${my_var}X" == "some_stringX" ]]; then …; fi
```

For numerical comparison, use `(( … ))` or `-lt`/`-gt`, not `<`/`>` inside `[[ … ]]` (those are lexicographical):

```bash
# ✅
if (( my_var > 3 )); then …; fi
if [[ "${my_var}" -gt 3 ]]; then …; fi

# ❌ Lexicographical: 22 < 4 is true
if [[ "${my_var}" > 3 ]]; then …; fi
```

### Wildcard Expansion

Use `./*` not `*` to avoid filenames starting with `-`:

```bash
# ✅ Safe
rm -v ./*

# ❌ Dangerous: '-f' becomes a flag
rm -v *
```

### eval

**Avoid `eval`**. It obscures what variables are set and can't be safely audited. Use arrays, parameter expansion, or process substitution instead.

### Arrays

Use arrays (not strings) to store lists of arguments or elements:

```bash
# ✅ Array: safe quoting
declare -a flags
flags=(--foo --bar='baz')
flags+=(--greeting="Hello ${name}")
mybinary "${flags[@]}"

# ❌ String: breaks on spaces
flags='--foo --bar=baz'
mybinary ${flags}
```

Always expand arrays with `"${array[@]}"` (quoted, `@` form).

Do not assign array from unquoted command substitution: whitespace splitting applies:

```bash
# ❌ Breaks on filenames with spaces
declare -a files=($(ls /directory))

# ✅ Use readarray with process substitution
readarray -t files < <(find /directory -maxdepth 1)
```

### Pipes to While

Pipes create a subshell: variables set inside a `while` loop body are not visible after the pipe ends. Use process substitution or `readarray` instead:

```bash
# ❌ last_line is always 'NULL' after the loop
your_command | while read -r line; do
  last_line="${line}"
done
echo "${last_line}"  # always 'NULL'

# ✅ Process substitution preserves variable scope
while read -r line; do
  last_line="${line}"
done < <(your_command)
echo "${last_line}"  # correct

# ✅ readarray + for loop
readarray -t lines < <(your_command)
for line in "${lines[@]}"; do
  last_line="${line}"
done
```

### Arithmetic

Always use `(( … ))` or `$(( … ))`. Never use `let`, `$[ … ]`, or `expr`:

```bash
# ✅
echo "$(( 2 + 2 )) is 4"
if (( a < b )); then …; fi
(( i = 10 * j + 400 ))
(( i += 3 ))

# ❌
let i="2 + 2"
i=$[2 * 10]
i=$(expr 4 + 4)
```

> ⚠️ Avoid standalone `(( … ))` as a statement with `set -e`: `(( i++ ))` when `i=0` evaluates to 0 (false) and causes the script to exit.

Inside `$(( … ))`, the `${var}` braces are not required: the shell resolves variables directly:

```bash
local -i hundred=$(( 10 * 10 ))
(( i += 3 ))
```

### Aliases

**Avoid aliases in scripts**: use functions instead. Functions provide a superset of alias functionality and are cleaner:

```bash
# ❌ Alias: $RANDOM evaluated once at define time
alias random_name="echo some_prefix_${RANDOM}"

# ✅ Function: evaluated on each call, arguments work normally
random_name() {
  echo "some_prefix_${RANDOM}"
}
```

---
