import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from routers import emails, user, delegations, metrics, governance, notifications

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Decision Intelligence API",
    description="AI-powered email decision intelligence system",
    version="2.0-async"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
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
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {"message": "Decision Intelligence API is running", "version": "2.0-async"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
