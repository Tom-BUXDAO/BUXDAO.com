// We'll use a type declaration for createClient to avoid import issues
declare function createClient(url: string, key: string): any;

// We'll use a type declaration for Deno.env to avoid the "Cannot find name 'Deno'" error
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function authenticateUser(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user.id;
}
