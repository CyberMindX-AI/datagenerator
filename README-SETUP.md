# Data Generator Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root with your Google API key:

```env
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_actual_api_key_here
```

**Alternative variable name:**
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Troubleshooting

### Common Errors and Solutions

#### 404 Error: `/api/generate-data`
- **Cause**: Development server not running
- **Solution**: Run `npm run dev` and ensure server starts on port 3000

#### 504 Timeout Error
- **Cause**: Large/complex prompts causing API timeout
- **Solution**: 
  - **Automatic handling**: Prompts over 2000 characters (mock) or 1500 characters (real) are automatically truncated
  - **Timeout protection**: 45-second timeout for mock data, 30-second timeout for real data
  - Use shorter, more specific prompts for best results
  - Reduce the number of rows requested (50 or fewer recommended)
  - Break very complex requests into smaller parts

#### "API Configuration Error"
- **Cause**: Missing Google API key
- **Solution**: 
  1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Add to `.env.local` file as shown above
  3. Restart development server

#### JSON Parse Error
- **Cause**: Server returning HTML error page instead of JSON
- **Solution**: Check server logs and ensure API key is configured

### Getting a Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add it to your `.env.local` file

### Performance Tips

#### For Mock Data (AI Generated)
- Prompts are automatically truncated at 2000 characters
- 45-second timeout protection with graceful error handling
- Request 50 rows or fewer for faster generation
- Use specific, clear descriptions rather than very detailed ones

#### For Real Data (API Sources)
- Prompts are automatically truncated at 1500 characters
- 30-second timeout protection for data fetching
- 15-second timeout for AI categorization
- Works with multiple data sources: finance, weather, news, crypto, sports, etc.
- Some data sources may have rate limits or require API keys

#### General Tips
- Test with simple prompts first
- Both mock and real data now handle large prompts automatically
- Error messages will guide you if adjustments are needed

## Example Prompts

### Simple Prompts (Recommended)
```
Generate customer data with name, email, age, and purchase amount
Create employee records with ID, name, department, and salary
Generate product inventory with SKU, name, price, and stock level
```

### Complex Prompts (Now Supported with Auto-Truncation)
```
Create a comprehensive dataset for an e-commerce platform including detailed customer profiles with demographics, purchase history, product preferences, loyalty status, geographic information, and behavioral analytics...
```
**Note**: Large prompts like this are now automatically handled - they'll be truncated to prevent timeouts while preserving the core request.

## Support

If you continue experiencing issues:
1. Check the browser console for detailed error messages
2. Verify your API key is valid and has quota remaining
3. Try with a simpler prompt first
4. Ensure your development server is running on the correct port
