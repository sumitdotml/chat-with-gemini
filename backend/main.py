from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat  # Changed to absolute import
from dotenv import load_dotenv
import os
import uvicorn

# Load environment variables at startup
load_dotenv()

# Verify API key is loaded
if not os.getenv("GEMINI_API_KEY"):
    raise ValueError("GEMINI_API_KEY environment variable is not set")

app = FastAPI(debug=True)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
