'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Inbox,
    Send,
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
    Shield,
    Lightbulb,
    PenSquare,
    Brain,
    BarChart2,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import NotificationPanel from '../NotificationPanel';
import { useTheme } from '@/components/ThemeProvider';
import { Notification as AppNotification } from '@/hooks/useNotifications';

export type ViewState = 'inbox' | 'sent' | 'memory' | 'drafts' | 'settings' | 'governance' | 'delegations' | 'metrics' | 'starred' | 'snoozed' | 'spam' | 'trash' | 'scheduled';

interface SidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    notifications: AppNotification[];
    showNotifications: boolean;
    toggleNotificationPanel: () => void;
    handleMarkNotificationAsRead: (id: number) => void;
    handleClearAllNotifications: () => void;
    onNotificationClick?: (notification: AppNotification) => void;
    onViewAllNotifications?: () => void;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    onSuggestionClick?: () => void;
    counts?: {
        inbox?: number;
        sent?: number;
        drafts?: number;
        starred?: number;
        snoozed?: number;
        spam?: number;
        trash?: number;
        scheduled?: number;
        delegations?: number;
        memory?: number;
        metrics?: number;
    };
}

const CONSOLE_LINES = [
    { text: '> SYNC_VECTORS_L1...', color: 'text-indigo-400/70' },
    { text: '> MAP_DECISION_NODES...', color: 'text-violet-400/70' },
    { text: '> CONTEXT_ENGINE: READY', color: 'text-emerald-400/80' },
    { text: '> PERSONA_CALIBRATED', color: 'text-sky-400/70' },
    { text: '> REASONING_CORE: OK', color: 'text-emerald-400/80' },
];

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
    onSuggestionClick,
    counts = {}
}: SidebarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [consoleLine, setConsoleLine] = useState(0);

    // Rotate console lines every 2.5s
    useEffect(() => {
        const timer = setInterval(() => {
            setConsoleLine(prev => (prev + 1) % CONSOLE_LINES.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        return pathname?.startsWith(path);
    };

    const mainNavItems = [
        { icon: Inbox, label: 'Inbox', href: '/dashboard/inbox', count: counts.inbox ?? 0 },
        { icon: Star, label: 'Starred', href: '/dashboard/starred', count: counts.starred ?? 0 },
        { icon: Clock, label: 'Snoozed', href: '/dashboard/snoozed', count: counts.snoozed ?? 0 },
        { icon: Send, label: 'Sent', href: '/dashboard/sent', count: counts.sent ?? 0 },
        { icon: FileText, label: 'Drafts', href: '/dashboard/drafts', count: counts.drafts ?? 0 },
        { icon: Clock, label: 'Scheduled', href: '/dashboard/scheduled', count: counts.scheduled ?? 0 },
    ] as const;

    const moreItems = [
        { icon: AlertOctagon, label: 'Spam', href: '/dashboard/spam', count: counts.spam ?? 0 },
        { icon: Trash2, label: 'Trash', href: '/dashboard/trash', count: counts.trash ?? 0 },
    ] as const;

    // Intelligence features — distinctly styled
    const intelligenceItems = [
        { icon: Users, label: 'Delegations', href: '/dashboard/delegations', count: counts.delegations ?? 0, color: 'text-violet-400', badge: 'AI' },
        { icon: Brain, label: 'Memory', href: '/dashboard/memory', count: counts.memory ?? 0, color: 'text-indigo-400', badge: 'AI' },
        { icon: BarChart2, label: 'Analytics', href: '/dashboard/metrics', count: counts.metrics ?? 0, color: 'text-sky-400', badge: 'AI' },
        { icon: Shield, label: 'Governance', href: '/dashboard/governance', count: 0, color: 'text-emerald-400', badge: 'AI' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings', count: 0, color: 'text-muted-foreground', badge: null },
    ] as const;

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-72 bg-sidebar backdrop-blur-3xl border-r border-sidebar-border
            transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-500
            flex flex-col
        `}>
            {/* ── TOP HEADER ── */}
            <div className="p-5 shrink-0 border-b border-sidebar-border">
                {/* Logo + notification row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center relative overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="SmartEmail Logo"
                                fill
                                className="object-contain p-1.5"
                            />
                        </div>
                        <div>
                            <span className="font-bold text-sm tracking-tight text-foreground block">SmartEmail</span>
                            <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Decision Intelligence</span>
                        </div>
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

                {/* AI Status pill */}
                <div className="flex items-center justify-between mb-4">
                    <div className="ai-status-pill">
                        <div className="ai-status-dot" />
                        Intelligence Active
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all"
                        title="Toggle theme"
                    >
                        {theme === 'dark'
                            ? <Moon className="w-3.5 h-3.5 text-muted-foreground" />
                            : <Sun className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                </div>

                {/* Compose with AI CTA */}
                <button className="compose-ai-btn" id="compose-ai-btn">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <PenSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex-1 text-left">Compose with AI</span>
                    <Sparkles className="w-3.5 h-3.5 opacity-70" />
                </button>
            </div>

            {/* ── NAVIGATION ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-6">

                {/* Standard Email Section */}
                <nav className="space-y-0.5">
                    <div className="px-3 mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground/50">Mail</span>
                    </div>
                    {mainNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group
                                    ${active
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-muted-foreground/70 hover:text-foreground hover:bg-white/5 border border-transparent'}
                                `}
                            >
                                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'group-hover:text-foreground transition-colors'}`} />
                                <span className="flex-1 font-medium text-[13px]">{item.label}</span>
                                {item.count > 0 && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center
                                        ${active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* More items (spam/trash) - extra subtle */}
                    {moreItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group
                                    ${active
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/5 border border-transparent'}
                                `}
                            >
                                <item.icon className="w-3.5 h-3.5 shrink-0" />
                                <span className="flex-1 font-medium text-[12px]">{item.label}</span>
                                {item.count > 0 && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Intelligence Section — Visually differentiated */}
                <nav className="space-y-0.5">
                    <div className="px-3 mb-3 flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-indigo-400/70">Intelligence</span>
                        <div className="flex-1 h-px bg-indigo-500/10" />
                        <Zap className="w-2.5 h-2.5 text-indigo-400/40" />
                    </div>

                    {intelligenceItems.map((item) => {
                        const active = isActive(item.href);
                        const isIntelligenceItem = item.badge === 'AI';

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    intel-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border transition-all duration-300 group
                                    ${active
                                        ? isIntelligenceItem
                                            ? 'active bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
                                            : 'bg-primary/10 text-primary border-primary/20'
                                        : 'border-transparent text-muted-foreground/60 hover:text-foreground'}
                                `}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all
                                    ${active && isIntelligenceItem
                                        ? 'bg-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                                        : isIntelligenceItem
                                            ? 'bg-muted group-hover:bg-indigo-500/10'
                                            : 'bg-muted'
                                    }`}>
                                    <item.icon className={`w-3.5 h-3.5 ${active && isIntelligenceItem ? item.color : isIntelligenceItem ? `${item.color} opacity-60 group-hover:opacity-100` : 'text-muted-foreground'}`} />
                                </div>
                                <span className={`flex-1 font-semibold text-[13px] ${active && isIntelligenceItem ? 'text-indigo-200' : ''}`}>
                                    {item.label}
                                </span>
                                {item.badge === 'AI' && (
                                    <span className={`intelligence-badge transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
                                        AI
                                    </span>
                                )}
                                {item.count > 0 && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center ml-1
                                        ${active && isIntelligenceItem
                                            ? 'bg-indigo-500/20 text-indigo-300'
                                            : 'bg-muted text-muted-foreground'}`}>
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Intelligence Console Widget */}
                <div className="intel-console p-4 mx-0">
                    {/* Console header */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                            <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                        </div>
                        <span className="text-[9px] text-indigo-400/60 font-bold uppercase tracking-widest ml-1">core.engine</span>
                    </div>

                    {/* Console lines */}
                    <div className="space-y-1.5 min-h-[60px]">
                        <div className="flex items-center gap-2 text-emerald-400/80 text-[9px] font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            <span className="font-bold">CORE_ENGAGE: OK</span>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={consoleLine}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.3 }}
                                className={`text-[9px] font-mono uppercase ${CONSOLE_LINES[consoleLine].color}`}
                            >
                                {CONSOLE_LINES[consoleLine].text}
                                <span className="console-cursor" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 pt-3 border-t border-indigo-500/10 grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Model</div>
                            <div className="text-[10px] text-indigo-300 font-bold">Hybrid</div>
                        </div>
                        <div className="text-center border-x border-indigo-500/10">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Enc</div>
                            <div className="text-[10px] text-emerald-300 font-bold">AES-256</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Acc</div>
                            <div className="text-[10px] text-sky-300 font-bold">98%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="p-4 mt-auto border-t border-sidebar-border space-y-3">
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 group hover:bg-white/5 transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform shrink-0">
                            {user.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate leading-tight">{user.name || 'Account'}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-medium">{user.email}</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-muted border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                    >
                        <LogOut className="w-3 h-3" />
                        Exit
                    </button>
                    <button
                        onClick={onSuggestionClick}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-all"
                    >
                        <Lightbulb className="w-3 h-3" />
                        Suggest
                    </button>
                </div>
            </div>
        </aside>
    );
}
