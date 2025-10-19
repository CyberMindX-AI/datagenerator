import { type NextRequest, NextResponse } from "next/server"
import { fetchRealData } from "@/lib/real-data-fetcher"
import { generateMockData } from "@/lib/mock-data-generator"

export async function POST(request: NextRequest) {
  // Set timeout for the entire request
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 50000) // 50 second timeout

  try {
    const body = await request.json()
    const { dataType, prompt, rows } = body

    // Validate input
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      clearTimeout(timeoutId)
      return NextResponse.json({ 
        error: "Please provide a valid data description",
        details: "Prompt is required and must be a non-empty string"
      }, { status: 400 })
    }

    // Validate row count
    const rowCount = Math.min(Math.max(1, parseInt(rows) || 10), 100)
    if (isNaN(rowCount)) {
      clearTimeout(timeoutId)
      return NextResponse.json({ 
        error: "Invalid row count",
        details: "Rows must be a valid number between 1 and 100"
      }, { status: 400 })
    }

    if (dataType === "mock") {
      // Check if API key is configured for mock data (requires Gemini AI)
      const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!apiKey) {
        clearTimeout(timeoutId)
        return NextResponse.json(
          { 
            error: "API Configuration Error",
            details: "Gemini API key not configured. Mock data generation requires GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in your environment variables.",
            solution: "Please add your Google API key to the environment variables"
          },
          { status: 500 }
        )
      }
      
      try {
        const result = await generateMockData(prompt, rowCount)
        clearTimeout(timeoutId)
        return NextResponse.json({ 
          success: true,
          data: result.data,
          fields: result.fields,
          source: "AI Generated Mock Data",
          rowCount: result.data.length
        })
      } catch (error) {
        clearTimeout(timeoutId)
        console.error("[API] Error generating mock data:", error)
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('aborted')
        
        return NextResponse.json(
          {
            success: false,
            error: isTimeout ? "Request Timeout" : "Generation Failed",
            details: errorMessage,
            suggestion: isTimeout 
              ? "Try using a shorter or simpler prompt" 
              : "Please try a different description or check your API key"
          },
          { status: isTimeout ? 504 : 500 }
        )
      }
    } else {
      try {
        const result = await fetchRealData(prompt, rowCount)
        clearTimeout(timeoutId)
        return NextResponse.json({
          success: true,
          data: result.data,
          source: result.source,
          rowCount: result.data?.length || 0
        })
      } catch (error) {
        clearTimeout(timeoutId)
        console.error("[API] Error fetching real data:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Real Data Fetch Failed",
            details: error instanceof Error ? error.message : "Unknown error occurred",
            suggestion: "Please try a different description or check if the data source is available."
          },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error("[API] Error in generate-data API:", error)
    
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid Request Format",
        details: "Request body must be valid JSON",
        suggestion: "Please check your request format"
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "An unexpected error occurred",
      suggestion: "Please try again or contact support if the issue persists"
    }, { status: 500 })
  }
}
