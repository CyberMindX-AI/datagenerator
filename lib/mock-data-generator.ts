import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

interface MockDataResult {
  data: Record<string, any>[]
  fields: string[]
}

export async function generateMockData(prompt: string, rows: number): Promise<MockDataResult> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Please add GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.")
  }

  const rowCount = Math.min(Math.max(1, rows || 10), 100) // Limit to 100 rows
  
  // Truncate very long prompts to prevent timeouts
  const truncatedPrompt = prompt.length > 2000 ? prompt.substring(0, 2000) + "..." : prompt

  try {
    // Create a timeout promise (reduced for better UX)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - please try a shorter or simpler prompt')), 12000) // 12 second timeout
    })

    const generatePromise = generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        fields: z.array(z.string()).describe("Array of field names for the data"),
        data: z.array(z.string()).describe(`Array of ${rowCount} JSON strings representing data objects`),
      }),
      prompt: `Generate ${rowCount} rows of realistic mock data based on: "${truncatedPrompt}"

Requirements:
- Return field names array and data array of JSON strings
- Use proper data types (numbers as numbers, dates as ISO strings, booleans as true/false)
- Make data diverse and realistic but completely fictional
- Use professional field names
- Format dates as YYYY-MM-DD, currencies as $1,234.56
- Include variety and logical relationships between fields
- Use current year (2024) for recent dates
- Keep JSON objects simple and well-formatted

Return exactly ${rowCount} rows of data.`,
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

  const rowCount = Math.min(Math.max(1, rows || 10), 100)

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
