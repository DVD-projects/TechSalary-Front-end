"use client"

import { useState } from "react"
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
  type SalaryEntry,
  formatSalary,
  getNetScore,
  isApproved,
} from "@/lib/mock-data"
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
  const [votes, setVotes] = useState({ up: entry.upvotes, down: entry.downvotes })
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [reported, setReported] = useState(false)

  function handleVote(type: "up" | "down") {
    if (!isLoggedIn) return
    if (userVote === type) {
      setVotes((prev) => ({
        ...prev,
        [type]: prev[type] - 1,
      }))
      setUserVote(null)
    } else {
      setVotes((prev) => ({
        ...prev,
        [type]: prev[type] + (userVote === null ? 1 : 1),
        ...(userVote !== null && userVote !== type
          ? { [userVote]: prev[userVote as "up" | "down"] - 1 }
          : {}),
      }))
      setUserVote(type)
    }
  }

  const approved = isApproved({ ...entry, upvotes: votes.up, downvotes: votes.down })
  const netScore = getNetScore({ ...entry, upvotes: votes.up, downvotes: votes.down })

  return (
    <Card className="border-border transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left side - Info */}
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

          {/* Right side - Compensation */}
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

        {/* Bottom - Voting & Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={userVote === "up" ? "default" : "outline"}
                    size="sm"
                    className="h-8 gap-1 px-3"
                    onClick={() => handleVote("up")}
                    disabled={!isLoggedIn}
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
                    disabled={!isLoggedIn}
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
              {netScore > 0 ? "+" : ""}
              {netScore} net
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {entry.submittedAt}
            </span>
            {isLoggedIn && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${reported ? "text-destructive" : "text-muted-foreground"}`}
                      onClick={() => setReported(!reported)}
                    >
                      <Flag className="h-3.5 w-3.5" />
                      <span className="sr-only">Report</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {reported ? "Reported" : "Report this entry"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {!isLoggedIn && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to vote on accuracy or report this entry.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
