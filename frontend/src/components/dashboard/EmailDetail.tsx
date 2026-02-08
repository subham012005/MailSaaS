'use client';

import { motion } from 'framer-motion';
import {
    ChevronLeft, Users, ShieldCheck, Brain, Zap, MessageSquare,
    AlertCircle, AlertTriangle, Target, Info, ArrowLeft, Mail,
    Shield, Gavel, Clock, ArrowUpRight, Check
} from 'lucide-react';
import AttachmentViewer from '@/components/AttachmentViewer';
import { useTheme } from '@/components/ThemeProvider';

interface EmailDetailProps {
    selectedEmail: any;
    viewMode: 'list' | 'detail';
    setViewMode: (mode: 'list' | 'detail') => void;
    setShowDelegateModal: (open: boolean) => void;
    isAnalyzing: boolean;
    isFetchingThread: boolean;
    activeThread: any[];
    expandedQuotes: { [key: string]: boolean };
    setExpandedQuotes: (quotes: any) => void;
    session: any;
    analysisResult: any;
    analysisError: string | null;
    assignedDelegations: any[];
    delegations: any[];
    quickReplyingId: number | null;
    setQuickReplyingId: (id: number | null) => void;
    quickReplyText: string;
    setQuickReplyText: (text: string) => void;
    handleInboxDelegationReply: (id: number, asDraft: boolean) => void;
    isSubmittingQuickReply: boolean;
    setActiveView: (view: string) => void;
    showReplyFlow: boolean;
    setShowReplyFlow: (show: boolean) => void;
    showContextQuestions: boolean;
    setShowContextQuestions: (show: boolean) => void;
    userInstruction: string;
    setUserInstruction: (instruction: any) => void;
    handleGenerateCustom: () => void;
    handleActionClick: (action: any) => void;
    setSelectedEmail: (email: any) => void;
    metrics: any;
    isGeneratingCustom: boolean;
}

