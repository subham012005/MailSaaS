'use client';

import {
    Inbox,
    Send,
    History,
    FileText,
    Settings,
    LogOut,
    Bell,
    Users,
    Zap
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import NotificationPanel from '../NotificationPanel';

export type ViewState = 'inbox' | 'sent' | 'memory' | 'drafts' | 'settings' | 'governance' | 'delegations' | 'metrics';

interface SidebarProps {
    activeView: ViewState;
    setActiveView: (view: ViewState) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    setViewMode: (mode: 'list' | 'detail') => void;
    isPolling: boolean;
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
    activeView,
    setActiveView,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setViewMode,
    isPolling,
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
    const navItems = [
        { icon: Inbox, label: 'Inbox', view: 'inbox' },
        { icon: Send, label: 'Sent', view: 'sent' },
        { icon: Users, label: 'Delegations', view: 'delegations' },
        { icon: History, label: 'History', view: 'memory' },
        { icon: FileText, label: 'Drafts', view: 'drafts' },
        { icon: Zap, label: 'Analytics', view: 'metrics' },
        { icon: Settings, label: 'Settings', view: 'settings' },
    ] as const;

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-[#050505] border-r border-white/5
            transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            flex flex-col
        `}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
                        A
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white flex-1">Antigravity</span>

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

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.view}
                            onClick={() => {
                                setActiveView(item.view);
                                setViewMode('list');
                                setIsMobileMenuOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                                ${activeView === item.view
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}
                            `}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-4">
                {user && (
                    <div className="flex items-center gap-3 px-4 py-2 border-t border-white/5 pt-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center overflow-hidden shrink-0 text-indigo-400 font-bold text-xs">
                            {user.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.name?.[0] || user.email?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user.name || 'Account'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                {runTokenDebug && (
                    <button
                        onClick={runTokenDebug}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all border border-indigo-500/10"
                    >
                        <Zap className="w-3 h-3" />
                        Run Diagnostic
                    </button>
                )}

                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
