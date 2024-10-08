/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { rateLimit } from '../rate-limiter.js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
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

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const allowed = await rateLimit(ip, 5, 60000); // 5 requests per minute
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 429,
    });
  }

  try {
    const body = await req.json() as { email: string; password: string };
    const { email, password } = body;

    // Add input validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error("Email and password must be strings");
    }

    // Add email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    });
  }
}

serve(handler);
