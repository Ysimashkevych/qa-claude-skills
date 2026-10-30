# qa-claude-skills

Reusable [Claude Code skills](https://code.claude.com/docs/en/skills) for QA and SDET work. A skill is a folder with a `SKILL.md` (YAML frontmatter with `name` and `description`, then instructions) that Claude loads when the description matches your request.

By Yurii Simashkevych, Senior/Lead SDET. These skills encode the review and triage heuristics I use for Playwright/TypeScript suites and risk-based testing.

| Skill | Use it to |
|---|---|
| [`playwright-test-review`](skills/playwright-test-review/SKILL.md) | Audit Playwright specs for flakiness, weak assertions, isolation and POM/fixture problems; get a ranked list with `file:line` and a fix |
| [`flaky-test-triage`](skills/flaky-test-triage/SKILL.md) | Turn a failure/CI log/trace into a root-cause hypothesis, repro plan, and fix-or-quarantine decision |
| [`risk-based-test-plan`](skills/risk-based-test-plan/SKILL.md) | Build a test plan from a PRD: risk matrix, prioritised scenarios, layer split, exit criteria, open questions |
| [`api-test-from-schema`](skills/api-test-from-schema/SKILL.md) | Generate Playwright `APIRequestContext` tests from OpenAPI/GraphQL schemas with a coverage checklist |

## Install

```bash
git clone https://github.com/Ysimashkevych/qa-claude-skills.git
cd qa-claude-skills
```

Personal (all projects):
```bash
mkdir -p ~/.claude/skills
cp -R skills/* ~/.claude/skills/
```
Per project (commit with your repo):
```bash
mkdir -p .claude/skills
cp -R skills/* .claude/skills/
```
Restart Claude Code (or start a new session). Skills are picked up automatically; you can also invoke one by name, e.g. `/risk-based-test-plan`.

## Example prompts

- **playwright-test-review**: "Review `tests/checkout/*.spec.ts` for flakiness and weak assertions." / "Audit the Playwright changes in this PR."
- **flaky-test-triage**: "This test fails 1 in 6 runs in CI only. Here's the error and trace summary: ... Fix or quarantine?"
- **risk-based-test-plan**: "Create a risk-based test plan for this PRD: @docs/split-payment.md"
- **api-test-from-schema**: "Generate Playwright API tests from `openapi.yaml`, cover auth and validation." / "Write tests for this GraphQL schema `schema.graphql`."

## Examples

Realistic input/output pairs in [`examples/`](examples/): one directory per skill. Outputs are illustrative samples of the expected format, not captured runs against a real system.

## Validate

```bash
python3 scripts/validate.py
```
Checks that every skill directory has a `SKILL.md`, frontmatter parses, `name` matches the folder, and a description exists.

## Conventions

- Descriptions state exactly when to trigger and when not to.
- Skills are opinionated, evidence-first, and refuse to invent metrics or assertions the source does not support.
- Heavy detail lives in `references/` and `templates/`, loaded only when needed.

## License

MIT, see [LICENSE](LICENSE).

## Development

CI checks two things on every push and pull request:

```bash
pip install -r requirements.txt && python scripts/validate.py   # frontmatter, names, referenced files
npm ci && npm run typecheck                                      # templates and examples compile
```

The example outputs are hand-written to show the expected format; they are not captured Claude runs.

## Related projects

- [ai-test-triage](https://github.com/Ysimashkevych/ai-test-triage): automated, report-level version of `flaky-test-triage`, with the same categories.
- [playwright-ts-framework](https://github.com/Ysimashkevych/playwright-ts-framework): a Playwright framework that follows the `playwright-test-review` checklist.
- [graphql-api-tests-go](https://github.com/Ysimashkevych/graphql-api-tests-go): GraphQL API testing in Go.

