# OWASP Top 10 review guide

## OWASP Top 10 Vulnerabilities

### 1. Injection (SQL, NoSQL, Command, LDAP)

**What it is:** Untrusted data sent to interpreter as part of command or query

**How to detect:**
- Look for string concatenation in queries
- Check for unsanitized user input in database calls
- Search for `exec`, `eval`, or similar dynamic execution

**How to prevent:**
- Use parameterized queries / prepared statements
- Use ORM query builders (not raw SQL)
- Validate and sanitize all inputs
- Apply principle of least privilege

**Example (vulnerable):**
```javascript
// ❌ Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

**Example (secure):**
```javascript
// ✅ Secure with parameterized query
const query = 'SELECT * FROM users WHERE email = ?';
db.execute(query, [userInput]);
```

### 2. Broken Authentication

**What it is:** Improperly implemented authentication allowing attackers to compromise passwords, keys, or session tokens

**How to detect:**
- Passwords stored in plain text or weak encryption
- Weak password requirements
- No rate limiting on login attempts
- Session tokens in URLs
- No session timeout
- Predictable session IDs

**How to prevent:**
- Hash passwords with bcrypt/Argon2 (never plain text)
- Implement strong password policies
- Add rate limiting on authentication endpoints
- Use secure session management (HTTP-only, secure cookies)
- Implement session timeout and invalidation
- Use multi-factor authentication (MFA)

**Checklist:**
- [ ] Passwords hashed with strong algorithm (bcrypt, Argon2)
- [ ] Rate limiting on login (e.g., 5 attempts per 15 min)
- [ ] Session tokens are random, unpredictable
- [ ] Sessions expire after inactivity
- [ ] HTTP-only, secure, SameSite cookies
- [ ] Logout invalidates sessions

### 3. Sensitive Data Exposure

**What it is:** Inadequate protection of sensitive data (PII, credentials, financial data)

**How to detect:**
- Sensitive data in logs
- Data transmitted over HTTP (not HTTPS)
- Weak encryption algorithms
- Unencrypted data at rest
- Sensitive data in source control (.env files)

**How to prevent:**
- Encrypt sensitive data at rest (AES-256)
- Use TLS/HTTPS for data in transit
- Never log sensitive data (passwords, tokens, SSNs, credit cards)
- Use environment variables for secrets
- Implement data classification policies

**Checklist:**
- [ ] All data in transit uses HTTPS/TLS
- [ ] Sensitive data encrypted at rest
- [ ] No sensitive data in logs
- [ ] Secrets in environment variables (not code)
- [ ] Data retention policies enforced

### 4. XML External Entities (XXE)

**What it is:** Vulnerable XML processors that parse untrusted XML with external entity references

**How to detect:**
- XML parsing without disabling external entities
- Processing untrusted XML input
- XML parsers with default configurations

**How to prevent:**
- Disable XML external entity processing
- Use JSON instead of XML when possible
- Validate and sanitize XML input
- Update XML processors to latest versions

### 5. Broken Access Control

**What it is:** Improperly enforced restrictions on authenticated users

**How to detect:**
- Missing authorization checks
- Direct object reference without ownership check
- Privilege escalation possibilities
- CORS misconfiguration

**How to prevent:**
- Deny by default (whitelist, not blacklist)
- Check authorization for every request
- Verify resource ownership before access
- Implement proper RBAC (Role-Based Access Control)

**Checklist:**
- [ ] Authorization checked on every endpoint
- [ ] Users can only access their own resources
- [ ] Admin functions properly restricted
- [ ] No direct object references without checks
- [ ] CORS properly configured

### 6. Security Misconfiguration

**What it is:** Insecure default configurations, incomplete setups, exposed error messages

**How to detect:**
- Default credentials in use
- Unnecessary features enabled
- Detailed error messages to users
- Missing security headers
- Outdated software versions

**How to prevent:**
- Change all default credentials
- Disable unnecessary features
- Generic error messages to users (detailed logs server-side)
- Add security headers (CSP, X-Frame-Options, etc.)
- Keep all software updated

**Security Headers Checklist:**
- [ ] Content-Security-Policy (CSP)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security (HSTS)
- [ ] X-XSS-Protection: 1; mode=block

### 7. Cross-Site Scripting (XSS)

**What it is:** Injecting malicious scripts into trusted websites

**How to detect:**
- User input displayed without encoding
- innerHTML used with user data
- Unescaped output in templates
- Missing Content-Security-Policy

**How to prevent:**
- Encode all output (HTML, JavaScript, URL)
- Use textContent instead of innerHTML
- Implement Content-Security-Policy
- Sanitize rich text input (use libraries)
- Use framework protections (React auto-escapes)

**Checklist:**
- [ ] All user input encoded before display
- [ ] CSP headers configured
- [ ] No innerHTML with user data
- [ ] Rich text properly sanitized

### 8. Insecure Deserialization

**What it is:** Untrusted data used to create objects, leading to code execution

**How to detect:**
- Deserializing untrusted data
- Using pickle, eval, unserialize on user input
- Accepting serialized objects from clients

**How to prevent:**
- Don't deserialize untrusted data
- Use JSON for data exchange (not pickle/serialize)
- Implement integrity checks (HMAC)
- Isolate deserialization in low-privilege environments

### 9. Using Components with Known Vulnerabilities

**What it is:** Using libraries/frameworks with known security flaws

**How to detect:**
- Outdated dependencies
- Dependencies with CVEs
- No dependency scanning

**How to prevent:**
- Regularly update dependencies
- Use dependency scanning tools (npm audit, Snyk, Dependabot)
- Monitor security advisories
- Remove unused dependencies

**Checklist:**
- [ ] Dependencies scanned regularly
- [ ] No critical/high CVEs in dependencies
- [ ] Automated dependency updates
- [ ] Only necessary dependencies included

### 10. Insufficient Logging & Monitoring

**What it is:** Inadequate logging and monitoring allowing breaches to go undetected

**How to detect:**
- No logging of authentication events
- Missing audit trails
- No alerting on suspicious activity
- Logs not reviewed

**How to prevent:**
- Log all authentication events (success and failure)
- Log authorization failures
- Log input validation failures
- Implement alerting for suspicious patterns
- Protect log integrity

**Checklist:**
- [ ] Login attempts logged (success/failure)
- [ ] Authorization failures logged
- [ ] High-value transactions logged
- [ ] Logs include sufficient context
- [ ] Alerting configured for anomalies

---
