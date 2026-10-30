# Case matrix by schema constraint

| Constraint | Cases |
|---|---|
| required field | omit it; send null; send empty string (if string) |
| type: string | number, boolean, object, array instead; empty; very long (maxLength+1); unicode/emoji; leading/trailing whitespace |
| type: integer/number | string, float for integer, min-1, min, max, max+1, 0, negative, NaN-like strings, exceeding int64 |
| enum | each valid value (one test table); invalid value; case variation |
| format (email, uuid, date-time, uri) | one valid, several malformed, boundary dates |
| pattern | matching sample, near-miss |
| array | empty, minItems-1, maxItems+1, duplicates if uniqueItems, wrong element type |
| nullable / optional | omit vs null differences |
| oneOf/anyOf | each branch valid; ambiguous/none match |
| additionalProperties: false | unknown field rejected |
| readOnly | client-supplied value ignored or rejected (mass assignment) |
| path/query params | missing, malformed id, nonexistent id, pagination limits (0, -1, max+1), sort/filter injection |
| security | no creds, malformed, expired, wrong scope/role, other tenant's id |
| content negotiation | wrong Content-Type, missing body, malformed JSON |
| idempotency | repeat PUT/DELETE; repeat POST with same Idempotency-Key if documented |
| GraphQL non-null | null for `!` variable; missing variable; wrong scalar type |
| GraphQL auth | field-level access per role; introspection policy; query depth/complexity limits if documented |
