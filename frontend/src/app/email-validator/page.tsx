import { Metadata } from 'next';
import EmailValidatorViewClient from '@/components/EmailValidatorViewClient';

export const metadata: Metadata = {
    title: "Free Email Validator & Verifier | Check If Any Email Is Real — Decision Intelligence",
    description: "Instantly validate any email address for free — no login required. Our SMTP email verifier checks syntax, MX records, mailbox existence, disposable email detection, and catch-all domains in real time. The most accurate free email checker online.",
    keywords: [
        "free email validator",
        "email verifier",
        "check if email is valid",
        "email verification tool",
        "SMTP email checker",
        "validate email address free",
        "email address checker",
        "check if email exists",
        "real-time mailbox verification",
        "MX record checker",
        "disposable email detector",
        "catch-all email checker",
        "bulk email validator",
        "email bounce checker",
        "free email verification",
        "email address validator online",
        "verify email without sending",
        "check email deliverability",
    ],
    alternates: {
        canonical: "https://smartemail.in/email-validator",
    },
    openGraph: {
        title: "Free Email Validator — Check If Any Email Is Real",
        description: "Instantly validate any email address for free. Real-time SMTP check, MX record lookup, disposable email detection — no login required.",
        url: "https://smartemail.in/email-validator",
        siteName: "Decision Intelligence",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Email Validator — SMTP Mailbox Verification",
        description: "Check if any email address is real and deliverable. Free, instant, no login required.",
        creator: "@smartemail_in",
    },
};

export default function Page() {
    return <EmailValidatorViewClient />;
}
