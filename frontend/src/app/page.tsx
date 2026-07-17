import { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';

export const metadata: Metadata = {
  title: "Decision Intelligence | Top India AI Email Assistant Market Leader",
  description: "Experience the #1 Global AI Email Assistant. Decision Intelligence optimizes your inbox in USA, UK, India, and beyond. Dominating the India AI email assistant market with smart delegation and secure mailing automation for professionals.",
  keywords: [
    "India AI email assistant market", "AI Email Assistant Worldwide", "Best Inbox Management 2025", "Smart Mailing SaaS USA",
    "Decision Intelligence India", "UK Professional Email AI", "Automated Gmail Delegation",
    "Neural Inbox Logic", "Enterprise Email Productivity Tool", "Global AI Mailing Engine",
    "free email validator", "email verifier", "check if email is real", "email verification tool", "SMTP email checker"
  ],
  alternates: {
    canonical: "https://smartemail.in",
  },
};

export default function Page() {
  return <LandingClient />;
}
