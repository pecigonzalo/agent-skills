---
name: role-security-auditor
description: Use this skill to conduct a security audit, threat-focused review, or OWASP Top 10 assessment and report vulnerabilities by severity. Use standards-security for secure implementation guidance during routine work with authentication, untrusted input, or sensitive data.
license: MIT
metadata:
  role: security-expert
  focus: security
---

**Provides:** OWASP Top 10 vulnerability scanning, severity assessment, remediation guidance, and security compliance evaluation.

## Quick Reference

**OWASP Top 10**: Injection, Broken Auth, Sensitive Data Exposure, XXE, Broken Access Control, Security Misconfiguration, XSS, Insecure Deserialization, Known Vulnerabilities, Insufficient Logging

**Critical Checks**: Input validation, auth/authz, secrets management, data encryption, dependency scanning

**Severity Levels**: Critical (🔴 must fix), High (🟠 should fix), Medium (🟡 consider), Low (🔵 nice to have)

**Reference**: `skill:standards-security` for comprehensive guidelines

---

## OWASP Top 10 Vulnerabilities

Read [the OWASP Top 10 review guide](references/owasp-top-10.md) when the audit scope requires category-specific examples and remediations.

## Security Review Process

### Step 1: Identify Sensitive Operations

Look for code that handles:
- [ ] User authentication and authorization
- [ ] Password handling and storage
- [ ] Session management
- [ ] Sensitive data (PII, financial, health)
- [ ] File uploads and downloads
- [ ] Database queries
- [ ] External API calls
- [ ] Cryptographic operations

### Step 2: Input Validation Review

Check all user inputs:
- [ ] All inputs validated (type, length, format)
- [ ] Whitelist validation (not blacklist)
- [ ] Validation on server side (not just client)
- [ ] Proper encoding for context (HTML, SQL, JavaScript)
- [ ] File upload restrictions (type, size)

### Step 3: Authentication & Authorization Review

Verify security controls:
- [ ] Strong password requirements
- [ ] Passwords properly hashed (bcrypt, Argon2)
- [ ] Rate limiting on auth endpoints
- [ ] Session management secure (HTTP-only cookies)
- [ ] Authorization checked on every endpoint
- [ ] Resource ownership verified
- [ ] Proper role-based access control

### Step 4: Data Protection Review

Check data handling:
- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS for data in transit
- [ ] No sensitive data in logs
- [ ] Secrets in environment variables
- [ ] Data retention policies followed
- [ ] PII handling compliant with regulations

### Step 5: Dependency & Configuration Review

Verify environment security:
- [ ] Dependencies up to date
- [ ] No known vulnerabilities (run npm audit / equivalent)
- [ ] Security headers configured
- [ ] Error messages don't leak info
- [ ] Debug mode disabled in production
- [ ] CORS properly configured

### Step 6: Document Findings

Report using severity levels:
- 🔴 **Critical**: Immediate risk, must fix before deployment
- 🟠 **High**: Significant risk, fix ASAP
- 🟡 **Medium**: Moderate risk, should fix soon
- 🔵 **Low**: Minor risk, nice to have

---

## Common Vulnerability Patterns by Language

### JavaScript/Node.js

**Injection:**
```javascript
// ❌ Vulnerable
eval(userInput);
child_process.exec(`ls ${userInput}`);

// ✅ Secure
// Don't use eval at all
child_process.execFile('ls', [userInput]); // Parameterized
```

**XSS:**
```javascript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Secure
element.textContent = userInput; // Auto-escaped
```

**Secrets:**
```javascript
// ❌ Vulnerable
const API_KEY = "sk_live_abc123";

// ✅ Secure
const API_KEY = process.env.API_KEY;
```

### Python

**Injection:**
```python
# ❌ Vulnerable
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# ✅ Secure
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
```

**Deserialization:**
```python
# ❌ Vulnerable
import pickle
obj = pickle.loads(untrusted_data)

# ✅ Secure
import json
obj = json.loads(untrusted_data) # Safer, but still validate
```

### Java

**Injection:**
```java
// ❌ Vulnerable
String query = "SELECT * FROM users WHERE email = '" + email + "'";

// ✅ Secure
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
stmt.setString(1, email);
```

---

## Severity Assessment

### Critical (🔴) - Fix Immediately

**Characteristics:**
- Allows unauthorized access to sensitive data
- Enables code execution
- Bypasses authentication
- Leaks credentials or secrets

**Examples:**
- Passwords stored in plain text
- SQL injection allowing data access
- Hardcoded API keys in source code
- Missing authentication on admin endpoints

**Action:** Block deployment, fix immediately

### High (🟠) - Fix ASAP

**Characteristics:**
- Significant security weakness
- Could lead to data breach with additional effort
- Affects multiple users
- Violates security policies

**Examples:**
- Missing input validation on critical endpoints
- Weak password policy (no requirements)
- No rate limiting on authentication
- Sensitive data in logs

**Action:** Fix within 1-2 days

### Medium (🟡) - Fix Soon

**Characteristics:**
- Moderate security weakness
- Requires specific conditions to exploit
- Limited impact or scope
- Defense in depth concern

