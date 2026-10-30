## Playwright review: examples/playwright-test-review/input.spec.ts
Config notes: (no config provided; assumed default `fullyParallel` off, so test 2's dependency on test 1 only "works" when run in order in one worker.)
Summary: 8 findings (P0 4, P1 2, P2 1, P3 1). Biggest risk: test 2 asserts nothing (always passes) and depends on test 1's module state.

### 1. [P0] Assertion that can never fail — input.spec.ts:21
Problem: `expect(locator).toBeTruthy()` checks that the Locator object exists, which is always true. The test passes even if the order is missing.
Evidence: `await expect(page.locator(\`text=${orderId}\`)).toBeTruthy();`
Fix:
```ts
await expect(page.getByRole('row', { name: new RegExp(orderId) })).toBeVisible();
```

### 2. [P0] Test 2 depends on test 1 through module state — input.spec.ts:3, 16, 21
Problem: `orderId` is set in test 1; test 2 breaks when run alone, sharded, or with `fullyParallel`. If test 1 fails, test 2 asserts on `undefined`.
Fix: create the order via API in a fixture and return its id; each test owns its data.
```ts
const test = base.extend<{ order: { id: string } }>({
  order: async ({ request }, use) => {
    const res = await request.post('/api/orders', { data: { sku: 'SKU-1' } });
    const order = await res.json();
    await use(order);
    await request.delete(`/api/orders/${order.id}`);
  },
});
```

### 3. [P0] Hard wait gates the flow — input.spec.ts:11
Problem: fixed 3 s is too long on a fast run and too short on a loaded runner.
Fix: remove; wait on the outcome: `await expect(page).toHaveURL(/\/dashboard/);`

### 4. [P0] Non-retrying assertion — input.spec.ts:16
Problem: `isVisible()` is an instant read; the toast may not have rendered yet, and it is flaky by design.
Fix: `await expect(page.getByRole('status')).toContainText('Order created');`

### 5. [P1] Positional / generated-class selectors — input.spec.ts:10, 15
Problem: `div:nth-child(3) > button` and `.css-1x2y3` break on any markup or build change.
Fix: `page.getByRole('button', { name: 'Sign in' })`, `page.getByRole('button', { name: 'Create order' })`.

### 6. [P1] Login through UI in every test — input.spec.ts:7-10
Problem: slow and repeats a failure point in every test; credentials are inline.
Fix: authenticate once in a setup project, reuse `storageState`; credentials from env.

### 7. [P2] Outcome not verified — input.spec.ts:16-17
Problem: only a toast is checked; persistence is not. Fix: after creating, assert the order via `request.get(\`/api/orders/${id}\`)` returns the SKU.

### 8. [P3] Selectors inline, no page object — whole file
Fix: extract `OrdersPage` with `createOrder(sku)`; keep assertions in tests.

**Suggested next step:** enable `eslint-plugin-playwright` (`no-wait-for-timeout`, `no-nth-methods`, `missing-playwright-await`, `valid-expect`) in CI.
