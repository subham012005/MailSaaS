import { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';

export const metadata: Metadata = {
  title: "Decision Intelligence | The #1 AI Email Assistant & Mailing SaaS",
  description: "Transform your inbox with Decision Intelligence. The leading global AI email assistant for smart delegation, neural thread analysis, and secure mailing automation.",
  keywords: [
    "AI Email Assistant", "Inbox Management", "Smart Mailing SaaS",
    "Decision Intelligence", "Professional Email AI", "Automated Email Delegation",
    "Neural Inbox Logic", "Enterprise Email Productivity", "AI Mailing Engine"
  ],
  alternates: {
    canonical: "https://smartemail.in",
  },
};

export default function Page() {
  return <LandingClient />;
}
