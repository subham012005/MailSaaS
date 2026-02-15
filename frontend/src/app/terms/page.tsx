import { Metadata } from 'next';
import TermsClient from '@/components/TermsClient';

export const metadata: Metadata = {
    title: "Terms of Service | Global Decision Intelligence Usage",
    description: "Review the global terms and framework for using Decision Intelligence. Engineered for worldwide AI mailing standards and professional accountability.",
    keywords: ["AI Mailing Terms", "SaaS Terms of Service USA UK", "Global Email Assistant Legal", "Decision Intelligence Agreement"],
};

export default function Page() {
    return <TermsClient />;
}
