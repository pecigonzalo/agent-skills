---
name: standards-go
description: Use this skill when writing or reviewing Go code or making Go architecture and API design decisions. Provides idiomatic Go patterns, error handling, resource management, generics, and design pattern guidance.
license: MIT
metadata:
  role: standards
  domain: go
  priority: high
---

# Go Standards

**Provides:** Idiomatic Go patterns, error handling, resource management,
naming/package conventions, API/type design, and lightweight Go-specific pattern
guidance. For concurrency, testing, and performance, load dedicated subskills.

**Primary references:**

- [Effective Go](https://go.dev/doc/effective_go)
- [Go CodeReviewComments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Google Go Style Guide](https://google.github.io/styleguide/go/guide)
- [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md)

## Quick Reference

**Golden Rule**: Explicit is better than implicit; clarity beats cleverness

**Style principles (priority order):**

| Principle       | Key question                              |
| --------------- | ----------------------------------------- |
| Clarity         | Can a reader understand what and why?     |
| Simplicity      | Is this the simplest approach?            |
| Concision       | Is the signal-to-noise ratio high?        |
| Maintainability | Can this be safely modified later?        |
| Consistency     | Does this match surrounding code?         |

**Do**:

- Run `gofmt`/`goimports` on every save
- Use MixedCaps for identifiers; avoid underscores (except test names and rare
  low-level interop)
- Return `error` last; wrap with `%w`; check with `errors.Is`/`errors.As` (1.13+)
- `defer` release immediately after acquisition
- Pass `context.Context` as the first argument to blocking calls
- Accept interfaces, return concrete types
- Design zero values to be usable
- Prefer standard helpers available in your Go version (`slices`, `maps`,
  `cmp`, `min`/`max`)
- Use `any` instead of `interface{}` when unconstrained (1.18+)

**Don't**:

- Hand-align code or use underscores in identifiers
- Stutter exported names (`bufio.BufReader` → use `bufio.Reader`)
- Discard errors with `_` silently
- Store `context.Context` in structs
- Use `panic` as flow control
- Use dot imports outside tests
- Name packages `util`, `common`, or `helpers`
- Use `init()` for anything beyond simple side-effect-free registration
- Use naked returns in non-trivial functions
- Define interfaces in consumers, not implementations
- Use bare `string`/`int` context keys
- Use `http.NewRequest` for outbound calls that must respect a deadline — use `http.NewRequestWithContext`

**Key commands (only when needed):**

```sh
go test ./...        # baseline validation
go test -race ./...  # when touching concurrency
go mod tidy          # when deps changed
```

---

## Formatting & Tooling

- Use `goimports` (or `gofmt`) on save; CI should reject unformatted files.
- Use `go vet ./...` in CI.
- Use `golangci-lint` as the unified linter runner when configured.
- Keep `//go:generate` deterministic; track generator tool dependencies via
  `tools.go` + `//go:build tools` when needed.
- Keep import groups simple: stdlib, external, internal (enforced by
  `goimports`).
- Restrict blank imports (`_`) to real side-effect registration use cases.

## Code Style

### Reduce Nesting

Handle error cases and special conditions first; return early or `continue` to keep the happy path unindented.

### Local Consistency

When multiple styles are acceptable and no rule applies, match the style of the surrounding file/package. Do not introduce a second convention without a strong reason.

### Least Mechanism

Prefer the simplest tool that works:

1) core language constructs (struct/slice/map/channel)
2) standard library
3) well-adopted libraries

Add dependencies and abstraction only when they clearly improve correctness, simplicity at call sites, or performance.

### Control Flow Idioms

- **`if` with initializer**: scope short-lived variables to the block: `if err := file.Chmod(0664); err != nil { return err }`.
- **`:=` redeclaration rule**: a variable in the *same scope* can reappear on the left of `:=` if at least one other variable is new. **Shadowing trap**: `:=` in an inner scope creates a new variable — the outer one is silently unchanged.
- **`range` over strings iterates runes (not bytes)**: `for i, r := range s` yields Unicode code points; `i` is the byte offset.
- **Switch**: no implicit fallthrough; expression-less switch (`switch { case cond: }`) switches on `true`; comma-separated cases share a body; use **labeled break** to exit an enclosing loop from within a switch.

### Reduce Scope of Variables

Declare variables as close as possible to their use. Prefer `if`/`switch` initializers to keep temporary values scoped to the block, and avoid pre-declaring `var x` far above where it is used.

### Raw String Literals

Use raw string literals (backticks) to avoid hand-escaped strings: `` `unknown error:"test"` `` instead of `"unknown error:\"test\""`.

## Naming & Packages

- Package names: lowercase, single word, matches directory name. Avoid `util`, `common`, `helpers`, `misc`.
- Exported names must not stutter: `http.Client` not `http.HTTPClient`; `bufio.Reader` not `bufio.BufReader`.
- Use MixedCaps (camelCase / PascalCase) for identifiers; no underscores. Exceptions: `Test*`/`Benchmark*`/`Example*` in `*_test.go`; low-level OS/cgo interop.
- Getters named as the field: `Owner()` not `GetOwner()`; setters: `SetOwner(v)`. Use `Compute`/`Fetch` for expensive operations.
- Single-method interfaces: suffix with `-er` (`io.Reader`, `http.Handler`); define at point of use, not in the implementing package.
- Doc comments on every exported symbol: `// FunctionName does X.`

