import { act } from '@testing-library/react'
import { mockSupabaseClient, createMockUser, createMockProfile, createMockSession } from './test-utils'

// Authentication test scenarios
export const authTestScenarios = {
  validCredentials: {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
  },
  invalidCredentials: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  networkError: {
    email: 'network-error@example.com',
    password: 'password123',
  },
  existingUser: {
    email: 'existing@example.com',
    password: 'password123',
    fullName: 'Existing User',
  },
  shortPassword: {
    email: 'test@example.com',
    password: '123',
    fullName: 'Test User',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'password123',
    fullName: 'Test User',
  },
}

// Mock authentication states
export const mockAuthStates = {
  authenticated: () => {
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
  },

  unauthenticated: () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    return { mockUser: null, mockProfile: null, mockSession: null }
  },

  sessionExpired: () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Auth session missing!' },
    })

    return { mockUser: null, mockProfile: null, mockSession: null }
  },

  profileMissing: () => {
    const mockUser = createMockUser()
    const mockSession = createMockSession({ user: mockUser })

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockSupabaseClient.from().single.mockRejectedValue({
      code: 'PGRST116',
      message: 'The result contains 0 rows',
    })

    return { mockUser, mockProfile: null, mockSession }
  },
}

// Authentication action helpers
export const authActions = {
  signIn: async (email: string, password: string) => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: createMockUser({ email }),
        session: createMockSession({ user: createMockUser({ email }) }),
      },
      error: null,
    })
  },

  signInFailure: async (email: string, password: string, errorMessage = 'Invalid login credentials') => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: errorMessage },
    })
  },

  signUp: async (email: string, password: string, fullName: string) => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: {
        user: createMockUser({ email, user_metadata: { full_name: fullName } }),
        session: null,
      },
      error: null,
    })
  },

  signUpFailure: async (email: string, password: string, fullName: string, errorMessage = 'User already registered') => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: errorMessage },
    })
  },

  signOut: async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    })
  },

  signOutFailure: async (errorMessage = 'Sign out failed') => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: { message: errorMessage },
    })
  },

  refreshSession: async () => {
    mockSupabaseClient.auth.refreshSession.mockResolvedValue({
      data: {
        session: createMockSession(),
        user: createMockUser(),
      },
      error: null,
    })
  },

  refreshSessionFailure: async (errorMessage = 'Failed to refresh session') => {
    mockSupabaseClient.auth.refreshSession.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: errorMessage },
    })
  },
}

// Profile management helpers
export const profileActions = {
  createProfile: async (userId: string, email: string, fullName: string) => {
    mockSupabaseClient.from().insert.mockResolvedValue({
      data: createMockProfile({ id: userId, email, full_name: fullName }),
      error: null,
    })
  },

  createProfileFailure: async (errorMessage = 'Profile creation failed') => {
    mockSupabaseClient.from().insert.mockRejectedValue({
      message: errorMessage,
    })
  },

  fetchProfile: async (userId: string) => {
    mockSupabaseClient.from().single.mockResolvedValue({
      data: createMockProfile({ id: userId }),
      error: null,
    })
  },

  fetchProfileFailure: async (errorMessage = 'Profile not found') => {
    mockSupabaseClient.from().single.mockRejectedValue({
      code: 'PGRST116',
      message: errorMessage,
    })
  },
}

// Test environment helpers
export const testEnvironment = {
  setupAuthenticatedUser: () => {
    return mockAuthStates.authenticated()
  },

  setupUnauthenticatedUser: () => {
    return mockAuthStates.unauthenticated()
  },

  simulateNetworkError: () => {
    mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Network error'))
    mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))
    mockSupabaseClient.auth.signUp.mockRejectedValue(new Error('Network error'))
  },

  simulateServiceUnavailable: () => {
    const serviceError = { message: 'Service temporarily unavailable', status: 503 }
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: serviceError,
    })
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: serviceError,
    })
  },

  resetToDefaults: () => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  },
}

// Performance testing helpers
export const performanceHelpers = {
  measureAuthTime: async (authFunction: () => Promise<any>) => {
    const startTime = performance.now()
    await authFunction()
    const endTime = performance.now()
    return endTime - startTime
  },

  simulateSlowNetwork: (delay: number = 2000) => {
    const originalMethods = {
      getSession: mockSupabaseClient.auth.getSession,
      signInWithPassword: mockSupabaseClient.auth.signInWithPassword,
      signUp: mockSupabaseClient.auth.signUp,
    }

    mockSupabaseClient.auth.getSession = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(originalMethods.getSession()), delay))
    )

    mockSupabaseClient.auth.signInWithPassword = jest.fn().mockImplementation(
      (credentials) => new Promise(resolve => setTimeout(() => resolve(originalMethods.signInWithPassword(credentials)), delay))
    )

    mockSupabaseClient.auth.signUp = jest.fn().mockImplementation(
      (credentials) => new Promise(resolve => setTimeout(() => resolve(originalMethods.signUp(credentials)), delay))
    )

    return () => {
      mockSupabaseClient.auth.getSession = originalMethods.getSession
      mockSupabaseClient.auth.signInWithPassword = originalMethods.signInWithPassword
      mockSupabaseClient.auth.signUp = originalMethods.signUp
    }
  },
}

// Assertion helpers
export const authAssertions = {
  expectUserToBeAuthenticated: (user: any, profile: any) => {
    expect(user).toBeTruthy()
    expect(user.id).toBeDefined()
    expect(user.email).toBeDefined()
    expect(profile).toBeTruthy()
    expect(profile.id).toBe(user.id)
    expect(profile.email).toBe(user.email)
  },

  expectUserToBeUnauthenticated: (user: any, profile: any) => {
    expect(user).toBeNull()
    expect(profile).toBeNull()
  },

  expectErrorToBeDisplayed: (container: HTMLElement, errorMessage: string) => {
    expect(container).toHaveTextContent(errorMessage)
  },

  expectLoadingStateToBeShown: (container: HTMLElement) => {
    expect(container.querySelector('[data-testid="loading"]')).toBeInTheDocument()
  },

  expectRedirectToHaveOccurred: (mockPush: jest.Mock, expectedPath: string) => {
    expect(mockPush).toHaveBeenCalledWith(expectedPath)
  },
}