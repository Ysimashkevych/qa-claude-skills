# Flaky triage: <test title> (<file>:<line>)

**Category:** <product-bug | test-bug | environment | flaky-test> (confidence High/Med/Low)

**Verdict:** <Fix now | Quarantine + fix by YYYY-MM-DD | Product bug: keep enabled | Need more evidence>
**Classification:** <class> (confidence High/Med/Low)

## Facts (observed)
- Failure: `<error one-liner>` at <step>
- Pattern: <N of M runs / only CI / only parallel>
- Evidence: <trace step, log line, timestamps>

## Hypotheses
1. **<primary>** (conf.): evidence ... ; falsified if ...
2. <alternate> ...

## Repro plan
1. `<command>`: isolates <variable>; expected failure rate: <observed baseline>
2. Control: `<command>`: expect <result>
3. Verify fix: `<repeat-each N command>` with 0 failures

## Fix sketch
```ts
<code or change>
```

## Decision checklist
| Question | Answer | Note |
|---|---|---|
| Reproducible? | | |
| Product defect? | | |
| Cause understood, fix < 1 day? | | |
| Guards critical path? | | |
| Blocking others? | | |
| Duplicate of known flake? | | |

## Actions
- [ ] <owner> <action> by <date>
## Evidence needed (if any)
