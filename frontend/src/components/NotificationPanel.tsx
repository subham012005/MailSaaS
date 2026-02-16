'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Mail, Users, ShieldCheck, CheckCircle2, Inbox } from 'lucide-react';

import { Notification } from '@/hooks/useNotifications';

interface NotificationPanelProps {
    notifications: Notification[];
    isOpen: boolean;
    onClose: () => void;
    onMarkAsRead: (id: number) => void;
    onClearAll: () => void;
    onViewAll?: () => void;
    onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationPanel({
    notifications,
    isOpen,
    onClose,
    onMarkAsRead,
    onClearAll,
    onViewAll,
    onNotificationClick
}: NotificationPanelProps) {
    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return time.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_email':
                return { icon: Mail, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' };
            case 'delegation':
                return { icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' };
            case 'approval':
                return { icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
            case 'system':
                return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
            default:
                return { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted border-border' };
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon with Badge */}
            <button
                onClick={() => onClose()}
                className="relative p-2.5 hover:bg-muted rounded-xl transition-all group"
            >
                <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-rose-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-rose-500/30 border border-black/20"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop - Stronger blur and click-to-close */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
                            onClick={onClose}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 h-full w-full sm:w-[500px] lg:w-[480px] bg-background/80 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] z-[101] flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10">
                                        <Bell className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">Intelligence</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-bold text-primary tracking-widest">
                                                {unreadCount} UNREAD ACTIVITIES
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={onClearAll}
                                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-3 hover:bg-white/5 rounded-2xl transition-all"
                                    >
                                        <X className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {notifications.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                        <div className="w-24 h-24 mb-6 bg-white/2 border border-white/5 rounded-[2rem] flex items-center justify-center">
                                            <Inbox className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground mb-2">Clear Skies</h4>
                                        <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                                            Everything is processed. New activity will appear here automatically.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {notifications.map((notification, index) => {
                                            const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-6 rounded-[1.5rem] transition-all cursor-pointer group relative overflow-hidden ${!notification.read
                                                        ? 'bg-primary/5 border border-primary/20'
                                                        : 'bg-white/2 border border-white/5 hover:border-white/10'
                                                        }`}
                                                    onClick={() => {
                                                        onMarkAsRead(notification.id);
                                                        onNotificationClick?.(notification);
                                                    }}
                                                >
                                                    {!notification.read && (
                                                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-bl-lg shadow-[0_0_10px_var(--primary)]" />
                                                    )}

                                                    <div className="flex items-start gap-5">
                                                        <div className={`p-3 rounded-2xl border ${bg} shrink-0 shadow-sm`}>
                                                            <Icon className={`w-5 h-5 ${color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                                    {formatTimeAgo(notification.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm leading-relaxed transition-colors ${!notification.read ? 'text-foreground font-bold' : 'text-muted-foreground/80 group-hover:text-foreground'}`}>
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-8 border-t border-white/5 bg-white/2">
                                    <button
                                        onClick={onViewAll}
                                        className="w-full text-center text-[10px] text-primary hover:text-white font-bold uppercase tracking-[0.3em] transition-all py-5 rounded-2xl bg-primary/10 hover:bg-primary shadow-lg shadow-primary/5 active:scale-[0.98]"
                                    >
                                        Strategic Activity Log
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
