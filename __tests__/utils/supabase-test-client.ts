import { createClient } from '@supabase/supabase-js'

// Test Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'

// Create test client with specific configuration for testing
export const createTestSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist sessions in tests
      autoRefreshToken: false, // Don't auto-refresh in tests
      detectSessionInUrl: false, // Don't detect sessions from URL in tests
    },
    global: {
      headers: {
        'X-Test-Mode': 'true',
      },
    },
  })
}

// Mock auth responses for different scenarios
export const mockAuthResponses = {
  signInSuccess: {
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          full_name: 'Test User',
        },
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString(),
        },
      },
    },
    error: null,
  },

  signInFailure: {
    data: {
      user: null,
      session: null,
    },
    error: {
      message: 'Invalid login credentials',
      status: 400,
    },
  },

  signUpSuccess: {
    data: {
      user: {
        id: 'new-user-id',
        email: 'newuser@example.com',
        email_confirmed_at: null,
        confirmation_sent_at: new Date().toISOString(),
        user_metadata: {
          full_name: 'New User',
        },
      },
      session: null,
    },
    error: null,
  },

  signUpFailure: {
    data: {
      user: null,
      session: null,
    },
    error: {
      message: 'User already registered',
      status: 422,
    },
  },

  sessionValid: {
    data: {
      session: {
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString(),
        },
      },
    },
    error: null,
  },

  sessionInvalid: {
    data: {
      session: null,
    },
    error: {
      message: 'Auth session missing!',
      status: 401,
    },
  },

  profileExists: {
    data: {
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    error: null,
  },

  profileNotFound: {
    data: null,
    error: {
      code: 'PGRST116',
      message: 'The result contains 0 rows',
      details: null,
      hint: null,
    },
  },
}

// Helper to create mock database responses
export const createMockDatabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
  status: error ? error.status || 400 : 200,
  statusText: error ? 'Error' : 'OK',
})