import { DataGeneratorForm } from "@/components/data-generator-form"
import { Database, FileJson, FileSpreadsheet } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-mono text-xl font-semibold text-foreground">Data Generator</h1>
              <p className="text-sm text-muted-foreground">Generate mock and real data instantly</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card/30 to-transparent">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-balance font-sans text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Generate Data for Your Projects
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Create realistic mock data or fetch real data from APIs. Export in CSV, JSON, or Excel formats across
              multiple domains including finance, healthcare, ecommerce, and IoT.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileJson className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">Multiple Formats</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Export your data in CSV, JSON, or Excel formats with proper formatting and structure.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Database className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">Multiple Domains</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Generate data for finance, healthcare, ecommerce, and IoT use cases with realistic fields.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                <FileSpreadsheet className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">Mock & Real Data</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Choose between generated mock data or fetch real data from external APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <DataGeneratorForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}
