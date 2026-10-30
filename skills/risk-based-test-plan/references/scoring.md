# Scoring scales

## Impact (if it fails in production)
5 Severe: money loss/wrong charges, data loss/corruption, security or privacy breach, legal/compliance breach, full outage of core flow
4 Major: core flow blocked for many users, wrong business data without workaround
3 Moderate: feature degraded for some users, workaround exists
2 Minor: cosmetic or edge-case inconvenience
1 Trivial: negligible, no user impact

## Likelihood (that a defect exists / escapes)
5 Very likely: brand-new complex logic, many integrations, concurrency, no existing tests
4 Likely: significant change to existing logic, unclear requirements
3 Possible: moderate change, partly covered
2 Unlikely: small change in well-covered, well-understood area
1 Rare: config/copy change, proven code path

## Bands
Critical >= 15 | High 10-14 | Medium 5-9 | Low <= 4

## Effort mapping (guidance)
Critical: multi-layer automation + exploratory + sign-off. High: automated at lowest effective layer + targeted exploratory. Medium: automated at one layer or scripted manual. Low: opportunistic / accept risk.
