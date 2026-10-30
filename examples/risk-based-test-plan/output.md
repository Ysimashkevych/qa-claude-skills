# Test Plan: Split payment
Source: feature description (example input)

## 1. Scope
In: split allocation, authorisation/void flow, refunds, feature flag, gift card integration. Out: mobile apps (not in scope per description; residual risk: none until mobile ships), PSP internals.

## 2. Summary
Highest risk is partial-failure handling (authorise 2 of 3, then one fails) and money arithmetic. Most effort goes to API/unit; UI covers one happy and one failure journey.

## 3. Risk register
| ID | Risk | I | L | Score | Band | Rationale |
|---|---|---|---|---|---|---|
| R1 | If a later payment fails, earlier authorisations are not voided, then customer funds stay held | 5 | 4 | 20 | Critical | multi-step distributed flow |
| R2 | If amounts do not sum exactly (rounding), then order is over/under charged | 5 | 3 | 15 | Critical | currency arithmetic |
| R3 | If refunds are allocated incorrectly, then customer is refunded to wrong method/amount | 5 | 3 | 15 | Critical | proportional logic, rounding |
| R4 | If gift card service times out/duplicates a call, then balance is double-debited | 4 | 4 | 16 | Critical | new integration |
| R5 | If two submits race, then order is paid twice | 5 | 2 | 10 | High | idempotency unknown |
| R6 | If flag is off, split UI/API still reachable | 3 | 2 | 6 | Medium | flag enforcement server-side? |
| R7 | If user B can reference user A's gift card, then balance is spent | 5 | 2 | 10 | High | authZ on new service |
| R8 | Requirement ambiguity: ordering of capture/authorisation, minimum per part | 3 | 4 | 12 | High | not specified |

## 4. Scenarios (excerpt)
| # | Scenario | Risk | Pri | Layer | Auto |
|---|---|---|---|---|---|
| 1 | 3 parts authorise; 3rd declines -> parts 1,2 voided, order unpaid | R1 | Critical | API (+1 UI) | Y |
| 2 | Amounts sum check: total 100.01 split 33.33/33.33/33.35 accepted; 33.33x3 rejected | R2 | Critical | Unit + API | Y |
| 3 | Refund of split order returns proportionally; cent remainder rule applied | R3 | Critical | Unit + API | Y |
| 4 | Gift card call retried with same idempotency key -> debited once | R4 | Critical | API (stubbed service) | Y |
| 5 | Double-click submit -> single order, single charge | R5 | High | API | Y |
| 6 | Gift card of another user rejected 403/404 | R7 | High | API | Y |
| 7 | Flag off: endpoint rejects split payload | R6 | Medium | API | Y |
| 8 | Happy path 2 methods end-to-end on web | R1-R3 | High | UI | Y |

## 5. Layer split
Unit: allocation and refund arithmetic. API: orchestration, partial failures, authZ, idempotency. UI: one happy, one failure journey. Exploratory: error messaging, accessibility of the payment form.

## 6. Exit criteria
- All Critical/High scenarios executed and passing; no open Sev1/Sev2.
- Medium risks passing or accepted by product owner.
- Open question 1-3 answered or risks accepted in writing.

## 7. Assumptions
1. PSP sandbox supports authorise/void and forced declines.
2. Gift card service has a test/stub environment.

## 8. Open questions
| # | Question | Owner | Impact |
|---|---|---|---|
| 1 | Capture timing: authorise all then capture, or sequential capture? | Backend lead | Changes R1 scenarios |
| 2 | Cent-remainder rule for refunds? | Product | Expected values in #3 |
| 3 | Is idempotency key supported by gift card service? | Integration owner | R4/R5 |
| 4 | Minimum amount per part? | Product | Boundary tests |
