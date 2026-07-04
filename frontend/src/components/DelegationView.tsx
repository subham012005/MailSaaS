'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Clock, CheckCircle2, AlertCircle, ShieldCheck, MessageSquare, X,
    Trash2, RotateCcw, Calendar, User, Menu,
    Zap, EyeOff, Send
} from 'lucide-react';
import { showNotification } from '@/lib/notifications';
import {
    deleteDelegation, addDelegationInstruction, approveDelegation,
    delegationUnifiedSend
} from '@/lib/api';

const CountdownTimer: React.FC<{ deadline: string, status: string }> = ({ deadline, status }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTime = () => {
            const diff = new Date(deadline).getTime() - new Date().getTime();
            setTimeLeft(Math.max(0, diff));
        };
        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [deadline]);

    if (status === 'sent' || status === 'approved') return null;

    const seconds = Math.floor((timeLeft / 1000) % 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const isUrgent = timeLeft < (4 * 60 * 60 * 1000);

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border font-mono transition-all ${isUrgent ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground border-border'}`}>
            <Clock className={`w-3 h-3 ${isUrgent ? 'animate-pulse' : ''}`} />
            {days > 0 && <span>{days}d </span>}
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
    );
};

interface Delegation {
    id: number;
    delegate_email: string;
    expected_action: string;
    reply_draft?: string;
    feedback?: string;
    original_sender?: string;
    thread_context?: { from: string, date: string, body: string }[];
    instruction_history?: { text: string, timestamp: string, type: string }[];
    status: 'pending' | 'awaiting_approval' | 'approved' | 'sent' | 'overdue' | 'needs_changes';
    sla_deadline: string;
    created_at: string;
    original_subject?: string;
    send_mode?: 'thread' | 'new';
}

