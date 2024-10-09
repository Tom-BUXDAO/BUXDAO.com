// Type declarations to avoid import issues
declare function serve(handler: (req: Request) => Promise<Response>): void;
declare function createClient(url: string, key: string): any;

// Import local utilities
import { corsHeaders, handleOptions, createErrorResponse, createSuccessResponse } from '../utils.ts'

// Type declaration for Deno.env to avoid the "Cannot find name 'Deno'" error
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleOptions(req) || new Response(null, { status: 204 });
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return createErrorResponse("Email and password are required", 400)
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return createSuccessResponse({ user: data.user, session: data.session })
  } catch (error) {
    return createErrorResponse(error.message, 400)
  }
})
