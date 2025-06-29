import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export async function getCurrentUser() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError && sessionError.message !== "Auth session missing!") {
    console.error("Auth error:", sessionError)
  }

  const user = session?.user

  if (!user) {
    // Not signed in – return null without logging an error
    return null
  }

  return user
}
