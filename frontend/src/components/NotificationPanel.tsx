'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Mail, Users, CheckCircle2, Sparkles, Inbox, ShieldCheck } from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    message: string;
    timestamp: string;
    read: boolean;
    targetView?: string;
    targetId?: string | number;
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
                return { icon: Mail, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
            case 'delegation':
                return { icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
            case 'approval':
                return { icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
            case 'system':
                return { icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
            default:
                return { icon: Bell, color: 'text-gray-400', bg: 'bg-white/5 border-white/10' };
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon with Badge */}
            <button
                onClick={() => onClose()}
                className="relative p-2.5 hover:bg-white/5 rounded-xl transition-all group"
            >
                <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-rose-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
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
                            className="absolute left-0 top-12 w-96 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                        >
                            {/* Header with gradient */}
                            <div className="relative px-5 py-4 border-b border-white/5 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                                            <Bell className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={onClearAll}
                                                className="text-[10px] text-gray-500 hover:text-rose-400 transition-colors font-bold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-rose-500/10"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                        <button
                                            onClick={onClose}
                                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-16 px-8 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl flex items-center justify-center border border-white/5">
                                            <Inbox className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-400 mb-1">No notifications</h4>
                                        <p className="text-xs text-gray-600 max-w-[200px] mx-auto">
                                            You're all caught up! New notifications will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {notifications.map((notification, index) => {
                                            const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-3 rounded-xl mb-1 last:mb-0 hover:bg-white/[0.03] transition-all cursor-pointer group ${!notification.read ? 'bg-indigo-500/[0.03] border border-indigo-500/10' : 'border border-transparent'
                                                        }`}
                                                    onClick={() => {
                                                        onMarkAsRead(notification.id);
                                                        onNotificationClick?.(notification);
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-xl border ${bg} shrink-0`}>
                                                            <Icon className={`w-3.5 h-3.5 ${color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm leading-snug ${!notification.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-[10px] text-gray-600 mt-1.5 font-medium">
                                                                {formatTimeAgo(notification.timestamp)}
                                                            </p>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full mt-1.5 shrink-0 shadow-lg shadow-indigo-500/30" />
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
                                <div className="px-5 py-3 border-t border-white/5 bg-black/40">
                                    <button
                                        onClick={onViewAll}
                                        className="w-full text-center text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider transition-colors py-1"
                                    >
                                        View all activity
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
