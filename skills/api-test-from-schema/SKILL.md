---
name: api-test-from-schema
description: Generate API tests from an OpenAPI/Swagger (JSON or YAML) or GraphQL schema (SDL or introspection JSON). Use when the user supplies a spec/schema and asks for API tests, a test suite, contract tests, or coverage of endpoints/queries/mutations. Defaults to Playwright APIRequestContext in TypeScript. Covers happy path, input validation, authentication/authorization, negative cases, and contract (response schema) checks, and ends with a coverage checklist. Not for UI tests or for test planning without a schema (use risk-based-test-plan).
---

# API Tests from Schema

Produce runnable, readable tests that fail for real defects. Derive everything from the schema; never invent endpoints, fields, or auth flows.

## Procedure

1. **Parse the schema.** Read the file/URL given. Build an inventory table: operation (method+path or query/mutation name), params, request body schema, response codes/types, security requirements. For GraphQL: types, enums, non-null (`!`), input objects, directives. Report anything unreadable or ambiguous.
2. **Check project context.** If a Playwright project exists (`playwright.config.*`), follow its conventions (baseURL, fixtures, folder layout). Otherwise scaffold per `templates/` (config, client fixture, schema validation helper). Ask only for what you cannot derive: base URL, how to obtain a token, test data/teardown. Put unknowns in env vars (`API_BASE_URL`, `API_TOKEN`) and list them.
3. **Plan per operation** using `references/case-matrix.md`: pick cases by schema constraints (required, type, min/max, enum, pattern, format, nullable, array bounds, oneOf).
4. **Generate tests** (default: `@playwright/test`, `request` fixture / `APIRequestContext`, TypeScript):
   - One spec file per resource/tag; `test.describe` per operation; title states behaviour and expected status.
   - **Happy path**: valid request, assert status, key fields' values (not only presence), and response matches schema.
   - **Validation**: each required field missing, wrong type, boundary +/-1, enum invalid, bad format; expect 400/422 and an error body shape per schema.
   - **Auth**: no token -> 401; invalid/expired token -> 401; insufficient role/other tenant's resource -> 403/404 (BOLA check) where the schema defines security.
   - **Negative**: nonexistent id -> 404, duplicate create -> 409 (if documented), unsupported content-type, oversized/unicode/injection-ish strings, idempotency of PUT/DELETE.
   - **Contract**: validate every response against its schema with Ajv (OpenAPI) or by asserting selection set/non-null (GraphQL); also assert undocumented status codes fail the test.
   - **State**: create data via API in fixtures with unique names, clean up in teardown; tests independent and parallel-safe. For lifecycle flows (create -> read -> update -> delete) keep in one test with `test.step`.
5. **GraphQL specifics**: send as `POST` JSON `{query, variables}`; assert `errors` absent on success and present with correct `extensions.code`/path on failure (HTTP 200 with errors is normal); test null propagation for non-null fields, unauthenticated field-level access, and variable type coercion errors.
6. **Self-check.** Run `npx tsc --noEmit` and, if the API is reachable, `npx playwright test`. If you cannot run, say so; never claim tests pass. Do not assert behaviour the schema does not specify; mark such tests `// ASSUMPTION:` and list them.
7. **Finish with the coverage checklist** from `templates/coverage-checklist.md`, filled per operation (covered / skipped + reason), and a list of assumptions, required env vars, and spec gaps (e.g. missing 4xx responses documented, no `security` defined, examples absent).

## Rules

- Assert exact status codes from the schema, not ranges. Assert error bodies, not just status.
- No hard-coded ids that rely on environment data; create or look up.
- No `any`; type responses from the schema (e.g. `openapi-typescript`) when feasible.
- Destructive or mutating tests must not target production; require an explicit base URL env var and refuse to default to a real host.
- Keep tests data-driven (table of cases) for validation matrices to avoid bloat.
- Flag schema defects found while generating (e.g. response example violates its own schema) as findings, not silently fixed.
