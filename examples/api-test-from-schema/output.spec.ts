// Generated from examples/api-test-from-schema/input.yaml
// Env: API_BASE_URL (required), API_TOKEN (valid bearer token)
import { test, expect, validator } from '../../skills/api-test-from-schema/templates/fixtures';

// Cleanup: the spec defines no DELETE /tasks/{id}, so created tasks cannot be removed.
// Unique titles (uid) keep tests independent; listed under spec gaps below.

const taskSchema = {
  type: 'object',
  required: ['id', 'title', 'priority'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
};
const assertTask = validator(taskSchema);

test.describe('POST /tasks', () => {
  test('201 creates task with default priority and matches schema', async ({ request, uid }) => {
    const title = `task-${uid}`;
    const res = await request.post('/tasks', { data: { title } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    assertTask(body);
    expect(body.title).toBe(title);
    expect(body.priority).toBe('medium'); // default per schema
  });

  const invalid: Array<[string, unknown]> = [
    ['missing title', {}],
    ['empty title (minLength 1)', { title: '' }],
    ['title 101 chars (maxLength 100)', { title: 'a'.repeat(101) }],
    ['title wrong type', { title: 123 }],
    ['invalid priority enum', { title: 'x', priority: 'urgent' }],
    ['unknown property (additionalProperties false)', { title: 'x', extra: true }],
  ];
  for (const [name, data] of invalid) {
    test(`400 ${name}`, async ({ request }) => {
      const res = await request.post('/tasks', { data: data as object });
      expect(res.status()).toBe(400);
    });
  }

  test('accepts title at maxLength boundary (100)', async ({ request }) => {
    const res = await request.post('/tasks', { data: { title: 'a'.repeat(100) } });
    expect(res.status()).toBe(201);
  });

  test('401 without token', async ({ anonymous }) => {
    const res = await anonymous.post('/tasks', { data: { title: 'x' } });
    expect(res.status()).toBe(401);
  });
});

test.describe('GET /tasks/{id}', () => {
  test('200 returns the created task', async ({ request, uid }) => {
    const setup = await request.post('/tasks', { data: { title: `get-${uid}` } });
    expect(setup.status()).toBe(201);
    const created = await setup.json();
    const res = await request.get(`/tasks/${created.id}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    assertTask(body);
    expect(body.id).toBe(created.id);
  });

  test('404 unknown uuid', async ({ request }) => {
    const res = await request.get('/tasks/00000000-0000-4000-8000-000000000000');
    expect(res.status()).toBe(404);
  });

  // ASSUMPTION: schema documents no 400 for malformed ids; status asserted loosely, see gaps.
  test('malformed id is rejected (not 200/500)', async ({ request }) => {
    const res = await request.get('/tasks/not-a-uuid');
    expect([400, 404]).toContain(res.status());
  });

  test('401 without token', async ({ anonymous }) => {
    const res = await anonymous.get('/tasks/00000000-0000-4000-8000-000000000000');
    expect(res.status()).toBe(401);
  });
});

/*
Coverage checklist
| Operation | Happy | Required fields | Types/bounds/enum | Auth missing/invalid | AuthZ/tenant | Not found | Conflict/dup | Content-type/body | Contract (resp schema) | Idempotency | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| POST /tasks | Y | Y | Y | Y / GAP (no expired-token fixture) | GAP (no roles in spec) | N/A (creates, no id) | GAP (no 409 documented) | GAP (no 415 documented) | Y | N/A (POST, no idempotency key in spec) | no cleanup: no DELETE in spec |
| GET /tasks/{id} | Y | N/A (no body) | Y (uuid) | Y / GAP (no expired-token fixture) | GAP (no tenancy in spec) | Y | N/A (read only) | N/A (no body) | Y | Y (GET is safe) | malformed id asserted loosely |

Spec gaps: no DELETE, so test data cannot be cleaned up; no 400 documented for GET /tasks/{id}; 400 error body schema
undefined, so error bodies are not asserted; no 403/409/415 documented; no invalid-token (expired) fixture provided.
*/
