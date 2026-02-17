import { User, UpdateProfileRequest, PaginatedUsersResponse, UpdateUserPayload } from "./types"

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

    /**
     * Get all users with pagination and search
     */
    static async getUsers(skip = 0, limit = 10, search = ""): Promise<PaginatedUsersResponse> {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        })
        if (search) params.append("search", search)

        const response = await fetch(`${API_BASE_URL}/users/?${params.toString()}`, {
            method: "GET",
            headers: this.getHeaders(),
        })

        if (!response.ok) throw new Error("Failed to fetch users.")
        return await response.json()
    }

    /**
     * Deactivate a user (PATCH)
     */
    static async deactivateUser(userId: number): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
            method: "PATCH",
            headers: this.getHeaders(),
        })

        if (!response.ok) throw new Error("Failed to deactivate user.")
        return await response.json()
    }

    /**
     * Update a user (PUT) - Used for Activating
     */
    static async updateUser(userId: number, data: UpdateUserPayload): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error("Failed to update user.")
        return await response.json()
    }

    /**
     * Delete a user
     */
    static async deleteUser(userId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "DELETE",
            headers: this.getHeaders(),
        })

        if (!response.ok) throw new Error("Failed to delete user.")
    }

}