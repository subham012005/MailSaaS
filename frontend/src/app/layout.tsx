import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
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
    "AI Email Assistant", "Email Decision Intelligence", "Inbox Management Software",
    "Generative AI Email", "Smart Email Delegation", "Mailing SaaS",
    "Automated Email Workflow", "AI Inbox Assistant", "Email Productivity Tool",
    "Enterprise Email AI"
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
      <body className={`${inter.variable} ${ebGaramond.variable} antialiased`}>
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
