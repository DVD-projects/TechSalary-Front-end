import { DollarSign } from "lucide-react"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <DollarSign className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">TechSalaries</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/salaries"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse Salaries
          </Link>
          <Link
            href="/submit"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Submit Salary
          </Link>
          <Link
            href="/stats"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Statistics
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          Community-driven salary data. All submissions are anonymous.
        </p>
      </div>
    </footer>
  )
}
