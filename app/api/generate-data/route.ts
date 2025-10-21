import { type NextRequest, NextResponse } from "next/server"
import { fetchRealData } from "@/lib/real-data-fetcher"
import { generateMockData } from "@/lib/mock-data-generator"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {

  // Check if client wants streaming response
  const isStreaming = request.headers.get('accept')?.includes('text/stream-json')
  
  if (isStreaming) {
    return handleStreamingRequest(request)
  }

  // Declare timeout variables in outer scope
  let timeoutId: NodeJS.Timeout | null = null
  
  try {
    const body = await request.json()
    const { dataType, prompt, rows } = body

    // Set timeout for the entire request (adjusted for batch processing)
    const controller = new AbortController()
    const requestedRows = parseInt(rows) || 10
    // Dynamic timeout based on row count: 25s base + 5s per batch (optimized for long prompts)
    const dynamicTimeout = requestedRows > 15 ? 25000 + Math.ceil(requestedRows / 5) * 5000 : 25000
    timeoutId = setTimeout(() => controller.abort(), dynamicTimeout)
    
    console.log(`[API] Processing ${requestedRows} rows with ${dynamicTimeout}ms timeout`)

    // Validate input
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      if (timeoutId) clearTimeout(timeoutId)
      return NextResponse.json({ 
        error: "Please provide a valid data description",
        details: "Prompt is required and must be a non-empty string"
      }, { status: 400 })
    }

    // Validate row count
    const rowCount = Math.min(Math.max(1, parseInt(rows) || 10), 50)
    if (isNaN(rowCount)) {
      if (timeoutId) clearTimeout(timeoutId)
      return NextResponse.json({ 
        error: "Invalid row count",
        details: "Rows must be a valid number between 1 and 50"
      }, { status: 400 })
    }

    // Auto-detect if request should use mock data generation
    const shouldUseMockData = dataType === "mock" || 
      prompt.toLowerCase().includes('json records') ||
      prompt.toLowerCase().includes('fine-tune') ||
      prompt.toLowerCase().includes('llm') ||
      prompt.toLowerCase().includes('training data') ||
      prompt.toLowerCase().includes('instruction') ||
      prompt.toLowerCase().includes('chatbot') ||
      prompt.toLowerCase().includes('custom')

    if (dataType !== "mock" && shouldUseMockData) {
      console.log("[API] Auto-detected mock data request, switching from real to mock data generation")
    }

    if (shouldUseMockData) {
      // Check if API key is configured for mock data (requires Gemini AI)
      const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!apiKey) {
        if (timeoutId) clearTimeout(timeoutId)
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
        if (timeoutId) clearTimeout(timeoutId)
        return NextResponse.json({ 
          success: true,
          data: result.data,
          fields: result.fields,
          source: "AI Generated Mock Data",
          rowCount: result.data.length
        }, { headers: corsHeaders })
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId)
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
          { status: isTimeout ? 504 : 500, headers: corsHeaders }
        )
      }
    } else {
      try {
        const result = await fetchRealData(prompt, rowCount)
        if (timeoutId) clearTimeout(timeoutId)
        return NextResponse.json({
          success: true,
          data: result.data,
          source: result.source,
          rowCount: result.data?.length || 0
        }, { headers: corsHeaders })
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId)
        console.error("[API] Error fetching real data:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Real Data Fetch Failed",
            details: error instanceof Error ? error.message : "Unknown error occurred",
            suggestion: "Please try a different description or check if the data source is available."
          },
          { status: 500, headers: corsHeaders }
        )
      }
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    console.error("[API] Error in generate-data API:", error)
    
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid Request Format",
        details: "Request body must be valid JSON",
        suggestion: "Please check your request format"
      }, { status: 400, headers: corsHeaders })
    }
    
    return NextResponse.json({ 
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "An unexpected error occurred",
      suggestion: "Please try again or contact support if the issue persists"
    }, { status: 500, headers: corsHeaders })
  }
}

// Streaming response handler for large requests
async function handleStreamingRequest(request: NextRequest) {
  const body = await request.json()
  const { dataType, prompt, rows } = body
  
  // Validate input
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json({ 
      error: "Please provide a valid data description"
    }, { status: 400 })
  }

  const rowCount = Math.min(Math.max(1, parseInt(rows) || 10), 100)
  
  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial response
        controller.enqueue(new TextEncoder().encode(
          JSON.stringify({ status: 'started', totalRows: rowCount }) + '\n'
        ))

        if (dataType === "mock") {
          await streamMockDataGeneration(controller, prompt, rowCount)
        } else {
          await streamRealDataGeneration(controller, prompt, rowCount)
        }

        // Send completion signal
        controller.enqueue(new TextEncoder().encode(
          JSON.stringify({ status: 'completed' }) + '\n'
        ))
        controller.close()
      } catch (error) {
        controller.enqueue(new TextEncoder().encode(
          JSON.stringify({ 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }) + '\n'
        ))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/stream-json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

// Stream mock data generation in batches
async function streamMockDataGeneration(controller: ReadableStreamDefaultController, prompt: string, totalRows: number) {
  const batchSize = 5 // Generate 5 rows at a time
  const batches = Math.ceil(totalRows / batchSize)
  
  for (let i = 0; i < batches; i++) {
    const currentBatchSize = Math.min(batchSize, totalRows - (i * batchSize))
    
    try {
      const result = await generateMockData(prompt, currentBatchSize)
      
      controller.enqueue(new TextEncoder().encode(
        JSON.stringify({
          status: 'batch',
          batchNumber: i + 1,
          totalBatches: batches,
          data: result.data,
          fields: result.fields
        }) + '\n'
      ))
      
      // Small delay to prevent overwhelming the client
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      controller.enqueue(new TextEncoder().encode(
        JSON.stringify({
          status: 'batch_error',
          batchNumber: i + 1,
          error: error instanceof Error ? error.message : 'Batch generation failed'
        }) + '\n'
      ))
    }
  }
}

// Stream real data generation
async function streamRealDataGeneration(controller: ReadableStreamDefaultController, prompt: string, totalRows: number) {
  try {
    const result = await fetchRealData(prompt, totalRows)
    
    controller.enqueue(new TextEncoder().encode(
      JSON.stringify({
        status: 'data',
        data: result.data,
        source: result.source
      }) + '\n'
    ))
  } catch (error) {
    controller.enqueue(new TextEncoder().encode(
      JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Real data fetch failed'
      }) + '\n'
    ))
  }
}
