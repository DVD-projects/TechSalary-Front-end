"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/api/auth"
import { User, LoginRequest, SignupRequest } from "@/lib/api/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: SignupRequest) => Promise<void>
  logout: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const SESSION_MS = 20 * 60 * 1000 // 20 minutes

  // Initialize state from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userData")
    const token = localStorage.getItem("token")
    const loginTime = localStorage.getItem("loginTime")
    const now = Date.now()
    const isSessionValid =
      loginTime && now - Number(loginTime) < SESSION_MS

    if (storedUser && token && isSessionValid) {
      setUser(JSON.parse(storedUser))
    } else {
      // Expired session cleanup
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
      localStorage.removeItem("loginTime")
    }
    setIsLoading(false)
  }, [])

  // Auto-logout when session window passes
  useEffect(() => {
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem("loginTime")
      if (!loginTime) return
      const now = Date.now()
      if (now - Number(loginTime) >= SESSION_MS) {
        logout()
      }
    }, 60_000) // check every minute

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (data: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await AuthService.login(data)

      // Save to storage
      localStorage.setItem("token", response.access_token)
      localStorage.setItem("userData", JSON.stringify(response.user))
      localStorage.setItem("loginTime", String(Date.now()))

      // Update State
      setUser(response.user)

      router.push("/salaries") // Default redirect
    } catch (error) {
      throw error // Let the component handle the error message display
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: SignupRequest) => {
    setIsLoading(true)
    try {
      const response = await AuthService.register(data)

      // Auto-login after register
      localStorage.setItem("token", response.access_token)
      localStorage.setItem("userData", JSON.stringify(response.user))
      localStorage.setItem("loginTime", String(Date.now()))

      setUser(response.user)

      // We don't redirect here, we let the component decide (e.g. show toast first)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    localStorage.removeItem("loginTime")
    setUser(null)
    router.push("/login")
    window.location.reload() 
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
