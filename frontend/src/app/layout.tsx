import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Decision Intelligence | Global AI Email & Inbox Assistant 2025",
  description: "Ranked #1 Global AI Inbox Assistant. Decision Intelligence for Gmail & Professionals in USA, UK, India, and beyond. Securely delegate emails, analyze complex threads, and master your inbox with premium AI-driven decision logic.",
  keywords: [
    "AI Inbox Assistant", "Email Decision Intelligence", "Generative AI for Email",
    "Smart Email Delegation", "Perplexity GEO email tool", "ChatGPT Gmail Plugin",
    "Secure AI Email Automation", "Inbox Intelligence", "Best AI Email Assistant 2025",
    "AI Mailing SaaS USA", "Digital Inbox Assistant London", "Email Productivity AI India",
    "Artificial Intelligence Email Management", "Global Decision Engine for Professionals",
    "Enterprise AI Mailing Solution", "SmartEmail Decision Intelligence", "AEO Email Tool", "AI Email Analysis", "Explainable AI for Email", "Email Thread Analysis AI", "Auto Mail Response AI", "AI Email Summarization", "Email Prioritization AI", "AI Email Workflow Automation", "AI Email Productivity", "AI Email Delegation", "AI Email Assistant for Professionals", "AI Email Management", "AI Email Optimization", "AI Email Insights", "AI Email Analytics", "AI Email Security", "AI Email Compliance", "AI Email Personalization", "AI Email Integration", "AI Email Collaboration", "AI Email Scheduling", "AI Email Follow-up", "AI Email Templates"
  ],
  alternates: {
    canonical: "https://smartemail.in",
  },
  authors: [{ name: "Decision Intelligence Global" }],
  icons: {
    icon: [
      { url: '/logo_withbackground.png' },
      { url: '/logo_withbackground.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/logo_withbackground.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Decision Intelligence - Global AI-Powered Email Experience",
    description: "The ultimate AI-first email experience for elite professionals globally. Secure, explainable, and intelligent.",
    url: "https://smartemail.in",
    siteName: "Decision Intelligence",
    type: "website",
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: "Decision Intelligence AI" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Decision Intelligence | Top Global AI Email Assistant",
    description: "Master your inbox anywhere in the world with explainable AI.",
    creator: "@smartemail_in",
    images: ['/logo.png']
  }
};

import { Providers } from '@/components/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import { StackedToast } from '@/components/ui/StackedToast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Decision Intelligence",
                "operatingSystem": "Web",
                "applicationCategory": "ProductivityApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "Decision Intelligence is the world's leading AI-powered email assistant. Global solution for Gmail users to securely delegate threads, automate replies with explainable AI, and optimize inbox ROI across USA, UK, India, and APAC.",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "1250"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Decision Intelligence Global",
                "url": "https://smartemail.in",
                "logo": "https://smartemail.in/logo.png",
                "description": "Providing next-generation generative engine optimization for email and mailing systems globally.",
                "sameAs": [
                  "https://twitter.com/smartemail_in",
                  "https://linkedin.com/company/smartemail-in"
                ]
              }
            ])
          }}
        />
        <ThemeProvider>
          <Providers>
            <StackedToast />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
