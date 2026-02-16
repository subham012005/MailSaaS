'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Mail, User, Calendar, Edit2, Trash2, Menu, Eye, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cancelScheduledEmail, updateScheduledEmail } from '@/lib/api';
import { showNotification } from '@/lib/notifications';
import ScheduleEmailModal from './ScheduleEmailModal';

interface ScheduledEmail {
    id: number;
    recipient: string;
    subject: string;
    scheduledTime: Date;
    body: string;
    status: 'pending' | 'sent' | 'cancelled' | 'failed';
}

interface BackendScheduledEmail {
    id: number;
    recipient: string;
    subject: string;
    body: string;
    status: 'pending' | 'sent' | 'cancelled' | 'failed';
    scheduled_time: string | number | Date;
}

interface ScheduledEmailsViewProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function ScheduledEmailsView({
    isMobileMenuOpen,
    setIsMobileMenuOpen
}: ScheduledEmailsViewProps) {
    const { data: session } = useSession();
    const dashboardData = useDashboardData(session);
    const accessToken = (session?.user as { accessToken?: string })?.accessToken;
    const userEmail = session?.user?.email;

    const [activeTab, setActiveTab] = useState<'upcoming' | 'sent'>('upcoming');

    // Transform backend data to frontend format
    const allScheduledEmails: ScheduledEmail[] = (dashboardData.scheduledEmails || []).map((e: BackendScheduledEmail) => {
        console.log('Backend scheduled_time:', e.scheduled_time, 'Type:', typeof e.scheduled_time);
        const dateObj = new Date(e.scheduled_time);
        console.log('Converted to Date:', dateObj.toISOString(), 'Local:', dateObj.toLocaleString());

        return {
            id: e.id,
            recipient: e.recipient,
            subject: e.subject,
            body: e.body,
            status: e.status,
            scheduledTime: dateObj
        };
    });

    const upcomingEmails = allScheduledEmails.filter(e => e.status === 'pending');
    const sentEmails = allScheduledEmails.filter(e => e.status === 'sent' || e.status === 'failed' || e.status === 'cancelled');

    const currentEmails = activeTab === 'upcoming' ? upcomingEmails : sentEmails;

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingEmail, setEditingEmail] = useState<ScheduledEmail | null>(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    const handleCancel = async (id: number) => {
        if (!userEmail) return;
        if (confirm('Are you sure you want to cancel this scheduled email?')) {
            try {
                await cancelScheduledEmail(userEmail, accessToken!, id);
                showNotification("Scheduled email cancelled", { type: 'success' });
                dashboardData.refetchAll();
            } catch (error) {
                console.error(error);
                showNotification("Failed to cancel scheduled email", { type: 'error' });
            }
        }
    };

    const handleReschedule = async (newTime: Date) => {
        if (!userEmail || !editingEmail) return;
        try {
            await updateScheduledEmail(userEmail, accessToken!, editingEmail.id, {
                scheduled_time: newTime.toISOString()
            });
            showNotification("Email rescheduled successfully", { type: 'success' });
            setShowRescheduleModal(false);
            setEditingEmail(null);
            dashboardData.refetchAll();
        } catch (error) {
            console.error(error);
            showNotification("Failed to reschedule email", { type: 'error' });
        }
    };

    const formatScheduledTime = (date: Date): string => {
        const now = new Date();

        // Create date objects at midnight for accurate day comparison
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const scheduledMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Calculate difference in days by comparing midnight timestamps
        const diffMs = scheduledMidnight.getTime() - todayMidnight.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        if (diffDays === 0) {
            return `Today at ${timeStr}`;
        } else if (diffDays === 1) {
            return `Tomorrow at ${timeStr}`;
        } else if (diffDays === -1) {
            return `Yesterday at ${timeStr}`;
        } else {
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    };

    const formatFullTime = (date: Date): string => {
        return date.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                Scheduled Emails
                            </h1>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Manage your scheduled emails. They will be sent automatically at the specified time.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted/20 rounded-xl mb-8 w-fit border border-border">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Upcoming
                        {upcomingEmails.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px]">
                                {upcomingEmails.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'sent'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Sent
                    </button>
                </div>

                {/* Scheduled Emails List */}
                {dashboardData.isLoadingScheduledEmails ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse">Checking scheduled tasks...</p>
                    </div>
                ) : currentEmails.length === 0 ? (
                    <div className="text-center p-12 md:p-20 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                            {activeTab === 'upcoming' ? 'No Upcoming Emails' : 'No Sent Emails'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            {activeTab === 'upcoming'
                                ? "When you schedule emails to send later, they'll appear here."
                                : "History of your automatically sent emails will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentEmails.map((email, index) => (
                            <motion.div
                                key={email.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`border rounded-xl bg-card transition-all overflow-hidden ${email.status === 'failed' ? 'border-red-500/30' : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                {/* Card Header */}
                                <div className="p-4 md:p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${email.status === 'sent'
                                            ? 'bg-emerald-500/10'
                                            : email.status === 'failed'
                                                ? 'bg-red-500/10'
                                                : 'bg-primary/10'
                                            }`}>
                                            <Mail className={`w-5 h-5 md:w-6 md:h-6 ${email.status === 'sent'
                                                ? 'text-emerald-500'
                                                : email.status === 'failed'
                                                    ? 'text-red-500'
                                                    : 'text-primary'
                                                }`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm md:text-base text-foreground mb-1">
                                                        {email.subject}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                                        <User className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                                                        <span className="truncate">To: {email.recipient}</span>
                                                    </div>
                                                </div>
                                                {email.status !== 'pending' && (
                                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${email.status === 'sent'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : email.status === 'failed'
                                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                            : 'bg-muted text-muted-foreground border-border'
                                                        }`}>
                                                        {email.status}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Scheduled Time Badge */}
                                            <div className="flex items-center gap-2 mt-3 mb-4">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${email.status === 'sent'
                                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                                    : 'bg-primary/10 border-primary/20'
                                                    }`}>
                                                    <Calendar className={`w-3 h-3 md:w-4 md:h-4 shrink-0 ${email.status === 'sent' ? 'text-emerald-500' : 'text-primary'
                                                        }`} />
                                                    <span className={`text-xs md:text-sm font-medium ${email.status === 'sent' ? 'text-emerald-500' : 'text-primary'
                                                        }`}>
                                                        {email.status === 'sent' ? 'Sent on ' : 'Scheduled for '}
                                                        {formatScheduledTime(email.scheduledTime)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border 
                                                             text-xs md:text-sm font-medium text-foreground hover:bg-muted/20 
                                                             transition-all"
                                                >
                                                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                                    {expandedId === email.id ? 'Hide' : 'View'} Content
                                                </button>

                                                {email.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingEmail(email);
                                                                setShowRescheduleModal(true);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border 
                                                                     text-xs md:text-sm font-medium text-foreground hover:bg-muted/20 
                                                                     transition-all"
                                                        >
                                                            <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(email.id)}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/20 
                                                                     bg-red-500/10 text-xs md:text-sm font-medium text-red-500 hover:bg-red-500/20 
                                                                     transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {expandedId === email.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-border bg-muted/5"
                                        >
                                            <div className="p-4 md:p-6 space-y-4">
                                                {/* Full Scheduled Time */}
                                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                                                        {email.status === 'sent' ? 'Actual Send Time' : 'Scheduled Send Time'}
                                                    </div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {formatFullTime(email.scheduledTime)}
                                                    </div>
                                                </div>

                                                {/* Email Body */}
                                                <div>
                                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                        Email Content
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-background border border-border shadow-inner">
                                                        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed italic opacity-80">
                                                            &quot;{email.body}&quot;
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {showRescheduleModal && editingEmail && (
                <ScheduleEmailModal
                    isOpen={showRescheduleModal}
                    onClose={() => {
                        setShowRescheduleModal(false);
                        setEditingEmail(null);
                    }}
                    onSchedule={handleReschedule}
                    emailSubject={editingEmail.subject}
                />
            )}
        </div>
    );
}
