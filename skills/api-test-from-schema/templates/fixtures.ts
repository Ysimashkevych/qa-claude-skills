import { test as base, expect, request, APIRequestContext } from '@playwright/test';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/** Compile a JSON Schema (extracted from the OpenAPI response) once; assert a body against it. */
export function validator(schema: object): (body: unknown) => void {
  const validate: ValidateFunction = ajv.compile(schema);
  return (body) => {
    const ok = validate(body);
    expect(ok, JSON.stringify(validate.errors, null, 2)).toBe(true);
  };
}

type Fixtures = {
  /** Client with no credentials, for 401 tests. */
  anonymous: APIRequestContext;
  /** Unique suffix per test for parallel-safe data. */
  uid: string;
};

export const test = base.extend<Fixtures>({
  anonymous: async ({}, use) => {
    const ctx = await request.newContext({ baseURL: process.env.API_BASE_URL });
    await use(ctx);
    await ctx.dispose();
  },
  uid: async ({}, use, testInfo) => {
    await use(`${testInfo.parallelIndex}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
  },
});

export { expect };
