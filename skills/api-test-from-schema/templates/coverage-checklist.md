# Coverage checklist

Legend: Y covered | N/A (reason) | GAP (reason)

| Operation | Happy | Required fields | Types/bounds/enum | Auth missing/invalid | AuthZ/tenant | Not found | Conflict/dup | Content-type/body | Contract (resp schema) | Idempotency | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|

Global:
- [ ] Every operation in schema has >=1 happy-path test
- [ ] Every documented response code exercised (or listed GAP)
- [ ] Every security scheme exercised (positive + negative)
- [ ] Every response validated against schema
- [ ] Tests create and clean up own data; run in parallel
- [ ] Env vars documented; no real-host default
- [ ] Assumptions marked `// ASSUMPTION:` and listed
- [ ] Spec gaps reported
