# Test Plan: Split payment
Version/date: example | Author: QA | Source: feature description (`input.md`)

## 1. Scope
In: split allocation, authorise/void flow, refunds, feature flag, gift card integration.
Out (with residual risk): mobile apps (feature is web only; residual risk: none until mobile ships); PSP internals (residual risk: PSP behaviour trusted via its sandbox contract).

## 2. Summary
Highest risk is partial-failure handling (authorise 2 of 3, then one fails) and money arithmetic. Most effort goes to unit and API layers; UI covers one happy and one failure journey. Two requirement gaps (capture order, minimum per part) block final expected values.

## 3. Risk register
| ID | Risk (If cause, then failure, affecting X) | I | L | Score | Band | Rationale |
|---|---|---|---|---|---|---|
| R1 | If a later payment fails, then earlier authorisations are not voided, affecting customers whose funds stay held | 5 | 4 | 20 | Critical | multi-step distributed flow, new code |
| R4 | If the gift card service times out or receives a duplicate call, then the balance is double-debited, affecting gift card holders | 4 | 4 | 16 | Critical | new integration |
| R2 | If amounts do not sum exactly (rounding), then the order is over- or under-charged, affecting customers and finance | 5 | 3 | 15 | Critical | currency arithmetic |
| R3 | If refunds are allocated incorrectly, then money returns to the wrong method or amount, affecting customers and support | 5 | 3 | 15 | Critical | proportional logic, rounding |
| R8 | Requirement ambiguity: if capture order and minimum per part stay unspecified, then implementation and tests diverge, affecting the whole feature | 3 | 4 | 12 | High | not specified |
| R5 | If two submits race, then the order is paid twice, affecting customers | 5 | 2 | 10 | High | idempotency unknown |
| R7 | If user B can reference user A's gift card, then A's balance is spent, affecting gift card holders | 5 | 2 | 10 | High | authZ on a new service |
| R6 | If the flag is enforced only in the UI, then the split API is reachable while the feature is off, affecting all customers | 3 | 2 | 6 | Medium | server-side enforcement unconfirmed |

### Heat map
| Impact \ Likelihood | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 5 | | R5, R7 | R2, R3 | R1 | |
| 4 | | | | R4 | |
| 3 | | R6 | | R8 | |
| 2 | | | | | |
| 1 | | | | | |

## 4. Scenarios
| # | Scenario (pre / action / expected) | Risk | Priority | Layer | Automate |
|---|---|---|---|---|---|
| 1 | 3 parts / 3rd declines / parts 1-2 voided, order unpaid | R1 | Critical | API | Y |
| 2 | 2 parts / 2nd declines in the browser / error shown, no held funds | R1 | Critical | UI | Y |
| 3 | total 100.01 / split 33.33+33.33+33.35 accepted, 33.33x3 rejected | R2 | Critical | Unit + API | Y |
| 4 | split order / refund / proportional amounts, remainder rule applied | R3 | Critical | Unit + API | Y |
| 5 | gift card call / retried with same idempotency key / debited once | R4 | Critical | API (stubbed service) | Y |
| 6 | gift card service slow / timeout then late success / reconciled, single debit | R4 | Critical | Integration (service sandbox) | Y |
| 7 | double-click submit / single order, single charge | R5 | High | API | Y |
| 8 | double-click submit in browser / button disabled, one request sent | R5 | High | UI | Y |
| 9 | user B / uses A's gift card id / 403 or 404, A's balance unchanged | R7 | High | API | Y |
| 10 | flag off / split payload posted / rejected server-side | R6 | Medium | API | Y |
| 11 | 2 methods / happy path end to end on web | R1-R3 | High | UI | Y |
| 12 | capture order and minimum per part / explore once answered | R8 | High | Exploratory | N |

Two-layer coverage for Critical/High: R1 (API + UI), R2/R3 (unit + API), R4 (API + integration), R5 (API + UI). R7 is API-only: authorisation is enforced server-side and the UI adds no extra path. R8 is resolved by answering the open questions, not by tests.

## 5. Layer split
| Layer | Responsibility | Scenarios | Notes |
|---|---|---|---|
| Unit | allocation and refund arithmetic | 3, 4 | cheapest place for rounding cases |
| API | orchestration, partial failure, authZ, idempotency, flag | 1, 3, 4, 5, 7, 9, 10 | bulk of automation |
| UI/E2E | one happy and two failure journeys | 2, 8, 11 | keep small |
| Exploratory/Non-functional | error messaging, payment form accessibility, open requirement areas | 6, 12 | 6 runs against the service sandbox |

## 6. Environments & test data
- Staging with PSP sandbox (forced declines) and gift card service stub plus sandbox.
- Feature flag toggled per test via an admin API.
- Test users created per test; gift cards issued per test with known balances.

## 7. Entry / exit criteria
Entry: feature deployed to staging behind the flag; PSP sandbox and gift card stub available; open questions 1 and 4 answered.
Exit: all Critical/High scenarios executed and passing; no open Sev1/Sev2; Medium risks passing or accepted by the product owner; open questions answered or the risk accepted in writing.

## 8. Assumptions
1. PSP sandbox supports authorise/void and forced declines.
2. Gift card service has a stub and a sandbox environment.

## 9. Open questions
| # | Question | Owner | Impact on plan |
|---|---|---|---|
| 1 | Capture timing: authorise all then capture, or sequential capture? | Backend lead | Changes R1 scenarios |
| 2 | Cent-remainder rule for refunds? | Product | Expected values in #4 |
| 3 | Does the gift card service support idempotency keys? | Integration owner | R4/R5 design |
| 4 | Minimum amount per part? | Product | Boundary tests in #3 |
