import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
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
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method Not Allowed', 405);
  }

  try {
    const rateLimitResponse = await handleRateLimit(req, 10, 60000); // 10 requests per minute
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const gameResult = validateGameResult(body);

    const { data: _data, error } = await supabase.rpc('update_user_stats', gameResult);

    if (error) throw error;

    return createSuccessResponse({ message: 'Game result updated successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return createErrorResponse(errorMessage, 500);
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
