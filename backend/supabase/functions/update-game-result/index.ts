import { serve } from "http/server";
import { createClient } from 'supabase';
import { 
  handleOptions, 
  createErrorResponse, 
  createSuccessResponse, 
  handleRateLimit
} from '../utils.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface GameResult {
  userId: string;
  gameType: 'poker' | 'spades';
  result: 'win' | 'loss';
  amount: number;
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method Not Allowed', 405);
  }

  try {
    // Rate limiting
    const rateLimitResponse = await handleRateLimit(req, 10, 60000); // 10 requests per minute
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const gameResult = validateGameResult(body);

    // Update user stats
    const { data, error } = await supabase.rpc('update_user_stats', gameResult);

    if (error) throw error;

    return createSuccessResponse({ message: 'Game result updated successfully' });
  } catch (error: any) {
    console.error('Update game result error:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred', error.status || 500);
  }
}

function validateGameResult(body: unknown): GameResult {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Invalid request body');
  }

  const { userId, gameType, result, amount } = body as Partial<GameResult>;

  if (typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Invalid userId');
  }

  if (gameType !== 'poker' && gameType !== 'spades') {
    throw new Error('Invalid gameType');
  }

  if (result !== 'win' && result !== 'loss') {
    throw new Error('Invalid result');
  }

  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Invalid amount');
  }

  return { userId, gameType, result, amount };
}

serve(handler);
