import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  PlusCircle,
  BarChart3,
  Shield,
  ThumbsUp,
  Globe,
  ArrowRight,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react"

const STATS = [
  { label: "Salary Entries", value: "20+", icon: DollarSign },
  { label: "Countries", value: "15", icon: Globe },
  { label: "Companies", value: "25+", icon: Users },
  { label: "Community Votes", value: "250+", icon: ThumbsUp },
]

const FEATURES = [
  {
    title: "Anonymous Submissions",
    description:
      "Submit your salary data without creating an account. No personal information is collected or stored.",
    icon: Shield,
  },
  {
    title: "Community Verified",
    description:
      "Salaries are voted on by the community. Entries that reach a trust threshold receive a verified badge.",
    icon: ThumbsUp,
  },
  {
    title: "Global Coverage",
    description:
      "Compare salaries across countries, companies, and experience levels in the tech industry worldwide.",
    icon: Globe,
  },
  {
    title: "Data-Driven Insights",
    description:
      "View aggregated statistics including averages, medians, and percentiles for specific roles and locations.",
    icon: BarChart3,
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(199_89%_48%/0.08),transparent_50%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center lg:px-8 lg:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Community-driven salary transparency
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Know your worth in the tech industry
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Browse real salary data submitted anonymously by tech professionals
            worldwide. Contribute your own data to help the community make
            informed career decisions.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/salaries">
              <Button size="lg" className="gap-2 text-base">
                <Search className="h-5 w-5" />
                Browse Salaries
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline" className="gap-2 text-base bg-transparent">
                <PlusCircle className="h-5 w-5" />
                Submit Your Salary
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-muted/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 lg:grid-cols-4 lg:px-8">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground text-balance">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            A transparent, community-powered approach to salary data.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border-border transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col items-start p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Help build salary transparency
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground leading-relaxed">
            Your anonymous contribution helps thousands of tech professionals
            make informed career decisions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/submit">
              <Button size="lg" className="gap-2">
                Submit Your Salary
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/stats">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <BarChart3 className="h-4 w-4" />
                View Statistics
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
