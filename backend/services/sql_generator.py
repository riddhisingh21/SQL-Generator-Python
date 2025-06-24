import google.generativeai as genai
from typing import Dict, Any
try:
    from ..config import settings
except ImportError:
    # Handle relative imports when running directly
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    from config import settings

class SQLGeneratorService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                # Try the newer model name first, fallback to older one
                try:
                    self.model = genai.GenerativeModel('gemini-1.5-flash')
                except:
                    self.model = genai.GenerativeModel('gemini-pro')
                print(f"DEBUG: Successfully initialized Gemini model")
            except Exception as e:
                print(f"DEBUG: Failed to initialize Gemini model: {e}")
                self.model = None
        else:
            print("DEBUG: No Gemini API key provided")
            self.model = None
    
    async def generate_sql(self, natural_query: str, database_type: str = "postgresql") -> Dict[str, Any]:
        """
        Generate SQL from natural language query using Gemini AI
        """
        print(f"DEBUG: Received query: '{natural_query}' for database: {database_type}")
        print(f"DEBUG: Model available: {self.model is not None}")
        print(f"DEBUG: API Key configured: {settings.GEMINI_API_KEY is not None}")

        if not self.model:
            print("DEBUG: No AI model available, using fallback")
            # Fallback to simple template-based generation
            return self._generate_simple_sql(natural_query, database_type)

        try:
            prompt = self._create_prompt(natural_query, database_type)
            print(f"DEBUG: Generated prompt: {prompt[:200]}...")

            response = self.model.generate_content(prompt)
            print(f"DEBUG: AI Response: {response.text[:200]}...")

            # Parse the response to extract SQL and explanation
            result = self._parse_ai_response(response.text)
            print(f"DEBUG: Parsed result: {result}")
            return result

        except Exception as e:
            print(f"Error generating SQL with AI: {e}")
            print("DEBUG: Falling back to simple SQL generation")
            return self._generate_simple_sql(natural_query, database_type)
    
    def _create_prompt(self, query: str, db_type: str) -> str:
        """Create a structured prompt for the AI model"""
        return f"""You are an expert SQL developer. Generate a SQL query based on the following natural language request.

Natural Language Query: "{query}"
SQL Dialect: {db_type.upper()}

Please provide your response in the following JSON format:
{{
  "sql": "your generated SQL query here",
  "explanation": "a clear explanation of what the query does and how it works"
}}

Requirements:
- Generate syntactically correct {db_type.upper()} SQL
- Use proper {db_type.upper()} syntax and functions
- Use reasonable table and column names based on the query context
- Provide a clear, concise explanation of the query
- Ensure the query is optimized and follows best practices
- Return ONLY the JSON response, no additional text

If the query is vague, make reasonable assumptions about table and column names based on common database patterns."""
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response to extract SQL and explanation"""
        try:
            import json
            # Try to extract JSON from the response
            json_match = response.strip()
            if json_match.startswith('{') and json_match.endswith('}'):
                parsed = json.loads(json_match)
                return {
                    "sql": parsed.get("sql", ""),
                    "explanation": parsed.get("explanation", "No explanation provided.")
                }

            # Try to find JSON within the response
            import re
            json_pattern = r'\{[^{}]*"sql"[^{}]*"explanation"[^{}]*\}'
            json_matches = re.findall(json_pattern, response, re.DOTALL)
            if json_matches:
                parsed = json.loads(json_matches[0])
                return {
                    "sql": parsed.get("sql", ""),
                    "explanation": parsed.get("explanation", "No explanation provided.")
                }

            # Fallback: try to extract SQL and explanation manually
            lines = response.strip().split('\n')
            sql = ""
            explanation = ""

            for line in lines:
                if line.startswith("SQL:"):
                    sql = line.replace("SQL:", "").strip()
                elif line.startswith("EXPLANATION:"):
                    explanation = line.replace("EXPLANATION:", "").strip()

            return {
                "sql": sql or "-- Unable to parse SQL from response",
                "explanation": explanation or "Unable to parse explanation from response."
            }

        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return {
                "sql": "-- Error parsing response",
                "explanation": "There was an error parsing the AI response. Please try again."
            }
    
    def _generate_simple_sql(self, query: str, db_type: str) -> Dict[str, Any]:
        """Fallback method for simple SQL generation with intelligent pattern matching"""
        query_lower = query.lower()
        print(f"DEBUG: Processing fallback query: {query_lower}")

        # Enhanced pattern matching with more keywords and context
        if any(keyword in query_lower for keyword in ["select", "find", "get", "show", "list", "display", "retrieve", "fetch"]):
            # Try to extract table/entity names from the query
            table_name = self._extract_table_name(query_lower)
            print(f"DEBUG: Extracted table name: {table_name}")

            # Check for specific conditions and build WHERE clause
            where_clause = self._extract_where_conditions(query_lower)
            print(f"DEBUG: Extracted WHERE clause: {where_clause}")

            if "count" in query_lower or "how many" in query_lower:
                if where_clause:
                    sql = f"SELECT COUNT(*) FROM {table_name} WHERE {where_clause};"
                    explanation = f"This query counts the number of records in the {table_name} table that match the condition: {where_clause}."
                else:
                    sql = f"SELECT COUNT(*) FROM {table_name};"
                    explanation = f"This query counts the total number of records in the {table_name} table."
            elif where_clause:
                sql = f"SELECT * FROM {table_name} WHERE {where_clause};"
                explanation = f"This query retrieves all records from the {table_name} table where {where_clause}."
            elif "all" in query_lower:
                sql = f"SELECT * FROM {table_name};"
                explanation = f"This query retrieves all columns and rows from the {table_name} table."
            else:
                sql = f"SELECT * FROM {table_name} LIMIT 10;"
                explanation = f"This query retrieves the first 10 records from the {table_name} table."

        elif any(keyword in query_lower for keyword in ["insert", "add", "create", "new"]):
            table_name = self._extract_table_name(query_lower)
            sql = f"INSERT INTO {table_name} (column1, column2) VALUES ('value1', 'value2');"
            explanation = f"This query inserts a new record into the {table_name} table. Replace column names and values as needed."

        elif any(keyword in query_lower for keyword in ["update", "modify", "change", "edit"]):
            table_name = self._extract_table_name(query_lower)
            sql = f"UPDATE {table_name} SET column_name = 'new_value' WHERE id = 1;"
            explanation = f"This query updates records in the {table_name} table. Specify the columns to update and the conditions."

        elif any(keyword in query_lower for keyword in ["delete", "remove", "drop"]):
            table_name = self._extract_table_name(query_lower)
            sql = f"DELETE FROM {table_name} WHERE condition = 'value';"
            explanation = f"This query deletes records from the {table_name} table based on a condition. Be careful with DELETE operations."

        elif any(keyword in query_lower for keyword in ["join", "combine", "merge"]):
            sql = "SELECT t1.*, t2.* FROM table1 t1 JOIN table2 t2 ON t1.id = t2.table1_id;"
            explanation = "This query joins two tables together. Replace table names and join conditions as needed."

        elif any(keyword in query_lower for keyword in ["group", "aggregate", "sum", "average", "max", "min"]):
            table_name = self._extract_table_name(query_lower)
            if "sum" in query_lower:
                sql = f"SELECT SUM(amount) FROM {table_name} GROUP BY category;"
            elif "average" in query_lower or "avg" in query_lower:
                sql = f"SELECT AVG(value) FROM {table_name} GROUP BY category;"
            elif "max" in query_lower:
                sql = f"SELECT MAX(value) FROM {table_name};"
            elif "min" in query_lower:
                sql = f"SELECT MIN(value) FROM {table_name};"
            else:
                sql = f"SELECT category, COUNT(*) FROM {table_name} GROUP BY category;"
            explanation = f"This query performs aggregation on the {table_name} table. Adjust column names and grouping as needed."

        else:
            # More intelligent fallback based on common database operations
            table_name = self._extract_table_name(query_lower)
            sql = f"SELECT * FROM {table_name} LIMIT 10;"
            explanation = f"Based on your query '{query}', this is a general SELECT statement for the {table_name} table. Please provide more specific details about what you want to retrieve, insert, update, or delete."

        return {
            "sql": sql,
            "explanation": explanation
        }

    def _extract_table_name(self, query_lower: str) -> str:
        """Extract potential table name from query"""
        words = query_lower.split()

        # Look for words after "from", "table", "into"
        for i, word in enumerate(words):
            if word in ["from", "table", "into"] and i + 1 < len(words):
                next_word = words[i + 1].strip(".,!?;")
                if next_word and len(next_word) > 2:
                    return next_word

        # Look for common table names
        for word in words:
            clean_word = word.strip(".,!?;")
            if clean_word in ["users", "products", "orders", "customers", "employees", "sales", "inventory", "items", "data"]:
                return clean_word

        # Look for plural nouns (likely table names)
        for word in words:
            clean_word = word.strip(".,!?;")
            if len(clean_word) > 3 and clean_word.endswith('s') and clean_word not in ["this", "that", "was", "has", "is"]:
                return clean_word

        # Default fallback
        return "your_table"

    def _extract_where_conditions(self, query_lower: str) -> str:
        """Extract WHERE conditions from natural language query"""
        conditions = []

        # Handle salary conditions
        if "salary" in query_lower:
            if "greater than" in query_lower or "more than" in query_lower or "above" in query_lower:
                # Extract number after "greater than", "more than", "above"
                import re
                number_match = re.search(r'(?:greater than|more than|above)\s+(\d+)', query_lower)
                if number_match:
                    amount = number_match.group(1)
                    conditions.append(f"salary > {amount}")
            elif "less than" in query_lower or "below" in query_lower or "under" in query_lower:
                import re
                number_match = re.search(r'(?:less than|below|under)\s+(\d+)', query_lower)
                if number_match:
                    amount = number_match.group(1)
                    conditions.append(f"salary < {amount}")
            elif "equal" in query_lower or "exactly" in query_lower:
                import re
                number_match = re.search(r'(?:equal|exactly)\s+(\d+)', query_lower)
                if number_match:
                    amount = number_match.group(1)
                    conditions.append(f"salary = {amount}")

        # Handle age conditions
        if "age" in query_lower:
            if "older than" in query_lower or "above" in query_lower:
                import re
                number_match = re.search(r'(?:older than|above)\s+(\d+)', query_lower)
                if number_match:
                    age = number_match.group(1)
                    conditions.append(f"age > {age}")
            elif "younger than" in query_lower or "under" in query_lower:
                import re
                number_match = re.search(r'(?:younger than|under)\s+(\d+)', query_lower)
                if number_match:
                    age = number_match.group(1)
                    conditions.append(f"age < {age}")

        # Handle department/category conditions
        if "department" in query_lower:
            import re
            dept_match = re.search(r'department\s+(?:is\s+)?["\']?([a-zA-Z\s]+)["\']?', query_lower)
            if dept_match:
                dept = dept_match.group(1).strip()
                conditions.append(f"department = '{dept}'")

        # Handle name conditions
        if "name" in query_lower and ("like" in query_lower or "contains" in query_lower or "starts with" in query_lower):
            import re
            name_match = re.search(r'name\s+(?:like|contains|starts with)\s+["\']([^"\']+)["\']', query_lower)
            if name_match:
                name = name_match.group(1)
                if "starts with" in query_lower:
                    conditions.append(f"name LIKE '{name}%'")
                else:
                    conditions.append(f"name LIKE '%{name}%'")

        # Handle status conditions
        if "status" in query_lower:
            import re
            status_match = re.search(r'status\s+(?:is\s+)?["\']?([a-zA-Z\s]+)["\']?', query_lower)
            if status_match:
                status = status_match.group(1).strip()
                conditions.append(f"status = '{status}'")

        # Handle date conditions
        if "date" in query_lower or "created" in query_lower or "updated" in query_lower:
            if "after" in query_lower or "since" in query_lower:
                import re
                date_match = re.search(r'(?:after|since)\s+(\d{4}-\d{2}-\d{2})', query_lower)
                if date_match:
                    date = date_match.group(1)
                    date_column = "created_at" if "created" in query_lower else "updated_at" if "updated" in query_lower else "date"
                    conditions.append(f"{date_column} > '{date}'")

        return " AND ".join(conditions) if conditions else ""
