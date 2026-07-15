# Common orchestration patterns

## Common Patterns

### Pattern 1: New Feature Implementation

```
1. Planning: Delegate to thinker (pattern-task-breakdown + role-architect)
2. User Approval: Present plan, get explicit approval
3. Session Setup: Create with full context
4. Execution:
   - Phase 1: Data model + database
   - Phase 2: Business logic + services
   - Phase 3: API endpoints
   - Phase 4: Tests
5. Verification: Comprehensive review
6. Cleanup: Summary
```

### Pattern 2: Large Refactoring

```
1. Planning: Delegate to thinker (pattern-task-breakdown + role-architect)
   - Include "add tests first" phase
   - Plan incremental changes
2. User Approval: Ensure plan is safe
3. Session Setup: Document current state
4. Execution:
   - Phase 1: Add tests for current behavior
   - Phase 2: Refactor section by section
   - Phase 3: Verify tests still pass
   - Phase 4: Clean up and optimize
5. Verification: Ensure no behavior changes
6. Cleanup: Document refactoring decisions
```

### Pattern 3: Security Hardening

```
1. Planning: Security audit first
   - Delegate to fast + role-security-auditor
   - Identify all vulnerabilities
   - Prioritize by severity
2. User Approval: Review findings and plan
3. Session Setup: Track each vulnerability
4. Execution:
   - Fix critical issues (deep + role-security-auditor)
   - Fix high-priority issues
   - Fix medium-priority issues
5. Verification: Security re-audit
6. Cleanup: Document security improvements
```

---
