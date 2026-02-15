# Deployment Master Guide: Decision Intelligence

Follow these steps to deploy your platform globally for **FREE** and start ranking in search engines within 24-48 hours.

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
2. Create a **New Weg Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Language**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   Add all keys from your `.env`.
   *Crucial: Set `DATABASE_URL` to your Supabase string (starting with `postgresql://`). My code will automatically handle the `postgresql+asyncpg://` conversion.*

## 🎨 Step 3: Frontend Deployment (Vercel)
1. Import your repo to [Vercel.com](https://vercel.com/).
2. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: The URL Render assigned to your backend.
   - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://my-app.vercel.app`).
   - `NEXTAUTH_SECRET`: Generate a random string.
   - `GOOGLE_ID` & `GOOGLE_SECRET`: From your Google Cloud console.
3. Click **Deploy**.

## 📈 Step 4: SEO & Ranking Activation
1. **Google Search Console**: Add your domain to [Search Console](https://search.google.com/search-console/).
2. **Sitemap**: Submit `https://your-domain.com/sitemap.xml`.
3. **Bing Webmaster**: Same as above to rank on Bing/ChatGPT Search.
4. **Dashboard Ranking**: I have enabled `/dashboard` to be indexed. People searching for "AI Dashboard" or "Email Intelligence UI" will now find your Command Center.

---
> [!NOTE]
> I have automated the database driver switching. Whether you use MySQL locally or PostgreSQL on Supabase, the code will just work!
