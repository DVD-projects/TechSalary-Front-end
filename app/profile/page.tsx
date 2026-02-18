"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { UserService } from "@/lib/api/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { UserCog, Save, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { User } from "@/lib/api/types"

export default function ProfilePage() {

    const router = useRouter()
    const { toast } = useToast()
    const [user, setUser] = useState<User | null>(null)

    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
    })

    const [initialData, setInitialData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
    })

    // Load data from Local Storage on mount
    useEffect(() => {
        const storedData = localStorage.getItem("userData")
        if (storedData) {
            try {
                const user = JSON.parse(storedData)
                const parsedData = {
                    firstName: user.first_name || "",
                    lastName: user.last_name || "",
                    username: user.username || "",
                    email: user.email || "",
                }
                setFormData(parsedData)
                setInitialData(parsedData)
            } catch (e) {
                console.error("Failed to parse user data", e)
            }
        } else {
            logout()
        }
    }, [router])

    // Check if form has modifications
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userData")
        setUser(null)
        router.push("/login")
        window.location.reload() 
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)

        try {
            const updatedUser = await UserService.updateMe({
                first_name: formData.firstName,
                last_name: formData.lastName,
                username: formData.username,
                email: formData.email,
                is_active: true,
            })

            localStorage.setItem("userData", JSON.stringify(updatedUser))

            setInitialData({
                firstName: updatedUser.first_name || "",
                lastName: updatedUser.last_name || "",
                username: updatedUser.username || "",
                email: updatedUser.email || "",
            })

            toast({
                title: "Profile Updated",
                description: "Your information has been saved successfully.",
            })

            // Optional: Force reload to update Header immediately if it doesn't listen to storage events
            // window.location.reload() 

        } catch (err) {
            if (err instanceof Error) {
                toast({
                    title: "Update Failed",
                    description: err.message,
                    variant: "destructive",
                })

                localStorage.clear()
                router.push("/login")
            }
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl">
                <Link
                    href="/salaries"
                    className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>

                <Card className="border-border">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <UserCog className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-foreground">
                                    Profile Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage your personal information and account details.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Name Section */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            {/* Username Section */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    // onChange={handleChange}
                                    placeholder="johndoe"
                                    disabled
                                    className="bg-muted text-muted-foreground opacity-100"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    This is your public display name in the community.
                                </p>
                            </div>

                            {/* Email Section (Disabled) */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-muted text-muted-foreground opacity-100"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Please contact support to change your email address.
                                </p>
                            </div>

                            {/* Save Button - Only enabled if dirty and not saving */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={!isDirty || isSaving}
                                    className="min-w-[120px] gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

}