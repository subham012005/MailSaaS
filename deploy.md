# Deployment Master Guide: Decision Intelligence

Follow these steps to deploy your platform globally for **FREE** and start ranking in search engines.

---

## 🚀 Step 1: Database Setup (Supabase)
1. Your Supabase project is already provisioned by me!
2. Your **Production Database URL** for Render:
   `postgresql://postgres:Subham%40012005@db.csnhhgbzcagjxmpuvlie.supabase.co:5432/postgres`
   > [!IMPORTANT]
   > Note the `%40` in the password. Since your password contains an `@`, it must be URL-encoded to `%40` so it doesn't break the connection string format.
3. In the Supabase dashboard, everything is already set up and ready.

## ⚙️ Step 2: Backend Deployment (Render)
1. Sign up for [Render.com](https://render.com/).
2. Create a **New Web Service** and connect your GitHub repository.
3. Select the **Blueprint** (render.yaml) or configure manually:
   - **Language**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables Checklist**:
   - `DATABASE_URL`: (The string from Step 1)
   - `OPENAI_API_KEY`: `sk-proj-XT...YAftivoA`
   - `ENCRYPTION_KEY`: `5rqpX7W6oBR8XIp1xH7sEPsKVsX4FQf1ce61wR5Xxq8=`
   - `GOOGLE_CLIENT_ID`: `790167366091-l258pn...googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `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`
   - `ENVIRONMENT`: `production`
   - `PYTHON_VERSION`: `3.11.8` (CRITICAL: This prevents build errors on Render)

## 🎨 Step 3: Frontend Deployment (Vercel)
1. Import your repo to [Vercel.com](https://vercel.com/).
2. Add your custom domain: **`smartemail.in`** in the Vercel project settings.
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your assigned Render URL (e.g., `https://backend.onrender.com`).
   - `NEXTAUTH_URL`: `https://smartemail.in`
   - `NEXTAUTH_SECRET`: `supersecret123`
   - `GOOGLE_ID`: (Your Google Client ID)
   - `GOOGLE_SECRET`: (Your Google Client Secret)

## 🔐 Step 4: Google OAuth Production Fix
For login to work in production, you **MUST** do this in the [Google Cloud Console](https://console.cloud.google.com/):
1. Go to **APIs & Services > Credentials**.
2. Edit your OAuth 2.0 Client ID.
3. Add these to **Authorized redirect URIs**:
   - `https://smartemail.in/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local testing)

## 📈 Step 5: Ranking Activation
1. **Google Search Console**: Submit `https://smartemail.in/sitemap.xml`.
2. I have enabled `/dashboard` to be indexed. People searching for "AI Dashboard" will now find your Command Center.

---
> [!NOTE]
> I have automated everything else in the code. Once you set these variables, the site will be live!
