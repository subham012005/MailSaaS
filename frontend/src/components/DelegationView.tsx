'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Mail,
    Send,
    ShieldCheck,
    MessageSquare,
    X,
    Check,
    Trash2,
    RotateCcw,
    CornerUpRight,
    Calendar,
    ChevronDown,
    ChevronRight,
    User,
    ListChecks,
    Menu
} from 'lucide-react';
import { showNotification } from '@/lib/notifications';
import {
    deleteDelegation,
    addDelegationInstruction,
    approveDelegation,
    requestDelegationChanges,
    delegationUnifiedSend
} from '@/lib/api';

// --- Sub-components ---

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

    const isUrgent = timeLeft < (4 * 60 * 60 * 1000); // 4 hours

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono transition-all ${isUrgent ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-white/5 text-gray-500 border-white/5'}`}>
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
    delegations: Delegation[]; // Tasks I DELEGATED (Boss perspective)
    assignedDelegations?: Delegation[]; // Tasks ASSIGNED TO ME (Delegate perspective)
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

    // Auto-refresh every 10 seconds for modular updates
    useEffect(() => {
        const interval = setInterval(() => {
            onRefresh?.();
        }, 10000);
        return () => clearInterval(interval);
    }, [onRefresh]);

    // New states for unified send
    const [sendMode] = useState<'thread' | 'new'>('new'); // Default to new as requested
    const [approvalRequired, setApprovalRequired] = useState(true);
    const [newInstructionText, setNewInstructionText] = useState('');
    const [addingInstructionId, setAddingInstructionId] = useState<number | null>(null);
    const [approvalModes, setApprovalModes] = useState<Record<number, 'thread' | 'new'>>({});

    // Scroll detection for hiding stats
    const [showStats, setShowStats] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Detect scroll to hide/show stats
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        let lastScrollY = 0;
        const handleScroll = () => {
            const currentScrollY = scrollContainer.scrollTop;

            // Hide stats when scrolling down, show when scrolling up or at top
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setShowStats(false);
            } else if (currentScrollY < lastScrollY || currentScrollY < 20) {
                setShowStats(true);
            }

            lastScrollY = currentScrollY;
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent':
            case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'awaiting_approval': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'needs_changes': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'overdue': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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
            showNotification(approvalRequired ? "Draft submitted for approval" : "Response sent successfully", { type: 'success' });
            onRefresh?.();
        } catch (error) {
            console.error("Unified send failed:", error);
            showNotification("Process failed", { type: 'error' });
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
            showNotification("Instruction added", { type: 'success' });
            onRefresh?.();
        } catch (error) {
            console.error("Add instruction failed:", error);
            showNotification("Failed to add instruction", { type: 'error' });
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
            showNotification(`Delegation approved (Sent as ${mode === 'thread' ? 'thread reply' : 'new email'})`, { type: 'success' });
            onRefresh?.();
        } catch (error) {
            console.error("Approval failed:", error);
            showNotification("Approval failed", { type: 'error' });
        } finally {
            setApprovingId(null);
        }
    };

    const handleFeedback = async () => {
        if (!showFeedbackModal || !feedbackText.trim()) return;
        try {
            await requestDelegationChanges(userEmail, showFeedbackModal.id, feedbackText, accessToken);
            setShowFeedbackModal(null);
            setFeedbackText('');
            showNotification("Changes requested", { type: 'success' });
            onRefresh?.();
        } catch (error) {
            console.error("Feedback failed:", error);
            showNotification("Failed to send feedback", { type: 'error' });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this delegation?")) return;
        setDeletingId(id);
        try {
            await deleteDelegation(userEmail, id);
            showNotification("Delegation deleted", { type: 'success' });
            onRefresh?.();
        } catch (error) {
            console.error("Delete failed:", error);
            showNotification("Failed to delete", { type: 'error' });
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
            {/* Header Area - Fixed height */}
            {/* Header - Sticky with scroll behavior */}
            <div className="shrink-0 p-4 md:p-6 md:pb-8 border-b border-border bg-gradient-to-b from-indigo-500/5 to-transparent sticky top-0 z-10 transition-transform duration-300"
                style={{ transform: `translateY(0)` }}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Compact Header */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-primary rounded-lg">
                                <Users className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-lg md:text-2xl font-bold tracking-tight text-foreground">Delegation Intelligence</h1>
                                {/* Hide description on mobile */}
                                <p className="hidden md:block text-muted-foreground text-sm font-medium mt-0.5">Empower your team with context and track every delegated decision.</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Toggle - Compact on mobile */}
                    <div className="flex bg-muted/20 p-1 rounded-xl border border-border w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('tracking')}
                            className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'tracking' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {activeTab === 'tracking' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-lg shadow-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">I Delegated</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('assigned')}
                            className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'assigned' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {activeTab === 'assigned' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-lg shadow-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">Assigned To Me</span>
                        </button>
                    </div>
                </div>

                {/* Stats - Compact on mobile, scrollable, hides on scroll */}
                <AnimatePresence>
                    {showStats && (
                        <motion.div
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                                <div className="grid grid-cols-4 gap-2 md:gap-3 md:gap-4 min-w-max md:min-w-0">
                                    {[
                                        { id: 'all', label: 'Total', value: listToDisplay.length, color: 'text-gray-400' },
                                        { id: 'pending', label: 'Action', value: listToDisplay.filter(d => d.status === 'pending' || d.status === 'overdue' || d.status === 'needs_changes').length, color: 'text-amber-400' },
                                        { id: 'awaiting', label: 'Review', value: listToDisplay.filter(d => d.status === 'awaiting_approval').length, color: 'text-indigo-400' },
                                        { id: 'completed', label: 'Done', value: listToDisplay.filter(d => d.status === 'sent' || d.status === 'approved').length, color: 'text-emerald-400' },
                                    ].map((stat, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setStatusFilter(stat.id as 'all' | 'pending' | 'awaiting' | 'completed')}
                                            className={`glass-card p-2 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between transition-all hover:border-white/20 border ${statusFilter === stat.id ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5'}`}
                                        >
                                            <span className="text-[8px] md:text-[10px] uppercase font-bold tracking-wider md:tracking-widest text-gray-500 leading-none mb-1 md:mb-0">{stat.label}</span>
                                            <span className={`text-base md:text-xl font-mono font-bold ${stat.color}`}>{stat.value}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* List Content - Takes remaining space */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                {filteredList.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <ShieldCheck className="w-12 h-12 mb-4 text-indigo-500" />
                        <h3 className="text-lg font-medium text-white">No results found for current filter</h3>
                        <p className="text-sm max-w-xs mx-auto mt-2 text-gray-400">Try adjusting your filters or switching tabs.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredList.map((delegation) => {
                            const StatusIcon = getStatusIcon(delegation.status);

                            return (
                                <motion.div
                                    key={delegation.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setViewingContext(delegation)}
                                    className={`glass-card group hover:border-indigo-500/30 transition-all p-4 relative overflow-hidden flex flex-col cursor-pointer ${delegation.status === 'awaiting_approval' && activeTab === 'tracking' ? 'ring-1 ring-indigo-500/50 bg-indigo-500/[0.02]' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-3 relative z-10 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(delegation.status)} flex items-center gap-1.5`}>
                                                    <StatusIcon className="w-2.5 h-2.5" />
                                                    {delegation.status.replace('_', ' ')}
                                                </span>
                                                <CountdownTimer deadline={delegation.sla_deadline} status={delegation.status} />
                                            </div>

                                            <h3 className="font-bold text-base text-white leading-tight mb-3 truncate pr-8" title={delegation.original_subject}>
                                                {delegation.original_subject || 'No Subject'}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                                                <div className="space-y-0.5">
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                                        <CornerUpRight className="w-2 h-2" /> Source
                                                    </div>
                                                    <div className="text-[10px] text-gray-300 font-medium truncate" title={delegation.original_sender}>
                                                        {delegation.original_sender || 'Unknown Sender'}
                                                    </div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                                        <User className="w-2 h-2" /> {activeTab === 'tracking' ? 'Delegate' : 'Owner'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-300 font-medium truncate">
                                                        {activeTab === 'tracking' ? delegation.delegate_email : 'Boss'}
                                                    </div>
                                                </div>
                                                <div className="space-y-0.5 text-indigo-400">
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                                        <Calendar className="w-2 h-2" /> Assigned
                                                    </div>
                                                    <div className="text-[10px] font-bold font-mono">
                                                        {new Date(delegation.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="space-y-0.5 text-amber-500">
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                                        <AlertCircle className="w-2 h-2" /> Due
                                                    </div>
                                                    <div className="text-[10px] font-bold font-mono">
                                                        {new Date(delegation.sla_deadline).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingContext(delegation);
                                                }}
                                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-indigo-400"
                                                title="View History"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(delegation.id);
                                                }}
                                                className="p-2 bg-white/5 rounded-lg hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 transition-all text-gray-400 hover:text-rose-400"
                                                title="Delete"
                                            >
                                                {deletingId === delegation.id ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all">
                                            <div className="text-[9px] uppercase font-bold text-indigo-500 mb-1.5 tracking-wider">Directive</div>
                                            <p className="text-[10px] text-gray-300 italic leading-relaxed line-clamp-2">
                                                &quot;{delegation.expected_action}&quot;
                                            </p>
                                        </div>

                                        {delegation.feedback && (
                                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <RotateCcw className="w-2.5 h-2.5 text-amber-500" />
                                                    <span className="text-[9px] font-bold uppercase text-amber-500 tracking-wider">Feedback Loop</span>
                                                </div>
                                                <p className="text-[10px] text-amber-200 italic line-clamp-2">
                                                    &quot;{delegation.feedback}&quot;
                                                </p>
                                            </div>
                                        )}

                                        {delegation.reply_draft && (
                                            <div className="p-3 rounded-lg bg-indigo-600/5 border border-indigo-500/15">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <CornerUpRight className="w-2.5 h-2.5 text-indigo-400" />
                                                        <span className="text-[9px] font-bold uppercase text-indigo-400 tracking-wider">Proposed Response</span>
                                                        {delegation.send_mode && (
                                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 uppercase font-bold tracking-wider border border-white/5">
                                                                {delegation.send_mode === 'thread' ? 'In Thread' : 'New Email'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-100 whitespace-pre-wrap leading-relaxed line-clamp-2">
                                                    {delegation.reply_draft}
                                                </p>
                                                <div className="mt-2 flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewingContext(delegation);
                                                        }}
                                                        className="text-[9px] font-bold uppercase text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1"
                                                    >
                                                        Review <ChevronRight className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'assigned' && (delegation.status === 'pending' || delegation.status === 'overdue' || delegation.status === 'needs_changes') && (
                                            <button
                                                onClick={() => {
                                                    setShowDraftModal(delegation);
                                                    setDraftText(delegation.reply_draft || '');
                                                }}
                                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                            >
                                                <Send className="w-3 h-3" />
                                                Draft Response
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Draft Submission Modal */}
            <AnimatePresence>
                {showDraftModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDraftModal(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden relative z-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)]"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600/10 rounded-2xl">
                                        <Send className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Drafting Response</h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Delegation ID: #{showDraftModal.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDraftModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="p-5 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10">
                                    <div className="text-[10px] uppercase font-black text-indigo-500 mb-2 tracking-widest leading-none">Directive</div>
                                    <p className="text-xs text-gray-300 italic font-medium">
                                        &quot;{showDraftModal.expected_action}&quot;
                                    </p>
                                </div>

                                <textarea
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-sm text-white h-48 focus:outline-none focus:border-indigo-600/50 transition-all resize-none shadow-inner"
                                    placeholder="Write your draft here..."
                                    value={draftText}
                                    onChange={(e) => setDraftText(e.target.value)}
                                />

                                <div className="space-y-3">
                                    <div className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Post-Action</div>
                                    <button
                                        onClick={() => setApprovalRequired(!approvalRequired)}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${approvalRequired ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'}`}
                                    >
                                        {approvalRequired ? <ShieldCheck className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                                        {approvalRequired ? 'Submit for Approval' : 'Dispatch Directly (New Mail)'}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 border-t border-white/5">
                                <button
                                    onClick={handleSubmitDraft}
                                    disabled={submittingId !== null || !draftText.trim()}
                                    className="w-full px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                                >
                                    {submittingId ? (
                                        <Clock className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {submittingId ? 'Processing Transaction...' : approvalRequired ? 'Submit to Governance' : 'Dispatch Intel Directly'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFeedbackModal(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden relative z-10 p-8 space-y-6 shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <RotateCcw className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="font-bold text-white">Request Changes</h3>
                            </div>
                            <textarea
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white h-32 focus:outline-none focus:border-amber-500/50 transition-all resize-none shadow-inner"
                                placeholder="What should be changed? Provide feedback to the delegate..."
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setShowFeedbackModal(null)} className="flex-1 px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold text-gray-400 transition-all">Cancel</button>
                                <button onClick={handleFeedback} disabled={!feedbackText.trim()} className="flex-1 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-amber-600/20">Send Feedback</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Thread Context Modal */}
            <AnimatePresence>
                {viewingContext && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingContext(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600/10 rounded-2xl">
                                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Full Conversation Analytics</h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{viewingContext.original_subject}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingContext(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6 bg-white/[0.01]">
                                <div className="p-5 rounded-3xl bg-indigo-500/[0.05] border border-indigo-500/15">
                                    <div className="text-[10px] uppercase font-black text-indigo-400 mb-2 tracking-widest leading-none flex items-center gap-2">
                                        <ShieldCheck className="w-3 h-3" /> Core Directive
                                    </div>
                                    <p className="text-sm text-white italic font-medium leading-relaxed">
                                        &quot;{viewingContext.expected_action}&quot;
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[10px] uppercase font-black text-gray-600 tracking-[0.2em] pl-1 flex items-center gap-2">
                                        <ListChecks className="w-3 h-3" /> Instruction History
                                    </div>
                                    <div className="space-y-3">
                                        {viewingContext.instruction_history?.map((inst, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${inst.type === 'initial' ? 'text-indigo-500' : 'text-amber-500'}`}>
                                                        {inst.type} Instruction
                                                    </span>
                                                    <span className="text-[9px] text-gray-600 font-mono">
                                                        {new Date(inst.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-300 italic">&quot;{inst.text}&quot;</p>
                                            </div>
                                        ))}
                                    </div>

                                    {activeTab === 'tracking' && (viewingContext.status !== 'sent' && viewingContext.status !== 'approved') && (
                                        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3 mt-4">
                                            <textarea
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white h-20 focus:outline-none focus:border-indigo-500/50 resize-none transition-all"
                                                placeholder="Add more instructions for the delegate..."
                                                value={newInstructionText}
                                                onChange={(e) => setNewInstructionText(e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleAddInstruction(viewingContext.id)}
                                                disabled={addingInstructionId === viewingContext.id || !newInstructionText.trim()}
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                            >
                                                {addingInstructionId === viewingContext.id ? 'Pushing Intel...' : 'Add Directive'}
                                            </button>
                                        </div>
                                    )}

                                    {viewingContext.reply_draft && (
                                        <div className="p-6 rounded-[32px] bg-indigo-600/5 border border-indigo-500/20 shadow-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CornerUpRight className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-xs font-black uppercase text-indigo-400 tracking-widest">Proposed Response Intel</span>
                                                </div>
                                                {activeTab === 'tracking' && viewingContext.status === 'awaiting_approval' && (
                                                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                                                        <button
                                                            onClick={() => setApprovalModes(prev => ({ ...prev, [viewingContext.id]: 'thread' }))}
                                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${(approvalModes[viewingContext.id] || 'thread') === 'thread' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                                        >
                                                            Thread
                                                        </button>
                                                        <button
                                                            onClick={() => setApprovalModes(prev => ({ ...prev, [viewingContext.id]: 'new' }))}
                                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${approvalModes[viewingContext.id] === 'new' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                                        >
                                                            New Mail
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/40">
                                                {viewingContext.reply_draft}
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-[10px] uppercase font-black text-gray-600 tracking-[0.2em] pl-1 flex items-center gap-2 pt-4">
                                        <ChevronDown className="w-3 h-3" /> Historical Timeline
                                    </div>
                                    {viewingContext.thread_context && viewingContext.thread_context.length > 0 ? (
                                        viewingContext.thread_context.map((msg: { from: string, date: string, body: string }, i: number) => (
                                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:bg-white/[0.03] transition-all group/msg">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-xs font-black text-indigo-300 border border-indigo-500/10 shrink-0 group-hover/msg:scale-110 transition-transform">
                                                            {msg.from?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-white truncate">{msg.from}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">{msg.date}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30 font-medium">
                                                    {msg.body}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-48 flex flex-col items-center justify-center text-center opacity-20">
                                            <Mail className="w-12 h-12 mb-2 text-gray-500" />
                                            <p className="text-sm font-bold text-gray-500">Encrypted context not stored</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                                {activeTab === 'tracking' && viewingContext.status === 'awaiting_approval' ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowFeedbackModal(viewingContext);
                                                setViewingContext(null);
                                            }}
                                            className="flex-1 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-amber-400 hover:bg-amber-400/5 transition-all"
                                        >
                                            Request Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleApprove(viewingContext.id);
                                                setViewingContext(null);
                                            }}
                                            disabled={approvingId === viewingContext.id}
                                            className="flex-[2] px-4 py-4 rounded-2xl bg-indigo-600 text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {approvingId === viewingContext.id ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            Final Approval & Dispatch
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setViewingContext(null)}
                                        className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all shadow-inner"
                                    >
                                        Dismiss Overlay
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DelegationView;
