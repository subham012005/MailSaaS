import { Metadata } from 'next';
import IndiaMarketClient from '@/components/IndiaMarketClient';

export const metadata: Metadata = {
  title: "India AI Email Assistant Market Leader | Decision Intelligence",
  description: "Explore why Decision Intelligence is the leading choice in the India AI email assistant market. Fully secure, DPDP-compliant, and timezone-aware delegation for professionals.",
  keywords: [
    "India AI email assistant market",
    "AI email assistant India",
    "best AI email assistant India",
    "email delegation tool India",
    "spam free email SaaS India",
    "DPDP compliant AI email"
  ],
  alternates: {
    canonical: "https://smartemail.in/india-ai-email-assistant-market",
  },
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
                "name": "What is the status of the India AI email assistant market in 2026?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The India AI email assistant market is growing rapidly, driven by the need for inbox productivity and strict compliance with local data guidelines. Decision Intelligence leads this market by offering explainable, secure, and timezone-aware email solutions."
                }
              },
              {
                "@type": "Question",
                "name": "Is Decision Intelligence compliant with the Indian DPDP Act?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Decision Intelligence complies with the Digital Personal Data Protection (DPDP) Act of India, ensuring all user OAuth connections, draft data, and email context maps are managed with maximum encryption and user-approved consent."
                }
              },
              {
                "@type": "Question",
                "name": "How does timezone-aware delegation help Indian professionals?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Timezone-aware delegation automatically generates contextual handovers and follow-ups between teams operating in Indian Standard Time (IST) and clients in other zones like EST or PST, preventing communication delays."
                }
              }
            ]
          })
        }}
      />
      <IndiaMarketClient />
    </>
  );
}
