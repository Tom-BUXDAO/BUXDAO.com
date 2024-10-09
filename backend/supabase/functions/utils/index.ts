export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

export function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }
}

export function createErrorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

export function createSuccessResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function handleRateLimit(_req: Request, _limit: number, _window: number) {
  // Implement rate limiting logic here
  // For now, we'll just return null to indicate no rate limiting
  return null;
}