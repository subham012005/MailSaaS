# Decision Intelligence Email Assistant

A professional email-assistant focused on decision intelligence, trust, and safety.

## Project Structure

- `/backend`: FastAPI application with LangChain integration.
  - `main.py`: API entry point.
  - `intents.py`: Intent + Consequence Engine.
  - `memory.py`: Personal Decision Memory.
  - `models.py`: Data models.
- `/frontend`: Next.js application with Framer Motion and Tailwind CSS.
  - `src/app`: Dashboard and Landing Page.
  - `src/components`: Reusable UI components (DraftEditor).
  - `src/lib`: API client.

## Getting Started

### Backend Setup
1. `cd backend`
2. Create `venv`: `python -m venv venv`
3. Activate `venv`: `.\venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt` (Note: I've installed them already in the demo)
5. Set `OPENAI_API_KEY` in `.env`.
6. Run: `python main.py`

### Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Set `NEXT_PUBLIC_API_URL` in `.env.local`.
4. Run: `npm run dev`

## Core Features
- **Shadow Mode**: Silent observation for zero-risk onboarding.
- **Intent + Consequence Engine**: Recommends actions with predicted outcomes.
- **Correction-driven Learning**: Learns from your edits to AI drafts.
- **Explainability**: "Why this reply" view for every suggestion.
- **Premium UI**: Glassmorphic, dark theme designed for professionals.
