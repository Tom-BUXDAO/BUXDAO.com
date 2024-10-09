import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { assertEquals, assertSpyCalls, spy } from "../deps.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Load environment variables from the root directory
config({ path: "../../../.env" }); // Adjust the path to reach the root

// Directly set environment variables for testing
Deno.env.set('SUPABASE_URL', 'https://zhtbgyhokeplieiqzbiy.supabase.co');
Deno.env.set('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodGJneWhva2VwbGllaXF6Yml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0MjAwNjgsImV4cCI6MjA0Mzk5NjA2OH0.7Rd9d7LKXcPNJvYQxsBEyrTpvr0y7A2gDtWjg4tIfhs');

// Log the loaded environment variables to verify
console.log("SUPABASE_URL from Deno.env:", Deno.env.get('SUPABASE_URL'));
console.log("SUPABASE_KEY from Deno.env:", Deno.env.get('SUPABASE_KEY'));

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or key');
}

const _supabase = createClient(supabaseUrl, supabaseKey); // Prefix with underscore

// Mock createClient function
const mockCreateClient = (_url: string, _key: string) => ({
  auth: {
    signInWithPassword: () => ({ 
      data: { user: {}, session: {} }, 
      error: null 
    }),
  },
}) as unknown as SupabaseClient;

// Spy on mockCreateClient
const createClientSpy = spy(mockCreateClient);

// Replace the actual createClient with our spy
(globalThis as unknown as { createClient: typeof mockCreateClient }).createClient = createClientSpy;

// Import the handler function
import { handler } from "./index.ts"; // Adjust the path as necessary

Deno.test("sign-in handler", async () => {
  const req = new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "password123" }),
  });

  const res = await handler(req);
  assertEquals(res.status, 200);

  const body = await res.json();
  assertEquals(body.user, {});
  assertEquals(body.session, {});

  assertSpyCalls(createClientSpy, 1);
});