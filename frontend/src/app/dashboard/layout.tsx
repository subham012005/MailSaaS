import { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';

export const metadata: Metadata = {
    title: "Decision Intelligence Dashboard | AI-Powered Gmail Control",
    description: "Monitor your neural mailing engine. Strategic thread analysis, AI delegation tracking, and efficiency metrics for global professionals.",
    keywords: ["AI Email Dashboard", "Inbox Intelligence UI", "Professional Mailing Metrics", "AI Delegation Tracker"],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <MobileMenuProvider>
            <DashboardLayoutClient>{children}</DashboardLayoutClient>
        </MobileMenuProvider>
    );
}
