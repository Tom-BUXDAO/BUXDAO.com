declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function cwd(): string;
  export function openKv(): Promise<any>;
}

interface DenoRequest extends Request {
  json(): Promise<any>;
}

declare module "https://deno.land/std@0.131.0/http/server.ts" {
  export function serve(handler: (request: DenoRequest) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(supabaseUrl: string, supabaseKey: string): any;
}