### Documentation (godoc)

- **Comment style**: Start with the name being documented; use a full sentence. Example: `// A Request represents a request to run a command.`
- **Package comment**: Every package needs exactly one; place it in `doc.go` for large packages.
- **Parameters / config**: Document only non-obvious behavior and edge cases.
- **Context cancellation**: Implied — document only when behavior differs.
- **Concurrency**: Read-only operations are assumed safe; mutating assumed unsafe. Add a note only when ambiguous.
- **Cleanup**: Always state when the caller must release a resource.
- **Errors**: Document sentinel errors and custom error types — use pointer form (`*PathError`) for `errors.As` targets.
- **Godoc formatting**: Blank line between paragraphs; indent code blocks by two extra spaces.

### Initialisms and Acronyms

Initialisms (URL, ID, HTTP, etc.) must be cased uniformly: `ParseURL`,
`HTTPClient`, `userID`. Avoid mixed forms like `userId` or `ParseUrl`.

### Avoid Predeclared Names

Do not name variables, parameters, fields, or methods after Go's predeclared identifiers (`error`, `string`, `int`, `len`, `make`, `new`, `close`). Shadowing creates subtle bugs.

### Avoiding Repetition

Names should not feel redundant when read in full context. Consider the package qualifier, receiver type, and surrounding code: `widget.New()` not `widget.NewWidget()`; `db.Load()` not `db.LoadFromDatabase()`.

## API & Type Design

Read [the API and type design guide](references/api-and-type-design.md) when designing exported APIs, interfaces, constructors, options, or type sets.

## Project Structure

```
cmd/myapp/main.go    # Minimal — wire dependencies and call into internal packages
internal/            # Private packages; cannot be imported by external modules
pkg/                 # Public library code (optional; omit if all consumers are internal)
api/                 # API definitions (OpenAPI specs, protobuf files)
configs/             # Configuration files
testdata/            # Test fixtures; ignored by go build
```

- Keep `main` packages thin — business logic belongs in `internal/`.
- Prefer `internal/` over `pkg/` unless you intentionally publish an importable API.
- `testdata/` is the conventional home for golden files, fixtures, and fuzz corpora.

### File Organization

- Group declarations: `import (...)`, then `const (...)`, `var (...)`, `type (...)` when related.
- Keep functions grouped by receiver; keep exported APIs first.
- Place constructors (`NewT`/`newT`) right after the type definition, before methods.
- Keep plain helper functions (no receiver) near the end of the file.

### Build constraints and workspaces

- Use `//go:build` syntax (not legacy `// +build`).
- Use `go work` in multi-module repos when local cross-module iteration is
  needed; avoid committing `go.work` when modules are independently versioned.

## Error Handling

- Return `error` as the last return value. Never discard with `_` without an explanatory comment.
- Wrap errors for context: `fmt.Errorf("open config: %w", err)`. Use `%w` (not `%v`) so callers can unwrap.
- Check wrapped errors with `errors.Is` and `errors.As` (or `errors.AsType` if
  available in your project Go version).
- Sentinel errors: declare as package-level vars — `var ErrFoo = errors.New("foo")` — so callers can match without string comparison.
- Combine multiple errors with `errors.Join(err1, err2)` (1.20+) instead of manual concatenation.
- **Custom error types**: define struct types when callers need structured
  fields; unwrap with `errors.As`.
- `panic` is program-fatal. Use `recover` only at package or handler boundaries (e.g., HTTP middleware). Never use panic/recover as a substitute for returning errors.

### Return the `error` Interface, Not a Concrete Type

Always return the `error` interface from exported functions. Returning a concrete type (e.g., `*os.PathError`) creates a typed-nil trap: a nil pointer compares non-nil as an interface value.

### Error Strings

Error strings should be **lowercase** and should **not** end with punctuation. Exception: capitalize when beginning with an exported name or proper noun.

### Avoid In-Band Errors

Do not use magic sentinel values (`-1`, `""`, `nil`) to signal failure. Use multiple return values: `func Lookup(key string) (string, bool)` or `func Parse(key string) (int, error)`.

### Indent Error Flow

Handle errors first and return early; do not put the normal path in an `else` branch. Avoid `if x, err := f(); err != nil { ... } else { use x }` — declare `x` separately when it lives beyond a few lines.

### `%v` vs `%w`

- Use `%w` for internal propagation where callers may match/unwrap.
- Use `%v` at service boundaries where you intentionally hide internals.

### Handle Errors Once

Each error must be handled exactly **once**. Never log *and* return the same error.

| Strategy | When to use |
|----------|-------------|
| **Wrap and return** | Caller is better positioned to handle it |
| **Log and degrade** | The error is non-fatal; execution can continue |
| **Match and handle** | You can recover from specific conditions; return others |

