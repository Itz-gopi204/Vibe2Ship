import os
import sys

# Ensure backend directory is in system path for nested imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Database initialization
from database import setup
setup.run_setup()

# Routers
from routers import issues, users, analysis

app = FastAPI(
    title="Community Hero Civic Backend", 
    description="Layered backend architecture managing database schemas, dynamic LLM agents, and AI resolution audits.",
    version="2.0.0"
)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static visuals through the /api proxy endpoint
os.makedirs("static", exist_ok=True)
app.mount("/api/static", StaticFiles(directory="static"), name="static")

# Mount Routers
app.include_router(issues.router)
app.include_router(users.router)
app.include_router(analysis.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
