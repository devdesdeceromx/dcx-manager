import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'

type AuthContextValue = {
  isAuthenticated: boolean
  enterPreview: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const value = useMemo(
    () => ({
      isAuthenticated,
      enterPreview: () => setIsAuthenticated(true),
      signOut: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Provider and hook intentionally live together to keep the auth boundary cohesive.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
