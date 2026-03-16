"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  type SalaryEntry,
  formatSalary,
  getNetScore,
  isApproved,
} from "@/lib/mock-data"

import { VoteService, type VoteType } from "@/lib/api/vote"
import { ReportService } from "@/lib/api/report"

import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  BadgeCheck,
  XCircle,
  CircleDashed,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Wifi,
} from "lucide-react"

import Link from "next/link"

/**
 * ⭐ FINAL MERGED SalaryEntry MODEL
 * Combines fields from your branch + main branch
 */
export interface MergedSalaryEntry extends SalaryEntry {
  job_title: string
  company: string
  location: string
  salary_amount: number
  currency: string
  years_experience: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  is_anonymous: boolean
  created_at: string

  // main branch fields
  upvotes?: number
  downvotes?: number
  city?: string
  country?: string
  experienceLevel?: string
  remotePolicy?: string
  techStack?: string[]
}

interface SalaryCardProps {
  entry: MergedSalaryEntry
}

export function SalaryCard({ entry }: SalaryCardProps) {
  const { isLoggedIn } = useAuth()

  // Voting state
  const [votes, setVotes] = useState({
    up: entry.upvotes ?? 0,
    down: entry.downvotes ?? 0,
  })
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  // Report state
  const [reportOpen, setReportOpen] = useState(false)
  const [reportText, setReportText] = useState("")
  const [reported, setReported] = useState(false)

  // Handle Votes
  async function handleVote(type: VoteType) {
    if (!isLoggedIn) return

    const res = await VoteService.vote(entry.id, type)
    if (!res.success) return

    setVotes({
      up: res.data.upvotes,
      down: res.data.downvotes,
    })
    setUserVote(type)
  }

  // Handle Report
  async function handleReport() {
    if (!reportText.trim()) return

    const res = await ReportService.report(entry.id, reportText)
    if (res.success) {
      setReported(true)
      setReportOpen(false)
    }
  }

  const netScore = useMemo(() => getNetScore(entry), [entry])
  const approved = useMemo(() => isApproved(entry), [entry])

  //
  // ⭐ STATUS BADGE (your branch)
  //
  function statusBadge() {
    if (entry.status === "APPROVED")
      return (
        <Badge className="gap-1 bg-success text-success-foreground hover:bg-success/90">
          <BadgeCheck className="h-3 w-3" />
          Approved
        </Badge>
      )

    if (entry.status === "PENDING")
      return (
        <Badge variant="secondary" className="gap-1">
          <CircleDashed className="h-3 w-3" />
          Pending
        </Badge>
      )

    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    )
  }

  return (
    <>
      <Card className="border-border transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            {/* LEFT SIDE */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">

                {/* Job Title */}
                <h3 className="text-lg font-semibold text-foreground">
                  {entry.job_title}
                </h3>

                {/* Status Badge (your branch) */}
                {statusBadge()}

                {/* "Verified" badge (main branch) */}
                {approved && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className="gap-1 bg-success text-success-foreground hover:bg-success/90">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Community verified - voting threshold reached</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* COMPANY / LOCATION / EXPERIENCE */}
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">

                {/* Company */}
                {entry.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    <Link href={`/company/${entry.company}`} className="hover:underline">
                      {entry.company}
                    </Link>
                  </span>
                )}

                {/* Location */}
                <span className="flex items-center gap-1">
                  {entry.remotePolicy ? (
                    <Wifi className="h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}

                  {entry.city ? `${entry.city}, ` : ""}
                  {entry.country ?? entry.location}
                </span>

                {/* Experience (your branch) */}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {entry.years_experience} yrs experience
                </span>

                {/* Anonymous Flag */}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {entry.is_anonymous ? "Anonymous submission" : "Named company"}
                </span>
              </div>

              {/* Tech Stack (main branch) */}
              {entry.techStack && entry.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col items-end gap-2 sm:text-right">

              {/* SALARY */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Salary
                </p>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {formatSalary(entry.salary_amount, entry.currency)}
                </p>
              </div>

              {/* Created At */}
              <span className="text-xs text-muted-foreground">
                Submitted on {new Date(entry.created_at).toLocaleDateString()}
              </span>

              {/* VOTING */}
              <div className="flex items-center gap-3 mt-2">
                <Button
                  size="sm"
                  variant={userVote === "up" ? "default" : "outline"}
                  onClick={() => handleVote("up")}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> {votes.up}
                </Button>

                <Button
                  size="sm"
                  variant={userVote === "down" ? "default" : "outline"}
                  onClick={() => handleVote("down")}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> {votes.down}
                </Button>

                {/* REPORT BUTTON */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReportOpen(true)}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* REPORT DIALOG */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Salary Entry</DialogTitle>
            <DialogDescription>
              Tell us why this entry should be reviewed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the issue..."
            />
          </div>

          <DialogFooter>
            <Button onClick={handleReport}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}