"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SalaryCard, type SalaryEntry } from "@/components/salary-card"
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react"

const ALL_VALUE = "__all__"
const API_BASE =
  process.env.NEXT_PUBLIC_SALARY_API_URL || "http://localhost:8010/api/v1/salary"

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<SalaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState(ALL_VALUE)
  const [company, setCompany] = useState(ALL_VALUE)
  const [status, setStatus] = useState(ALL_VALUE)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "highest">("newest")

  useEffect(() => {
    async function loadSalaries() {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE}/all`, { cache: "no-store" })

        if (!response.ok) {
          throw new Error("Failed to load salaries")
        }

        const data = await response.json()
        setSalaries(data)
      } catch (err) {
        setError("Failed to load salaries")
      } finally {
        setLoading(false)
      }
    }

    loadSalaries()
  }, [])

  const locations = useMemo(() => {
    return Array.from(new Set(salaries.map((s) => s.location).filter(Boolean)))
  }, [salaries])

  const companies = useMemo(() => {
    return Array.from(new Set(salaries.map((s) => s.company).filter(Boolean)))
  }, [salaries])

  const filtered = useMemo(() => {
    let result = salaries

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.job_title.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
      )
    }

    if (location !== ALL_VALUE) {
      result = result.filter((s) => s.location === location)
    }

    if (company !== ALL_VALUE) {
      result = result.filter((s) => s.company === company)
    }

    if (status !== ALL_VALUE) {
      result = result.filter((s) => s.status === status)
    }

    if (sortBy === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else {
      result = [...result].sort((a, b) => b.salary_amount - a.salary_amount)
    }

    return result
  }, [salaries, search, location, company, status, sortBy])

  const activeFilters = [location, company, status].filter(
    (v) => v !== ALL_VALUE
  ).length

  function clearFilters() {
    setSearch("")
    setLocation(ALL_VALUE)
    setCompany(ALL_VALUE)
    setStatus(ALL_VALUE)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
          Browse Salaries
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Explore real salary submissions from the platform.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by job title, company, or location..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <Badge className="h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilters}
                </Badge>
              )}
            </Button>

            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as "newest" | "highest")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="highest">Highest Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Locations</SelectItem>
                    {locations.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Company</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Companies</SelectItem>
                    {companies.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Statuses</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="APPROVED">APPROVED</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFilters > 0 && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {salaries.length} entries
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Loading salaries...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-card p-8 text-center text-destructive">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.length > 0 ? (
            filtered.map((entry) => <SalaryCard key={entry.id} entry={entry} />)
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <Search className="mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                No salaries found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}