# Review checklist

Format: rule | detect | fix.

## Flakiness (P0/P1)
| Rule | Detect | Fix |
|---|---|---|
| Hard wait | `waitForTimeout(`, `setTimeout`, `sleep(` | Wait on condition: `await expect(loc).toBeVisible()`, `page.waitForResponse`, `expect.poll(...)` |
| `networkidle` as readiness | `waitForLoadState('networkidle')`, `goto(..., {waitUntil:'networkidle'})` | Assert on the specific element/response the test needs; networkidle is discouraged by Playwright and hangs on polling/websockets |
| Non-retrying assertion on async state | `expect(await loc.isVisible()).toBe(true)`, `expect(await loc.textContent()).toBe(..)`, `expect(await loc.count()).toBe(n)` | `await expect(loc).toBeVisible()`, `toHaveText`, `toHaveCount` (auto-retry) |
| Missing `await` | Unawaited `expect(loc)...`, `page.click()`, `.fill()` | Add `await`; enable `@typescript-eslint/no-floating-promises` |
| Point-in-time reads | `allTextContents()`, `innerText()` then compare | `await expect(loc).toHaveText([...])` |
| Force actions | `{ force: true }`, `dispatchEvent('click')` | Fix the actionability cause (overlay, disabled state); force hides real UX bugs |
| Race on navigation | `click()` then immediate assertion on new page without URL/element wait | `await expect(page).toHaveURL(..)` or assert target element |
| Time/locale dependence | `new Date()`, `Date.now()` in assertions, timezone-sensitive text | `page.clock` API, fixed fixtures, regex/format-insensitive checks |
| Animation/transition | Clicking moving elements, wait-for-animation sleeps | `animations: 'disabled'` in screenshot opts / reduced-motion in config |

## Selectors (P1)
- Positional: `nth(`, `.first()`/`.last()` on broad locators, `:nth-child`.
- Layout-coupled CSS: long descendant chains, generated classes (`.css-1x2y3`, `.MuiButton-root`).
- XPath absolute paths.
- Raw text on translated/dynamic copy → role + name, or test id.
- Fix order: `getByRole(name)` > `getByLabel` > `getByTestId` > `getByText` > scoped CSS. Scope with parent locators / `filter({ hasText })` instead of indices.

## Isolation & state (P0/P1)
- Module-level `let` mutated by tests; tests depending on prior test (`test.describe.serial` used to share login/data without need).
- Shared user/account/record across workers → collisions under `fullyParallel`. Fix: per-test data via fixture with unique suffix (`test.info().parallelIndex`, uuid), cleanup in fixture teardown.
- UI login in every test → `storageState` per worker/role via setup project or worker-scoped fixture.
- Tests that need seeded order or leave data behind (no teardown); `afterAll` cleanup that is skipped on failure.
- `test.only`/`test.skip` committed; `forbidOnly` missing in CI config.
- Assertions depend on global counts (`toHaveCount(10)` on a shared list) → filter to own data.

## Assertion strength (P2)
- No assertion at all, or only `toBeVisible` on the page container.
- Asserts action happened (toast shown) but not outcome (record persisted: verify via API or reload).
- `toBeTruthy()` / `not.toBeNull()` on objects where a value is checkable.
- `expect.soft` used everywhere and never reviewed; `try/catch` swallowing failures.
- `page.route` mocking the system under test so the test can only pass.
- Snapshot tests without masking dynamic regions (`mask`, `maxDiffPixels` justification).
- Negative assertions without a positive precondition (`not.toBeVisible()` passes on a blank page).

## Structure (P3)
- Selectors and flows duplicated across specs → page object or fixture. POM methods should expose actions/locators, not assertions that hide intent; keep assertions in tests (exception: tiny `expectLoaded()`).
- Fixtures via `test.extend` for auth, API clients, data factories; avoid `beforeEach` that does 10 steps.
- Test >~40 lines or >1 behaviour; titles that describe steps instead of behaviour.
- Magic strings/credentials inline; env-specific URLs not from `baseURL`.
- Custom `timeout` bumps per test without reason; `test.slow()` as a crutch.
- Missing `trace: 'on-first-retry'` / `retain-on-failure` in config.
