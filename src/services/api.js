import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateSQL(query, schema, dialect) {
  try {
    // Check if API key is configured
    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt for Gemini
    const prompt = buildPrompt(query, schema, dialect);

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the response to extract SQL and explanation
    return parseGeminiResponse(text);

  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Fallback to mock implementation if Gemini fails
    return generateFallbackResponse(query, schema, dialect);
  }
}

// Build the prompt for Gemini API
function buildPrompt(query, schema, dialect) {
  let prompt = `You are an expert SQL developer. Generate a SQL query based on the following natural language request.

Natural Language Query: "${query}"
SQL Dialect: ${dialect.toUpperCase()}

`;

  if (schema && schema.trim()) {
    prompt += `Database Schema:
${schema}

`;
  }

  prompt += `Please provide your response in the following JSON format:
{
  "sql": "your generated SQL query here",
  "explanation": "a clear explanation of what the query does and how it works"
}

Requirements:
- Generate syntactically correct ${dialect.toUpperCase()} SQL
- Use proper ${dialect.toUpperCase()} syntax and functions
- If schema is provided, use the exact table and column names from the schema
- If no schema is provided, use reasonable table and column names based on the query
- Provide a clear, concise explanation of the query
- Ensure the query is optimized and follows best practices
- Return ONLY the JSON response, no additional text`;

  return prompt;
}

// Parse Gemini's response to extract SQL and explanation
function parseGeminiResponse(text) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sql: parsed.sql || '',
        explanation: parsed.explanation || 'No explanation provided.'
      };
    }

    // Fallback: try to extract SQL and explanation manually
    const sqlMatch = text.match(/```sql\n([\s\S]*?)\n```/i) || text.match(/sql["\s]*:\s*["']([\s\S]*?)["']/i);
    const explanationMatch = text.match(/explanation["\s]*:\s*["']([\s\S]*?)["']/i);

    return {
      sql: sqlMatch ? sqlMatch[1].trim() : 'SELECT 1; -- Unable to parse SQL from response',
      explanation: explanationMatch ? explanationMatch[1].trim() : 'Unable to parse explanation from response.'
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return {
      sql: 'SELECT 1; -- Error parsing response',
      explanation: 'There was an error parsing the AI response. Please try again.'
    };
  }
}

// Fallback implementation when Gemini API fails
function generateFallbackResponse(query, schema, dialect) {
  const tableName = schema ? extractTableName(schema) : "data";

  return {
    sql: generateGenericSQL(query, tableName, dialect),
    explanation: `This is a fallback response. The AI service is currently unavailable. Query: "${query}" using ${dialect.toUpperCase()} syntax.`
  };
}

// Helper function to extract a table name from schema
function extractTableName(schema) {
  const match = schema.match(/CREATE\s+TABLE\s+(\w+)/i);
  return match ? match[1] : "data";
}

// Helper function to generate a generic SQL query
function generateGenericSQL(query, tableName, dialect) {
  const lowerQuery = query.toLowerCase();
  const limitClause = dialect === 'mssql' ? 'TOP 10' : 'LIMIT 10';

  if (lowerQuery.includes("count") || lowerQuery.includes("how many")) {
    return `SELECT COUNT(*) FROM ${tableName};`;
  } else if (lowerQuery.includes("average") || lowerQuery.includes("avg")) {
    const columnGuess = lowerQuery.includes("price") ? "price" : "value";
    return `SELECT AVG(${columnGuess}) FROM ${tableName};`;
  } else if (lowerQuery.includes("sum") || lowerQuery.includes("total")) {
    const columnGuess = lowerQuery.includes("price") ? "price" : "amount";
    return `SELECT SUM(${columnGuess}) FROM ${tableName};`;
  } else if (lowerQuery.includes("group by") || lowerQuery.includes("grouped by")) {
    const columnGuess = lowerQuery.includes("category") ? "category" : "type";
    return `SELECT ${columnGuess}, COUNT(*) FROM ${tableName} GROUP BY ${columnGuess};`;
  } else {
    // Default to a SELECT query with dialect-specific syntax
    return dialect === 'mssql'
      ? `SELECT ${limitClause} * FROM ${tableName};`
      : `SELECT * FROM ${tableName} ${limitClause};`;
  }
}