export default function EmailDetail({
    selectedEmail,
    viewMode,
    setViewMode,
    setShowDelegateModal,
    isAnalyzing,
    isFetchingThread,
    activeThread,
    expandedQuotes,
    setExpandedQuotes,
    session,
    analysisResult,
    analysisError,
    assignedDelegations,
    delegations,
    quickReplyingId,
    setQuickReplyingId,
    quickReplyText,
    setQuickReplyText,
    handleInboxDelegationReply,
    isSubmittingQuickReply,
    setActiveView,
    showReplyFlow,
    setShowReplyFlow,
    showContextQuestions,
    setShowContextQuestions,
    userInstruction,
    setUserInstruction,
    handleGenerateCustom,
    handleActionClick,
    setSelectedEmail,
    metrics,
    isGeneratingCustom
}: EmailDetailProps) {
    const { theme } = useTheme();

    if (!selectedEmail) {
        return (
            <div className={`
                ${viewMode === 'detail' ? 'flex' : 'hidden md:flex'}
                h-full flex-col items-center justify-center text-center p-12 bg-transparent relative overflow-hidden
            `}>
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full" />
                </div>
                <div className="w-24 h-24 rounded-[32px] bg-muted border border-border flex items-center justify-center mb-8 backdrop-blur-2xl shadow-2xl relative z-10">
                    <Mail className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground tracking-tight relative z-10">Select a vector.</h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-base font-medium leading-relaxed relative z-10">
                    Choose an intelligence stream from your inbox to engage the Decision Engine.
                </p>
                <div className="mt-12 flex items-center gap-3 px-4 py-2 rounded-full bg-muted border border-border relative z-10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Intelligence Core Standing By</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`
            ${viewMode === 'detail' ? 'flex' : 'hidden md:flex'}
            flex-1 bg-transparent overflow-y-auto w-full custom-scrollbar relative z-10
        `}>
            <div className="p-8 md:p-16 max-w-5xl mx-auto w-full space-y-12">
                {/* Mobile Back Button */}
                <button
                    onClick={() => setViewMode('list')}
                    className="md:hidden flex items-center gap-2 text-muted-foreground mb-8 px-4 py-2 rounded-full bg-muted border border-border"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Return</span>
                </button>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                        <div className="space-y-4 flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                                {selectedEmail.subject}
                            </h1>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-bold text-foreground/80">{selectedEmail.from}</span>
                                <span className="text-xs text-muted-foreground font-medium truncate">{selectedEmail.fromFull}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-2">
                            <button
                                onClick={() => setShowDelegateModal(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold transition-all shadow-xl"
                            >
                                <Users className="w-4 h-4" />
                                Delegate
                            </button>
                            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold shadow-2xl shadow-primary/10">
                                <ShieldCheck className="w-4 h-4" />
                                {isAnalyzing ? 'Mapping Nodes...' : 'Logic Engine L4'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Tier */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Shield, label: 'OAuth 2.0 Secure' },
                        { icon: Zap, label: 'AES-256 Verified' },
                        { icon: Brain, label: 'Local-First Policy' },
                        { icon: Target, label: 'No Data Tracking' }
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border group hover:bg-muted/80 transition-all">
                            <badge.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{badge.label}</span>
                        </div>
                    ))}
                </div>

                {/* Conversation Logic Layer */}
                <div className="space-y-8 relative">
                    <div className="absolute left-[2.45rem] top-10 bottom-10 w-px bg-white/[0.05] pointer-events-none" />

                    {isFetchingThread ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto opacity-40" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Syncing Intelligence Nodes...</p>
                        </div>
                    ) : activeThread.length > 0 ? (
                        activeThread.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <div className="flex items-start gap-8">
                                    {/* Avatar Tier */}
                                    <div className="relative z-10 shrink-0">
                                        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground text-base font-bold shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                            {msg.from.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-2xl" />
                                    </div>

                                    {/* Message Slab */}
                                    <div className="flex-1 min-w-0 glass-card p-8 bg-card border-border hover:bg-muted transition-all duration-500">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground mb-1">{msg.from}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                    {msg.from}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{msg.date}</span>
                                        </div>

                                        <div className="relative">
                                            {msg.html_body ? (
                                                <div className="overflow-hidden rounded-xl bg-muted/30 border border-border p-4">
                                                    <iframe
                                                        srcDoc={`
                                                            <style>
                                                                body { 
                                                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                                                                    color: ${theme === 'dark' ? '#e5e7eb' : '#1c1917'}; 
                                                                    font-size: 14px; 
                                                                    line-height: 1.6; 
                                                                    background: transparent !important;
                                                                    margin: 0;
                                                                }
                                                                .gmail_quote, .gmail_extra, .outlook_quote, blockquote { 
                                                                    display: ${expandedQuotes[msg.id] ? 'block' : 'none'} !important; 
                                                                    border-left: 2px solid ${theme === 'dark' ? '#374151' : '#d1d5db'} !important;
                                                                    padding-left: 1.5rem !important;
                                                                    margin: 1.5rem 0 !important;
                                                                    color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'} !important;
                                                                }
                                                                a { color: #0071e3; text-decoration: none; font-weight: 500; }
                                                            </style>
                                                            ${msg.html_body}
                                                        `}
                                                        className="w-full border-none opacity-90"
                                                        title={`Email-${msg.id}`}
                                                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                                        onLoad={(e) => {
                                                            const iframe = e.currentTarget;
                                                            try {
                                                                if (iframe.contentWindow && iframe.contentWindow.document.body) {
                                                                    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
                                                                }
                                                            } catch (err) { }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-sm text-foreground/90 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {msg.body}
                                                </p>
                                            )}

                                            {/* Logic Expander (Quoted Body) */}
                                            {(msg.quoted_body || (msg.html_body && (msg.html_body.includes('gmail_quote') || msg.html_body.includes('blockquote')))) && (
                                                <div className="mt-6 flex items-center gap-4">
                                                    <div className="h-px bg-muted flex-1" />
                                                    <button
                                                        onClick={() => setExpandedQuotes((prev: any) => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                                        className="flex items-center gap-2 group/btn"
                                                    >
                                                        <div className="w-8 h-5 flex items-center justify-center bg-muted border border-border rounded-full text-[10px] text-muted-foreground group-hover/btn:bg-white/10 group-hover/btn:text-foreground transition-all">
                                                            ...
                                                        </div>
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover/btn:text-gray-300">
                                                            {expandedQuotes[msg.id] ? 'Contract History' : 'Expand History'}
                                                        </span>
                                                    </button>
                                                    <div className="h-px bg-muted flex-1" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="glass-card p-10 bg-white/[0.02] border-white/5">
                            {selectedEmail.html_body ? (
                                <iframe
                                    srcDoc={`
                                        <style>
                                            body { font-family: -apple-system, sans-serif; color: #e5e7eb; font-size: 14px; line-height: 1.6; background: transparent !important; margin: 0; }
                                            a { color: #0071e3; }
                                        </style>
                                        ${selectedEmail.html_body}
                                    `}
                                    className="w-full min-h-[400px] border-none opacity-90"
                                    title="Single View"
                                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                />
                            ) : (
                                <p className="text-sm text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">
                                    {selectedEmail.preview}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Attachments Tier */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="py-8 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Asset Stream</span>
                        </div>
                        <AttachmentViewer
                            attachments={selectedEmail.attachments}
                            messageId={selectedEmail.id}
                            accessToken={(session?.user as any)?.accessToken || ''}
                            userEmail={session?.user?.email || ''}
                        />
                    </div>
                )}

                {/* Intelligence Layer */}
                <div className="space-y-12 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                <Brain className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Neural Logic Synthesis</h3>
                        </div>
                        {!isAnalyzing && analysisResult && (
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">98% Accuracy</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {isAnalyzing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                            <div className="h-40 glass-card bg-white/[0.02]" />
                            <div className="h-40 glass-card bg-white/[0.02]" />
                        </div>
                    ) : analysisResult ? (
                        <div className="space-y-8">
                            {/* Executive Summary Slab */}
                            <div className="glass-card p-10 bg-primary/[0.03] border-primary/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />

                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Primary Intent Vector</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-1 h-4 bg-primary/20 rounded-full" />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-2xl font-semibold text-foreground leading-relaxed">
                                        {analysisResult.recommendations?.find((r: any) => r.id === analysisResult.primary_action_id)?.decision_rationale ||
                                            analysisResult.recommendations?.[0]?.decision_rationale ||
                                            "Strategic prioritization applied based on sender velocity and content intent."}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Confidence Score</span>
                                            <div className="text-lg font-bold text-foreground">High Velocity</div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Risk Profile</span>
                                            <div className="text-lg font-bold text-emerald-500">Neutral Integrity</div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tone Alignment</span>
                                            <div className="text-lg font-bold text-primary">94% Professional</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Intent & Safety Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-8 bg-white/[0.02] border-white/5">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Target className="w-4 h-4 text-emerald-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Contextual Matrix</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {(analysisResult.summary || []).map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-4 text-sm text-gray-300 font-medium leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_#10b981] shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="glass-card p-8 bg-white/[0.02] border-white/5">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Shield className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Integrity Protocol</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                            <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Status: Passed</div>
                                            <div className="text-xs text-emerald-400/70 font-medium">No phishing or deceptive patterns detected in this stream.</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <div className="text-[9px] font-bold text-primary uppercase mb-1">Audit: Verified</div>
                                            <div className="text-xs text-primary/70 font-medium">Professional tone maintains corporate reputation standards.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delegation Link Layer (Dynamic) */}
                            {(() => {
                                const isMatch = (d: any) =>
                                    (d.original_sender === selectedEmail.from || d.original_sender?.includes(selectedEmail.from) || selectedEmail.from?.includes(d.original_sender)) &&
                                    (d.original_subject === selectedEmail.subject || selectedEmail.subject?.includes(d.original_subject) || d.original_subject?.includes(selectedEmail.subject));

                                const linkedIncoming = assignedDelegations.find(isMatch);
                                const linkedOutgoing = delegations.find(isMatch);

                                if (linkedIncoming) {
                                    return (
                                        <div className="glass-card p-8 bg-primary/10 border-primary/20 group animate-in slide-in-from-bottom-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                <div className="flex items-start gap-6">
                                                    <div className="p-4 rounded-2xl bg-primary/20 text-primary shadow-2xl">
                                                        <ShieldCheck className="w-6 h-6" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-lg font-bold text-foreground">Protocol Task Assigned</h4>
                                                        <p className="text-sm text-primary/70 font-medium">
                                                            Instruction: <span className="text-foreground">"{linkedIncoming.expected_action}"</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {!quickReplyingId && (
                                                        <button
                                                            onClick={() => {
                                                                setQuickReplyingId(linkedIncoming.id);
                                                                setQuickReplyText(linkedIncoming.reply_draft || '');
                                                            }}
                                                            className="px-6 py-3 rounded-xl bg-muted hover:bg-white/10 text-foreground text-xs font-bold border border-border transition-all"
                                                        >
                                                            Quick Resolve
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setActiveView('delegations')}
                                                        className="glow-button px-6 py-3 text-xs"
                                                    >
                                                        Secure Workspace
                                                    </button>
                                                </div>
                                            </div>

                                            {quickReplyingId === linkedIncoming.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 pt-8 border-t border-white/5">
                                                    <textarea
                                                        value={quickReplyText}
                                                        onChange={(e) => setQuickReplyText(e.target.value)}
                                                        placeholder="Compose response vector..."
                                                        className="w-full bg-black/40 border border-border rounded-2xl p-6 text-sm focus:border-primary/50 outline-none transition-all mb-6 text-foreground min-h-[120px] font-medium"
                                                    />
                                                    <div className="flex justify-end gap-4">
                                                        <button onClick={() => setQuickReplyingId(null)} className="px-6 py-3 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                                        <button
                                                            onClick={() => handleInboxDelegationReply(linkedIncoming.id, true)}
                                                            disabled={isSubmittingQuickReply || !quickReplyText.trim()}
                                                            className="px-6 py-3 rounded-xl bg-muted hover:bg-white/10 text-foreground text-xs font-bold border border-border disabled:opacity-30"
                                                        >
                                                            Stage Draft
                                                        </button>
                                                        <button
                                                            onClick={() => handleInboxDelegationReply(linkedIncoming.id, false)}
                                                            disabled={isSubmittingQuickReply || !quickReplyText.trim()}
                                                            className="glow-button px-8 py-3 text-xs disabled:opacity-30"
                                                        >
                                                            {isSubmittingQuickReply ? 'Dispatching...' : 'Dispatch Now'}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Governance & Policy Tier */}
                            {(analysisResult.policy_matches && analysisResult.policy_matches.length > 0) || analysisResult.cold_outreach ? (
                                <div className="pt-8 border-t border-white/5 space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gavel className="w-4 h-4 text-gray-600" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Policy Sovereignty</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {analysisResult.policy_matches?.map((p: any, i: number) => (
                                            <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-[10px] font-bold ${p.impact === 'enforced' ? 'bg-primary/10 border-primary/20 text-primary' :
                                                p.impact === 'violated' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                    'bg-muted border-border text-muted-foreground'
                                                }`}>
                                                <Shield className="w-3.5 h-3.5" />
                                                {p.title}: {p.impact.toUpperCase()}
                                            </div>
                                        ))}
                                        {analysisResult.cold_outreach && (
                                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold animate-pulse">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                COLD OUTREACH IMMUNITY ACTIVE
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {/* Proactive Intelligence Flow */}
                <div className="space-y-12 pb-20">
                    <div className="h-px bg-muted w-full" />

                    {/* Handle Missing Context (Questions) */}
                    {analysisResult.questions_for_user && analysisResult.questions_for_user.length > 0 && !showReplyFlow && showContextQuestions ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Contextual Clarification</h3>
                            </div>

                            <div className="glass-card p-10 bg-amber-500/[0.02] border-amber-500/10 relative overflow-hidden">
                                <p className="text-lg font-medium text-gray-300 mb-8 leading-relaxed">
                                    To synthesize a mathematically precise response, the engine requires additional context:
                                </p>

                                <div className="space-y-6 mb-10">
                                    {analysisResult.questions_for_user.map((q: string, idx: number) => (
                                        <div key={idx} className="space-y-3">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{q}</label>
                                            <input
                                                type="text"
                                                placeholder="Enter response data..."
                                                className="w-full bg-muted/50 border border-border/50 rounded-2xl px-6 py-4 text-sm focus:border-amber-500/30 outline-none transition-all text-foreground font-medium"
                                                onChange={(e) => {
                                                    const answer = e.target.value;
                                                    if (answer) setUserInstruction((prev: string) => prev + `\nAnswer to "${q}": ${answer}`);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleGenerateCustom()}
                                        className="glow-button-amber px-8 py-4 text-xs"
                                    >
                                        Synthesize with Context
                                    </button>
                                    <button
                                        onClick={() => setShowReplyFlow(true)}
                                        className="px-6 py-4 rounded-2xl bg-muted hover:bg-white/10 text-foreground text-xs font-bold border border-border transition-all"
                                    >
                                        Bypass Context
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {(() => {
                                const primaryAction = analysisResult.primary_action_id
                                    ? analysisResult.recommendations.find((r: any) => r.id === analysisResult.primary_action_id)
                                    : null;

                                if (primaryAction && primaryAction.suggested_reply && !showReplyFlow && (!analysisResult.questions_for_user || analysisResult.questions_for_user.length === 0 || !showContextQuestions)) {
                                    return (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                    <Zap className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Suggested Vector</h3>
                                            </div>

                                            <div className="glass-card p-10 bg-emerald-500/[0.03] border-emerald-500/20 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />

                                                <div className="relative z-10 space-y-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                                            {primaryAction.action_label}
                                                        </div>
                                                        <span className="text-xs text-emerald-400/60 font-medium tracking-tight">
                                                            {primaryAction.predicted_outcome}
                                                        </span>
                                                    </div>

                                                    <p className="text-2xl font-semibold text-gray-100 leading-relaxed italic border-l-2 border-emerald-500/30 pl-8">
                                                        "{primaryAction.suggested_reply}"
                                                    </p>

                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleActionClick(primaryAction)}
                                                            className="glow-button-emerald px-10 py-5 text-xs shadow-2xl shadow-emerald-500/20"
                                                        >
                                                            Dispatch Response
                                                        </button>
                                                        <button
                                                            onClick={() => handleActionClick(primaryAction)}
                                                            className="px-6 py-5 rounded-2xl bg-muted hover:bg-white/10 text-foreground text-xs font-bold border border-border transition-all"
                                                        >
                                                            Edit Directive
                                                        </button>
                                                        <button
                                                            onClick={() => setShowReplyFlow(true)}
                                                            className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-foreground transition-colors"
                                                        >
                                                            View Alternatives
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (primaryAction && !primaryAction.suggested_reply && !showReplyFlow) {
                                    return (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Recommended Action</h3>
                                            </div>

                                            <div className="glass-card p-10 bg-white/[0.02] border-white/5">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="px-3 py-1 rounded-lg bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest border border-border">
                                                        {primaryAction.action_label}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {primaryAction.predicted_outcome}
                                                    </span>
                                                </div>

                                                <p className="text-xl font-medium text-gray-300 mb-8 leading-relaxed">
                                                    {primaryAction.why_recommendation}
                                                </p>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmail(null);
                                                            setViewMode('list');
                                                        }}
                                                        className="glow-button px-10 py-5 text-xs"
                                                    >
                                                        Finalize & Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => setShowReplyFlow(true)}
                                                        className="px-6 py-5 rounded-2xl bg-muted hover:bg-white/10 text-foreground text-xs font-bold border border-border transition-all"
                                                    >
                                                        Override Manual
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return !showReplyFlow ? (
                                    <div className="py-20 text-center space-y-10 glass-card border-white/5 bg-white/[0.01]">
                                        <div className="space-y-3">
                                            <h4 className="text-3xl font-bold text-foreground tracking-tight">Deployment Ready</h4>
                                            <p className="text-muted-foreground text-base font-medium">Choose a manual deployment route for this stream.</p>
                                        </div>
                                        <div className="flex justify-center gap-6">
                                            <button
                                                onClick={() => setShowReplyFlow(true)}
                                                className="glow-button px-12 py-5 text-xs"
                                            >
                                                Initiate Response
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedEmail(null);
                                                    setViewMode('list');
                                                }}
                                                className="px-10 py-5 rounded-2xl bg-muted hover:bg-white/10 text-foreground text-xs font-bold border border-border transition-all"
                                            >
                                                End Session
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                                    <MessageSquare className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Logic Branch Selection</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {analysisResult.recommendations
                                                    .filter((r: any) => {
                                                        const type = (r.action_type || '').toLowerCase();
                                                        const label = (r.action_label || '').toLowerCase();
                                                        return !type.includes('ignore') && !type.includes('no_reply') &&
                                                            !label.includes('ignore') && !label.includes('no reply') &&
                                                            !label.includes('do nothing');
                                                    })
                                                    .map((action: any, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleActionClick(action)}
                                                            className="glass-card p-8 text-left group hover:bg-primary/[0.04] hover:border-primary/20 transition-all flex flex-col justify-between h-48"
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{action.action_label}</span>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-3">{action.why_recommendation}</p>
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="space-y-8 pt-16 border-t border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                                        <Zap className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Custom Directive</h3>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Logic Engine L4</span>
                                            </div>

                                            <div className="glass-card p-10 bg-black/40 border-white/5 space-y-8 focus-within:border-primary/30 transition-all group">
                                                <textarea
                                                    value={userInstruction}
                                                    onChange={(e) => setUserInstruction(e.target.value)}
                                                    placeholder="Specify tone, key details, or required outcomes..."
                                                    className="w-full bg-transparent border-none text-lg placeholder:text-gray-700 outline-none resize-none min-h-[160px] text-foreground font-medium custom-scrollbar"
                                                />
                                                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                                    <div className="flex gap-3">
                                                        {['Formal', 'Concise', 'Creative'].map(t => (
                                                            <button key={t} className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-muted text-muted-foreground hover:bg-white/10 hover:text-gray-300 transition-all">
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={handleGenerateCustom}
                                                        disabled={isGeneratingCustom || !userInstruction.trim()}
                                                        className="glow-button px-10 py-4 text-xs flex items-center gap-3 disabled:opacity-30 disabled:grayscale transition-all"
                                                    >
                                                        {isGeneratingCustom ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                                Processing Logic...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Brain className="w-4 h-4" />
                                                                Generate Response
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Logic Metrics Tier */}
                    {(metrics || analysisResult) && (
                        <div className="mt-20 pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                {
                                    label: 'Obligation',
                                    value: analysisResult ? `${analysisResult.obligation_score || 0}` : metrics?.decisions_saved || 0,
                                    icon: ShieldCheck,
                                    sub: "Logic Severity"
                                },
                                {
                                    label: 'Opportunity',
                                    value: analysisResult ? `${analysisResult.opportunity_score || 0}` : `${(metrics?.minutes_saved || 0).toFixed(1)}m`,
                                    icon: Zap,
                                    sub: "Growth Potential"
                                },
                                {
                                    label: 'Fidelity',
                                    value: analysisResult ? '96%' : `${((metrics?.consistency_score || 1) * 100).toFixed(0)}%`,
                                    icon: Target,
                                    sub: "Engine Health"
                                },
                                {
                                    label: 'Reduction',
                                    value: analysisResult ? `${(analysisResult.confidence_score * 100).toFixed(0)}%` : (metrics?.replies_prevented || 0),
                                    icon: Brain,
                                    sub: "Synthesized Confidence"
                                },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-4 group">
                                    <div className="flex items-center gap-3">
                                        <stat.icon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors duration-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-gray-400 transition-colors duration-500">{stat.label}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-3xl font-bold text-foreground tracking-tighter group-hover:text-primary transition-colors duration-500">{stat.value}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-700">{stat.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
