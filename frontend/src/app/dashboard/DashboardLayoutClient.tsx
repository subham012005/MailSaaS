'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import GoogleFeedbackForm from '@/components/GoogleFeedbackForm';
import { X, Inbox, Send, FileText, Star, Clock, Users, Brain, BarChart2, Shield, Settings, Menu } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { showNotification } from '@/lib/notifications';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import { useDashboardData, groupEmailsByThread } from '@/hooks/useDashboardData';

// Section title map
type SectionInfo = { label: string; icon: React.ElementType; isAI: boolean };
const SECTION_LABELS: Record<string, SectionInfo> = {
    '/dashboard/inbox': { label: 'Inbox', icon: Inbox, isAI: false },
    '/dashboard/sent': { label: 'Sent', icon: Send, isAI: false },
    '/dashboard/drafts': { label: 'Drafts', icon: FileText, isAI: false },
    '/dashboard/starred': { label: 'Starred', icon: Star, isAI: false },
    '/dashboard/snoozed': { label: 'Snoozed', icon: Clock, isAI: false },
    '/dashboard/scheduled': { label: 'Scheduled', icon: Clock, isAI: false },
    '/dashboard/spam': { label: 'Spam', icon: Inbox, isAI: false },
    '/dashboard/trash': { label: 'Trash', icon: Inbox, isAI: false },
    '/dashboard/delegations': { label: 'Delegations', icon: Users, isAI: true },
    '/dashboard/memory': { label: 'AI Memory', icon: Brain, isAI: true },
    '/dashboard/metrics': { label: 'Analytics', icon: BarChart2, isAI: true },
    '/dashboard/governance': { label: 'Governance', icon: Shield, isAI: true },
    '/dashboard/settings': { label: 'Settings', icon: Settings, isAI: false },
};

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    // Use Dashboard Data for Sidebar counts
    const dashboardData = useDashboardData(session);
    const groupedInbox = useMemo(() => groupEmailsByThread(dashboardData.emails || []), [dashboardData.emails]);
    const groupedSent = useMemo(() => groupEmailsByThread(dashboardData.sentEmails || []), [dashboardData.sentEmails]);
    const groupedDrafts = useMemo(() => groupEmailsByThread(dashboardData.draftEmails || []), [dashboardData.draftEmails]);

    const counts = useMemo(() => ({
        inbox: groupedInbox.filter(e => e.hasUnread).length,
        sent: groupedSent.length,
        drafts: groupedDrafts.length,
        scheduled: dashboardData.scheduledEmails.length,
        delegations: dashboardData.delegations.length,
        memory: dashboardData.history.length,
        metrics: dashboardData.metrics ? 1 : 0,
    }), [groupedInbox, groupedSent, groupedDrafts, dashboardData.scheduledEmails, dashboardData.delegations, dashboardData.history, dashboardData.metrics]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/api/auth/signin');
        }
    }, [status, router]);

    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const prevNotificationsLenRef = useRef(0);

    // Toast new notifications
    useEffect(() => {
        if (notifications.length > prevNotificationsLenRef.current) {
            const newCount = notifications.length - prevNotificationsLenRef.current;
            const newNotifs = notifications.slice(0, newCount);
            newNotifs.forEach(n => {
                if (!n.read) showNotification(n.message, { type: 'success' });
            });
        }
        prevNotificationsLenRef.current = notifications.length;
    }, [notifications]);

    // Get current section info
    const currentSection = useMemo((): SectionInfo => {
        const match = Object.entries(SECTION_LABELS).find(([key]) => pathname?.startsWith(key));
        return match ? match[1] : { label: 'Dashboard', icon: Brain, isAI: false };
    }, [pathname]);

    if (status === 'loading') return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto animate-pulse">
                    <Brain className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Initializing Intelligence...</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                notifications={notifications}
                showNotifications={showNotifications}
                toggleNotificationPanel={() => setShowNotifications(!showNotifications)}
                handleMarkNotificationAsRead={(id) => markAsRead(id)}
                handleClearAllNotifications={() => markAllAsRead()}
                onNotificationClick={() => setShowNotifications(false)}
                onViewAllNotifications={() => {
                    router.push('/dashboard/memory');
                    setShowNotifications(false);
                }}
                user={session?.user}
                onSuggestionClick={() => setShowSuggestionModal(true)}
                counts={counts}
            />

            {/* Suggestion Modal */}
            {showSuggestionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowSuggestionModal(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-[#0a0a0b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/5 to-transparent">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Send Suggestion</h2>
                                <p className="text-sm text-gray-400 mt-1">Help us make SmartEmail even better</p>
                            </div>
                            <button
                                onClick={() => setShowSuggestionModal(false)}
                                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <GoogleFeedbackForm
                                onSuccess={() => {
                                    setTimeout(() => setShowSuggestionModal(false), 2000);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main content area */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top section header bar */}
                <div className="flex-shrink-0 h-12 border-b border-border/30 bg-background/60 backdrop-blur-xl flex items-center px-4 gap-3">
                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="w-4 h-4" />
                    </button>

                    {/* Section info */}
                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${currentSection.isAI ? 'bg-indigo-500/15 border border-indigo-500/20' : 'bg-muted border border-border'}`}>
                            <currentSection.icon className={`w-3.5 h-3.5 ${currentSection.isAI ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`text-sm font-bold ${currentSection.isAI ? 'text-indigo-300' : 'text-foreground'}`}>
                            {currentSection.label}
                        </span>
                        {currentSection.isAI && (
                            <span className="intelligence-badge">AI</span>
                        )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Global AI status */}
                    <div className="ai-status-pill hidden sm:flex">
                        <div className="ai-status-dot" />
                        <span className="hidden md:inline">Intelligence Active</span>
                        <span className="md:hidden">Active</span>
                    </div>
                </div>

                {/* Page content */}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
