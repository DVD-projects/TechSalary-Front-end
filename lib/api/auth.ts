import { SignupRequest, LoginRequest, AuthResponse, ValidationErrorResponse } from "./types"

const API_BASE_URL = "http://127.0.0.1:8001/api/v1"

export class AuthService {
    
    /**
     * Login users.
     * Throws an error with the message if the request fails.
     */
    static async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()

                if (response.status === 422) {
                    const validationError = errorData as ValidationErrorResponse
                    const firstMessage = validationError.detail?.[0]?.msg || "Validation failed"
                    throw new Error(firstMessage)
                }

                if (response.status === 401) {
                    throw new Error("Invalid email or password.")
                }

                throw new Error("Login failed. Please try again.")
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error("An unexpected error occurred")
        }
    }

    /**
     * Registers a new user.
     * Throws an error with the message if the request fails.
     */
    static async register(data: SignupRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                if (response.status === 422) {
                    const validationError = errorData as ValidationErrorResponse
                    const firstMessage = validationError.detail?.[0]?.msg || "Validation failed"
                    throw new Error(firstMessage)
                }
                throw new Error("Registration failed.")
            }
            return await response.json()
        } catch (error) {
            if (error instanceof Error) throw error
            throw new Error("An unexpected error occurred")
        }
    }

}