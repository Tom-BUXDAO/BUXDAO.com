import { corsHeaders, handleOptions, createErrorResponse, createSuccessResponse, isValidEmail } from "./utils.ts";

// Mock Deno.test function
function test(name: string, fn: () => void | Promise<void>) {
  console.log(`Running test: ${name}`);
  fn();
}

// Mock assertEquals function
function assertEquals(actual: any, expected: any) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, but got ${actual}`);
  }
}

test("corsHeaders returns correct headers", () => {
  const headers = corsHeaders();
  assertEquals(headers["Access-Control-Allow-Origin"], "*");
  assertEquals(headers["Access-Control-Allow-Headers"], "authorization, x-client-info, apikey, content-type");
});

test("handleOptions returns correct response for OPTIONS request", () => {
  const req = new Request("https://example.com", { method: "OPTIONS" });
  const response = handleOptions(req);
  assertEquals(response instanceof Response, true);
  if (response) {
    assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  }
});

test("createErrorResponse returns correct error response", async () => {
  const response = createErrorResponse("Test error", 400);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Test error");
});

test("createSuccessResponse returns correct success response", async () => {
  const data = { message: "Success" };
  const response = createSuccessResponse(data, 201);
  assertEquals(response.status, 201);
  const body = await response.json();
  assertEquals(body.message, "Success");
});

test("isValidEmail correctly validates email addresses", () => {
  assertEquals(isValidEmail("test@example.com"), true);
  assertEquals(isValidEmail("invalid-email"), false);
});
