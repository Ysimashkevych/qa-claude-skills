---
name: risk-based-test-plan
description: Generate a risk-based test plan from a feature description, user story, PRD, or ticket. Use when the user asks for a test plan, test strategy, test scope, "what should we test", QA sign-off criteria, or how to prioritise testing for a feature/release. Produces a risk matrix (impact x likelihood), prioritised scenarios, a unit/API/UI layer split, exit criteria, and explicit assumptions and open questions. Not for generating executable test code (use api-test-from-schema for API tests).
---

# Risk-Based Test Plan

Test effort follows risk. Output must let a reader see **why** each test exists and **what is deliberately not tested**.

## Procedure

1. **Ingest** the input (paste, file, ticket text). Extract: user goals, actors/roles, data entities, integrations, state transitions, business rules, non-functionals mentioned. Quote ambiguities; do not fill gaps silently.
2. **Identify risks** across the categories in `references/risk-prompts.md` (functional, data integrity, security/authZ, money/compliance, integration, concurrency, performance, usability, migration/compat, observability). Aim for 8-20 risks, each stated as "If <cause>, then <failure>, affecting <who/what>".
3. **Score** each risk: Impact 1-5 and Likelihood 1-5 using the scales in `references/scoring.md`; Score = I x L. Justify each score in one phrase (e.g. "new code, no prior coverage", "touches payments"). Likelihood drivers: novelty, complexity, change size, team familiarity, dependency count, past defects *if provided*. Do not invent defect history or numbers.
4. **Prioritise**: bands: Critical (>=15), High (10-14), Medium (5-9), Low (<5). Present the matrix as a table sorted by score and a 5x5 grid.
5. **Derive scenarios** per risk (highest first): title, precondition, steps/expected in one line, risk ID, priority, **layer** (Unit / API / UI / Manual-exploratory / Non-functional), automate Y/N. Push checks to the lowest layer that can detect the failure; UI only for end-to-end integration and user-visible behaviour. Include negative, boundary, permission and failure-mode scenarios, not only happy paths.
6. **Layer split** summary: count and rationale per layer; call out what each layer is responsible for.
7. **Exit criteria**: measurable and tied to risk bands, e.g. all Critical/High scenarios executed and passing; no open Sev1/Sev2; Medium risks either passing or accepted by named role. Include entry criteria, environments, test data, and de-scoped items with the residual risk accepted.
8. **Assumptions & open questions**: numbered; each open question names who should answer and what it would change in the plan.
9. Write using `templates/test-plan.md`. If the user wants the plan saved, write `test-plan-<feature>.md`.

## Rules

- No invented metrics, SLAs, or historical defect rates. If a number is needed (e.g. latency target) put it in Open Questions, or mark "TBD: confirm".
- Every scenario traces to a risk ID; every Critical/High risk has at least one scenario at two layers or a stated reason why one suffices.
- Keep it scannable: tables over prose; scenarios one line each. A plan for a small story should be 1-2 pages.
- State explicitly what is out of scope and why. Flag testability problems (no observable state, no test data hooks) as risks.
- When requirements conflict or are missing, the plan lists the risk "Requirement ambiguity: <topic>" instead of choosing an interpretation.
