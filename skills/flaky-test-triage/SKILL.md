---
name: flaky-test-triage
description: Triage a failing or intermittently failing automated test (Playwright, Jest, Cypress, Selenium, pytest, Go) from an error message, stack trace, Playwright trace/report, or CI log. Use when the user pastes a failure, says a test is flaky/"passes on retry"/"fails only in CI", or asks whether to fix or quarantine a test. Produces a root-cause hypothesis ranked with evidence, a repro plan, and a fix-or-quarantine recommendation using a decision checklist. Not for reviewing a whole suite statically (use playwright-test-review).
---

# Flaky Test Triage

Goal: decide the category, one of `product-bug`, `test-bug`, `environment` or `flaky-test` (the same labels as [ai-test-triage](https://github.com/Ysimashkevych/ai-test-triage)), and what to do today. Do not guess from the error string alone; classify with evidence and say what would falsify the hypothesis.

## Procedure

1. **Gather** what you have: error + stack, test source, CI log, trace/video/screenshot paths, run history (pass/fail pattern, retry counts), recent commits, CI vs local diff. Read the test and the code it touches. If key evidence is missing, list it under "Evidence needed" instead of inventing it.
2. **Characterise the failure** (fill in what is known):
   - Frequency/pattern (always, N of M runs, only after commit X, only on shard/browser/OS, only in parallel, only first run of the day).
   - Failure point (setup, action, assertion, teardown) and the exact assertion/timeout.
3. **Classify** using `references/failure-taxonomy.md`, which maps each failure class to a category. Pick a primary cause and at most two alternates; give a confidence (High/Med/Low) and the specific evidence for each (log line, trace step, timestamp gap).
4. **Repro plan.** Smallest command that raises failure probability, e.g. `npx playwright test path -g "title" --repeat-each=50 --workers=4`, `--retries=0`, `--trace=on`, CPU throttling / `taskset`, run with the suite's neighbours, set `TZ`/locale, network throttling. Include a control run to confirm the signal (expected failure rate before/after fix). State which variable each step isolates.
5. **Recommend** fix or quarantine via the checklist below. Always produce a concrete fix sketch (code) when the cause is test-side.
6. **Output** using `templates/triage-report.md`.

## Decision checklist: fix now vs quarantine

Answer each Yes/No/Unknown in the report.

1. Is the failure reproducible (>=1 in 50 runs locally or in CI loop)? If no, you cannot verify a fix; lean quarantine + instrumentation.
2. Does the root cause point to a **product defect** (race in app, 500s, data corruption)? Yes -> file bug, keep the test enabled (it is doing its job), mark `test.fixme` only if it blocks the pipeline.
3. Is the cause understood and the fix < ~1 day? Yes -> fix now.
4. Does the test guard a high-risk/critical path (payments, auth, data loss)? Yes -> do not leave uncovered; fix now or add compensating API/lower-layer coverage before quarantining.
5. Is it blocking merges for others (fail rate high)? Yes -> quarantine immediately, with owner and expiry.
6. Is it a duplicate of an existing quarantined/known flake with same signature? Link it.

**Quarantine rules** (if chosen): tag/annotate (`test.fixme` with issue link, or `@quarantine` tag run in a non-blocking job), assign an owner, set an expiry (e.g. 2 weeks) after which it is fixed or deleted, keep it running non-blocking so the fail rate stays visible. Never quarantine silently; never "fix" with retries or longer timeouts without a causal explanation.

## Rules

- Retries and timeout increases are mitigations, not fixes. Say so if proposed.
- Distinguish "slow" from "never": check whether the awaited thing ever appears in the trace/network log.
- If the trace shows the app behaved wrongly, the verdict is product bug even if the test is also sloppy.
- Mark every statement as Evidence (observed) or Inference. Keep the report under ~1 page.
