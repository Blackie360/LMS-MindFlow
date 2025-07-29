import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/components/auth/auth-provider'

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
  })),
}

// Mock the Supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  user_metadata: {
    full_name: 'Test User',
  },
  ...overrides,
})

export const createMockProfile = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'student' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
})

// Test helpers
export const waitForAuthState = (callback: () => void, timeout = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback()
      resolve(true)
    }, timeout)
  })
}

export const mockAuthSuccess = () => {
  const mockUser = createMockUser()
  const mockProfile = createMockProfile()
  const mockSession = createMockSession({ user: mockUser })

  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  })

  mockSupabaseClient.from().single.mockResolvedValue({
    data: mockProfile,
    error: null,
  })

  return { mockUser, mockProfile, mockSession }
}

export const mockAuthFailure = (errorMessage = 'Authentication failed') => {
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: { message: errorMessage },
  })
}

export const resetAllMocks = () => {
  jest.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
}