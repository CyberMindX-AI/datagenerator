import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

// Helper function to analyze user request and suggest fields
function analyzeUserRequest(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase()
  const suggestedFields: string[] = []
  
  // Common field patterns
  const fieldPatterns = {
    'instruction': ['instruction', 'task', 'command', 'request', 'what the user wants'],
    'input': ['input', 'context', 'example', 'content', 'data', 'prompt'],
    'output': ['output', 'response', 'result', 'answer', 'description'],
    'name': ['name', 'full name', 'first name', 'last name', 'person', 'user', 'customer', 'employee'],
    'email': ['email', 'e-mail', 'contact', 'address'],
    'phone': ['phone', 'telephone', 'mobile', 'contact'],
    'age': ['age', 'years old', 'birth'],
    'salary': ['salary', 'wage', 'income', 'pay', 'compensation'],
    'department': ['department', 'division', 'team', 'group'],
    'company': ['company', 'organization', 'business', 'employer'],
    'address': ['address', 'location', 'city', 'street'],
    'date': ['date', 'time', 'created', 'updated', 'hired'],
    'price': ['price', 'cost', 'amount', 'value', 'money'],
    'product': ['product', 'item', 'goods', 'service'],
    'category': ['category', 'type', 'kind', 'classification'],
    'status': ['status', 'state', 'condition', 'active'],
    'industry': ['industry', 'sector', 'domain', 'field'],
    'chatbot': ['chatbot', 'bot', 'assistant', 'ai'],
    'llm': ['llm', 'language model', 'ai model', 'fine-tune', 'training'],
    'faq': ['faq', 'question', 'answer', 'help'],
    'id': ['id', 'identifier', 'number', 'code']
  }
  
  // Analyze prompt for field suggestions
  Object.entries(fieldPatterns).forEach(([field, patterns]) => {
    if (patterns.some(pattern => lowerPrompt.includes(pattern))) {
      suggestedFields.push(field)
    }
  })
  
  return suggestedFields.length > 0 ? suggestedFields : ['id', 'name', 'value']
}

interface MockDataResult {
  data: Record<string, any>[]
  fields: string[]
}

export async function generateMockData(prompt: string, rows: number): Promise<MockDataResult> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Please add GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.")
  }

  const rowCount = Math.min(Math.max(1, rows || 10), 50) // Limit to 50 rows
  
  // Gemini can handle long prompts - no need to truncate
  const fullPrompt = prompt
  
  // For large row counts, use batch processing
  if (rowCount > 15) {
    return await generateMockDataInBatches(fullPrompt, rowCount)
  }

  try {
    // Create a timeout promise (adjusted for long prompts)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Gemini is processing your detailed request')), 20000) // 20 second timeout for long prompts
    })

    const generatePromise = generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        fields: z.array(z.string()).describe("Array of field names for the data"),
        data: z.array(z.string()).describe(`Array of ${rowCount} JSON strings representing data objects`),
      }),
      prompt: `${fullPrompt}

Generate ${rowCount} rows of data as JSON. Return as:
- fields: array of field names
- data: array of JSON strings`,
    })

    const { object } = await Promise.race([generatePromise, timeoutPromise]) as { object: any }

    if (!object.data || object.data.length === 0) {
      throw new Error("Failed to generate mock data. Please try a different description.")
    }

    // Parse the JSON strings back to objects
    const parsedData = object.data.map((jsonStr: string) => {
      try {
        return JSON.parse(jsonStr)
      } catch (error) {
        // Fallback: create a simple object if JSON parsing fails
        return { value: jsonStr }
      }
    })

    return {
      data: parsedData,
      fields: object.fields || Object.keys(parsedData[0] || {}),
    }
  } catch (error) {
    console.error("[MockDataGenerator] Error:", error)
    throw new Error(
      error instanceof Error
        ? `Mock data generation failed: ${error.message}`
        : "Failed to generate mock data. Please try again with a different description."
    )
  }
}

