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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  COUNTRIES,
  ROLES,
  COMPANIES,
  EXPERIENCE_LEVELS,
  CURRENCIES,
} from "@/lib/mock-data"
import { CheckCircle, Shield, ArrowRight, Briefcase, MapPin, DollarSign } from "lucide-react"

const TECH_OPTIONS = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "C#",
  "Ruby", "PHP", "Swift", "Kotlin", "Scala", "React", "Vue", "Angular",
  "Node.js", "Django", "Spring Boot", "AWS", "Azure", "GCP", "Docker",
  "Kubernetes", "PostgreSQL", "MongoDB", "Redis", "GraphQL",
]

export function SalarySubmissionForm() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [formData, setFormData] = useState({
    role: "",
    company: "",
    customCompany: "",
    country: "",
    city: "",
    experienceLevel: "",
    yearsOfExperience: "",
    baseSalary: "",
    currency: "",
    bonuses: "",
    stockOptions: "",
    employmentType: "",
    remotePolicy: "",
  })

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function toggleTech(tech: string) {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  function handleSubmit() {
    setSubmitted(true)
  }

  function canProceedStep1() {
    return formData.role && formData.country && formData.experienceLevel
  }

  function canProceedStep2() {
    return formData.baseSalary && formData.currency
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Salary Submitted Successfully
        </h2>
        <p className="mb-6 max-w-md text-muted-foreground leading-relaxed">
          Thank you for contributing to salary transparency. Your submission is
          anonymous and will be available for the community to review.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false)
              setStep(1)
              setFormData({
                role: "",
                company: "",
                customCompany: "",
                country: "",
                city: "",
                experienceLevel: "",
                yearsOfExperience: "",
                baseSalary: "",
                currency: "",
                bonuses: "",
                stockOptions: "",
                employmentType: "",
                remotePolicy: "",
              })
              setSelectedTech([])
            }}
          >
            Submit Another
          </Button>
          <Button asChild>
            <a href="/salaries">Browse Salaries</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s < step) setStep(s)
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <CheckCircle className="h-4 w-4" /> : s}
            </button>
            {s < 3 && (
              <div
                className={`h-0.5 w-12 rounded-full ${
                  s < step ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {step === 1 && "Step 1 of 3 -- Role & Location"}
          {step === 2 && "Step 2 of 3 -- Compensation"}
          {step === 3 && "Step 3 of 3 -- Additional Details"}
        </p>
      </div>

      {/* Step 1: Role & Location */}
      {step === 1 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Briefcase className="h-5 w-5 text-primary" />
              Role & Location
            </CardTitle>
            <CardDescription>
              Tell us about your position and where you work.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Job Title *</Label>
              <Select value={formData.role} onValueChange={(v) => updateField("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="company">Company</Label>
              <Select
                value={formData.company}
                onValueChange={(v) => updateField("company", v)}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                  <SelectItem value="__other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formData.company === "__other" && (
                <Input
                  placeholder="Enter company name"
                  value={formData.customCompany}
                  onChange={(e) => updateField("customCompany", e.target.value)}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(v) => updateField("country", v)}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Colombo, London"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(v) => updateField("experienceLevel", v)}
                >
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="yoe">Years of Experience</Label>
                <Input
                  id="yoe"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g. 5"
                  value={formData.yearsOfExperience}
                  onChange={(e) => updateField("yearsOfExperience", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1()}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Compensation */}
      {step === 2 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              Compensation
            </CardTitle>
            <CardDescription>
              Enter your annual compensation details.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => updateField("currency", v)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="baseSalary">Base Salary (Annual) *</Label>
              <Input
                id="baseSalary"
                type="number"
                min="0"
                placeholder="e.g. 120000"
                value={formData.baseSalary}
                onChange={(e) => updateField("baseSalary", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bonuses">Annual Bonuses</Label>
                <Input
                  id="bonuses"
                  type="number"
                  min="0"
                  placeholder="e.g. 15000"
                  value={formData.bonuses}
                  onChange={(e) => updateField("bonuses", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="stock">Stock / RSU (Annual)</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="e.g. 30000"
                  value={formData.stockOptions}
                  onChange={(e) => updateField("stockOptions", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Estimated Total Compensation
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground font-mono">
                {formData.currency || "---"}{" "}
                {(
                  (Number(formData.baseSalary) || 0) +
                  (Number(formData.bonuses) || 0) +
                  (Number(formData.stockOptions) || 0)
                ).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2()}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Additional Details */}
      {step === 3 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              Additional Details
            </CardTitle>
            <CardDescription>
              Help the community with extra context (all optional).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(v) => updateField("employmentType", v)}
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="remotePolicy">Remote Policy</Label>
                <Select
                  value={formData.remotePolicy}
                  onValueChange={(v) => updateField("remotePolicy", v)}
                >
                  <SelectTrigger id="remotePolicy">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tech Stack</Label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech) => (
                  <Badge
                    key={tech}
                    variant={selectedTech.includes(tech) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Your submission is anonymous
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No personal information is collected. Your IP address is not
                  stored. The community will vote on the accuracy of your
                  submission.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                Submit Salary
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
