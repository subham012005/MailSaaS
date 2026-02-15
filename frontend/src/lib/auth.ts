import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    debug: true,
    logger: {
        error(code, metadata) {
            console.error("NextAuth Error:", code, metadata);
        },
        warn(code) {
            console.warn("NextAuth Warning:", code);
        },
        debug(code, metadata) {
            console.log("NextAuth Debug:", code, metadata);
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, account }) {
            // Initial sign in
            if (account) {
                console.log("DEBUG: NextAuth JWT - Initial sign in. Capturing tokens.");
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at as number,
                };
            }

            // Return previous token if valid
            const expiresAt = (token as { expiresAt?: number }).expiresAt;
            if (expiresAt && Date.now() < (expiresAt * 1000 - 10000)) {
                return token;
            }

            // Access token has expired, try to update it
            console.log("DEBUG: NextAuth JWT - Token expired, attempting refresh.");
            return await refreshAccessToken(token);
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.sub;
                (session.user as { accessToken?: string }).accessToken = token.accessToken as string | undefined;
                (session.user as { refreshToken?: string }).refreshToken = token.refreshToken as string | undefined;
                (session.user as { error?: string }).error = token.error as string | undefined;
            }
            return session;
        },
    },
};

interface Token {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    [key: string]: unknown;
}

async function refreshAccessToken(token: Token) {
    try {
        const url = "https://oauth2.googleapis.com/token";
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID || "",
                client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
                grant_type: "refresh_token",
                refresh_token: (token.refreshToken as string) || "",
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        console.log("DEBUG: Token refreshed successfully.");

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing access token", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}
