"use client"

import { useState, useMemo } from "react"
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
import { SalaryCard } from "@/components/salary-card"
import {
  getMockSalaries,
  COUNTRIES,
  ROLES,
  COMPANIES,
  EXPERIENCE_LEVELS,
} from "@/lib/mock-data"
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react"

const ALL_VALUE = "__all__"

export default function SalariesPage() {
  const salaries = getMockSalaries()
  const [search, setSearch] = useState("")
  const [country, setCountry] = useState(ALL_VALUE)
  const [role, setRole] = useState(ALL_VALUE)
  const [company, setCompany] = useState(ALL_VALUE)
  const [experienceLevel, setExperienceLevel] = useState(ALL_VALUE)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "most-voted">("newest")

  const filtered = useMemo(() => {
    let result = salaries

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.role.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.techStack.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (country !== ALL_VALUE) {
      result = result.filter((s) => s.country === country)
    }
    if (role !== ALL_VALUE) {
      result = result.filter((s) => s.role === role)
    }
    if (company !== ALL_VALUE) {
      result = result.filter((s) => s.company === company)
    }
    if (experienceLevel !== ALL_VALUE) {
      result = result.filter((s) => s.experienceLevel === experienceLevel)
    }

    if (sortBy === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
    } else if (sortBy === "highest") {
      result = [...result].sort(
        (a, b) => b.totalCompensation - a.totalCompensation
      )
    } else {
      result = [...result].sort(
        (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      )
    }

    return result
  }, [salaries, search, country, role, company, experienceLevel, sortBy])

  const activeFilters = [country, role, company, experienceLevel].filter(
    (v) => v !== ALL_VALUE
  ).length

  function clearFilters() {
    setSearch("")
    setCountry(ALL_VALUE)
    setRole(ALL_VALUE)
    setCompany(ALL_VALUE)
    setExperienceLevel(ALL_VALUE)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
          Browse Salaries
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Explore {salaries.length} community-submitted tech salaries from
          around the world.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by role, company, country, or tech..."
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
              onValueChange={(v) => setSortBy(v as typeof sortBy)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="highest">Highest Salary</SelectItem>
                <SelectItem value="most-voted">Most Voted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Countries</SelectItem>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Roles</SelectItem>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
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
                    {COMPANIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Experience Level</Label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Levels</SelectItem>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
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

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {salaries.length} entries
        </p>
        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-2">
            {country !== ALL_VALUE && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => setCountry(ALL_VALUE)}
              >
                {country} <X className="h-3 w-3" />
              </Badge>
            )}
            {role !== ALL_VALUE && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => setRole(ALL_VALUE)}
              >
                {role} <X className="h-3 w-3" />
              </Badge>
            )}
            {company !== ALL_VALUE && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => setCompany(ALL_VALUE)}
              >
                {company} <X className="h-3 w-3" />
              </Badge>
            )}
            {experienceLevel !== ALL_VALUE && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => setExperienceLevel(ALL_VALUE)}
              >
                {experienceLevel} <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Salary Cards */}
      <div className="flex flex-col gap-4">
        {filtered.length > 0 ? (
          filtered.map((entry) => (
            <SalaryCard key={entry.id} entry={entry} />
          ))
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
    </div>
  )
}
