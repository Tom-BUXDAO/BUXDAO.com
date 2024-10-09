import { config } from 'https://deno.land/x/dotenv@v3.2.2/mod.ts';

// Load environment variables from the root directory
config({ path: "../../../.env" }); // Adjust the path to reach the root

// Directly set environment variables for testing
Deno.env.set('SUPABASE_URL', 'https://zhtbgyhokeplieiqzbiy.supabase.co');
Deno.env.set('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodGJneWhva2VwbGllaXF6Yml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0MjAwNjgsImV4cCI6MjA0Mzk5NjA2OH0.7Rd9d7LKXcPNJvYQxsBEyrTpvr0y7A2gDtWjg4tIfhs');

// Log the loaded environment variables to verify
console.log("SUPABASE_URL from Deno.env:", Deno.env.get('SUPABASE_URL'));
console.log("SUPABASE_KEY from Deno.env:", Deno.env.get('SUPABASE_KEY'));

Deno.test("Environment Variable Test", () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or key');
  }

  console.log("Environment variables are set correctly.");
});