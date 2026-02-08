'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Mail, Users, CheckCircle2, Sparkles, Inbox, ShieldCheck } from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    message: string;
    created_at: string;
    read: boolean;
    target_view?: string;
    target_id?: string | number;
}

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
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={onClose}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed lg:absolute top-0 lg:top-14 left-0 lg:left-auto lg:-right-4 w-full h-full lg:h-auto lg:w-[480px] bg-card border lg:border-border lg:rounded-3xl shadow-2xl backdrop-blur-3xl z-50 overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                            {unreadCount} NEW
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onClearAll}
                                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors mr-2"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 hover:bg-muted rounded-lg transition-all"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[60vh] lg:max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-16 px-8 text-center bg-card">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-muted border border-border rounded-2xl flex items-center justify-center">
                                            <Inbox className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground mb-1">No notifications</h4>
                                        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                                            You're all caught up! New notifications will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {notifications.map((notification, index) => {
                                            const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 rounded-2xl hover:bg-muted transition-all cursor-pointer group ${!notification.read ? 'bg-primary/5 border border-primary/10' : 'border border-transparent'}`}
                                                    onClick={() => {
                                                        onMarkAsRead(notification.id);
                                                        onNotificationClick?.(notification);
                                                    }}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-2.5 rounded-xl border ${bg} shrink-0`}>
                                                            <Icon className={`w-4 h-4 ${color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm leading-snug transition-colors ${!notification.read ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1 block">
                                                                {formatTimeAgo(notification.created_at)}
                                                            </span>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_var(--primary)]" />
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-4 border-t border-border bg-muted/20">
                                    <button
                                        onClick={onViewAll}
                                        className="w-full text-center text-[10px] text-primary hover:text-primary/80 font-bold uppercase tracking-[0.2em] transition-colors py-2 rounded-xl bg-primary/10"
                                    >
                                        View all intelligence activity
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
