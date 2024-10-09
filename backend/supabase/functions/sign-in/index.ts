import { createClient } from "../deps.ts"; // Adjust the path as necessary

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ user: data.user, session: data.session }), { status: 200 });
  } catch (error) {
    // Type assertion to access the message property
    const errorMessage = (error instanceof Error) ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
};
