import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';

// ─── In-Memory Cache (per validated email, 24hr TTL) ───────────────────────
const resultCache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(email: string) {
    const entry = resultCache.get(email.toLowerCase());
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { resultCache.delete(email.toLowerCase()); return null; }
    return entry.data;
}

function setCache(email: string, data: unknown) {
    // Cap cache size at 10,000 entries to prevent memory leak
    if (resultCache.size >= 10000) {
        const firstKey = resultCache.keys().next().value;
        if (firstKey) resultCache.delete(firstKey);
    }
    resultCache.set(email.toLowerCase(), { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Per-IP Rate Limiter (10 requests / 60 seconds) ────────────────────────
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 10;        // max requests
const RATE_WINDOW_MS = 60_000; // per 60 seconds

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, windowStart: now });
        return false;
    }

    if (entry.count >= RATE_LIMIT) return true;

    entry.count++;
    return false;
}

// ─── Route Handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    // 1. Rate limit check
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

    if (isRateLimited(ip)) {
        return NextResponse.json(
            { detail: 'Too many requests. Please wait 60 seconds before trying again.' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }

    // 2. Parse body
    let body: { email?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
    }

    const email = (body.email || '').trim().toLowerCase();
    if (!email) {
        return NextResponse.json({ detail: 'Email is required.' }, { status: 400 });
    }

    // 3. Cache hit — return instantly, no SMTP call needed
    const cached = getCached(email);
    if (cached) {
        return NextResponse.json({ ...cached as object, cached: true });
    }

    // 4. Forward to backend
    try {
        const response = await fetch(`${BACKEND_URL}/emails/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // 5. Cache the result before returning
        setCache(email, data);
        return NextResponse.json(data);

    } catch (error) {
        console.error('Email validation proxy error:', error);
        return NextResponse.json(
            { detail: 'Failed to connect to validation service. Please ensure the backend server is running.' },
            { status: 503 }
        );
    }
}
