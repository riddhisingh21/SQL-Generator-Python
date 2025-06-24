import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

export async function generateSQL(query, schema, dialect) {
  // Use backend API if configured, otherwise use direct Gemini integration
  if (USE_BACKEND) {
    return generateSQLViaBackend(query, dialect);
  }

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

    // Fallback to backend API if available, otherwise use mock
    if (!USE_BACKEND) {
      try {
        return await generateSQLViaBackend(query, dialect);
      } catch (backendError) {
        console.error('Backend API also failed:', backendError);
      }
    }

    // Final fallback to mock implementation
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
    // Clean the response text
    const cleanText = text.trim();

    // Try to extract JSON from the response
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sql: parsed.sql || '',
        explanation: parsed.explanation || 'No explanation provided.'
      };
    }

    // Try to find JSON with more flexible pattern
    const jsonPattern = /\{[^{}]*"sql"[^{}]*"explanation"[^{}]*\}/s;
    const flexibleJsonMatch = cleanText.match(jsonPattern);
    if (flexibleJsonMatch) {
      const parsed = JSON.parse(flexibleJsonMatch[0]);
      return {
        sql: parsed.sql || '',
        explanation: parsed.explanation || 'No explanation provided.'
      };
    }

    // Fallback: try to extract SQL and explanation manually
    const sqlMatch = cleanText.match(/```sql\n([\s\S]*?)\n```/i) ||
                     cleanText.match(/sql["\s]*:\s*["']([\s\S]*?)["']/i) ||
                     cleanText.match(/SQL:\s*([\s\S]*?)(?:\n|$)/i);

    const explanationMatch = cleanText.match(/explanation["\s]*:\s*["']([\s\S]*?)["']/i) ||
                            cleanText.match(/EXPLANATION:\s*([\s\S]*?)(?:\n|$)/i);

    // If we found SQL, return it; otherwise provide a helpful fallback
    if (sqlMatch && sqlMatch[1].trim()) {
      return {
        sql: sqlMatch[1].trim(),
        explanation: explanationMatch ? explanationMatch[1].trim() : 'SQL query generated successfully.'
      };
    }

    // If no SQL found, provide a more helpful response
    return {
      sql: 'SELECT * FROM your_table LIMIT 10; -- Please modify this template based on your needs',
      explanation: `I couldn't parse a specific SQL query from the AI response. The response was: "${cleanText.substring(0, 200)}...". Please try rephrasing your query with more specific details about what you want to retrieve, insert, update, or delete.`
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return {
      sql: 'SELECT * FROM your_table LIMIT 10; -- Please modify this template',
      explanation: 'There was an error parsing the AI response. Please try rephrasing your query with more specific details about the database operation you want to perform.'
    };
  }
}

// Fallback implementation when Gemini API fails
function generateFallbackResponse(query, schema, dialect) {
  const tableName = schema ? extractTableName(schema) : extractTableNameFromQuery(query);

  return {
    sql: generateGenericSQL(query, tableName, dialect),
    explanation: `This is a template SQL query based on your request: "${query}". The AI service is temporarily unavailable, so this is a best-guess template using ${dialect.toUpperCase()} syntax. Please modify the table names, column names, and conditions to match your specific database schema.`
  };
}

