import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Inicio de Sesión - Reparaciones Tesla's",
  icons: {
    icon: 'https://cdn-icons-png.flaticon.com/128/3256/3256783.png',
    },
}

export default async function LoginPage() {
  // Use a safer approach for authentication check during build
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // During build/SSR, just render the login form without auth check
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
          <LoginForm />
        </main>
      )
    }
    
    // In browser environment, we can safely check auth
    const cookieStore = cookies()
    const token = (await cookieStore).get('auth_token')
    
    if (token) {
      redirect('/dashboard')
    }
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <LoginForm />
      </main>
    )
  } catch (error) {
    // Fallback for any errors
    console.error("Error in root page:", error)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <LoginForm />
      </main>
    )
  }
}