// Batch processing function for large row counts
async function generateMockDataInBatches(prompt: string, totalRows: number): Promise<MockDataResult> {
  // Use smaller batches for complex prompts
  const isComplexPrompt = prompt.length > 200
  const batchSize = isComplexPrompt ? 5 : 10
  const batches = Math.ceil(totalRows / batchSize)
  
  let allData: Record<string, any>[] = []
  let fields: string[] = []
  
  console.log(`[MockDataGenerator] Processing ${totalRows} rows in ${batches} batches of ${batchSize}`)
  
  for (let i = 0; i < batches; i++) {
    const currentBatchSize = Math.min(batchSize, totalRows - (i * batchSize))
    
    try {
      console.log(`[MockDataGenerator] Processing batch ${i + 1}/${batches} (${currentBatchSize} rows)`)
      
      let object: any
      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          // Create a timeout promise for each batch (increased for long prompts)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Batch ${i + 1} timeout - Gemini is processing your detailed request`)), 25000) // 25 second timeout per batch for long prompts
          })

          // Use progressively simpler prompts on retries
          let promptText: string
          if (retryCount === 0) {
            // First attempt: pass user prompt directly to Gemini
            promptText = `${prompt}

Generate ${currentBatchSize} rows of data as JSON. Return as:
- fields: array of field names  
- data: array of JSON strings`
          } else if (retryCount === 1) {
            // Second attempt: simplified version of user prompt
            promptText = `${prompt.substring(0, 200)}...

Generate ${currentBatchSize} rows as JSON.`
          } else {
            // Final attempt: ultra-simple
            promptText = `Generate ${currentBatchSize} rows of data as JSON.`
          }

          const generatePromise = generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
              fields: z.array(z.string()).describe("Array of field names for the data"),
              data: z.array(z.string()).describe(`Array of ${currentBatchSize} JSON strings representing data objects`),
            }),
            prompt: promptText,
          })

          const result = await Promise.race([generatePromise, timeoutPromise]) as { object: any }
          object = result.object
          break // Success, exit retry loop
          
        } catch (error) {
          retryCount++
          console.warn(`[MockDataGenerator] Batch ${i + 1} attempt ${retryCount} failed:`, error instanceof Error ? error.message : 'Unknown error')
          
          if (retryCount > maxRetries) {
            throw error // Re-throw if all retries exhausted
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!object.data || object.data.length === 0) {
        throw new Error(`Failed to generate batch ${i + 1}. Please try a different description.`)
      }

      // Parse the JSON strings back to objects
      const parsedBatchData = object.data.map((jsonStr: string) => {
        try {
          return JSON.parse(jsonStr)
        } catch (error) {
          // Fallback: create a simple object if JSON parsing fails
          return { value: jsonStr }
        }
      })

      // Set fields from first batch and ensure consistency
      if (i === 0) {
        fields = object.fields || Object.keys(parsedBatchData[0] || {})
        console.log(`[MockDataGenerator] Established field structure:`, fields)
      } else {
        // Validate that subsequent batches have consistent fields
        const currentFields = Object.keys(parsedBatchData[0] || {})
        if (currentFields.length !== fields.length || !currentFields.every(field => fields.includes(field))) {
          console.warn(`[MockDataGenerator] Field mismatch in batch ${i + 1}. Expected:`, fields, 'Got:', currentFields)
          // Normalize data to match expected fields
          parsedBatchData.forEach((row: any) => {
            fields.forEach(field => {
              if (!(field in row)) {
                row[field] = null // Add missing fields
              }
            })
            // Remove extra fields
            Object.keys(row).forEach(key => {
              if (!fields.includes(key)) {
                delete (row as any)[key]
              }
            })
          })
        }
      }

      allData = allData.concat(parsedBatchData)
      
      // Small delay between batches to prevent rate limiting
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
    } catch (error) {
      console.error(`[MockDataGenerator] Error in batch ${i + 1}:`, error)
      throw new Error(`Failed to generate batch ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  console.log(`[MockDataGenerator] Successfully generated ${allData.length} rows in ${batches} batches`)
  
  return {
    data: allData,
    fields: fields,
  }
}

// Get all available data types for typed mock data generation
export function getAvailableDataTypes(): string[] {
  return [
    'business', 'startup', 'personal', 'celebrity', 'financial', 'investment', 'cryptocurrency',
    'ecommerce', 'marketplace', 'healthcare', 'pharmaceutical', 'education', 'university',
    'technology', 'gaming', 'marketing', 'social_media', 'transportation', 'logistics',
    'real_estate', 'entertainment', 'music', 'sports', 'fitness', 'restaurant', 'recipe',
    'travel', 'scientific', 'weather', 'government', 'manufacturing', 'agriculture'
  ]
}

// Check if a data type is supported
export function isValidDataType(dataType: string): boolean {
  return getAvailableDataTypes().includes(dataType.toLowerCase())
}

// Helper function for generating specific types of mock data with enhanced prompts
export async function generateTypedMockData(
  dataType: string,
  prompt: string,
  rows: number,
  additionalContext?: string
): Promise<MockDataResult> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Please add GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.")
  }

  // Validate data type
  if (!isValidDataType(dataType)) {
    throw new Error(`Unsupported data type: ${dataType}. Available types: ${getAvailableDataTypes().join(', ')}`)
  }

  const rowCount = Math.min(Math.max(1, rows || 10), 50)

  // Enhanced prompts for different data types - AWESOME EDITION! 🚀
  const typePrompts = {
    // Business & Corporate
    business: `🏢 Generate AMAZING business/company data! Include: company names (creative & realistic), industries, annual revenue ($1M-$50B), employee counts (10-100K), headquarters locations (global cities), founding years (1950-2023), CEO names, stock symbols, market cap, growth rates, and business models (B2B/B2C/SaaS).`,
    
    startup: `🚀 Create INNOVATIVE startup data! Include: disruptive company names, cutting-edge industries (AI, blockchain, biotech), funding rounds (seed to Series C), valuation ($100K-$10B), investor names, founder profiles, launch dates, burn rates, runway months, and revolutionary product descriptions.`,
    
    // Personal & Demographics  
    personal: `👤 Generate DIVERSE personal profiles! Include: realistic names (global diversity), ages (18-85), addresses (worldwide), occupations (500+ job types), salaries ($20K-$500K), education levels, hobbies, personality traits, family status, and contact info. Make each person UNIQUE and interesting!`,
    
    // Financial & Economics
    financial: `💰 Generate COMPREHENSIVE financial data! Include: transaction IDs, account numbers, amounts ($0.01-$1M), currencies (50+ types), transaction types (transfer, payment, investment), merchant names, categories, dates/times, fees, exchange rates, and fraud scores.`,
    
    // E-commerce & Retail
    ecommerce: `🛒 Create AMAZING e-commerce data! Include: product names (creative & appealing), categories, brands, prices ($1-$10K), discounts, ratings (1-5 stars), review counts, inventory levels, SKUs, descriptions, colors, sizes, and seasonal trends.`,
    
    // Add more as needed...
  }

  const enhancedPrompt = `🎯 You are the ULTIMATE ${dataType.toUpperCase()} Data Generation SPECIALIST! You have PhD-level expertise in this domain and can create PHENOMENAL mock datasets!

🌟 DOMAIN EXPERTISE:
${typePrompts[dataType as keyof typeof typePrompts] || '🎲 Generate INCREDIBLE realistic mock data based on the description with MAXIMUM creativity and authenticity!'}

🎪 SPECIFIC USER REQUEST: "${prompt}"
${additionalContext ? `🔍 ADDITIONAL CONTEXT: ${additionalContext}` : ''}

🚀 ELITE REQUIREMENTS:
✅ Generate EXACTLY ${rowCount} rows of premium-quality data
✅ Use REALISTIC but 100% FICTIONAL values (safety first!)
✅ Ensure PERFECT data types and professional formatting
✅ Make data INCREDIBLY DIVERSE and globally representative
✅ Include INDUSTRY-STANDARD field names for ${dataType} domain
✅ Add LOGICAL RELATIONSHIPS between related fields
✅ Include REALISTIC EDGE CASES and statistical distributions
✅ Use CURRENT industry standards and best practices
✅ Make each row UNIQUE and interesting

IMPORTANT: Return the data as an array of JSON strings, where each string represents one data object. Also provide the field names separately.

💎 Generate WORLD-CLASS ${dataType} mock data that will BLOW MINDS!`

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        fields: z.array(z.string()).describe("Array of field names for the data"),
        data: z.array(z.string()).describe(`Array of ${rowCount} JSON strings representing data objects`),
      }),
      prompt: enhancedPrompt,
    })

    if (!object.data || object.data.length === 0) {
      throw new Error("Failed to generate typed mock data. Please try a different description.")
    }

    // Parse the JSON strings back to objects
    const parsedData = object.data.map((jsonStr: string) => {
      try {
        return JSON.parse(jsonStr)
      } catch (error) {
        // Fallback: create a simple object if JSON parsing fails
        return { value: jsonStr }
      }
    })

    return {
      data: parsedData,
      fields: object.fields || Object.keys(parsedData[0] || {}),
    }
  } catch (error) {
    console.error("[TypedMockDataGenerator] Error:", error)
    throw new Error(
      error instanceof Error
        ? `Typed mock data generation failed: ${error.message}`
        : "Failed to generate typed mock data. Please try again."
    )
  }
}
