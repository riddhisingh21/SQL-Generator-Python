from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

try:
    from .services.sql_generator import SQLGeneratorService
    from .config import settings
except ImportError:
    # Handle relative imports when running directly
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent))
    from services.sql_generator import SQLGeneratorService
    from config import settings

# Load environment variables
load_dotenv()

# Initialize services
sql_service = SQLGeneratorService()

app = FastAPI(
    title="SQL Generator API",
    description="Backend API for SQL Generator application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SQLRequest(BaseModel):
    query: str
    database_type: str = "postgresql"

class SQLResponse(BaseModel):
    sql: str
    explanation: str

# Routes
@app.get("/")
async def root():
    return {"message": "SQL Generator API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "sql-generator-api"}

@app.post("/generate-sql", response_model=SQLResponse)
async def generate_sql(request: SQLRequest):
    """
    Generate SQL from natural language query
    """
    try:
        result = await sql_service.generate_sql(request.query, request.database_type)
        
        return SQLResponse(
            sql=result["sql"],
            explanation=result["explanation"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/databases")
async def get_supported_databases():
    """
    Get list of supported database types
    """
    return {
        "databases": [
            {"id": "postgresql", "name": "PostgreSQL"},
            {"id": "mysql", "name": "MySQL"},
            {"id": "sqlite", "name": "SQLite"},
            {"id": "mssql", "name": "Microsoft SQL Server"},
            {"id": "oracle", "name": "Oracle"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