// Helper function to extract table name from query text
function extractTableNameFromQuery(query) {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);

  // Look for common table names or patterns
  const commonTables = ['users', 'products', 'orders', 'customers', 'employees', 'sales', 'inventory', 'items', 'data'];

  for (const table of commonTables) {
    if (lowerQuery.includes(table)) {
      return table;
    }
  }

  // Look for words after "from", "into", "table"
  for (let i = 0; i < words.length - 1; i++) {
    if (['from', 'into', 'table'].includes(words[i])) {
      const nextWord = words[i + 1].replace(/[^a-zA-Z0-9_]/g, '');
      if (nextWord.length > 2) {
        return nextWord;
      }
    }
  }

  // Look for plural nouns (likely table names)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z0-9_]/g, '');
    if (cleanWord.length > 3 && cleanWord.endsWith('s') && !['this', 'that', 'was', 'has', 'is'].includes(cleanWord)) {
      return cleanWord;
    }
  }

  return 'your_table';
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

  // Enhanced pattern matching for better SQL generation
  if (lowerQuery.includes("count") || lowerQuery.includes("how many")) {
    return `SELECT COUNT(*) FROM ${tableName};`;
  } else if (lowerQuery.includes("average") || lowerQuery.includes("avg")) {
    const columnGuess = guessColumnName(lowerQuery, ["price", "amount", "value", "salary", "cost"]);
    return `SELECT AVG(${columnGuess}) FROM ${tableName};`;
  } else if (lowerQuery.includes("sum") || lowerQuery.includes("total")) {
    const columnGuess = guessColumnName(lowerQuery, ["price", "amount", "value", "salary", "cost"]);
    return `SELECT SUM(${columnGuess}) FROM ${tableName};`;
  } else if (lowerQuery.includes("max") || lowerQuery.includes("maximum") || lowerQuery.includes("highest")) {
    const columnGuess = guessColumnName(lowerQuery, ["price", "amount", "value", "date", "id"]);
    return `SELECT MAX(${columnGuess}) FROM ${tableName};`;
  } else if (lowerQuery.includes("min") || lowerQuery.includes("minimum") || lowerQuery.includes("lowest")) {
    const columnGuess = guessColumnName(lowerQuery, ["price", "amount", "value", "date", "id"]);
    return `SELECT MIN(${columnGuess}) FROM ${tableName};`;
  } else if (lowerQuery.includes("group by") || lowerQuery.includes("grouped by") || lowerQuery.includes("group")) {
    const columnGuess = guessColumnName(lowerQuery, ["category", "type", "status", "department", "region"]);
    return `SELECT ${columnGuess}, COUNT(*) FROM ${tableName} GROUP BY ${columnGuess};`;
  } else if (lowerQuery.includes("insert") || lowerQuery.includes("add") || lowerQuery.includes("create")) {
    return `INSERT INTO ${tableName} (column1, column2) VALUES ('value1', 'value2');`;
  } else if (lowerQuery.includes("update") || lowerQuery.includes("modify") || lowerQuery.includes("change")) {
    return `UPDATE ${tableName} SET column_name = 'new_value' WHERE id = 1;`;
  } else if (lowerQuery.includes("delete") || lowerQuery.includes("remove")) {
    return `DELETE FROM ${tableName} WHERE condition = 'value';`;
  } else if (lowerQuery.includes("join") || lowerQuery.includes("combine")) {
    return `SELECT t1.*, t2.* FROM ${tableName} t1 JOIN related_table t2 ON t1.id = t2.${tableName}_id;`;
  } else if (lowerQuery.includes("where") || lowerQuery.includes("filter") || lowerQuery.includes("condition")) {
    return dialect === 'mssql'
      ? `SELECT ${limitClause} * FROM ${tableName} WHERE column_name = 'value';`
      : `SELECT * FROM ${tableName} WHERE column_name = 'value' ${limitClause};`;
  } else {
    // Default to a SELECT query with dialect-specific syntax
    return dialect === 'mssql'
      ? `SELECT ${limitClause} * FROM ${tableName};`
      : `SELECT * FROM ${tableName} ${limitClause};`;
  }
}

// Helper function to guess column names based on query context
function guessColumnName(query, possibleColumns) {
  for (const column of possibleColumns) {
    if (query.includes(column)) {
      return column;
    }
  }
  return possibleColumns[0]; // Return first as default
}

// Function to call the Python backend API
async function generateSQLViaBackend(query, dialect) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        database_type: dialect || 'postgresql'
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      sql: data.sql,
      explanation: data.explanation
    };
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw error;
  }
}

// Additional backend API functions
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

export async function getSupportedDatabases() {
  try {
    const response = await fetch(`${API_BASE_URL}/databases`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching supported databases:', error);
    throw error;
  }
}