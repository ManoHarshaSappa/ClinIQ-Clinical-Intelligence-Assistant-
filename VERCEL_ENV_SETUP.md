# Vercel Environment Variables Setup

## Required Environment Variables

For the ClinIQ app to work properly on Vercel, you need to configure the following environment variables in your Vercel project settings:

### 1. Database Configuration (Supabase)
```
SUPABASE_URL=https://pxtldxfprbrcuhnhzzcw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[Your actual production service role key]
```

### 2. OpenAI API Configuration
```
OPENAI_API_KEY=[Your actual OpenAI API key]
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable with:
   - **Name**: The variable name (e.g., `SUPABASE_URL`)
   - **Value**: The actual value
   - **Environment**: Select "Production", "Preview", and "Development" as needed

## Important Notes

⚠️ **Security**: Never commit actual API keys to your repository. The values in `.env.local` are for development only.

⚠️ **Service Role Key**: Make sure you're using the **service role key** (not the anonymous key) for Supabase, as it has the necessary permissions for backend operations.

## Verification

After setting the environment variables, redeploy your Vercel app. You can verify the deployment is working by:

1. Visiting your deployed app URL
2. Checking if the dashboard loads patient data
3. Testing the API endpoints at `https://your-app.vercel.app/api/health`

## Current Status

- ✅ Vercel configuration (`vercel.json`) has been updated to properly build the Next.js app
- ✅ Local development is working correctly with data loading
- ⚠️ Environment variables need to be configured in Vercel dashboard
- 🔄 Deployment testing pending after environment setup