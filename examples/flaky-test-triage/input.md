Test `checkout › applies promo code` fails in CI roughly 1 in 6 runs, always passes locally.

```
Error: expect(locator).toHaveText(expected)
Locator: getByTestId('order-total')
Expected: "$90.00"
Received: "$100.00"
Timeout: 5000ms
  at checkout.spec.ts:48
```
Trace: after click "Apply", POST /api/cart/promo returns 200 at +6.4s (typical +0.3s). The CI run had 4 workers on a 2-vCPU runner. Test uses shared promo code SAVE10 with a single-use-per-account limit and a fixed account `qa-checkout@example.com`.
