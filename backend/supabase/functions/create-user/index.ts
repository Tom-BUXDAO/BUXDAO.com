// Type declarations to avoid import issues
declare function createClient(url: string, key: string): any;
declare function serve(handler: (req: Request) => Promise<Response>): void;

// Type declaration for Deno.env to avoid the "Cannot find name 'Deno'" error
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
  function cwd(): string;
}

console.log("Current working directory:", Deno.cwd());

const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req: Request): Promise<Response> {
  try {
    const { email, password } = await req.json();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
}

serve(handler);