```go
if err := db.QueryRow(ctx, q, id).Scan(&u); err != nil {
    if errors.Is(err, sql.ErrNoRows) {
        return nil, ErrNotFound
    }
    return nil, fmt.Errorf("get user %s: %w", id, err)
}
```

### init() Rules

Avoid `init()` — prefer an explicit initialization function called by `main()`. When unavoidable (e.g., `database/sql` driver registration), `init()` must be: completely deterministic, free of ordering dependencies, must not read env vars or `os.Args`, and must not perform I/O.

### Exit and log.Fatal

Call `os.Exit` or `log.Fatal*` **only in `main()`**. All other functions must return errors. Prefer the `run() error` pattern:

```go
func main() {
    if err := run(); err != nil {
        log.Fatal(err)
    }
}

func run() error {
    // ... business logic returning errors ...
    return nil
}
```

## Resource Management

- `defer` release **immediately** after acquisition: `f, err := os.Open(name); if err != nil { ... }; defer f.Close()`.
- Deferred call arguments are evaluated at the `defer` statement, not at call time.
- Pass `context.Context` as the **first argument** to blocking/cancellable functions. Do not store context in structs.
- Check errors from `Close()` on write paths (e.g., `gzip.Writer`, `bufio.Writer`).

### Context Patterns

- **No custom context types.** Always accept `context.Context`; embedding extra methods breaks composability.
- **Data placement order**: function parameters → receiver fields → package-level globals → context values. Context values are only for request-scoped, cross-cutting data (request IDs, trace IDs, auth tokens).
- **Context immutability**: safe to pass the same `ctx` to multiple sequential or concurrent calls.
- **`context.Background()`**: only at program entry points (`main`, top-level goroutines, tests). Everywhere else, accept and forward `ctx`.
- **Always `defer cancel()`** immediately after deriving a context.
- **Use `http.NewRequestWithContext`** (never `http.NewRequest`) so outbound requests respect the caller's deadline.

**Typed context keys** — never use bare string or int as a key:

```go
// Unexported type scoped to this package — impossible for other packages to collide
type contextKey string

const (
    requestIDKey contextKey = "requestID"
    userIDKey    contextKey = "userID"
)

func WithRequestID(ctx context.Context, id string) context.Context {
    return context.WithValue(ctx, requestIDKey, id)
}

func RequestID(ctx context.Context) (string, bool) {
    id, ok := ctx.Value(requestIDKey).(string)
    return id, ok
}
```

## Generics (1.18+)

Use generics to remove true type-parameterized duplication; do not reach for
them by default.

- Prefer concrete types and small interfaces first.
- Use minimal constraints (`any`, `comparable`, or narrow union constraints).
- Avoid generic data structures unless they provide clear ergonomic or
  correctness benefits beyond stdlib helpers.
- Do not use `any` where an interface better expresses behavior.

---

## Modern Go by Version

Check project Go version first (`go.mod`). Prefer modern stdlib functionality
available in that version.

High-value defaults to prefer when available:

- `slices`/`maps`/`cmp` helpers over manual loops and boilerplate
- `min`/`max`, `clear`, and other builtins over ad-hoc patterns
- improved context/test APIs (`With*Cause`, `t.Context()`, etc.)
- modern loop and ServeMux idioms in newer Go versions

High-value examples often **not** auto-fixed by `modernize`:

- API boundaries: use `slices.Clone` / `maps.Clone` to avoid aliasing mutable
  caller state.
- HTTP routing: use method-aware `http.ServeMux` patterns and `r.PathValue`
  where supported.
- Cancellation semantics: prefer `context.WithTimeoutCause` /
  `context.WithDeadlineCause` when error attribution matters.
- Tests/benchmarks: use `t.Context()` and `b.Loop()` when your Go version
  supports them.
- WaitGroup ergonomics: prefer `wg.Go(fn)` in newer Go versions.

When uncertain about version behavior, verify with official
[Go release notes](https://go.dev/doc/devel/release).

---

## Skill Loading Triggers

| Situation                                    | Also load                                              |
| -------------------------------------------- | ------------------------------------------------------ |
| Writing any Go code                          | `standards-code`                                       |
| Writing Go tests, benchmarks, fuzz tests     | `standards-go-testing`, `standards-testing`            |
| Goroutines, channels, sync, context patterns | `standards-go-concurrency`                             |
| Profiling, tracing, allocation, GC tuning    | `standards-go-performance`, `standards-observability`  |
| Auth, secrets, user input, crypto            | `standards-security`                                   |
| Implementing features/fixes (TDD)            | `role-developer`                                       |
| API/package/service design                   | `role-architect`                                       |
| Go PR review                                 | `role-code-review`                                     |

## Verification Checklist

- [ ] No formatting/lint/vet failures (prefer repo task runner; use
  `golangci-lint` when configured)
- [ ] Required tests pass
- [ ] Concurrency changes were race-checked when goroutines/sync were touched
- [ ] Dependency metadata is clean when dependencies changed

Note: file list is sampled.
