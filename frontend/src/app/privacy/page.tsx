import { Metadata } from 'next';
import PrivacyClient from '@/components/PrivacyClient';

export const metadata: Metadata = {
    title: "Privacy Policy | Decision Intelligence Global Data Safety",
    description: "Our world-class privacy protocols (GDPR, CCPA) ensure your email data is protected globally. Learn about AES-256 encryption and secure OAuth for your AI email assistant.",
    keywords: ["AI Email Privacy", "Safe Mailing SaaS USA", "GDPR Email Assistant", "Encryption for Gmail AI"],
};

export default function Page() {
    return <PrivacyClient />;
}
