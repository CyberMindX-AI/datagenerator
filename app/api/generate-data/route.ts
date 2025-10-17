import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { fetchRealData } from "@/lib/real-data-fetcher"

export async function POST(request: NextRequest) {
  try {
    const { dataType, prompt, rows } = await request.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Please provide a data description" }, { status: 400 })
    }

    const rowCount = Math.min(Math.max(1, rows || 10), 100) // Limit to 100 rows

    if (dataType === "mock") {
      const { object } = await generateObject({
        model: "google/gemini-2.0-flash-exp",
        schema: z.object({
          fields: z.array(z.string()).describe("Array of field names for the data"),
          data: z.array(z.record(z.any())).describe(`Array of ${rowCount} data objects with the specified fields`),
        }),
        prompt: `You are a mock data generator. Generate realistic but fake data based on the user's description. Create ${rowCount} rows of data with appropriate field names and realistic values.\n\nUser request: ${prompt}\n\nGenerate exactly ${rowCount} rows of data.`,
      })

      if (!object.data || object.data.length === 0) {
        return NextResponse.json(
          { error: "Failed to generate mock data. Please try a different description." },
          { status: 500 },
        )
      }

      return NextResponse.json({ data: object.data })
    } else {
      try {
        const result = await fetchRealData(prompt, rowCount)
        return NextResponse.json({
          data: result.data,
          source: result.source,
        })
      } catch (error) {
        console.error("[v0] Error fetching real data:", error)
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch real data. Please try a different description or check if the data source is available.",
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("[v0] Error in generate-data API:", error)
    return NextResponse.json({ error: "Failed to generate data. Please try again." }, { status: 500 })
  }
}
