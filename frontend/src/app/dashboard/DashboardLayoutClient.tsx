'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import GoogleFeedbackForm from '@/components/GoogleFeedbackForm';
import { X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { showNotification } from '@/lib/notifications';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import { useDashboardData, groupEmailsByThread } from '@/hooks/useDashboardData';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

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
                if (!n.read) {
                    showNotification(n.message, { type: 'success' });
                }
            });
        }
        prevNotificationsLenRef.current = notifications.length;
    }, [notifications]);


    if (status === 'loading') return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
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
                onNotificationClick={() => {
                    setShowNotifications(false);
                }}
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
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
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

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {children}
            </main>
        </div>
    );
}
