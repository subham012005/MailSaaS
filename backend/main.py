import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from routers import emails, user, delegations, metrics, governance

# Configure Logging
logging.basicConfig(
    level=logging.DEBUG, 
    filename='backend_debug.log', 
    filemode='a',
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate Environment
required_env_vars = ['OPENAI_API_KEY', 'DATABASE_URL', 'ENCRYPTION_KEY']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")

app = FastAPI(title="Decision Intelligence Email Assistant")

# CORS Configuration
environment = os.getenv('ENVIRONMENT', 'development')
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] if environment == 'development' else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(emails.router)
app.include_router(user.router)
app.include_router(delegations.router)
app.include_router(metrics.router)
app.include_router(governance.router)

@app.get("/")
async def root():
    return {"message": "Decision Intelligence API is running", "version": "2.0-async"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
