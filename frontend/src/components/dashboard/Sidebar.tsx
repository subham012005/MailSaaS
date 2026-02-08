'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Inbox,
    Send,
    History,
    Settings,
    LogOut,
    Users,
    Zap,
    Sun,
    Moon,
    Star,
    Clock,
    AlertOctagon,
    Trash2,
    FileText,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import NotificationPanel from '../NotificationPanel';
import { useTheme } from '@/components/ThemeProvider';

export type ViewState = 'inbox' | 'sent' | 'memory' | 'drafts' | 'settings' | 'governance' | 'delegations' | 'metrics' | 'starred' | 'snoozed' | 'spam' | 'trash' | 'scheduled';

interface SidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    notifications: any[];
    showNotifications: boolean;
    toggleNotificationPanel: () => void;
    handleMarkNotificationAsRead: (id: number) => void;
    handleClearAllNotifications: () => void;
    onNotificationClick?: (notification: any) => void;
    onViewAllNotifications?: () => void;
    user?: any;
    runTokenDebug?: () => void;
}

export default function Sidebar({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    notifications,
    showNotifications,
    toggleNotificationPanel,
    handleMarkNotificationAsRead,
    handleClearAllNotifications,
    onNotificationClick,
    onViewAllNotifications,
    user,
    runTokenDebug
}: SidebarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true; // Default
        return pathname?.startsWith(path);
    };

    const mainNavItems = [
        { icon: Inbox, label: 'Inbox', href: '/dashboard/inbox', count: 3 },
        { icon: Star, label: 'Starred', href: '/dashboard/starred', count: 0 },
        { icon: Clock, label: 'Snoozed', href: '/dashboard/snoozed', count: 0 },
        { icon: Send, label: 'Sent', href: '/dashboard/sent', count: 0 },
        { icon: FileText, label: 'Drafts', href: '/dashboard/drafts', count: 1 },
        { icon: Clock, label: 'Scheduled', href: '/dashboard/scheduled', count: 2 },
    ] as const;

    const moreItems = [
        { icon: AlertOctagon, label: 'Spam', href: '/dashboard/spam', count: 3 },
        { icon: Trash2, label: 'Trash', href: '/dashboard/trash', count: 0 },
    ] as const;

    const appItems = [
        { icon: Users, label: 'Delegations', href: '/dashboard/delegations', count: 0 },
        { icon: History, label: 'History', href: '/dashboard/memory', count: 0 },
        { icon: Zap, label: 'Analytics', href: '/dashboard/metrics', count: 0 },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings', count: 0 },
        { icon: Shield, label: 'Governance', href: '/dashboard/governance', count: 0 },
    ] as const;

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-72 bg-sidebar backdrop-blur-3xl border-r border-sidebar-border
            transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            flex flex-col
        `}>
            {/* Header */}
            <div className="p-8 shrink-0">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-xl">
                            <img src="/logo.png" alt="SmartEmail Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground">SmartEmail</span>
                    </div>

                    <NotificationPanel
                        notifications={notifications}
                        isOpen={showNotifications}
                        onClose={toggleNotificationPanel}
                        onMarkAsRead={handleMarkNotificationAsRead}
                        onClearAll={handleClearAllNotifications}
                        onNotificationClick={onNotificationClick}
                        onViewAll={onViewAllNotifications}
                    />
                </div>

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-muted border border-border hover:bg-muted/80 transition-all text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                    <span className="flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                        <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </span>
                    <div className="w-8 h-4 bg-muted-foreground/20 rounded-full relative flex items-center px-1">
                        <motion.div
                            animate={{ x: theme === 'dark' ? 16 : 0 }}
                            className="w-2 h-2 rounded-full bg-white dark:bg-primary shadow-sm"
                        />
                    </div>
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-8 pb-10">
                <nav className="space-y-1">
                    <div className="px-4 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Communications</span>
                    </div>
                    {mainNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 group
                                    ${active
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'}
                                `}
                            >
                                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-primary' : 'group-hover:text-foreground'}`} />
                                <span className="flex-1 text-left font-medium">{item.label}</span>
                                {item.count > 0 && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <nav className="space-y-1">
                    <div className="px-4 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Intelligence</span>
                    </div>
                    {appItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 group
                                    ${active
                                        ? 'bg-secondary/10 text-secondary border border-secondary/20 shadow-lg shadow-secondary/5'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'}
                                `}
                            >
                                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-secondary' : 'group-hover:text-foreground'}`} />
                                <span className="flex-1 text-left font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Trust & Security Widget */}
                {/* ... existing widget code ... */}
                <div className="px-2">
                    <div className="glass-card p-6 bg-primary/[0.02] border-white/5 overflow-hidden group">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <Shield className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Trust Engine</span>
                                <span className="text-[8px] text-muted-foreground font-medium">L4 SECURITY PROTOCOL</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-medium">
                                    <span className="text-gray-500">LLM Privacy</span>
                                    <span className="text-emerald-500 font-bold uppercase tracking-tighter">Verified</span>
                                </div>
                                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        className="h-full bg-emerald-500/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="p-2 rounded-xl bg-muted border border-border flex flex-col gap-1">
                                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Model</span>
                                    <span className="text-[9px] text-foreground font-medium">Hybrid-S</span>
                                </div>
                                <div className="p-2 rounded-xl bg-muted border border-border flex flex-col gap-1">
                                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Encryption</span>
                                    <span className="text-[9px] text-foreground font-medium">AES-256</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-2">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[9px] space-y-1.5 opacity-40 group hover:opacity-100 transition-opacity relative overflow-hidden h-20">
                        <div className="flex items-center gap-2 text-emerald-500/80">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                            <span className="font-bold">CORE_ENGAGE: OK</span>
                        </div>
                        <div className="text-gray-500 animate-pulse delay-75 uppercase">
                            {'>'} SYNC_VECTORS_L1...
                        </div>
                        <div className="text-gray-500 animate-pulse delay-150 uppercase">
                            {'>'} MAP_DECISION_NODES...
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Footer / Account */}
            <div className="p-8 mt-auto space-y-6">
                {user && (
                    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-muted border border-border group">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                            {user.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-primary font-bold">{user.name?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{user.name || 'Account'}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-medium">{user.email}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                    >
                        <LogOut className="w-3 h-3" />
                        Exit
                    </button>
                    <button
                        onClick={runTokenDebug}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
                    >
                        <Zap className="w-3 h-3" />
                        Debug
                    </button>
                </div>
            </div>
        </aside>
    );
}
