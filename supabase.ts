// src/lib/supabase.ts
//
// Two clients, matching Supabase's recommended Next.js App Router pattern:
// - browserClient: used in "use client" components (Google OAuth sign in, session reads)
// - serverClient: used in Server Components / Route Handlers, reads cookies for the session

import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set"
    );
  }
  return { url, anonKey };
}

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getEnv();
  return createBrowserClient(url, anonKey);
}

export function createServerSupabaseClient() {
  const { url, anonKey } = getEnv();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Components can't set cookies — middleware handles refresh instead.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // same as above
        }
      },
    },
  });
}
