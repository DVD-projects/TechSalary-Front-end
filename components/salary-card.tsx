"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
import { useToast } from "@/components/ui/use-toast"
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  BadgeCheck,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Wifi,
} from "lucide-react"
import Link from "next/link"

interface SalaryCardProps {
  entry: SalaryEntry
}

export function SalaryCard({ entry }: SalaryCardProps) {
  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [votes, setVotes] = useState({ up: entry.upvotes, down: entry.downvotes })
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [reported, setReported] = useState(false)
  const [status, setStatus] = useState<string>(entry.status || "PENDING")
  const [isVoting, setIsVoting] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [isReporting, setIsReporting] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  async function handleVote(type: "up" | "down") {
    if (!isLoggedIn || isVoting) return

    setIsVoting(true)

    const voteType: VoteType = type === "up" ? "UP" : "DOWN"

    try {
      const data =
        userVote === type
          ? await VoteService.deleteVote(entry.id, voteType)
          : await VoteService.createVote(entry.id, voteType)

      setVotes({
        up: data.up_votes,
        down: data.down_votes,
      })

      setUserVote(userVote === type ? null : type)
      if (data.status) {
        setStatus(data.status)
      }

      toast({
        title: userVote === type ? "Vote removed" : "Vote recorded",
        description: `Current net score: ${
          (data.score ?? data.up_votes - data.down_votes) >= 0 ? "+" : ""
        }${data.score ?? data.up_votes - data.down_votes} (${data.status ?? "PENDING"})`,
      })
    } catch (error) {
      console.error("Vote error:", error)
      toast({
        title: "Vote failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  function handleReportDialogChange(open: boolean) {
    setIsReportDialogOpen(open)
    if (!open) {
      setReportReason("")
      setReportError(null)
    }
  }

  async function handleReportSubmit() {
    if (!isLoggedIn || isReporting) return
    if (!reportReason.trim()) {
      setReportError("Please provide a reason for the report.")
      return
    }

    try {
      setIsReporting(true)
      const response = await ReportService.createReport(
        entry.id,
        reportReason.trim()
      )
      setReported(true)
      if (response.status) {
        setStatus(response.status)
      }
      setIsReportDialogOpen(false)
      toast({
        title: "Report submitted",
        description: response.status
          ? `Status updated to ${response.status}`
          : "Thanks for letting us know.",
      })
    } catch (error) {
      console.error("Report error:", error)
      setReportError(
        error instanceof Error ? error.message : "Failed to submit report."
      )
      toast({
        title: "Report failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReporting(false)
    }
  }

  const approved = isApproved({ ...entry, upvotes: votes.up, downvotes: votes.down })
  const netScore = getNetScore({ ...entry, upvotes: votes.up, downvotes: votes.down })

  const statusBadge = useMemo(() => {
    switch (status) {
      case "APPROVED":
        return { label: "Approved", variant: "default" as const }
      case "REJECTED":
        return { label: "Rejected", variant: "destructive" as const }
      case "REPORTED":
        return { label: "Reported", variant: "secondary" as const }
      default:
        return { label: "Pending", variant: "outline" as const }
    }
  }, [status])

  return (
    <Card className="border-border transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {entry.role}
              </h3>
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
                      <p>Community verified - reached voting threshold</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Badge
                variant={statusBadge.variant}
                className="gap-1"
              >
                {statusBadge.label}
              </Badge>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {entry.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {entry.company}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {entry.city ? `${entry.city}, ` : ""}
                {entry.country}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {entry.yearsOfExperience} yrs
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {entry.experienceLevel}
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="h-3.5 w-3.5" />
                {entry.remotePolicy}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {entry.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 sm:text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Compensation
              </p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatSalary(entry.totalCompensation, entry.currency)}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Base: {formatSalary(entry.baseSalary, entry.currency)}</span>
              {entry.bonuses > 0 && (
                <span>Bonus: {formatSalary(entry.bonuses, entry.currency)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={userVote === "up" ? "default" : "outline"}
                      size="sm"
                      className="h-8 gap-1 px-3"
                      onClick={() => handleVote("up")}
                      disabled={!isLoggedIn || isVoting}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {votes.up}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isLoggedIn
                      ? "This salary looks accurate"
                      : "Sign in to vote"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={userVote === "down" ? "destructive" : "outline"}
                      size="sm"
                      className="h-8 gap-1 px-3"
                      onClick={() => handleVote("down")}
                      disabled={!isLoggedIn || isVoting}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      {votes.down}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isLoggedIn
                      ? "This salary seems inaccurate"
                      : "Sign in to vote"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span
                className={`ml-1 text-xs font-medium ${
                  netScore > 0
                    ? "text-success"
                    : netScore < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                Net score: {netScore > 0 ? "+" : ""}
                {netScore}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {userVote ? `You voted ${userVote}` : "No vote yet"}
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-2">
              <span className="text-foreground">
                Net score: {netScore > 0 ? "+" : ""}
                {netScore}
              </span>
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in to vote
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {entry.submittedAt}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      reported ? "text-destructive" : "text-muted-foreground"
                    }`}
                    onClick={() =>
                      isLoggedIn ? setIsReportDialogOpen(true) : undefined
                    }
                    disabled={reported || !isLoggedIn}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span className="sr-only">Report</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {!isLoggedIn
                    ? "Sign in to report"
                    : reported
                    ? "Report submitted"
                    : "Report this entry"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Dialog open={isReportDialogOpen} onOpenChange={handleReportDialogChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report this salary entry</DialogTitle>
              <DialogDescription>
                Tell us why this salary submission should be reviewed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`report-${entry.id}`}>Reason</Label>
              <Textarea
                id={`report-${entry.id}`}
                placeholder="Provide a brief explanation..."
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              />
              {reportError && (
                <p className="text-sm text-destructive">{reportError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleReportDialogChange(false)}
                disabled={isReporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReportSubmit}
                disabled={isReporting || reportReason.trim().length === 0}
              >
                {isReporting ? "Submitting..." : "Submit report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
