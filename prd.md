# Product Requirements Document: Decision Intelligence Email Assistant

## 1. Project Overview
### 1.1 Mission
To build a professional, trust-centric email assistant that empowers users with "Decision Intelligence." The system doesn't just draft replies; it analyzes intent, predicts consequences, and learns from user behavior to act as a high-fidelity proxy for professional communication.

### 1.2 Target Audience
- Executives and Managers handling high volumes of critical emails.
- Professional services (Legal, Consulting) where tone and accuracy are paramount.
- Individuals seeking to delegate email management with high safety and trust.

### 1.3 Core Value Proposition
- **Trust & Safety**: Explainable AI that shows "why" a suggestion was made.
- **Decision Intelligence**: Predicting the outcome of a reply before it's sent.
- **Proactive Delegation**: Identifying tasks and delegating them with context.

---

## 2. Frontend Requirements (Web)
### 2.1 Technology Stack
- **Framework**: Next.js 14+ (App Router).
- **Styling**: Tailwind CSS with a "Premium Apple-style" aesthetic.
- **UI Components**: shadcn/ui, Radix UI.
- **Animations**: Framer Motion, React Bits (Squares, BlurText, ShinyText).
- **State Management**: React Context / Hooks.

### 2.2 Key Features & Pages
- **Landing Page**: High-conversion, animated introduction to "Decision Intelligence."
- **Dashboard**:
    - **Inbox**: Unified view with AI-powered metrics (Urgency, Sentiment).
    - **Email Detail View**: Glassmorphic interface featuring:
        - Proactive Suggestions & Reply Flow.
        - Explainability Panel ("Why this reply?").
        - Attachment Viewer.
    - **Delegation Intelligence**: Track and manage delegated tasks.
    - **Personal Decision Memory**: View how the AI has learned from your edits.
- **Theme Support**: Robust Dark/Light mode support with high-contrast semantic variables.

---

## 3. Backend Requirements
### 3.1 Technology Stack
- **Framework**: FastAPI.
- **AI/LLM**: LangChain, OpenAI (GPT-4o/Turbo).
- **Email Integration**: Gmail API (OAuth2).
- **Database**: SQLite (Development) / PostgreSQL (Production).
- **Security**: AES-256 Encryption for sensitive data, Fernet for session tokens.

### 3.2 Core Engines
- **Intent + Consequence Engine**: Analyzes incoming emails for underlying intent and suggests replies with predicted outcomes.
- **Personal Decision Memory**: A feedback loop that records user edits to AI drafts to refine future suggestions.
- **Shadow Mode**: A silent observation mode that builds a user profile without sending any emails.
- **Attachment Processor**: Securely handles and indexes email attachments for LLM context.

---

## 4. Mobile Frontend Requirements
### 4.1 UI/UX Strategy
- **Responsive Design**: Mobile-first approach for all dashboard views.
- **Optimized Layouts**:
    - Compact headers (showing only App Name).
    - Hidden descriptive text on small screens to maximize content area.
    - Sticky headers that hide on scroll.
- **Navigation**: Mobile-specific bottom navigation or slide-out menu (`MobileMenuContext`).
- **Touch Interactions**: Swipe gestures for email actions (archive, delete, snooze).

### 4.2 Features
- **Push Notifications**: Real-time alerts for high-urgency emails.
- **Quick Actions**: One-tap "Approve & Send" for AI-generated drafts.
- **Mobile-friendly Stats**: Horizontally scrollable metrics dashboard.
