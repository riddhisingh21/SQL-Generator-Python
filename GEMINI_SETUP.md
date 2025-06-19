# Gemini API Setup Guide

Your SQL Generator now uses Google's Gemini AI to generate SQL queries! Follow these steps to set it up:

## 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## 2. Configure the API Key

1. Open the `.env` file in your project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## 3. Restart Your Development Server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

## 4. Test the Integration

1. Open your SQL Generator application
2. Enter a natural language query like "find all users older than 25"
3. Optionally provide a database schema
4. Click "Generate SQL"

The application will now use Gemini AI to generate intelligent SQL queries based on your natural language input!

## Features

- **Smart SQL Generation**: Gemini understands complex natural language queries
- **Schema-Aware**: When you provide a database schema, Gemini uses the exact table and column names
- **Multi-Dialect Support**: Generates SQL for MySQL, PostgreSQL, SQLite, SQL Server, and Oracle
- **Detailed Explanations**: Each generated query comes with a clear explanation
- **Fallback Support**: If Gemini is unavailable, the app falls back to basic query generation

## Troubleshooting

- **"API key not configured" error**: Make sure you've set the `VITE_GEMINI_API_KEY` in your `.env` file
- **API errors**: Check that your API key is valid and you have sufficient quota
- **Slow responses**: Gemini API calls may take a few seconds, this is normal

## Security Note

Never commit your `.env` file to version control. The `.env` file is already included in `.gitignore` to prevent accidental commits.
