---
name: role-technical-writer
description: Use this skill to plan, structure, or review user-facing documentation, public API guides, and technical specifications for a defined audience. Pair it with format-specific standards when writing Markdown; use standards-documentation alone for routine README or comment conventions.
---

**Provides:** Documentation structure templates, audience-focused writing patterns, clarity principles, and documentation standards.

## Quick Reference

**Golden Rule**: If users ask the same question twice, document it

**Document WHY, not just WHAT**: Explain decisions and reasoning

**Audience First**: Write for your readers (developers, users, operators)

**Show, Don't Just Tell**: Examples > abstract explanations

**Keep Current**: Outdated docs are worse than no docs

**Reference**: `skill:standards-documentation`

---

## Documentation Principles

### Audience-Focused

**Identify your audience:**
- **End users**: Need user guides, tutorials, FAQs
- **Developers**: Need API docs, code examples, architecture overview
- **Contributors**: Need setup guide, contribution guidelines
- **Operators**: Need deployment docs, troubleshooting, monitoring

**Write for their level:**
- Assume appropriate background knowledge
- Define unfamiliar terms
- Use audience's vocabulary

### Clear and Concise

**Be direct:**
- Use active voice ("Run the command" not "The command should be run")
- Use simple words ("use" not "utilize")
- Keep sentences short
- One idea per paragraph

**Remove fluff:**
```markdown
❌ "It is important to note that you should probably make sure to..."
✅ "Ensure..."

❌ "In order to start the server, you need to..."
✅ "To start the server, run..."
```

### Show, Don't Just Tell

**Use examples:**
```markdown
❌ "The function accepts a configuration object with optional properties."

✅ "The function accepts a configuration object:
```javascript
fetchData({
  url: 'https://api.example.com',
  timeout: 5000,  // optional, defaults to 3000
  retries: 3      // optional, defaults to 0
});
```
"
```

**Use visuals:**
- Diagrams for architecture
- Screenshots for UI
- Code examples for APIs
- Tables for comparisons

### Up-to-Date

**Keep docs current:**
- Update docs in same PR as code changes
- Mark deprecated features
- Version documentation for different releases
- Remove outdated sections

**Review regularly:**
- Quarterly documentation review
- Check links aren't broken
- Verify examples still work
- Update for new features

---

## Documentation types

Read [the documentation type patterns](references/documentation-types.md) when creating a README, API reference, code comment policy, architecture document, or procedural user guide. Load only the relevant section for the requested artifact.

## Documentation Structure

### For Small Projects

```
README.md           # Overview, quick start, installation
API.md             # API reference
CONTRIBUTING.md    # How to contribute
```

### For Large Projects

```
docs/
  README.md              # Documentation home
  getting-started/
    installation.md
    quick-start.md
  guides/
    user-guide.md
    admin-guide.md
  api/
    rest-api.md
    graphql-api.md
  architecture/
    overview.md
    decisions/
      adr-001-database-choice.md
  contributing/
    development-setup.md
    code-style.md
    pull-request-process.md
```

---

## Writing Style Guide

### Voice and Tone

**Use active voice:**
```markdown
❌ Passive: "The server should be started by running..."
✅ Active: "Start the server by running..."
```

**Be direct:**
```markdown
❌ Wordy: "It is recommended that you should consider..."
✅ Direct: "We recommend..."
```

**Use second person (you):**
```markdown
❌ "Users should configure their settings"
✅ "Configure your settings"
```

### Formatting

**Use headings for structure:**
- H1 for document title
- H2 for major sections
- H3 for subsections
- Don't skip levels

**Use lists for multiple items:**
- Ordered lists for sequential steps
- Unordered lists for non-sequential items
- Keep items parallel in structure

**Use code blocks:**
```markdown
For inline code: Use `backticks`
For code blocks: Use triple backticks with language
```

**Use emphasis sparingly:**
- **Bold** for important terms or actions
- *Italic* for emphasis (use rarely)
- Don't use ALL CAPS (too aggressive)

### Language Choices

**Prefer simple words:**
- "use" not "utilize"
- "help" not "facilitate"
- "before" not "prior to"
- "show" not "demonstrate"

