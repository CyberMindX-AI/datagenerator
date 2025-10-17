import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { data, format, prompt } = await request.json()

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data to download" }, { status: 400 })
    }

    const sanitizedPrompt =
      prompt
        ?.slice(0, 30)
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase() || "data"

    let content: string | Buffer
    let contentType: string
    let filename: string

    if (format === "json") {
      content = JSON.stringify(data, null, 2)
      contentType = "application/json"
      filename = `${sanitizedPrompt}.json`
    } else if (format === "csv") {
      // Convert to CSV
      const headers = Object.keys(data[0]).join(",")
      const rows = data.map((row: any) =>
        Object.values(row)
          .map((val) => {
            // Handle null/undefined values
            if (val === null || val === undefined) return '""'
            // Escape quotes and wrap in quotes
            const stringVal = String(val).replace(/"/g, '""')
            return `"${stringVal}"`
          })
          .join(","),
      )
      content = [headers, ...rows].join("\n")
      contentType = "text/csv"
      filename = `${sanitizedPrompt}.csv`
    } else {
      // In production, use a library like xlsx for true Excel format
      const headers = Object.keys(data[0]).join(",")
      const rows = data.map((row: any) =>
        Object.values(row)
          .map((val) => {
            if (val === null || val === undefined) return '""'
            const stringVal = String(val).replace(/"/g, '""')
            return `"${stringVal}"`
          })
          .join(","),
      )
      content = [headers, ...rows].join("\n")
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      filename = `${sanitizedPrompt}.xlsx`
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error in download-data API:", error)
    return NextResponse.json({ error: "Failed to download data" }, { status: 500 })
  }
}
