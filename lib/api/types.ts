export interface SignupRequest {
    email: string
    username: string
    first_name: string
    last_name: string
    password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface User {
    id: number
    email: string
    username: string
    first_name: string
    last_name: string
    is_active: boolean
    roles: string[]
}

// Successful API Response
export interface AuthResponse {
    access_token: string
    token_type: string
    user: User
}

// Error Response Structure (for 422)
export interface ValidationErrorDetail {
    loc: (string | number)[]
    msg: string
    type: string
}

export interface ValidationErrorResponse {
    detail: ValidationErrorDetail[]
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  email?: string
  username?: string
  //password?: string
  is_active?: boolean
}

// Admin User Management
export interface PaginatedUsersResponse {
  total: number
  page: number
  size: number
  items: User[]
}

export interface UpdateUserPayload {
  first_name: string
  last_name: string
  email: string
  is_active: boolean
}