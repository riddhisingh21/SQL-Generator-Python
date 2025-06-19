import { SignIn } from '@clerk/clerk-react'

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to SQL Generator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Generate intelligent SQL queries with AI
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            routing="path" 
            path="/sign-in" 
            redirectUrl="/"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SignInPage