**Examples:**
- Missing security headers
- Outdated dependencies (no known exploit)
- Overly permissive CORS
- Session timeout too long

**Action:** Fix within 1-2 weeks

### Low (🔵) - Nice to Have

**Characteristics:**
- Minor security concern
- Difficult to exploit
- Minimal impact
- Best practice improvement

**Examples:**
- Using older but secure crypto algorithms
- Verbose error messages (internal only)
- Missing CSRF protection on read-only endpoints
- Suboptimal logging

**Action:** Fix when convenient

---

## Security Review Report Format

```markdown
## Security Review: {Component/Feature Name}

**Reviewed:** {Date}
**Reviewer:** {Name}
**Scope:** {What was reviewed}
**Assessment:** Approved / Needs Fixes / Critical Issues

---

### Critical Issues (🔴) - Fix Immediately

1. **{File}:{Line} - {Issue}**
   - **Vulnerability:** {Type of vulnerability}
   - **Impact:** {What could happen}
   - **Fix:** {Specific remediation}
   - **Reference:** {OWASP, CWE, or standard reference}

---

### High Issues (🟠) - Fix ASAP

1. **{File}:{Line} - {Issue}**
   - **Vulnerability:** {Type}
   - **Impact:** {What could happen}
   - **Fix:** {Specific remediation}

---

### Medium Issues (🟡) - Fix Soon

1. **{File}:{Line} - {Issue}**
   - **Vulnerability:** {Type}
   - **Fix:** {Specific remediation}

---

### Low Issues (🔵) - Nice to Have

1. **{File}:{Line} - {Issue}**
   - **Improvement:** {What could be better}

---

### Positive Observations

- ✅ {Good security practice observed}
- ✅ {Another good practice}

---

### Recommendations

1. {Next steps}
2. {Additional improvements}
3. {Follow-up items}

**Overall Risk Level:** {Critical / High / Medium / Low}
```

---

## Security Checklist

### Authentication
- [ ] Passwords hashed with bcrypt/Argon2 (12+ rounds)
- [ ] Password requirements enforced (length, complexity)
- [ ] Rate limiting on login attempts (5 per 15 min)
- [ ] Account lockout after failed attempts
- [ ] Secure password reset flow (time-limited tokens)
- [ ] MFA available for sensitive accounts

### Authorization
- [ ] Authorization checked on every endpoint
- [ ] Users can only access their own resources
- [ ] Admin endpoints properly restricted
- [ ] Role-based access control implemented
- [ ] Principle of least privilege applied

### Input Validation
- [ ] All user inputs validated (type, length, format)
- [ ] Server-side validation (not just client-side)
- [ ] Whitelist validation where possible
- [ ] File uploads restricted (type, size)
- [ ] Input sanitized for context (HTML, SQL, JavaScript)

### Data Protection
- [ ] Sensitive data encrypted at rest (AES-256)
- [ ] All traffic uses HTTPS/TLS
- [ ] No sensitive data in logs or error messages
- [ ] Secrets stored in environment variables
- [ ] Data retention policies implemented
- [ ] PII handling compliant with regulations

### Session Management
- [ ] Session tokens are random and unpredictable
- [ ] HTTP-only and Secure flags on cookies
- [ ] SameSite cookie attribute set
- [ ] Session timeout after inactivity
- [ ] Logout properly invalidates sessions
- [ ] No session data in URLs

### Error Handling
- [ ] Generic error messages to users
- [ ] Detailed errors logged server-side only
- [ ] No stack traces in production
- [ ] No sensitive data in error messages

### Dependencies
- [ ] All dependencies up to date
- [ ] No critical/high CVEs in dependencies
- [ ] Dependency scanning automated
- [ ] Only necessary dependencies included

### Configuration
- [ ] All default credentials changed
- [ ] Debug mode disabled in production
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CORS properly restricted
- [ ] Unnecessary features disabled

### Logging & Monitoring
- [ ] Authentication events logged
- [ ] Authorization failures logged
- [ ] Input validation failures logged
- [ ] Logs protected from tampering
- [ ] Alerting configured for anomalies

---

## References

**Comprehensive security guidelines:** `skill:standards-security`

**OWASP Resources:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/

**Security Standards:**
- CWE (Common Weakness Enumeration)
- CVE (Common Vulnerabilities and Exposures)
- NIST Cybersecurity Framework

---

## Integration with Other Skills

### With role-code-review
- role-code-review handles general quality and maintainability
- role-security-auditor handles deep security analysis
- Use both together for comprehensive review

### With role-qa-engineer
- role-qa-engineer designs test strategies
- role-security-auditor identifies security test cases
- Collaborate on security testing approach

---

## Quick Tips

**Always validate inputs** - Never trust user data  
**Hash, don't encrypt passwords** - Use bcrypt or Argon2  
**Use parameterized queries** - Prevent SQL injection  
**Keep dependencies updated** - Patch known vulnerabilities  
**Encrypt sensitive data** - At rest and in transit  
**Log security events** - But never log sensitive data  
**Implement rate limiting** - Prevent abuse and brute force  
**Use security headers** - Defense in depth  
**Principle of least privilege** - Minimal permissions needed  
**Fail securely** - Deny by default  
