# Documentation type patterns

Use the relevant pattern when the requested artifact needs more detail than the core technical-writing workflow.

## Documentation types

### README

**Essential sections:**
```markdown
# Project Name

Brief one-sentence description

## Features
- Key feature 1
- Key feature 2

## Installation
```bash
npm install project-name
```

## Quick Start
```javascript
const project = require('project-name'); project.doSomething();
```

## Documentation
Full documentation: [link]

## Contributing
See CONTRIBUTING.md

## License
MIT
```

**README Best Practices:**
- Clear project description (1-2 sentences)
- Quick start that actually works
- Installation instructions (all platforms if relevant)
- Link to detailed docs (don't cram everything in README)
- Badges (build status, coverage, version)

### API Documentation

**For each endpoint/function, document:**
1. **Purpose**: What it does (one sentence)
2. **Parameters**: What inputs it accepts
3. **Returns**: What it returns
4. **Example**: Working code example
5. **Errors**: What can go wrong

**Example:**
```markdown
### `createUser(userData)`

Creates a new user in the system.

**Parameters:**
- `userData` (Object):
  - `email` (string, required): User's email address
  - `name` (string, required): User's full name
  - `role` (string, optional): User role, defaults to 'user'

**Returns:**
- (Promise<User>): Created user object with ID

**Throws:**
- `ValidationError`: If email is invalid or already exists
- `DatabaseError`: If database operation fails

**Example:**
```javascript
const user = await createUser({
  email: 'alice@example.com',
  name: 'Alice Smith',
  role: 'admin'
}); console.log(user.id); // '123e4567-e89b-12d3-a456-426614174000'
```
```

### Code Comments

**When to comment:** ✅ **DO comment:**
- Why a decision was made
- Complex algorithms (link to source/paper)
- Workarounds for bugs
- Non-obvious side effects
- Deprecation warnings

❌ **DON'T comment:**
- Obvious code (e.g., `i++; // increment i`)
- What code does (should be self-explanatory)
- Redundant information

**Good comment examples:**
```javascript
// Using setTimeout instead of setInterval to avoid queueing
// if the function takes longer than the interval
setTimeout(function tick() {
  doWork();
  setTimeout(tick, 1000);
}, 1000);

// WORKAROUND: Library X has a bug with Y, remove when fixed
// See: https://github.com/library/issue/123
const temp = workaroundFunction();

// Binary search: O(log n) - critical for performance with large datasets
const index = binarySearch(sortedArray, target);
```

### Architecture Documentation

**What to include:**
```markdown
# Architecture Overview

## System Context
[Diagram showing system in environment]
- External systems we integrate with
- Users of the system

## Component Structure
[Diagram showing main components]
- API Layer: Handles HTTP requests
- Service Layer: Business logic
- Data Layer: Database access

## Key Decisions

### Why we chose PostgreSQL over MongoDB
- Need for complex queries and joins
- ACID compliance required
- Team expertise with SQL

### Why microservices architecture
- Independent scaling of services
- Different teams can work independently
- Trade-off: Added operational complexity

## Data Flow
[Sequence diagram for main flow]
```

### User Guides

**Structure:**
1. **Goal**: What the user wants to achieve
2. **Prerequisites**: What they need first
3. **Steps**: Clear, numbered steps
4. **Verification**: How to check it worked
5. **Troubleshooting**: Common issues

**Example:**
```markdown
## How to Deploy to Production

**Goal**: Deploy the application to production environment

**Prerequisites**:
- Application passes all tests
- You have production credentials
- Changes are reviewed and approved

**Steps**:
1. Ensure you're on main branch:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Tag the release:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. Deploy:
   ```bash
   ./scripts/deploy.sh production
   ```

4. Verify deployment:
   - Visit https://app.example.com/health
   - Check logs: `kubectl logs -f deployment/app`

**Verification**:
- Health check returns 200 OK
- Version in logs matches tag (v1.2.3)
- No error spikes in monitoring

**Troubleshooting**:
- "Permission denied": Check if you have production access
- "Deploy failed": Check build logs with `./scripts/deploy.sh --logs`
```

---
