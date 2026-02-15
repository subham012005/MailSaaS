import { Metadata } from 'next';
import SafetyClient from '@/components/SafetyClient';

export const metadata: Metadata = {
    title: "Safety Architecture | International AI Email Security",
    description: "Decision Intelligence safety global protocols: AES-256, BYOK infrastructure, and zero-tracking policy. Trusted by professionals in USA, Europe, and Asia.",
    keywords: ["Global Email Security", "AI Safety Protocols", "Secure Mailing SaaS Worldwide", "Encrypted Inbox Assistant USA"],
};

export default function Page() {
    return <SafetyClient />;
}
