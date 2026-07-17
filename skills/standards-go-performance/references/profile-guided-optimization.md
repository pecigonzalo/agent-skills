# Profile-guided optimization

## Pattern 7: Profile-Guided Optimization (PGO)

Feed a real production CPU profile back into the compiler to enable inlining and de-virtualization decisions that static analysis cannot make.

**When:** Service has been running in production long enough to have a representative CPU profile, and further micro-optimizations have been exhausted.

**How:**

1. Collect representative CPU profiles from real traffic.
2. Build with PGO (`default.pgo` or explicit `-pgo` flag).
3. Confirm impact with `benchstat`.

**Pitfalls:**
- A profile from an atypical workload (e.g., load test, not real traffic) may optimize the wrong paths.
- PGO improves only what the compiler can do differently: it does not replace algorithmic improvements.
- The `default.pgo` file should be committed to source control and refreshed periodically as workload patterns change.

**Verify:** `go build -pgo=auto` succeeds; `benchstat` shows statistically significant improvement (typical: 5–15%); binary size may increase slightly due to more aggressive inlining.

---
