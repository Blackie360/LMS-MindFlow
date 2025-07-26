import { supabase } from "./supabase"
import type { Profile } from "./supabase"

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Handle the specific "Auth session missing!" error gracefully
    if (sessionError) {
      if (sessionError.message === "Auth session missing!") {
        // This is expected when no user is signed in, not a real error
        return null
      }
      console.error("Auth error:", sessionError)
      return null
    }

    const user = session?.user

    if (!user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)

      // If profile doesn't exist, create it
      if (profileError.code === "PGRST116") {
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
      console.error("Sign in error:", error)
      return { data: null, error }
    }

    // Ensure profile exists after successful sign in
    if (data.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Create profile if it doesn't exist
          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.email,
            role: "student",
          })
        }
      } catch (profileError) {
        console.error("Profile check/creation error:", profileError)
        // Don't fail the sign in if profile creation fails
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
      console.error("Sign up error:", error)
      return { data, error }
    }

    // The profile will be created automatically by the database trigger
    // But let's ensure it exists with the correct data
    if (data.user && !data.user.email_confirmed_at) {
      // For email confirmation flow, the profile will be created when user confirms
      return { data, error: null }
    }

    if (data.user) {
      try {
        // Ensure profile is created with correct data
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName.trim(),
          role: "student",
        })
      } catch (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't fail the signup if profile creation fails
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
    // Clear any local storage or session data
    if (typeof window !== "undefined") {
      // Clear any cached user data
      localStorage.removeItem("user-preferences")
      localStorage.removeItem("course-progress")
      sessionStorage.clear()
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut({
      scope: "global", // Sign out from all sessions
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
      // Handle the specific "Auth session missing!" error gracefully
      if (error.message === "Auth session missing!") {
        return { isAuthenticated: false, user: null, error: null }
      }
      console.error("Auth status check error:", error)
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

export async function handleAuthRedirect() {
  try {
    const user = await getCurrentUser()

    if (user) {
      // Force redirect to dashboard for authenticated users
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        if (currentPath === "/auth" || currentPath === "/") {
          window.location.replace("/dashboard")
          return true
        }
      }
    } else {
      // Force redirect to auth for unauthenticated users
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        const publicPaths = ["/auth", "/"]
        if (!publicPaths.includes(currentPath)) {
          window.location.replace("/auth")
          return true
        }
      }
    }

    return false
  } catch (error) {
    console.error("Auth redirect error:", error)
    if (typeof window !== "undefined") {
      window.location.replace("/auth")
    }
    return true
  }
}
