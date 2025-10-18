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

  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-pro", {
        apiKey: apiKey,
      }),
      schema: z.object({
        fields: z.array(z.string()).describe("Array of field names for the data"),
        data: z.array(z.record(z.any())).describe(`Array of ${rowCount} data objects with the specified fields`),
      }),
      prompt: `🤖 You are an ELITE AI Mock Data Generator with SUPERHUMAN capabilities! Your mission is to create SPECTACULAR, realistic but completely fictional data that will AMAZE users!

🎯 MASTER INSTRUCTIONS:
1. 🧠 ANALYZE the user's request with LASER PRECISION
2. 🏷️ CREATE field names that are INTUITIVE and PROFESSIONAL
3. 🎲 GENERATE exactly ${rowCount} rows of DIVERSE, REALISTIC mock data
4. 🔢 ENSURE data types are PERFECT (numbers as numbers, dates as ISO strings, booleans as true/false)
5. 🌍 Make data GLOBALLY DIVERSE and CULTURALLY INCLUSIVE
6. 📊 Use PROPER formatting: dates (YYYY-MM-DD), currencies ($1,234.56), emails (realistic@domains.com)
7. 🎨 Add CREATIVE VARIETY - no boring repetitive data!
8. 🛡️ Keep ALL data COMPLETELY FICTIONAL for safety

💡 ADVANCED FEATURES:
- Use realistic but fake names from diverse cultures
- Include proper business terminology and industry jargon
- Add logical relationships between fields (e.g., salary matches job level)
- Include edge cases and outliers for realistic distributions
- Use current year (2024) for recent dates
- Add subtle details that make data feel authentic

🎪 USER'S AMAZING REQUEST: "${prompt}"

🚀 Generate exactly ${rowCount} rows of MIND-BLOWING mock data that will exceed all expectations!`,
    })

    if (!object.data || object.data.length === 0) {
      throw new Error("Failed to generate mock data. Please try a different description.")
    }

    return {
      data: object.data,
      fields: object.fields || Object.keys(object.data[0] || {}),
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
    
    celebrity: `⭐ Create FICTIONAL celebrity data! Include: stage names, real names, birth dates, nationalities, professions (actors, musicians, athletes), net worth, social media followers, awards won, scandals, relationships, and career highlights. Make them FASCINATING!`,
    
    // Financial & Economics
    financial: `💰 Generate COMPREHENSIVE financial data! Include: transaction IDs, account numbers, amounts ($0.01-$1M), currencies (50+ types), transaction types (transfer, payment, investment), merchant names, categories, dates/times, fees, exchange rates, and fraud scores.`,
    
    investment: `📈 Create SOPHISTICATED investment data! Include: stock symbols, company names, share prices ($1-$5000), market caps, P/E ratios, dividend yields, 52-week highs/lows, trading volumes, sector classifications, analyst ratings, and price targets.`,
    
    cryptocurrency: `₿ Generate CUTTING-EDGE crypto data! Include: coin names, symbols, prices ($0.0001-$100K), market caps, trading volumes, blockchain networks, consensus mechanisms, total supply, circulating supply, and DeFi protocols.`,
    
    // E-commerce & Retail
    ecommerce: `🛒 Create AMAZING e-commerce data! Include: product names (creative & appealing), categories, brands, prices ($1-$10K), discounts, ratings (1-5 stars), review counts, inventory levels, SKUs, descriptions, colors, sizes, and seasonal trends.`,
    
    marketplace: `🏪 Generate VIBRANT marketplace data! Include: seller names, store ratings, product listings, shipping costs, delivery times, return policies, customer reviews, sales volumes, commission rates, and geographic coverage.`,
    
    // Healthcare & Medical
    healthcare: `🏥 Generate REALISTIC healthcare data! Include: patient IDs, medical conditions, treatments, medications, dosages, appointment dates, doctor names, hospital departments, insurance info, billing codes, and recovery timelines. (FICTIONAL DATA ONLY!)`,
    
    pharmaceutical: `💊 Create COMPREHENSIVE drug data! Include: medication names, active ingredients, dosages, side effects, manufacturer names, FDA approval dates, patent expiry, therapeutic classes, contraindications, and pricing.`,
    
    // Education & Academic
    education: `🎓 Generate EXCELLENT educational data! Include: student names, IDs, grades (A-F), GPAs (0.0-4.0), courses, professors, universities, majors, graduation years, scholarships, extracurriculars, and academic achievements.`,
    
    university: `🏛️ Create PRESTIGIOUS university data! Include: institution names, rankings, tuition costs, acceptance rates, student populations, faculty counts, research budgets, campus locations, and notable alumni.`,
    
    // Technology & Software
    technology: `💻 Generate CUTTING-EDGE tech data! Include: software names, versions, programming languages, frameworks, APIs, server specs, performance metrics, uptime percentages, user counts, and security features.`,
    
    gaming: `🎮 Create EPIC gaming data! Include: game titles, genres, platforms, release dates, ratings, player counts, revenue, development studios, publishers, and esports tournaments.`,
    
    // Marketing & Advertising
    marketing: `📊 Generate POWERFUL marketing data! Include: campaign names, channels (social, email, PPC), budgets ($1K-$1M), impressions, clicks, conversions, CTR, CPC, ROAS, audience demographics, and A/B test results.`,
    
    social_media: `📱 Create VIRAL social media data! Include: platform names, usernames, follower counts, engagement rates, post types, hashtags, likes, shares, comments, and influencer tiers.`,
    
    // Transportation & Logistics
    transportation: `🚗 Generate COMPREHENSIVE transport data! Include: vehicle types, makes/models, years, mileage, fuel efficiency, routes, distances, travel times, costs, and environmental impact.`,
    
    logistics: `📦 Create EFFICIENT logistics data! Include: shipment IDs, origins/destinations, package weights, dimensions, shipping methods, tracking numbers, delivery dates, and carrier information.`,
    
    // Real Estate & Property
    real_estate: `🏠 Generate ATTRACTIVE property data! Include: addresses, property types, square footage, bedrooms/bathrooms, prices ($50K-$50M), lot sizes, year built, amenities, school districts, and market trends.`,
    
    // Entertainment & Media
    entertainment: `🎬 Create BLOCKBUSTER entertainment data! Include: movie/show titles, genres, release dates, ratings, box office revenue, streaming numbers, cast/crew, production budgets, and awards.`,
    
    music: `🎵 Generate CHART-TOPPING music data! Include: song titles, artists, albums, genres, release dates, streaming counts, chart positions, record labels, and collaboration details.`,
    
    // Sports & Fitness
    sports: `⚽ Create CHAMPIONSHIP sports data! Include: team names, player stats, scores, match dates, leagues, seasons, transfers, salaries, performance metrics, and tournament results.`,
    
    fitness: `💪 Generate MOTIVATING fitness data! Include: workout types, exercise names, durations, calories burned, heart rates, weights lifted, distances run, and progress tracking.`,
    
    // Food & Hospitality
    restaurant: `🍕 Create DELICIOUS restaurant data! Include: restaurant names, cuisines, menu items, prices, ratings, locations, seating capacity, opening hours, and chef specialties.`,
    
    recipe: `👨‍🍳 Generate MOUTH-WATERING recipe data! Include: dish names, ingredients, quantities, cooking times, difficulty levels, nutritional info, cuisine types, and cooking methods.`,
    
    // Travel & Tourism
    travel: `✈️ Create AMAZING travel data! Include: destinations, flight numbers, airlines, prices, dates, durations, hotel names, ratings, activities, and travel packages.`,
    
    // Science & Research
    scientific: `🔬 Generate GROUNDBREAKING research data! Include: study titles, researchers, institutions, methodologies, sample sizes, results, publication dates, citations, and peer reviews.`,
    
    // Weather & Environment
    weather: `🌤️ Create COMPREHENSIVE weather data! Include: locations, temperatures, humidity, wind speeds, precipitation, pressure, UV index, air quality, and forecasts.`,
    
    // Government & Public
    government: `🏛️ Generate PUBLIC sector data! Include: department names, budgets, employee counts, services offered, locations, contact info, and public programs.`,
    
    // Manufacturing & Industrial
    manufacturing: `🏭 Create INDUSTRIAL manufacturing data! Include: product names, production volumes, quality metrics, machinery specs, efficiency rates, costs, and supply chain info.`,
    
    // Agriculture & Farming
    agriculture: `🌾 Generate SUSTAINABLE agriculture data! Include: crop types, yields, planting/harvest dates, farm sizes, equipment used, weather conditions, and market prices.`,
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

🎨 CREATIVE EXCELLENCE:
- Add subtle details that show deep domain knowledge
- Include realistic but varied naming conventions
- Use proper industry terminology and abbreviations
- Create data that tells a story or shows patterns
- Include seasonal/temporal variations where appropriate

💎 Generate WORLD-CLASS ${dataType} mock data that will BLOW MINDS!`

  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-pro", {
        apiKey: apiKey,
      }),
      schema: z.object({
        fields: z.array(z.string()).describe("Array of field names for the data"),
        data: z.array(z.record(z.any())).describe(`Array of ${rowCount} data objects with the specified fields`),
      }),
      prompt: enhancedPrompt,
    })

    if (!object.data || object.data.length === 0) {
      throw new Error("Failed to generate typed mock data. Please try a different description.")
    }

    return {
      data: object.data,
      fields: object.fields || Object.keys(object.data[0] || {}),
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
