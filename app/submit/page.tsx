import { SalarySubmissionForm } from "@/components/salary-submission-form"

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
          Submit Your Salary
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Contribute anonymously to salary transparency in the tech industry.
        </p>
      </div>
      <SalarySubmissionForm />
    </div>
  )
}
