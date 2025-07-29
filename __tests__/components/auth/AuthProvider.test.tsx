import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/auth/auth-provider'
import { mockSupabaseClient, createMockUser, createMockProfile, createMockSession, resetAllMocks } from '../../utils/test-utils'
import { mockAuthStates, testEnvironment } from '../../utils/auth-test-helpers'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: jest.fn(),
}))

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))

// Mock the auth signOut function
jest.mock('@/lib/auth', () => ({
  signOut: jest.fn().mockResolvedValue({ error: null }),
}))

// Test component to access auth context
const TestComponent = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
      <div data-testid="profile">{profile ? profile.full_name : 'no profile'}</div>
      <button data-testid="signout" onClick={signOut}>Sign Out</button>
      <button data-testid="refresh" onClick={refreshProfile}>Refresh Profile</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    resetAllMocks()
    mockPush.mockClear()
    mockRefresh.mockClear()
    ;(usePathname as jest.Mock).mockReturnValue('/')
    
    // Mock window.location
    delete (window as any).location
    window.location = { href: 'http://localhost:3000/' } as any
  })

  describe('Initial state loading', () => {
    it('should start with loading state', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: { session: null }, error: null }), 100))
      )

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
      expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
    })

    it('should load authenticated user state', async () => {
      // Arrange
      const { mockUser, mockProfile } = mockAuthStates.authenticated()
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
        expect(screen.getByTestId('profile')).toHaveTextContent(mockProfile.full_name)
      })
    })

    it('should load unauthenticated state', async () => {
      // Arrange
      mockAuthStates.unauthenticated()

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
        expect(screen.getByTestId('user')).toHaveTextContent('no user')
        expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
      })
    })
  })

  describe('User state updates', () => {
    it('should update state when user signs in', async () => {
      // Arrange
      mockAuthStates.unauthenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no user')
      })

      // Simulate auth state change
      const mockUser = createMockUser()
      const mockProfile = createMockProfile({ id: mockUser.id })
      const mockSession = createMockSession({ user: mockUser })

      mockSupabaseClient.from().single.mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      // Act - trigger auth state change
      const authStateChangeCallback = mockSupabaseClient.auth.onAuthStateChange.mock.calls[0][0]
      await act(async () => {
        await authStateChangeCallback('SIGNED_IN', mockSession)
      })

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
        expect(screen.getByTestId('profile')).toHaveTextContent(mockProfile.full_name)
      })
    })

    it('should update state when user signs out', async () => {
      // Arrange
      const { mockUser, mockProfile } = mockAuthStates.authenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
      })

      // Act - trigger auth state change
      const authStateChangeCallback = mockSupabaseClient.auth.onAuthStateChange.mock.calls[0][0]
      await act(async () => {
        await authStateChangeCallback('SIGNED_OUT', null)
      })

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no user')
        expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
      })
    })

    it('should handle token refresh', async () => {
      // Arrange
      const { mockUser, mockProfile } = mockAuthStates.authenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
      })

      // Act - trigger token refresh
      const updatedSession = createMockSession({ 
        user: mockUser,
        access_token: 'new-access-token'
      })

      const authStateChangeCallback = mockSupabaseClient.auth.onAuthStateChange.mock.calls[0][0]
      await act(async () => {
        await authStateChangeCallback('TOKEN_REFRESHED', updatedSession)
      })

      // Assert - user should remain the same
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
        expect(screen.getByTestId('profile')).toHaveTextContent(mockProfile.full_name)
      })
    })
  })

  describe('Profile synchronization', () => {
    it('should fetch profile when user signs in', async () => {
      // Arrange
      mockAuthStates.unauthenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const mockUser = createMockUser()
      const mockProfile = createMockProfile({ id: mockUser.id })
      const mockSession = createMockSession({ user: mockUser })

      mockSupabaseClient.from().single.mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      // Act
      const authStateChangeCallback = mockSupabaseClient.auth.onAuthStateChange.mock.calls[0][0]
      await act(async () => {
        await authStateChangeCallback('SIGNED_IN', mockSession)
      })

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
        expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('*')
        expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', mockUser.id)
      })
    })

    it('should handle profile fetch error gracefully', async () => {
      // Arrange
      mockAuthStates.unauthenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const mockUser = createMockUser()
      const mockSession = createMockSession({ user: mockUser })

      mockSupabaseClient.from().single.mockRejectedValue(new Error('Profile fetch failed'))

      // Act
      const authStateChangeCallback = mockSupabaseClient.auth.onAuthStateChange.mock.calls[0][0]
      await act(async () => {
        await authStateChangeCallback('SIGNED_IN', mockSession)
      })

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
        expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
      })
    })

    it('should refresh profile on demand', async () => {
      // Arrange
      const { mockUser, mockProfile } = mockAuthStates.authenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent(mockProfile.full_name)
      })

      // Update profile data
      const updatedProfile = createMockProfile({
        id: mockUser.id,
        full_name: 'Updated Name',
      })

      mockSupabaseClient.from().single.mockResolvedValue({
        data: updatedProfile,
        error: null,
      })

      // Act
      const refreshButton = screen.getByTestId('refresh')
      await act(async () => {
        refreshButton.click()
      })

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('Updated Name')
      })
    })
  })

  describe('Cleanup on unmount', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      // Arrange
      const mockUnsubscribe = jest.fn()
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      })

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Act
      unmount()

      // Assert
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should handle missing subscription gracefully', () => {
      // Arrange
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: null }
      })

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Act & Assert - should not throw
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Sign out functionality', () => {
    it('should sign out user and clear state', async () => {
      // Arrange
      const { mockUser } = mockAuthStates.authenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
      })

      // Act
      const signOutButton = screen.getByTestId('signout')
      await act(async () => {
        signOutButton.click()
      })

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no user')
        expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
        expect(mockPush).toHaveBeenCalledWith('/auth')
      })
    })

    it('should clear local storage on sign out', async () => {
      // Arrange
      const mockRemoveItem = jest.fn()
      const mockClear = jest.fn()

      Object.defineProperty(window, 'localStorage', {
        value: { removeItem: mockRemoveItem },
        writable: true,
      })

      Object.defineProperty(window, 'sessionStorage', {
        value: { clear: mockClear },
        writable: true,
      })

      const { mockUser } = mockAuthStates.authenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
      })

      // Act
      const signOutButton = screen.getByTestId('signout')
      await act(async () => {
        signOutButton.click()
      })

      // Assert
      await waitFor(() => {
        expect(mockRemoveItem).toHaveBeenCalledWith('user-preferences')
        expect(mockRemoveItem).toHaveBeenCalledWith('course-progress')
        expect(mockClear).toHaveBeenCalled()
      })
    })

    it('should handle sign out errors gracefully', async () => {
      // Arrange
      const { signOut } = require('@/lib/auth')
      signOut.mockRejectedValue(new Error('Sign out failed'))

      const { mockUser } = mockAuthStates.authenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
      })

      // Act
      const signOutButton = screen.getByTestId('signout')
      await act(async () => {
        signOutButton.click()
      })

      // Assert - should still redirect to auth even on error
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth')
      })
    })
  })

  describe('Error handling', () => {
    it('should handle initial session fetch error', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Session fetch failed'))

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
        expect(screen.getByTestId('user')).toHaveTextContent('no user')
      })
      expect(console.error).toHaveBeenCalledWith('Error getting initial session:', expect.any(Error))
    })

    it('should handle auth state change errors', async () => {
      // Arrange
      mockAuthStates.unauthenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const mockUser = createMockUser()
      const mockSession = createMockSession({ user: mockUser })

      // Profile fetch fails
      mockSupabaseClient.from().single.mockRejectedValue(new Error('Profile fetch failed'))

      // Act
      const authStateChangeCallback = mockSupabaseClient.auth.onAuthStateChange.mock.calls[0][0]
      await act(async () => {
        await authStateChangeCallback('SIGNED_IN', mockSession)
      })

      // Assert - should still update user state
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
        expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
      })
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Arrange
      const TestComponentOutsideProvider = () => {
        useAuth()
        return <div>Test</div>
      }

      // Act & Assert
      expect(() => {
        render(<TestComponentOutsideProvider />)
      }).toThrow('useAuth must be used within an AuthProvider')
    })

    it('should provide auth context values', async () => {
      // Arrange
      const { mockUser, mockProfile } = mockAuthStates.authenticated()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email)
        expect(screen.getByTestId('profile')).toHaveTextContent(mockProfile.full_name)
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      // Check that functions are available
      expect(screen.getByTestId('signout')).toBeInTheDocument()
      expect(screen.getByTestId('refresh')).toBeInTheDocument()
    })
  })

  describe('Route-based redirects', () => {
    it('should redirect authenticated user from auth page', async () => {
      // Arrange
      ;(usePathname as jest.Mock).mockReturnValue('/auth')
      mockAuthStates.authenticated()

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard')
      })
    })

    it('should redirect unauthenticated user from protected route', async () => {
      // Arrange
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      mockAuthStates.unauthenticated()

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth')
      })
    })

    it('should not redirect on public routes', async () => {
      // Arrange
      ;(usePathname as jest.Mock).mockReturnValue('/')
      mockAuthStates.unauthenticated()

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})