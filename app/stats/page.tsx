"use client"

import { useEffect, useState } from "react"
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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import {
    TrendingUp,
    Users,
    Globe,
    Briefcase,
    BarChart3,
    Calculator,
} from "lucide-react"

const API_BASE_URL = "https://20.197.82.255.nip.io"
const ALL_VALUE = "__all__"

type FiltersResponse = {
    countries: string[]
    roles: string[]
}

type SummaryResponse = {
    total_entries: number
    average_salary: number | null
    median_salary: number | null
}

type PercentilesResponse = {
    p25_salary: number | null
    p50_salary: number | null
    p75_salary: number | null
    p90_salary: number | null
}

type ExperienceBucketItem = {
    experience_range: string
    count: number
    average_salary: number | null
}

type TopRoleItem = {
    job_title: string
    average_salary: number
    count: number
}

type CountrySubmissionItem = {
    country: string
    count: number
}

function formatSalary(value: number | null | undefined, currency = "LKR") {
    if (value === null || value === undefined) return "N/A"

    try {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(value)
    } catch {
        return `${currency} ${Math.round(value).toLocaleString()}`
    }
}

function buildQuery(country: string, role: string) {
    const params = new URLSearchParams()

    if (country !== ALL_VALUE) {
        params.append("location", country)
    }

    if (role !== ALL_VALUE) {
        params.append("job_title", role)
    }

    const query = params.toString()
    return query ? `?${query}` : ""
}

export default function StatsPage() {
    const [filterCountry, setFilterCountry] = useState(ALL_VALUE)
    const [filterRole, setFilterRole] = useState(ALL_VALUE)

    const [filters, setFilters] = useState<FiltersResponse>({
        countries: [],
        roles: [],
    })

    const [summary, setSummary] = useState<SummaryResponse | null>(null)
    const [percentiles, setPercentiles] = useState<PercentilesResponse | null>(null)
    const [byExperience, setByExperience] = useState<ExperienceBucketItem[]>([])
    const [byRole, setByRole] = useState<TopRoleItem[]>([])
    const [byCountry, setByCountry] = useState<CountrySubmissionItem[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/stats/filters`)
                if (!res.ok) {
                    throw new Error("Failed to load filters")
                }

                const data: FiltersResponse = await res.json()
                setFilters(data)
            } catch (err) {
                setError("Failed to load filter options")
            }
        }

        fetchFilters()
    }, [])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                setError(null)

                const query = buildQuery(filterCountry, filterRole)

                const [
                    summaryRes,
                    percentilesRes,
                    byExperienceRes,
                    byRoleRes,
                    byCountryRes,
                ] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/v1/stats/summary${query}`),
                    fetch(`${API_BASE_URL}/api/v1/stats/percentiles${query}`),
                    fetch(`${API_BASE_URL}/api/v1/stats/by-experience${query}`),
                    fetch(`${API_BASE_URL}/api/v1/stats/top-roles${query}`),
                    fetch(`${API_BASE_URL}/api/v1/stats/submissions-by-country${query}`),
                ])

                if (
                    !summaryRes.ok ||
                    !percentilesRes.ok ||
                    !byExperienceRes.ok ||
                    !byRoleRes.ok ||
                    !byCountryRes.ok
                ) {
                    throw new Error("Failed to load dashboard data")
                }

                const summaryData: SummaryResponse = await summaryRes.json()
                const percentilesData: PercentilesResponse = await percentilesRes.json()
                const byExperienceData: ExperienceBucketItem[] = await byExperienceRes.json()
                const byRoleData: TopRoleItem[] = await byRoleRes.json()
                const byCountryData: CountrySubmissionItem[] = await byCountryRes.json()

                setSummary(summaryData)
                setPercentiles(percentilesData)
                setByExperience(byExperienceData)
                setByRole(byRoleData)
                setByCountry(byCountryData)
            } catch (err) {
                setError("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [filterCountry, filterRole])

    const totalEntries = summary?.total_entries ?? 0
    const hasData = totalEntries > 0

    if (loading && !summary) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                <p className="text-muted-foreground">Loading statistics...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
                    Salary Statistics
                </h1>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                    Aggregated salary insights including averages, medians, and percentiles across locations and roles.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

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
                                {filters.countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
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
                                {filters.roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Badge variant="secondary" className="h-10 px-4 text-sm">
                            {totalEntries} entries
                        </Badge>
                    </div>
                </div>
            </div>

            {!hasData ? (
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
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-border">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Entries</p>
                                    <p className="text-2xl font-bold text-foreground font-mono">
                                        {summary?.total_entries ?? 0}
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
                                        Average Salary
                                    </p>
                                    <p className="text-2xl font-bold text-foreground font-mono">
                                        {formatSalary(summary?.average_salary, "LKR")}
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
                                        Median Salary
                                    </p>
                                    <p className="text-2xl font-bold text-foreground font-mono">
                                        {formatSalary(summary?.median_salary, "LKR")}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-8 border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Salary Percentiles
                            </CardTitle>
                            <CardDescription>
                                Distribution of salary across the filtered dataset.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        25th Percentile
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-foreground font-mono">
                                        {formatSalary(percentiles?.p25_salary, "LKR")}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        50th (Median)
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-foreground font-mono">
                                        {formatSalary(percentiles?.p50_salary, "LKR")}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        75th Percentile
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-foreground font-mono">
                                        {formatSalary(percentiles?.p75_salary, "LKR")}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        90th Percentile
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-foreground font-mono">
                                        {formatSalary(percentiles?.p90_salary, "LKR")}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">
                                    Average Salary by Experience Range
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={byExperience}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 89%)" />
                                            <XAxis
                                                dataKey="experience_range"
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
                                                    "Average Salary",
                                                ]}
                                            />
                                            <Bar
                                                dataKey="average_salary"
                                                fill="hsl(199, 89%, 48%)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

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
                                                dataKey="job_title"
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
                                                    "Average Salary",
                                                ]}
                                            />
                                            <Bar
                                                dataKey="average_salary"
                                                fill="hsl(160, 84%, 39%)"
                                                radius={[0, 4, 4, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border lg:col-span-2">
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
                            {item.count} {item.count === 1 ? "entry" : "entries"}
                          </span>
                                                </div>
                                                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${byCountry.length > 0 ? (item.count / byCountry[0].count) * 100 : 0}%`,
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