import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";

Deno.test("example test", () => {
  const result = 1 + 1;
  assertEquals(result, 2);
});
