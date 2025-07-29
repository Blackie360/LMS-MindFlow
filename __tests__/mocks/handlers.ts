import { http, HttpResponse } from 'msw'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'

export const handlers = [
  // Mock Supabase Auth endpoints
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          full_name: 'Test User',
        },
      },
    })
  }),

  http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json({
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
    })
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({})
  }),

  http.post(`${SUPABASE_URL}/auth/v1/refresh`, () => {
    return HttpResponse.json({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      },
    })
  }),

  // Mock Supabase REST API endpoints
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json([
      {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),

  http.post(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }),

  // Mock error scenarios
  http.post(`${SUPABASE_URL}/auth/v1/token`, ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (email === 'invalid@example.com') {
      return HttpResponse.json(
        { error: 'Invalid login credentials' },
        { status: 400 }
      )
    }
    
    if (email === 'network-error@example.com') {
      return HttpResponse.error()
    }
    
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user-id',
        email: email || 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      },
    })
  }),
]