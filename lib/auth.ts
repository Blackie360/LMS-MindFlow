import { supabase } from "./supabase"
import type { Profile } from "./supabase"

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      if (sessionError.message === "Auth session missing!") {
        return null
      }
      console.error("Auth error:", sessionError)
      return null
    }

    const user = session?.user
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email,
            role: "student",
          })
          .select()
          .single()

        if (createError) {
          console.error("Profile creation error:", createError)
          return null
        }
        return newProfile
      }
      return null
    }

    return profile
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      return { data: null, error }
    }

    // Ensure profile exists
    if (data.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.email,
            role: "student",
          })
        }
      } catch (profileError) {
        console.error("Profile check/creation error:", profileError)
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Sign in exception:", error)
    return {
      data: null,
      error: { message: "An unexpected error occurred during sign in" },
    }
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })

    if (error) {
      return { data, error }
    }

    if (data.user && !data.user.email_confirmed_at) {
      return { data, error: null }
    }

    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName.trim(),
          role: "student",
        })
      } catch (profileError) {
        console.error("Profile creation error:", profileError)
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Sign up exception:", error)
    return {
      data: null,
      error: { message: "An unexpected error occurred during sign up" },
    }
  }
}

export async function signOut() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user-preferences")
      localStorage.removeItem("course-progress")
      sessionStorage.clear()
    }

    const { error } = await supabase.auth.signOut({
      scope: "global",
    })

    if (error) {
      console.error("Sign out error:", error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error("Sign out exception:", error)
    return { error: { message: "An unexpected error occurred during sign out" } }
  }
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error("Session refresh error:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Session refresh exception:", error)
    return {
      data: null,
      error: { message: "Failed to refresh session" },
    }
  }
}

export async function checkAuthStatus() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      if (error.message === "Auth session missing!") {
        return { isAuthenticated: false, user: null, error: null }
      }
      return { isAuthenticated: false, user: null, error }
    }

    return {
      isAuthenticated: !!session?.user,
      user: session?.user || null,
      error: null,
    }
  } catch (error) {
    console.error("Auth status check exception:", error)
    return {
      isAuthenticated: false,
      user: null,
      error: { message: "Failed to check authentication status" },
    }
  }
}
