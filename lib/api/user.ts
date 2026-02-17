import { User, UpdateProfileRequest } from "./types"

const API_BASE_URL = "http://127.0.0.1:8001/api/v1"

export class UserService {
    
    private static getHeaders() {
        const token = localStorage.getItem("token")
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    }

    /**
     * Fetches the current logged-in user's profile.
     */
    // static async getMe(): Promise<User> {
    //     const response = await fetch(`${API_BASE_URL}/users/me`, {
    //         method: "GET",
    //         headers: this.getHeaders(),
    //     })

    //     if (!response.ok) {
    //         if (response.status === 401) {
    //             throw new Error("Unauthorized. Please log in again.")
    //         }
    //         throw new Error("Failed to fetch profile.")
    //     }

    //     return await response.json()
    // }

    /**
     * Updates the current user's profile.
     */
    static async updateMe(data: UpdateProfileRequest): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const errorData = await response.json()
            if (response.status === 422) {
                const msg = errorData.detail?.[0]?.msg || "Validation failed"
                throw new Error(msg)
            } else if (response.status === 401) {
                const msg = errorData.detail || "Validation failed"
                throw new Error(msg)
            }
            throw new Error("Failed to update profile.")
        }

        return await response.json()
    }
    
}