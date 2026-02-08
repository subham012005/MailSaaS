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

export const metadata: Metadata = {
  title: "SmartEmail | AI Decision Intelligence for Gmail & Professionals",
  description: "SmartEmail is an advanced AI inbox assistant for professionals. Securely delegate emails, analyze complex threads, and master your Gmail with explainable decision intelligence.",
  keywords: ["AI Inbox Assistant", "Email Decision Intelligence", "Generative AI for Email", "Smart Email Delegation", "Perplexity-optimized email tool", "ChatGPT for Gmail", "Secure AI Email Automation", "Inbox Intelligence", "SmartEmail"],
  authors: [{ name: "SmartEmail Global" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "SmartEmail - Decision Intelligence for Professionals",
    description: "The ultimate AI-first email experience that puts you in control.",
    url: "https://smartemail.in",
    siteName: "SmartEmail",
    type: "website",
    images: [{ url: '/logo.png' }]
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartEmail | AI Decision Intelligence",
    description: "Master your inbox with explainable AI.",
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
                "name": "SmartEmail",
                "operatingSystem": "Web",
                "applicationCategory": "ProductivityApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "SmartEmail is an AI-powered email decision intelligence platform that helps users manage their Gmail inbox through secure delegation and automated thread analysis.",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "100"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "SmartEmail",
                "url": "https://smartemail.in",
                "logo": "https://smartemail.in/logo.png",
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
