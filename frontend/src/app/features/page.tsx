import { Metadata } from 'next';
import FeaturesClient from '@/components/FeaturesClient';

export const metadata: Metadata = {
    title: "Global AI Email Features | Decision Intelligence Dashboard",
    description: "Explore the technical capabilities of Decision Intelligence: Shadow Mode Learning, Neural Thread Analysis, and Secure Global Delegation. Optimized for professionals in USA, UK, India, and APAC.",
    keywords: ["AI Email Features", "Neural Inbox Management", "Smart Delegation Tool Global", "Shadow Mode AI", "Email Outcome Prediction"],
};

export default function Page() {
    return <FeaturesClient />;
}
