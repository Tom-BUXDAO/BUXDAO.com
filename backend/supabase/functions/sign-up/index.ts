import { createClient, SupabaseClient as _SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { 
  handleOptions, 
  createErrorResponse, 
  createSuccessResponse, 
  isValidEmail,
  handleRateLimit
} from '../utils/index.ts';
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";

// Type declaration for Deno.env to avoid the "Cannot find name 'Deno'" error
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface SignUpRequest {
  email: string;
  password: string;
  username: string;
}

function validateSignUpRequest(body: unknown): SignUpRequest {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Invalid request body');
  }

  const { email, password, username } = body as Partial<SignUpRequest>;

  if (typeof email !== 'string' || !isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (typeof username !== 'string' || username.length < 3 || username.length > 20) {
    throw new Error('Username must be between 3 and 20 characters long');
  }

  return { email, password, username };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleOptions(req) || new Response(null, { status: 204 });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method Not Allowed', 405);
  }

  try {
    // Rate limiting
    const rateLimitResponse = await handleRateLimit(req, 3, 60000); // 3 requests per minute
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { email, password, username } = validateSignUpRequest(body);

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return createErrorResponse('Username already taken', 400);
    }

    // Create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Add user to profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username, email });

      if (profileError) throw profileError;
    }

    return createSuccessResponse({ message: 'User created successfully' }, 201);
  } catch (error) {
    console.error('Sign-up error:', error);
    if (error instanceof HttpError) {
      return createErrorResponse(error.message, error.status);
    }
    return createErrorResponse('An unexpected error occurred', 500);
  }
});

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
