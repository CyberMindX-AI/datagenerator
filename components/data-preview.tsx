"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataPreviewProps {
  data: any[]
  format: string
  domain: string
}

export function DataPreview({ data, format, domain }: DataPreviewProps) {
  const previewData = data.slice(0, 5)

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Data Preview</CardTitle>
        <CardDescription className="text-muted-foreground">
          Showing first 5 rows of {data.length} total rows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border border-border bg-background p-4">
          <pre className="font-mono text-sm text-foreground">{JSON.stringify(previewData, null, 2)}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
