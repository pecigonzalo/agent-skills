# Go API and type design

## API & Type Design

Keep APIs interface-friendly: accept interfaces, return concrete types, avoid pointers to interfaces, use `any` for placeholders. Design zero values to be usable.

### Struct Literals & Zero Values

- Prefer keyed struct literals by default. Positional struct literals are acceptable only in small, local table tests (3 fields or fewer) where meaning is obvious.
- Omit zero-value fields in keyed literals unless the field name adds meaningful context (common in table tests).
- When a value is truly the zero value, prefer `var t T` over `t := T{}`.
- Prefer `&T{...}` over `new(T)` for struct pointers (consistent with literal initialization).
- For multi-line literals, keep the closing brace aligned with the opening brace and include trailing commas; let `gofmt` handle formatting.
- In slice/map literals, omit repeated type names when it improves readability; `gofmt -s` can simplify many cases.

### Slice & Map Idioms

**`append` always returns a new slice header: always assign the result:**

```go
// Correct
items = append(items, newItem)
items = append(items, other...)

// Discards the result: may silently no-op when capacity grows
append(items, newItem)
```

**Nil vs empty slice**: prefer `var s []T` (nil slice) over `s := []T{}` (non-nil empty). Both have `len == 0` and work with `append`, `range`, etc. JSON exception: nil encodes to `null`; `[]T{}` encodes to `[]`.

When designing APIs, **do not distinguish** between a nil and a non-nil zero-length slice.

**Map comma-ok: always use the two-value form to detect presence:** `if v, ok := m[key]; ok { ... }`

**Set representation**: prefer `map[T]struct{}` over `map[T]bool`; zero-size values consume no heap.

**Copy slices and maps at API boundaries**: slices and maps hold pointers to underlying data; storing or returning them without copying leaks internal state. For Go 1.21+, prefer `slices.Clone` and `maps.Clone`:

```go
// Bad: caller can mutate d.trips
func (d *Driver) SetTrips(trips []Trip) { d.trips = trips }

// Good: defensive copy
func (d *Driver) SetTrips(trips []Trip) { d.trips = slices.Clone(trips) }

// Bad: exposes internal state
func (s *Stats) Snapshot() map[string]int { return s.counters }

// Good: return a copy
func (s *Stats) Snapshot() map[string]int { return maps.Clone(s.counters) }
```

### Type Safety Pitfalls

- Avoid `String()` recursion traps (`fmt.Sprintf("%s", receiver)` inside
  `String()`). Convert to underlying type first.
- Do not copy values containing sync primitives or pointer-receiver semantics.
  Pass pointers instead.

### Enum / Iota Values

Start iota-based enums at `iota + 1` so the zero value means "unset/unknown" and is distinguishable from a valid entry:

```go
// Zero means "uninitialized"
type Operation int

const (
    Add      Operation = iota + 1
    Subtract
    Multiply
)

// Exception: when zero is the meaningful default
type LogDestination int

const (
    LogToStdout LogDestination = iota // 0 = stdout is a sensible default
    LogToFile
)
```

### Time: Use `time.Time` and `time.Duration`

Represent instants with `time.Time` and durations with `time.Duration`: never raw `int` or `int64`. If a JSON/YAML schema forces a raw integer, include the unit in the field name (`IntervalMillis`, not `Interval`).

### Marshaling: Always Use Explicit Field Tags

Any struct serialized to JSON, YAML, TOML, etc. must carry explicit field tags. Without tags, renaming a Go field silently breaks the wire contract. Use `omitempty` (or `omitzero` on Go 1.24+) when absent fields should be omitted.

### Avoid Mutable Package-Level Globals

Mutable globals make code hard to test and reason about. Prefer **dependency injection**: pass dependencies as struct fields or constructor arguments. Read-only package-level vars (sentinel errors, compiled regexps, `sync.Once`-initialized values) are fine.

### Cryptographically Secure Randomness

Never use `math/rand` (or `math/rand/v2`) for keys, tokens, session IDs, or security-sensitive values. Use `crypto/rand` instead: on Go 1.22+, `rand.Text()` returns a base32-encoded random string.

> **Security**: See `standards-security` for broader guidance.

### Functional Options

Use functional options when a constructor or public API has **3+ independent optional parameters** or when the API is expected to grow new options over time. Prefer a plain config struct when options are few, all usually specified together, or the API is internal-only.

Prefer the package-owned option pattern (`Option` with unexported `apply`) for public APIs. Closure-based options are acceptable for package-internal APIs.

```go
type options struct {
    port    int
    timeout time.Duration
}

type Option interface {
    apply(*options)
}

type portOption int

func (p portOption) apply(o *options) { o.port = int(p) }

// WithPort sets the listening port.
func WithPort(p int) Option { return portOption(p) }

type timeoutOption struct{ d time.Duration }

func (t timeoutOption) apply(o *options) { o.timeout = t.d }
func WithTimeout(d time.Duration) Option { return timeoutOption{d} }

func NewServer(opts ...Option) *Server {
    o := options{port: 8080, timeout: 30 * time.Second}
    for _, opt := range opts {
        opt.apply(&o)
    }
    return &Server{port: o.port, timeout: o.timeout}
}
```

### Receiver Type Selection

Use a **pointer receiver** when the method mutates the receiver, the struct contains a `sync.Mutex` or similar, or the struct is large. Use a **value receiver** when the type is small and immutable (e.g., `time.Time`, `Point`), or field types are maps/funcs/chans (already references).

**Consistency rule**: if any method needs a pointer receiver, use pointer receivers for _all_ methods on that type.

**Pitfall**: values in maps are not addressable: store `map[K]*T` if the type needs pointer receivers.

> **When in doubt, use a pointer receiver.**

### Interface Satisfaction Check

Use a blank-identifier compile-time assertion to ensure a type implements an interface: catches drift without a runtime test:

```go
var _ io.Reader   = (*MyReader)(nil)
var _ io.Writer   = (*MyWriter)(nil)
var _ http.Handler = (*MyHandler)(nil)
```

### Type Assertions & Type Switches

Always use the two-value form (`v, ok := x.(T)`) to avoid panics. Use type switches for exhaustive branching. The single-value form panics on mismatch: avoid in production code. Type switch cases can match both concrete and interface types.

### io.Reader / io.Writer Composition

Prefer stdlib composable primitives over bespoke wrappers: `io.MultiReader`, `io.TeeReader`, `io.LimitReader`, `io.MultiWriter`.

### Composition via Embedding

Go favors **composition over inheritance**. Embedding promotes methods to the outer type.

- **Interface embedding**: combine interfaces (`type ReadWriter interface { Reader; Writer }`).
- **Struct embedding**: promote concrete methods (`type ReadWriter struct { *Reader; *Writer }`).
- Access embedded fields using the unqualified type name as the field name.
- Define the same method on the outer type to override/intercept.
- An outer field/method always hides the same name from embedded types.
- The receiver of a promoted method is the **inner** type, not the outer: no implicit `super`.

> **Caution: avoid embedding in exported structs**: embedding leaks the full API of the embedded type. Adding/removing methods on the embedded type becomes a breaking change. Prefer a **named private field + explicit forwarding methods** so you control the public surface. Embedding is fine for **unexported** structs and for interface composition.

### Go-specific pattern guidance

- Prefer functional options over builders for most Go APIs.
- Use strategy via small interfaces (often single-method) instead of inheritance
  hierarchies.
- Use channels for high-throughput event fan-out; use observer-style registries
  only when dynamic subscriber lifecycle is required.
- For broader pattern selection and trade-offs, also load `role-architect`.
