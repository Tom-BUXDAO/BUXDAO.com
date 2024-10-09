import { corsHeaders, handleOptions, createErrorResponse, createSuccessResponse, isValidEmail } from "./index.ts"; // Corrected import path
import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts"; // Example import

// Mock Deno.test function
Deno.test("corsHeaders returns correct headers", () => {
  const headers = corsHeaders();
  assertEquals(headers["Access-Control-Allow-Origin"], "*");
  assertEquals(headers["Access-Control-Allow-Headers"], "authorization, x-client-info, apikey, content-type");
});

Deno.test("handleOptions returns correct response for OPTIONS request", () => {
  const req = new Request("https://example.com", { method: "OPTIONS" });
  const response = handleOptions(req);
  assertEquals(response instanceof Response, true);
  if (response) {
    assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  }
});

Deno.test("createErrorResponse returns correct error response", async () => {
  const response = createErrorResponse("Test error", 400);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Test error");
});

Deno.test("createSuccessResponse returns correct success response", async () => {
  const data = { message: "Success" };
  const response = createSuccessResponse(data, 201);
  assertEquals(response.status, 201);
  const body = await response.json();
  assertEquals(body.message, "Success");
});

Deno.test("isValidEmail correctly validates email addresses", () => {
  assertEquals(isValidEmail("test@example.com"), true);
  assertEquals(isValidEmail("invalid-email"), false);
});
