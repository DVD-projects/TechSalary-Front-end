"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_BASE =
  process.env.NEXT_PUBLIC_SALARY_API_URL || "https://20.197.82.255.nip.io/api/v1/salary"

export function SalarySubmissionForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    role: "",
    company: "",
    location: "",
    salary: "",
    currency: "LKR",
    experience: "",
    isAnonymous: true,
  })

  function updateField(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    try {
      setLoading(true)

      const payload = {
        job_title: formData.role,
        company: formData.company || "Anonymous",
        location: formData.location,
        salary_amount: Number(formData.salary),
        currency: formData.currency,
        years_experience: Number(formData.experience),
        is_anonymous: formData.isAnonymous,
      }

      const response = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Submission failed")
      }

      setSubmitted(true)
    } catch (error) {
      alert("Failed to submit salary")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-3">
          Salary submitted successfully
        </h2>
        <p className="text-muted-foreground">
          Thank you for contributing to salary transparency.
        </p>
      </div>
    )
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Salary</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">

        <div>
          <Label>Job Title</Label>
          <Input
            value={formData.role}
            onChange={(e) => updateField("role", e.target.value)}
          />
        </div>

        <div>
          <Label>Company</Label>
          <Input
            value={formData.company}
            onChange={(e) => updateField("company", e.target.value)}
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input
            placeholder="e.g. Colombo"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </div>

        <div>
          <Label>Salary</Label>
          <Input
            type="number"
            value={formData.salary}
            onChange={(e) => updateField("salary", e.target.value)}
          />
        </div>

        <div>
          <Label>Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(v) => updateField("currency", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="LKR">LKR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Years of Experience</Label>
          <Input
            type="number"
            value={formData.experience}
            onChange={(e) => updateField("experience", e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.isAnonymous}
            onChange={(e) => updateField("isAnonymous", e.target.checked)}
          />
          Anonymous submission
        </label>

        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Salary"}
        </Button>

      </CardContent>
    </Card>
  )
}