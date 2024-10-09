import { assertEquals } from "std/testing/asserts.ts";
import { assertSpyCalls, spy, stub } from "std/testing/mock.ts";
import { createClient } from 'supabase';
import { handler } from './sign-in/index.ts';
import * as utils from '../utils.ts';
import { serve } from "http/server";

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: () => Promise.resolve({ data: { user: { id: '123' } }, error: null }),
  },
};

// Stub createClient to return our mock
const createClientStub = stub(globalThis, "createClient", () => mockSupabaseClient);

// Stub utility functions
const handleRateLimitStub = stub(utils, "handleRateLimit", () => Promise.resolve(null));

Deno.test("sign-in handler", async () => {
  const req = new Request("https://example.com/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "password123" }),
  });

  const response = await handler(req);
  assertEquals(response.status, 200);

  const body = await response.json() as { user: { id: string } };
  assertEquals(body.user.id, '123');

  assertSpyCalls(createClientStub, 1);
  assertSpyCalls(handleRateLimitStub, 1);
});

// Clean up stubs
createClientStub.restore();
handleRateLimitStub.restore();
