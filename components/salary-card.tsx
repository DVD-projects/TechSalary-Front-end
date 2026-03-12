"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  BadgeCheck,
  XCircle,
  CircleDashed,
} from "lucide-react"

export interface SalaryEntry {
  id: number
  job_title: string
  company: string
  location: string
  salary_amount: number
  currency: string
  years_experience: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  is_anonymous: boolean
  created_at: string
}

interface SalaryCardProps {
  entry: SalaryEntry
}

function formatSalary(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString()}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

export function SalaryCard({ entry }: SalaryCardProps) {
  return (
    <Card className="border-border transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {entry.job_title}
              </h3>

              {entry.status === "APPROVED" && (
                <Badge className="gap-1 bg-success text-success-foreground hover:bg-success/90">
                  <BadgeCheck className="h-3 w-3" />
                  Approved
                </Badge>
              )}

              {entry.status === "PENDING" && (
                <Badge variant="secondary" className="gap-1">
                  <CircleDashed className="h-3 w-3" />
                  Pending
                </Badge>
              )}

              {entry.status === "REJECTED" && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Rejected
                </Badge>
              )}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {entry.company}
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {entry.location}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {entry.years_experience} yrs experience
              </span>

              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {entry.is_anonymous ? "Anonymous submission" : "Named company"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 sm:text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Salary
              </p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatSalary(entry.salary_amount, entry.currency)}
              </p>
            </div>

            <span className="text-xs text-muted-foreground">
              Submitted on {formatDate(entry.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}