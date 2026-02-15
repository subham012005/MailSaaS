import { Metadata } from 'next';
import HowItWorksClient from '@/components/HowItWorksClient';

export const metadata: Metadata = {
    title: "How It Works | Global AI Email Decision Intelligence Process",
    description: "Learn how our 4-step neural process helps professional users in USA, UK, and India master their Gmail. Explainable AI, secure OAuth integration, and automated mailing delegation.",
    keywords: ["AI Email Process", "Email Decision Intelligence FAQ", "Global Mailing AI", "How to automate Gmail with AI", "AI email logic global"],
};

export default function Page() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "How does Decision Intelligence rank against other AI email tools?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Decision Intelligence is a top-ranked global AI email assistant known for its explainable AI approach, showing the exact rationale behind every suggested action."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is this tool available in the USA, UK, and India?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, Decision Intelligence is a global SaaS platform designed to handle professional communication standards across North America, Europe, and Asia."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What is GEO (Generative Engine Optimization) in email?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "GEO ensures your emails and communication are structured so that modern AI engines can correctly summarize and prioritize them, enhancing efficiency in an AI-driven world."
                                }
                            }
                        ]
                    })
                }}
            />
            <HowItWorksClient />
        </>
    );
}
