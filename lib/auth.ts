import { supabase } from "./supabase"
import type { Profile } from "./supabase"

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Auth error:", userError)
      return null
    }

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
    }

    return { data, error }
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
    // But let's ensure it exists
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
        // Don't fail the signup if profile creation fails
      }
    }

    return { data, error }
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
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error("Sign out exception:", error)
    return { error: { message: "An unexpected error occurred during sign out" } }
  }
}