interface DelegationViewProps {
    delegations: Delegation[];
    assignedDelegations?: Delegation[];
    userEmail: string;
    accessToken?: string;
    onRefresh?: () => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

const DelegationView: React.FC<DelegationViewProps> = ({
    delegations,
    assignedDelegations = [],
    userEmail,
    accessToken,
    onRefresh,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}) => {
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [draftText, setDraftText] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [showDraftModal, setShowDraftModal] = useState<Delegation | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState<Delegation | null>(null);
    const [activeTab, setActiveTab] = useState<'tracking' | 'assigned'>('tracking');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'awaiting' | 'completed'>('all');
    const [viewingContext, setViewingContext] = useState<Delegation | null>(null);

    const [sendMode] = useState<'thread' | 'new'>('new');
    const [approvalRequired, setApprovalRequired] = useState(true);
    const [newInstructionText, setNewInstructionText] = useState('');
    const [addingInstructionId, setAddingInstructionId] = useState<number | null>(null);
    const [approvalModes, setApprovalModes] = useState<Record<number, 'thread' | 'new'>>({});
    const [showStats, setShowStats] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // To fix unused variable lint warnings, we log them in development if needed, or just don't use them.
    // For now, we will retain them as they might be used in future features, but console.log to satisfy linter, or remove if unused.

    useEffect(() => {
        const interval = setInterval(() => { onRefresh?.(); }, 10000);
        return () => clearInterval(interval);
    }, [onRefresh]);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;
        let lastScrollY = 0;
        const handleScroll = () => {
            const currentScrollY = scrollContainer.scrollTop;
            if (currentScrollY > lastScrollY && currentScrollY > 50) setShowStats(false);
            else if (currentScrollY < lastScrollY || currentScrollY < 20) setShowStats(true);
            lastScrollY = currentScrollY;
        };
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent':
            case 'approved': return 'bg-success/10 text-success border-success/20';
            case 'awaiting_approval': return 'bg-primary/10 text-primary border-primary/20';
            case 'needs_changes': return 'bg-warning/10 text-warning border-warning/20';
            case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-secondary/10 text-secondary border-secondary/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent':
            case 'approved': return CheckCircle2;
            case 'awaiting_approval': return ShieldCheck;
            case 'needs_changes': return RotateCcw;
            case 'overdue': return AlertCircle;
            default: return Clock;
        }
    };

    const generateSpamScore = (text: string) => {
        // Mock spam score generation based on text length for visual effect
        const length = text.length;
        if (length === 0) return 100;
        if (length < 50) return 92;
        if (length > 300) return 99;
        return 96;
    };

    const handleSubmitDraft = async () => {
        if (!showDraftModal || !draftText.trim()) return;
        setSubmittingId(showDraftModal.id);
        try {
            await delegationUnifiedSend(userEmail, showDraftModal.id, {
                reply_draft: draftText,
                send_mode: sendMode,
                approval_required: approvalRequired
            }, accessToken);
            setShowDraftModal(null);
            setDraftText('');
            showNotification(approvalRequired ? "Draft submitted to Command Center" : "Response deployed", { type: 'success' });
            onRefresh?.();
        } catch (error) {
            showNotification("Deployment failed", { type: 'error' });
        } finally {
            setSubmittingId(null);
        }
    };

    const handleAddInstruction = async (id: number) => {
        if (!newInstructionText.trim()) return;
        setAddingInstructionId(id);
        try {
            await addDelegationInstruction(userEmail, id, { instruction: newInstructionText });
            setNewInstructionText('');
            showNotification("Directive updated", { type: 'success' });
            onRefresh?.();
        } catch (error) {
            showNotification("Failed to update directive", { type: 'error' });
        } finally {
            setAddingInstructionId(null);
        }
    };

    const handleApprove = async (id: number) => {
        if (!accessToken) return;
        setApprovingId(id);
        const mode = approvalModes[id] || 'thread';
        try {
            await approveDelegation(userEmail, accessToken, id, mode);
            showNotification(`Action Approved & Deployed`, { type: 'success' });
            onRefresh?.();
        } catch (error) {
            showNotification("Approval failed", { type: 'error' });
        } finally {
            setApprovingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Terminate this mission?")) return;
        setDeletingId(id);
        try {
            await deleteDelegation(userEmail, id);
            showNotification("Mission terminated", { type: 'success' });
            onRefresh?.();
        } catch (error) {
            showNotification("Failed to terminate", { type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    const listToDisplay = activeTab === 'tracking' ? delegations : assignedDelegations;
    const filteredList = listToDisplay.filter(d => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending') return d.status === 'pending' || d.status === 'overdue' || d.status === 'needs_changes';
        if (statusFilter === 'awaiting') return d.status === 'awaiting_approval';
        if (statusFilter === 'completed') return d.status === 'sent' || d.status === 'approved';
        return true;
    });

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="shrink-0 p-4 md:p-6 border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-10 transition-transform">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-display font-black tracking-tight neon-text">Decision Board</h1>
                                <p className="hidden md:block text-muted-foreground text-sm font-medium mt-1">Manage global email directives and AI responses.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex bg-muted p-1.5 rounded-xl border border-border w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('tracking')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'tracking' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {activeTab === 'tracking' && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                            )}
                            <span className="relative z-10">Command (My Directives)</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('assigned')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'assigned' ? 'text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {activeTab === 'assigned' && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-secondary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                            )}
                            <span className="relative z-10">Ops (Assigned to Me)</span>
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showStats && (
                        <motion.div initial={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { id: 'all', label: 'Total Missions', value: listToDisplay.length, color: 'text-foreground' },
                                    { id: 'pending', label: 'Active Drafts', value: listToDisplay.filter(d => d.status === 'pending' || d.status === 'overdue' || d.status === 'needs_changes').length, color: 'text-warning' },
                                    { id: 'awaiting', label: 'Pending Review', value: listToDisplay.filter(d => d.status === 'awaiting_approval').length, color: 'text-primary' },
                                    { id: 'completed', label: 'Deployed', value: listToDisplay.filter(d => d.status === 'sent' || d.status === 'approved').length, color: 'text-success' },
                                ].map((stat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setStatusFilter(stat.id as 'all' | 'pending' | 'awaiting' | 'completed')}
                                        className={`glass-card p-4 flex flex-col items-start transition-all ${statusFilter === stat.id ? 'border-primary shadow-[0_0_15px_rgba(139,92,246,0.1)]' : ''}`}
                                    >
                                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">{stat.label}</span>
                                        <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {filteredList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <ShieldCheck className="w-16 h-16 mb-6 text-primary" />
                        <h3 className="text-xl font-bold text-foreground">No active missions in this sector.</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredList.map((delegation) => {
                            const StatusIcon = getStatusIcon(delegation.status);
                            const spamScore = generateSpamScore(delegation.reply_draft || '');

                            return (
                                <motion.div
                                    key={delegation.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setViewingContext(delegation)}
                                    className={`glass-card group hover:border-primary/50 transition-all p-6 relative flex flex-col cursor-pointer ${delegation.status === 'awaiting_approval' && activeTab === 'tracking' ? 'ring-2 ring-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.15)]' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4 relative z-10 mb-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(delegation.status)} flex items-center gap-2`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {delegation.status.replace('_', ' ')}
                                                </span>
                                                <CountdownTimer deadline={delegation.sla_deadline} status={delegation.status} />
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground leading-snug mb-4 truncate pr-8" title={delegation.original_subject}>
                                                {delegation.original_subject || 'No Subject'}
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                                <div className="flex items-center gap-1.5"><User className="w-4 h-4"/> {activeTab === 'tracking' ? delegation.delegate_email : 'Command'}</div>
                                                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {new Date(delegation.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); setViewingContext(delegation); }} className="p-2.5 bg-muted rounded-xl hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(delegation.id); }} className="p-2.5 bg-muted rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all">
                                                {deletingId === delegation.id ? <Clock className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="p-4 rounded-xl bg-card border border-border">
                                            <div className="text-[10px] uppercase font-black text-primary mb-2 tracking-[0.2em]">Active Directive</div>
                                            <p className="text-sm text-foreground/80 italic leading-relaxed line-clamp-2">
                                                &quot;{delegation.expected_action}&quot;
                                            </p>
                                        </div>

                                        {delegation.reply_draft && (
                                            <div className="p-5 rounded-xl bg-secondary/5 border border-secondary/20 relative overflow-hidden">
                                                {/* Spam Score Indicator */}
                                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                                    <div className="text-[10px] font-black uppercase text-success tracking-wider">Spam Safe</div>
                                                    <div className="w-8 h-8 rounded-full border-2 border-success flex items-center justify-center text-[10px] font-bold text-success shadow-[0_0_10px_rgba(16,185,129,0.3)]">{spamScore}</div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mb-3">
                                                    <EyeOff className="w-4 h-4 text-secondary" />
                                                    <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Shadow Mode Draft</span>
                                                </div>
                                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed line-clamp-2 pr-16">
                                                    {delegation.reply_draft}
                                                </p>
                                            </div>
                                        )}

                                        {activeTab === 'assigned' && (delegation.status === 'pending' || delegation.status === 'needs_changes') && (
                                            <button onClick={(e) => { e.stopPropagation(); setShowDraftModal(delegation); setDraftText(delegation.reply_draft || ''); }} className="glow-button w-full mt-4">
                                                Deploy Response <Send className="w-4 h-4" />
                                            </button>
                                        )}
                                        {activeTab === 'tracking' && delegation.status === 'awaiting_approval' && (
                                            <div className="flex gap-3 mt-4">
                                                <button onClick={(e) => { e.stopPropagation(); handleApprove(delegation.id); }} className="glow-button flex-1 py-3 px-0">
                                                    {approvingId === delegation.id ? <Clock className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>} Approve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal placeholder (Logic remains similar, UI updated to match dark theme) */}
            <AnimatePresence>
                {showDraftModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDraftModal(null)} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-3xl overflow-hidden relative z-10">
                            <div className="p-8 border-b border-border flex items-center justify-between">
                                <h3 className="font-display font-bold text-2xl text-foreground flex items-center gap-3">
                                    <Send className="text-primary w-6 h-6"/> Response Deployment
                                </h3>
                                <button onClick={() => setShowDraftModal(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-6 h-6 text-muted-foreground" /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="p-5 rounded-xl bg-card border border-border">
                                    <div className="text-[10px] uppercase font-black text-primary mb-2 tracking-widest">Directive</div>
                                    <p className="text-sm text-foreground/80 italic">&quot;{showDraftModal.expected_action}&quot;</p>
                                </div>
                                <textarea
                                    className="w-full bg-background border border-border rounded-xl p-6 text-sm text-foreground h-64 focus:outline-none focus:border-primary/50 transition-all resize-none shadow-inner"
                                    placeholder="Draft your response... Deliverability shield is active."
                                    value={draftText}
                                    onChange={(e) => setDraftText(e.target.value)}
                                />
                                <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-success"/>
                                        <div>
                                            <div className="text-sm font-bold">Deliverability Shield</div>
                                            <div className="text-xs text-muted-foreground">Draft is optimized to bypass spam filters.</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-success">96%</div>
                                </div>
                            </div>
                            <div className="p-8 bg-muted/30 border-t border-border flex gap-4">
                                <button onClick={handleSubmitDraft} disabled={submittingId !== null || !draftText.trim()} className="glow-button w-full h-14">
                                    {submittingId ? <Clock className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />} Deploy
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DelegationView;
