'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Mail, User, Calendar, Edit2, Trash2, Menu, X, Eye, Send } from 'lucide-react';
import ScheduleEmailModal from './ScheduleEmailModal';

interface ScheduledEmail {
    id: number;
    recipient: string;
    subject: string;
    scheduledTime: Date;
    body: string;
}

interface ScheduledEmailsViewProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function ScheduledEmailsView({
    isMobileMenuOpen,
    setIsMobileMenuOpen
}: ScheduledEmailsViewProps) {
    // Mock data - will be replaced with actual API call
    const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([
        {
            id: 1,
            recipient: '[email protected]',
            subject: 'Follow up on project proposal',
            scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
            body: 'Hi John,\n\nI wanted to follow up on the project proposal we discussed last week. Have you had a chance to review the documents I sent?\n\nLooking forward to your feedback.\n\nBest regards'
        },
        {
            id: 2,
            recipient: '[email protected]',
            subject: 'Weekly team update',
            scheduledTime: new Date(Date.now() + 259200000), // 3 days
            body: 'Team,\n\nHere are this week\'s updates:\n\n1. Project Alpha is on track for Q1 delivery\n2. New team member joining next Monday\n3. All-hands meeting scheduled for Friday\n\nPlease review and let me know if you have any questions.\n\nThanks!'
        }
    ]);

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingEmail, setEditingEmail] = useState<ScheduledEmail | null>(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this scheduled email?')) {
            // TODO: Call API to cancel scheduled email
            setScheduledEmails(prev => prev.filter(email => email.id !== id));
        }
    };

    const handleReschedule = (newTime: Date) => {
        if (editingEmail) {
            // TODO: Call API to update scheduled time
            setScheduledEmails(prev => prev.map(email =>
                email.id === editingEmail.id
                    ? { ...email, scheduledTime: newTime }
                    : email
            ));
            setShowRescheduleModal(false);
            setEditingEmail(null);
        }
    };

    const formatScheduledTime = (date: Date): string => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else if (days === 1) {
            return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
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

                {/* Scheduled Emails List */}
                {scheduledEmails.length === 0 ? (
                    <div className="text-center p-12 md:p-20 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">No Scheduled Emails</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            When you schedule emails to send later, they'll appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scheduledEmails.map((email, index) => (
                            <motion.div
                                key={email.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border border-border rounded-xl bg-card hover:border-primary/50 transition-all overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="p-4 md:p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Mail className="w-5 h-5 md:w-6 md:h-6 text-primary" />
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
                                            </div>

                                            {/* Scheduled Time Badge */}
                                            <div className="flex items-center gap-2 mt-3 mb-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-primary shrink-0" />
                                                    <span className="text-xs md:text-sm font-medium text-primary">
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
                                                    {expandedId === email.id ? 'Hide' : 'View'} Details
                                                </button>
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
                                                        Scheduled Send Time
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
                                                    <div className="p-4 rounded-lg bg-background border border-border">
                                                        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                                            {email.body}
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
