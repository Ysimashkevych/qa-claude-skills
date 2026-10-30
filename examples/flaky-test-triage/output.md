# Flaky triage: checkout > applies promo code (checkout.spec.ts:48)

**Category:** environment (confidence Med)

**Verdict:** Fix now (test-side), plus open a product ticket for the slow promo endpoint
**Classification:** Infra / resource (Med confidence); alternates: Shared state / order dependence (Low), App race / product bug (Low-Med)

## Facts (observed)
- Failure: total stays `$100.00` for 5 s after Apply.
- Pattern: ~1 in 6 CI runs, never locally.
- Evidence: promo POST returned 200 at +6.4s, past the 5 s assertion timeout; CI used 4 workers on 2 vCPU; fixed account with single-use promo.

## Hypotheses
1. **Slow response under CPU contention** (Med): the 6.4 s latency exceeds `expect.timeout`; consistent with 4 workers on 2 vCPU. Falsified if the same latency appears with `--workers=1` on CI.
2. **Promo already consumed by a concurrent/previous run** (Med): single-use code on a shared account would normally yield an error response; here status is 200, so less likely, but the response body was not captured. Falsified if the 200 body contains the discount.
3. Product: promo endpoint slow (Low-Med): 0.3 s -> 6.4 s may be a backend issue, not only CI load.

## Repro plan
1. `npx playwright test checkout.spec.ts -g "applies promo" --repeat-each=40 --workers=4 --retries=0` on a 2-CPU container: isolates CPU contention.
2. Control: same with `--workers=1`: expect 0 failures if hypothesis 1 holds.
3. Re-run step 1 with a unique account per test (fixture): isolates data collision.
4. Log response body of the promo call (`trace: 'on'`).

## Fix sketch
```ts
// per-test account + promo; wait on the real signal
const [res] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/api/cart/promo')),
  page.getByRole('button', { name: 'Apply' }).click(),
]);
expect(res.ok()).toBeTruthy();
await expect(page.getByTestId('order-total')).toHaveText('$90.00');
```
Create the user and a fresh single-use promo through the API in a fixture. Do not raise the timeout without evidence of the baseline latency.

## Decision checklist
| Question | Answer | Note |
|---|---|---|
| Reproducible? | Unknown | Try step 1 |
| Product defect? | Possible | 6.4 s endpoint latency |
| Cause understood, fix < 1 day? | Yes (fixture) | |
| Guards critical path? | Yes | pricing |
| Blocking others? | Yes (~1/6) | Fix is verified and merges today, so no quarantine; if it slips, move to the `@quarantine` job with owner + expiry |
| Duplicate of known flake? | Unknown | |

## Actions
- [ ] Test owner: unique account/promo fixture
- [ ] Backend owner: investigate promo endpoint latency
