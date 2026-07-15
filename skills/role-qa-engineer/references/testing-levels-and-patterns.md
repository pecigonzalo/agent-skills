# Testing levels and patterns

## Testing Levels

### Unit Tests
**What:** Test individual functions/methods in isolation **Goal:** Verify logic correctness **Speed:** Fast (milliseconds) **Coverage:** High (most tests should be unit tests)

**When to write:**
- For business logic
- For utility functions
- For data transformations
- For validation logic

**When NOT to write:**
- For trivial getters/setters
- For framework code
- For simple passthroughs

**Example scope:**
```javascript
// Test this function in isolation
function calculateDiscount(price, discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Invalid discount');
  }
  return price * (1 - discountPercent / 100);
}

// Test cases:
// - Valid discount (10%)
// - Edge: 0% discount
// - Edge: 100% discount
// - Error: negative discount
// - Error: >100% discount
```

### Integration Tests
**What:** Test interaction between components **Goal:** Verify components work together **Speed:** Medium (seconds) **Coverage:** Medium (focus on critical paths)

**When to write:**
- For API endpoints
- For database operations
- For external service integration
- For multi-component flows

**Example scope:**
```javascript
// Test API endpoint with real database
test('POST /users creates user in database', async () => {
  const response = await request(app)
    .post('/users')
    .send({ name: 'Alice', email: 'alice@example.com' });
  
  expect(response.status).toBe(201);
  
  // Verify in database
  const user = await db.users.findByEmail('alice@example.com');
  expect(user.name).toBe('Alice');
});
```

### End-to-End (E2E) Tests
**What:** Test complete user flows through the system **Goal:** Verify system works as a whole **Speed:** Slow (minutes) **Coverage:** Low (only critical user journeys)

**When to write:**
- For critical user flows (login, checkout, etc.)
- For happy path scenarios
- For regression protection

**Example scope:**
```javascript
// Test complete user registration flow
test('User can register and login', async () => {
  // 1. Visit registration page
  await page.goto('/register');
  
  // 2. Fill form
  await page.fill('[name=email]', 'user@example.com');
  await page.fill('[name=password]', 'SecurePass123');
  await page.click('button[type=submit]');
  
  // 3. Verify redirected to dashboard
  await expect(page).toHaveURL('/dashboard');
  
  // 4. Logout
  await page.click('button#logout');
  
  // 5. Login again
  await page.goto('/login');
  await page.fill('[name=email]', 'user@example.com');
  await page.fill('[name=password]', 'SecurePass123');
  await page.click('button[type=submit]');
  
  // 6. Verify back on dashboard
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Test Patterns

### AAA Pattern (Arrange-Act-Assert)

**The Standard Pattern for Clear Tests:**

```javascript
test('calculateDiscount applies percentage correctly', () => {
  // ARRANGE: Set up test data and preconditions
  const price = 100;
  const discount = 10;
  
  // ACT: Execute the code under test
  const result = calculateDiscount(price, discount);
  
  // ASSERT: Verify the result
  expect(result).toBe(90);
});
```

**Benefits:**
- Clear test structure
- Easy to understand
- Consistent across codebase

### Given-When-Then (BDD Style)

**Alternative Pattern for Behavior-Driven Development:**

```javascript
test('User login', () => {
  // GIVEN: User exists in system
  const user = createUser({ email: 'test@example.com', password: 'pass123' });
  
  // WHEN: User attempts to login
  const result = login('test@example.com', 'pass123');
  
  // THEN: Login succeeds and returns token
  expect(result.success).toBe(true);
  expect(result.token).toBeDefined();
});
```

---
