'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useNotifications } from '@/hooks/useNotifications';
import { showNotification } from '@/lib/notifications';
import { MobileMenuProvider, useMobileMenu } from '@/contexts/MobileMenuContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const accessToken = (session?.user as any)?.accessToken;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/api/auth/signin');
        }
    }, [status, router]);

    // Use Mobile Menu Context
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    // Notification State
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const prevNotificationsLenRef = useRef(0);

    // Toast new notifications
    useEffect(() => {
        if (notifications.length > prevNotificationsLenRef.current) {
            const newCount = notifications.length - prevNotificationsLenRef.current;
            const newNotifs = notifications.slice(0, newCount);

            newNotifs.forEach(n => {
                if (!n.read) {
                    // Show notification with appropriate type
                    showNotification(n.message, { type: 'success' });
                }
            });
        }
        prevNotificationsLenRef.current = notifications.length;
    }, [notifications]);

    const runTokenDebug = async () => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/debug/token`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${(session?.user as any)?.accessToken}`,
                    'X-User-Email': session?.user?.email || ''
                }
            });
            const data = await response.json();
            console.log('TOKEN DEBUG RESULT:', data);
            showNotification('Token debug info logged to console', { type: 'success' });
        } catch (error) {
            console.error('Token debug failed:', error);
            showNotification('Token debug failed', { type: 'error' });
        }
    };

    if (status === 'loading') return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden relative">

            {/* Mobile Menu Overlay */}
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
                    // Navigation handled by Link in Sidebar, just close specific panels if needed
                    setShowNotifications(false);
                }}
                onViewAllNotifications={() => {
                    router.push('/dashboard/memory');
                    setShowNotifications(false);
                }}
                user={session?.user}
                runTokenDebug={runTokenDebug}
            />

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <MobileMenuProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </MobileMenuProvider>
    );
}
