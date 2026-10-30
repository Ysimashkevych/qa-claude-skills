---
name: playwright-test-review
description: Review Playwright (@playwright/test, TypeScript/JavaScript) spec files for flakiness and maintainability. Use when the user asks to review, audit, or critique Playwright tests, a test PR/diff, or says tests are flaky or "bad". Checks hard waits, brittle selectors, shared state, missing auto-waiting assertions, weak assertions, isolation, and POM/fixture usage. Outputs a ranked findings list with file:line and a concrete fix. Do not use for writing new tests or for diagnosing one specific failing run (use flaky-test-triage).
---

# Playwright Test Review

Review for **what will fail intermittently or hide real bugs**, not style. Be blunt, rank by damage, and give a fix for every finding.

## Procedure

1. **Scope.** Review the files/diff the user names; if none, find `**/*.spec.ts` changed vs the main branch (`git diff --name-only origin/main...`) and fall back to all specs. Read `playwright.config.*` first (retries, `fullyParallel`, `workers`, `testIdAttribute`, `use.trace`, `expect.timeout`) — findings depend on it.
2. **Read every line** of each spec plus the page objects/fixtures it imports. Do not review from grep alone.
3. **Scan** against `references/checklist.md`. Each rule has a detection hint and a standard fix.
4. **Verify before reporting.** Confirm each finding in context (e.g. a `waitForTimeout` after an animation hook may still be wrong, but a `page.waitForTimeout` in a debug-only helper is lower severity). Never report a rule hit you have not seen in the code.
5. **Rank** and output using the format below. Do not edit files unless asked; if asked, apply fixes highest severity first and show a diff summary.

## Severity

- **P0 Flaky/Wrong**: will produce false failures or false passes (hard waits gating assertions, shared mutable state across parallel tests, `expect(await x.isVisible()).toBe(true)`, assertion-free tests, swallowed errors).
- **P1 Fragile**: breaks on routine UI/data change (CSS/XPath/nth chains, text selectors on i18n content, order-dependent tests, hard-coded data collisions).
- **P2 Weak**: passes while the feature is broken (existence-only assertions, no verification of outcome/side effect, mocked everything).
- **P3 Maintainability**: duplication, missing POM/fixture, giant tests, unclear names.

## Output format

```
## Playwright review: <scope>
Config notes: <retries/workers/parallel facts that matter>
Summary: <N> findings (P0 a, P1 b, P2 c, P3 d). Biggest risk: <one sentence>.

### 1. [P0] <short title> — path/to/file.spec.ts:42
Problem: <what, why it flakes/lies>
Evidence: `<offending code>`
Fix: 
```ts
<replacement code>
```
```

Order strictly by severity, then by blast radius (a helper used by 30 tests outranks a one-off). Group identical repeats: "same pattern at lines 12, 57, 88" with one fix. End with **What is good** (max 3 bullets, only if true) and **Suggested next step** (one action, e.g. add an ESLint rule `playwright/no-wait-for-timeout`).

## Rules of engagement

- Prefer `getByRole` > `getByLabel` > `getByTestId` > `getByText`; CSS/XPath only as last resort.
- Fixes must use web-first assertions (`await expect(locator).toBeVisible()`), never `waitForTimeout`; wait on a condition (response, URL, locator state, `expect.poll`/`toPass`).
- If a rule is project-dependent (e.g. `test.describe.configure({ mode: 'serial' })` is legitimate for a single multi-step flow), say so and downgrade rather than flag blindly.
- Do not suggest `retries` as a fix. Retries mask P0s; mention only if config uses them to hide failures.
- If you cannot tell whether data is shared (no view of the backend/seed), state it as an assumption in the finding.
