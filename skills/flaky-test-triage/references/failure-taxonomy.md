# Failure taxonomy

| Class | Category | Typical signals | Confirm by | Typical fix |
|---|---|---|---|---|
| **Test race / missing wait** | `flaky-test` | Passes on retry; `locator.click: Timeout`, "element not stable/detached", assertion on stale value | Trace: action fired before request completed; `--repeat-each` fails more under CPU throttle | Web-first assertion, wait on response/URL/state |
| **Shared state / order dependence** | `flaky-test` | Fails only in full run or with `workers>1`; unique-constraint errors; wrong counts | Run alone passes, run with neighbours fails; `--workers=1` passes | Per-test data, fixture teardown, remove serial coupling |
| **Test data / environment drift** | `environment` | "not found", unexpected rows, expired token, date-dependent | Query the data at failure time; check seed/reset jobs and clock | Create data in test, freeze clock, isolate tenant |
| **App race / product bug** | `product-bug` | Backend 5xx, duplicate submissions, UI shows stale state, console errors, same failure for manual repro | Network log in trace shows error; reproducible by hand with throttling | File bug; keep test; add API-level assert |
| **Infra / resource** | `environment` | Timeouts clustered in time, many tests fail at once, OOM, browser crash, "Target closed" | Correlate with runner load, shard, CI incident; pattern across unrelated tests | Reduce workers, bigger runner, shard rebalance, retry infra step only |
| **Third-party / network** | `environment` | DNS, 502 from external dependency, rate limit | Failing request host in HAR | Mock at boundary (contract-tested), stub, or isolate to an integration suite |
| **Timing/locale/clock** | `flaky-test` | Fails near midnight/month end, TZ differences, DST | Failures correlate with wall-clock | `page.clock`, fixed TZ in config |
| **Rendering/visual** | `flaky-test` | Screenshot diff of few px, font/AA differences between CI and local | Diff image; OS/browser versions | Pin container image, mask dynamic areas, tolerance with justification |
| **Selector drift** | `test-bug` | Always fails after UI change (not flaky) | Locator count 0 in trace | Update locator; reclassify as deterministic failure |

Heuristic: failure in <5% of runs and passes alone -> shared state or race; fails in clusters -> infra; fails always since commit X -> not flaky, bisect.
