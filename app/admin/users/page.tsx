"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { UserService } from "@/lib/api/user"
import { User, PaginatedUsersResponse } from "@/lib/api/types"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table" // Assuming you have shadcn table, if not I use standard HTML below
import {
    Search,
    Trash2,
    UserX,
    UserCheck,
    Loader2,
    ShieldAlert
} from "lucide-react"
import { Badge } from "@/components/ui/badge" // Assuming you have shadcn badge

export default function UserManagementPage() {

    const router = useRouter()
    const { toast } = useToast()

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")

    // Pagination State
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 10

    // Fetch Users Function
    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const skip = (page - 1) * limit
            const data: PaginatedUsersResponse = await UserService.getUsers(skip, limit, search)
            setUsers(data.items)
            setTotal(data.total)
        } catch (error) {
            router.push("/login")
            
            toast({
                title: "Error",
                description: "Failed to load users.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [page, search, toast])

    // Initial Fetch & Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers()
        }, 500) // Debounce search
        return () => clearTimeout(timer)
    }, [fetchUsers])

    // Actions
    const handleDeactivate = async (user: User) => {
        try {
            await UserService.deactivateUser(user.id)
            toast({ title: "User Deactivated", description: `${user.username} is now inactive.` })
            fetchUsers() // Refresh list
        } catch (error) {
            toast({ title: "Action Failed", variant: "destructive" })
        }
    }

    const handleActivate = async (user: User) => {
        try {
            // API requires full payload for PUT. We send existing data + is_active: true
            // Note: If API requires password, this might fail unless backend handles empty password
            await UserService.updateUser(user.id, {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                is_active: true
            })
            toast({ title: "User Activated", description: `${user.username} is now active.` })
            fetchUsers()
        } catch (error) {
            toast({ title: "Action Failed", variant: "destructive" })
        }
    }

    const handleDelete = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

        try {
            await UserService.deleteUser(userId)
            toast({ title: "User Deleted", description: "The user has been removed." })
            fetchUsers()
        } catch (error) {
            toast({ title: "Delete Failed", variant: "destructive" })
        }
    }

    const totalPages = Math.ceil(total / limit) || 1

    return (
        <div className="container mx-auto max-w-6xl py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground mt-2">
                    Manage system access, view registered users, and update their status.
                </p>
            </div>

            {/* Search Bar */}
            <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name, email..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1) // Reset to page 1 on search
                        }}
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle className="text-base">
                        Registered Users
                    </CardTitle>
                    <CardDescription>
                        Total users found: {total}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            {/* Standard Table Structure */}
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User ID</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{user.id}</td>
                                                <td className="p-4 align-middle font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{user.first_name} {user.last_name}</span>
                                                        <span className="text-xs text-muted-foreground font-normal">@{user.username}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">{user.email}</td>
                                                <td className="p-4 align-middle">
                                                    {user.roles?.includes("ADMIN") ? (
                                                        <span className="inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                                            User
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {user.is_active ? (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <span className="h-2 w-2 rounded-full bg-green-600" />
                                                            Active
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-red-500">
                                                            <span className="h-2 w-2 rounded-full bg-red-500" />
                                                            Inactive
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Toggle Status Button */}
                                                        {user.is_active ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                onClick={() => handleDeactivate(user)}
                                                                title="Deactivate User"
                                                            >
                                                                <UserX className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleActivate(user)}
                                                                title="Activate User"
                                                            >
                                                                <UserCheck className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        {/* Delete Button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(user.id)}
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )

}