**Avoid jargon (or explain it):**
```markdown
❌ "Leverage the DAG to orchestrate the ETL pipeline"
✅ "Use the workflow graph to coordinate the data pipeline steps"
```

**Be specific:**
```markdown
❌ "The process might take a while"
✅ "The process takes approximately 5 minutes"

❌ "Some configurations may need to be changed"
✅ "Update the database URL in config.json"
```

---

## Common Documentation Issues

### Problem: Outdated Documentation

**Symptoms:**
- Code examples don't work
- Screenshots show old UI
- Referenced features no longer exist

**Solutions:**
- Update docs in same PR as code changes
- Add CI checks for broken links
- Review docs quarterly
- Add "Last updated" dates

### Problem: Missing Context

**Symptoms:**
- Users don't understand why to use feature
- Unclear when to use one approach vs another
- No explanation of trade-offs

**Solutions:**
- Document the "why" not just the "how"
- Provide use cases and examples
- Explain alternatives and trade-offs

### Problem: Too Much Detail

**Symptoms:**
- Documentation is overwhelming
- Users can't find what they need
- Maintenance burden is high

**Solutions:**
- Start with essentials, link to details
- Use progressive disclosure (simple → advanced)
- Remove unnecessary information
- Use table of contents

### Problem: Assumes Too Much Knowledge

**Symptoms:**
- Beginners can't follow along
- Steps are skipped
- Terms aren't defined

**Solutions:**
- Define your audience explicitly
- Explain or link to unfamiliar concepts
- Include all steps (don't skip "obvious" ones)
- Provide both beginner and advanced sections

---

## Documentation Checklist

### For Every Documentation Update

- [ ] **Clear purpose**: Reader knows what this document is for
- [ ] **Target audience defined**: Written for specific audience
- [ ] **Complete**: All necessary information included
- [ ] **Accurate**: Information is correct and current
- [ ] **Examples work**: Code examples have been tested
- [ ] **Well-structured**: Uses headings, lists, formatting
- [ ] **Links work**: All links point to existing pages
- [ ] **Grammar/spelling checked**: No obvious errors

### For New Features

- [ ] **README updated**: Quick start includes new feature (if relevant)
- [ ] **API docs updated**: New endpoints/functions documented
- [ ] **User guide updated**: How to use new feature
- [ ] **Architecture docs updated**: How feature fits in system
- [ ] **Migration guide**: If breaking changes
- [ ] **Changelog**: Feature listed in changelog

### For READMEs

- [ ] **One-sentence description**: Clear what project does
- [ ] **Installation instructions**: Work on fresh system
- [ ] **Quick start example**: Actually works
- [ ] **Link to full docs**: For detailed information
- [ ] **Contributing guidelines**: Link to CONTRIBUTING.md
- [ ] **License**: Clearly stated

---

## Tools and Formats

### Markdown

**Advantages:**
- Simple syntax
- Readable as plain text
- Widely supported (GitHub, GitLab, etc.)
- Version controllable

**Use for:**
- READMEs
- Documentation sites (with static site generators)
- Inline documentation in repos

### Static Site Generators

**Popular options:**
- **Docusaurus**: React-based, great for projects
- **MkDocs**: Python, simple and fast
- **VuePress**: Vue-based, powerful
- **Jekyll**: Ruby, GitHub Pages default

**Use for:**
- Large documentation projects
- Version-specific docs
- Search functionality
- Professional appearance

### API Documentation Tools

- **OpenAPI/Swagger**: REST API specs
- **GraphQL**: Built-in schema documentation
- **JSDoc/TSDoc**: Inline code documentation
- **Postman**: API testing and documentation

---

## Integration with Other Skills

**With role-code-review:** Review documentation quality
**With role-architect:** Document architectural decisions
**With role-qa-engineer:** Document testing procedures

---

## Quick Tips

- **Start with user's goal** - What are they trying to do?
- **Use examples liberally** - Show, don't just tell
- **Update docs with code** - Don't defer documentation
- **Test your examples** - Make sure they actually work
- **Get feedback** - Ask users if docs are helpful
- **Keep it simple** - Clear and concise beats comprehensive
- **Version your docs** - Match docs to software versions
- **Make it searchable** - Use clear headings and structure
