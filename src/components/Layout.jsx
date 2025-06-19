import { useAuth, useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import Navigation from './Navigation'

function Layout({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return (
    <>
      <Navigation user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  )
}

export default Layout
