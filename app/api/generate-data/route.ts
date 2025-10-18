import { type NextRequest, NextResponse } from "next/server"
import { fetchRealData } from "@/lib/real-data-fetcher"
import { generateMockData } from "@/lib/mock-data-generator"

export async function POST(request: NextRequest) {
  try {
    const { dataType, prompt, rows } = await request.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Please provide a data description" }, { status: 400 })
    }

    const rowCount = Math.min(Math.max(1, rows || 10), 100) // Limit to 100 rows

    if (dataType === "mock") {
      // Check if API key is configured for mock data (requires Gemini AI)
      const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!apiKey) {
        return NextResponse.json(
          { error: "Gemini API key not configured. Mock data generation requires GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in your environment variables." },
          { status: 500 }
        )
      }
      try {
        const result = await generateMockData(prompt, rowCount)
        return NextResponse.json({ 
          data: result.data,
          fields: result.fields,
          source: "AI Generated Mock Data"
        })
      } catch (error) {
        console.error("[v0] Error generating mock data:", error)
        return NextResponse.json(
          {
            error: error instanceof Error 
              ? error.message 
              : "Failed to generate mock data. Please try a different description."
          },
          { status: 500 }
        )
      }
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
