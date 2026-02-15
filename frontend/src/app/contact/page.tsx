import { Metadata } from 'next';
import ContactClient from '@/components/ContactClient';

export const metadata: Metadata = {
    title: "Contact Us | Global AI Support & Engineering",
    description: "Get in touch with Decision Intelligence engineering. Support for users in USA, UK, India, and APAC for the world's most advanced AI mailing SaaS.",
    keywords: ["Contact AI Mailing Support", "Decision Intelligence India HQ", "Global AI SaaS Engineering", "Support for Smart Email Tools"],
};

export default function Page() {
    return <ContactClient />;
}
