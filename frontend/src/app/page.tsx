import { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';

export const metadata: Metadata = {
  title: "Decision Intelligence | Top AI Email Assistant & Mailing SaaS 2025",
  description: "Experience the #1 Global AI Email Assistant. Decision Intelligence optimizes your inbox in USA, UK, India, and beyond. Smart delegation, neural thread analysis, and secure mailing automation for professionals.",
  keywords: [
    "AI Email Assistant Worldwide", "Best Inbox Management 2025", "Smart Mailing SaaS USA",
    "Decision Intelligence India", "UK Professional Email AI", "Automated Gmail Delegation",
    "Neural Inbox Logic", "Enterprise Email Productivity Tool", "Global AI Mailing Engine"
  ],
  alternates: {
    canonical: "https://smartemail.in",
  },
};

export default function Page() {
  return <LandingClient />;
}
