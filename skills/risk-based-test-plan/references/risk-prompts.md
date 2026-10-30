# Risk discovery prompts

- Functional: business rules, calculations, state machine illegal transitions, defaults, rounding, idempotency/retries.
- Data integrity: partial writes, duplicates, ordering, migrations, backfills, cascading deletes, eventual consistency.
- Security: authN, authZ per role/tenant (IDOR/BOLA), input injection, mass assignment, secrets/PII in logs, rate limiting.
- Money/compliance: pricing, tax, refunds, audit trail, consent, retention, regional rules.
- Integration: third-party failure/timeouts/rate limits, schema or version drift, webhook replay/out-of-order, backward compatibility of API consumers.
- Concurrency: double-submit, simultaneous edits, race on inventory/limits, locking.
- Performance/scalability: large payloads/lists, pagination, N+1, cold start, only if the input suggests volume; otherwise raise as open question.
- Usability/accessibility: error messages, keyboard, screen reader, localisation, empty/loading/error states.
- Operability: logging, alerting, feature flag, rollback, observability of failures.
- Compatibility: browsers/devices/OS/API client versions as relevant.
- Testability: lack of seed data, non-deterministic dependencies, no env parity.
