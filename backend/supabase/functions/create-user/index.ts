/// <reference path="../deno.d.ts" />

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

console.log("Current working directory:", Deno.cwd());

const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req: DenoRequest): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json() as { username: string; email: string };
    const { username, email } = body;

    // Add input validation
    if (!username || !email) {
      throw new Error("Username and email are required");
    }

    if (typeof username !== 'string' || typeof email !== 'string') {
      throw new Error("Username and email must be strings");
    }

    // Add email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ username, email })
      .select();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 201,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: error.message.includes("required") || error.message.includes("Invalid") ? 400 : 500,
    });
  }
}

serve(handler);
