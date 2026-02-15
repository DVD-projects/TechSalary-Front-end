"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  getMockSalaries,
  formatSalary,
  COUNTRIES,
  ROLES,
  type SalaryEntry,
} from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Users,
  Globe,
  Briefcase,
  BarChart3,
  Calculator,
} from "lucide-react"

const ALL_VALUE = "__all__"

const CHART_COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(160, 84%, 39%)",
  "hsl(215, 25%, 27%)",
  "hsl(43, 96%, 56%)",
  "hsl(0, 84%, 60%)",
]

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

function median(arr: number[]): number {
  return percentile(arr, 50)
}

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export default function StatsPage() {
  const salaries = getMockSalaries()
  const [filterCountry, setFilterCountry] = useState(ALL_VALUE)
  const [filterRole, setFilterRole] = useState(ALL_VALUE)

  const filtered = useMemo(() => {
    let result = salaries
    if (filterCountry !== ALL_VALUE) {
      result = result.filter((s) => s.country === filterCountry)
    }
    if (filterRole !== ALL_VALUE) {
      result = result.filter((s) => s.role === filterRole)
    }
    return result
  }, [salaries, filterCountry, filterRole])

  // Aggregate stats
  const stats = useMemo(() => {
    if (filtered.length === 0) {
      return {
        count: 0,
        avgBase: 0,
        medianBase: 0,
        avgTotal: 0,
        medianTotal: 0,
        p25: 0,
        p75: 0,
        p90: 0,
        dominantCurrency: "USD",
      }
    }

    const bases = filtered.map((s) => s.baseSalary)
    const totals = filtered.map((s) => s.totalCompensation)
    const currencyCounts = filtered.reduce(
      (acc, s) => {
        acc[s.currency] = (acc[s.currency] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const dominantCurrency = Object.entries(currencyCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0]

    return {
      count: filtered.length,
      avgBase: Math.round(average(bases)),
      medianBase: Math.round(median(bases)),
      avgTotal: Math.round(average(totals)),
      medianTotal: Math.round(median(totals)),
      p25: Math.round(percentile(totals, 25)),
      p75: Math.round(percentile(totals, 75)),
      p90: Math.round(percentile(totals, 90)),
      dominantCurrency,
    }
  }, [filtered])

  // Charts data - By Experience Level
  const byExperience = useMemo(() => {
    const levels = ["Junior", "Mid", "Senior", "Lead", "Principal", "Staff"]
    return levels
      .map((level) => {
        const entries = filtered.filter((s) => s.experienceLevel === level)
        if (entries.length === 0)
          return { level, avgTotal: 0, count: 0 }
        return {
          level,
          avgTotal: Math.round(
            entries.reduce((sum, s) => sum + s.totalCompensation, 0) /
              entries.length
          ),
          count: entries.length,
        }
      })
      .filter((d) => d.count > 0)
  }, [filtered])

  // By Country
  const byCountry = useMemo(() => {
    const grouped: Record<string, SalaryEntry[]> = {}
    for (const s of filtered) {
      if (!grouped[s.country]) grouped[s.country] = []
      grouped[s.country].push(s)
    }
    return Object.entries(grouped)
      .map(([country, entries]) => ({
        country,
        count: entries.length,
        avgTotal: Math.round(
          entries.reduce((sum, s) => sum + s.totalCompensation, 0) /
            entries.length
        ),
      }))
      .sort((a, b) => b.count - a.count)
  }, [filtered])

  // Remote distribution
  const remoteDistribution = useMemo(() => {
    const grouped: Record<string, number> = {}
    for (const s of filtered) {
      grouped[s.remotePolicy] = (grouped[s.remotePolicy] || 0) + 1
    }
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [filtered])

  // By Role
  const byRole = useMemo(() => {
    const grouped: Record<string, SalaryEntry[]> = {}
    for (const s of filtered) {
      if (!grouped[s.role]) grouped[s.role] = []
      grouped[s.role].push(s)
    }
    return Object.entries(grouped)
      .map(([role, entries]) => ({
        role,
        count: entries.length,
        avgTotal: Math.round(
          entries.reduce((sum, s) => sum + s.totalCompensation, 0) /
            entries.length
        ),
      }))
      .sort((a, b) => b.avgTotal - a.avgTotal)
      .slice(0, 8)
  }, [filtered])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
          Salary Statistics
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Aggregated salary insights including averages, medians, and
          percentiles across locations and roles.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label>Filter by Country</Label>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
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
            <Label>Filter by Role</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
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
          <div className="flex items-end">
            <Badge variant="secondary" className="h-10 px-4 text-sm">
              {filtered.length} entries
            </Badge>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <BarChart3 className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            No data available
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters to see statistics.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {stats.count}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Total Comp
                  </p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatSalary(stats.avgTotal, stats.dominantCurrency)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Median Total Comp
                  </p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatSalary(stats.medianTotal, stats.dominantCurrency)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10">
                  <Briefcase className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Base Salary
                  </p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatSalary(stats.avgBase, stats.dominantCurrency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Percentile Breakdown */}
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Total Compensation Percentiles
              </CardTitle>
              <CardDescription>
                Distribution of total compensation across the dataset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    25th Percentile
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground font-mono">
                    {formatSalary(stats.p25, stats.dominantCurrency)}
                  </p>
                </div>
                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    50th (Median)
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground font-mono">
                    {formatSalary(stats.medianTotal, stats.dominantCurrency)}
                  </p>
                </div>
                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    75th Percentile
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground font-mono">
                    {formatSalary(stats.p75, stats.dominantCurrency)}
                  </p>
                </div>
                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    90th Percentile
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground font-mono">
                    {formatSalary(stats.p90, stats.dominantCurrency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* By Experience Level */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Average Compensation by Experience Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byExperience}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 89%)" />
                      <XAxis
                        dataKey="level"
                        tick={{ fontSize: 12, fill: "hsl(215, 12%, 50%)" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(215, 12%, 50%)" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 18%, 89%)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [
                          value.toLocaleString(),
                          "Avg Total Comp",
                        ]}
                      />
                      <Bar
                        dataKey="avgTotal"
                        fill="hsl(199, 89%, 48%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Remote Distribution */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Work Model Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={remoteDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {remoteDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${
                              // biome-ignore lint/suspicious/noArrayIndexKey: chart cells
                              index
                            }`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* By Role */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Top Paying Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byRole} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 89%)" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: "hsl(215, 12%, 50%)" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="role"
                        width={140}
                        tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 18%, 89%)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [
                          value.toLocaleString(),
                          "Avg Total Comp",
                        ]}
                      />
                      <Bar
                        dataKey="avgTotal"
                        fill="hsl(160, 84%, 39%)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* By Country */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe className="h-5 w-5 text-primary" />
                  Submissions by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {byCountry.map((item, i) => (
                    <div key={item.country} className="flex items-center gap-3">
                      <span className="w-6 text-right text-sm font-medium text-muted-foreground">
                        {i + 1}.
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {item.country}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.count}{" "}
                            {item.count === 1 ? "entry" : "entries"}
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${(item.count / byCountry[0].count) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
