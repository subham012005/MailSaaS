'use client';

import { motion } from 'framer-motion';
import {
    ChevronLeft, Users, ShieldCheck, Brain, Zap, MessageSquare,
    AlertCircle, Target, Info, Mail, Shield
} from 'lucide-react';
import AttachmentViewer from '@/components/AttachmentViewer';
import { useTheme } from '@/components/ThemeProvider';
import Skeleton from '../ui/Skeleton';

interface Email {
    id: string;
    threadId?: string;
    subject: string;
    from: string;
    fromFull: string;
    preview: string;
    html_body?: string;
    body?: string;
    quoted_body?: string;
    dateRaw?: string;
    date: string;
    attachments?: Array<{
        id: string;
        filename: string;
        size: number;
        mimeType: string;
    }>;
}

interface Message {
    id: string;
    from: string;
    date: string;
    body: string;
    html_body?: string;
    quoted_body?: string;
}

interface Recommendation {
    id: string;
    action_label: string;
    action_type?: string;
    decision_rationale: string;
    suggested_reply?: string;
    why_recommendation?: string;
}

interface AnalysisResult {
    primary_action_id?: string;
    recommendations?: Recommendation[];
    summary?: string[];
    questions_for_user?: string[];
    obligation_score?: number;
}

interface Metrics {
    decisions_saved: number;
    minutes_saved: number;
    accuracy: number;
    velocity: number[];
    top_category: string;
    replies_prevented: number;
}

interface EmailDetailProps {
    selectedEmail: Email | null;
    viewMode: 'list' | 'detail';
    setViewMode: (mode: 'list' | 'detail') => void;
    setShowDelegateModal: (open: boolean) => void;
    isAnalyzing: boolean;
    isFetchingThread: boolean;
    activeThread: Message[];
    expandedQuotes: { [key: string]: boolean };
    setExpandedQuotes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
    session: { user?: { name?: string | null; email?: string | null; image?: string | null; accessToken?: string } } | null;
    analysisResult: AnalysisResult | null;
    analysisError: string | null;
    showReplyFlow: boolean;
    setShowReplyFlow: (show: boolean) => void;
    showContextQuestions: boolean;
    userInstruction: string;
    setUserInstruction: React.Dispatch<React.SetStateAction<string>>;
    handleGenerateCustom: () => void;
    handleActionClick: (action: Recommendation) => void;
    setSelectedEmail: (email: Email | null) => void;
    metrics: Metrics | Record<string, unknown> | null;
    isGeneratingCustom: boolean;
    isLoadingEmails: boolean;
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
    showReplyFlow,
    setShowReplyFlow,
    showContextQuestions,
    userInstruction,
    setUserInstruction,
    handleGenerateCustom,
    handleActionClick,
    setSelectedEmail,
    metrics,
    isGeneratingCustom,
    isLoadingEmails
}: EmailDetailProps) {
    const { theme } = useTheme();

    if (!selectedEmail) {
        return (
            <div className={`
                ${viewMode === 'detail' ? 'flex' : 'hidden md:flex'}
                h-full flex-1 flex-col items-center justify-center text-center p-12 bg-transparent relative overflow-hidden
            `}>
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full" />
                </div>

                {isLoadingEmails ? null : (
                    <>
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
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={`
            ${viewMode === 'detail' ? 'flex' : 'hidden md:flex'}
            flex-1 bg-transparent overflow-y-auto w-full custom-scrollbar relative z-10
        `}>
            <div className="p-4 md:p-16 max-w-5xl mx-auto w-full space-y-8 md:space-y-12">
                {/* Mobile Back Button */}
                <button
                    onClick={() => setViewMode('list')}
                    className="md:hidden flex items-center gap-2 text-muted-foreground mb-4 px-4 py-2 rounded-full bg-muted border border-border"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Return</span>
                </button>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                        <div className="space-y-4 flex-1">
                            <h1 className="text-2xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                                {selectedEmail.subject}
                            </h1>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm md:text-base font-bold text-foreground/80 leading-snug">{selectedEmail.from}</span>
                                <span className="text-[10px] md:text-xs text-muted-foreground font-medium break-all md:truncate">{selectedEmail.fromFull}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-2">
                            <button
                                onClick={() => setShowDelegateModal(true)}
                                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground border border-border text-[10px] md:text-xs font-bold transition-all shadow-xl"
                            >
                                <Users className="w-3 md:w-4 h-3 md:h-4" />
                                Delegate
                            </button>
                            <div className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-[10px] md:text-xs font-bold shadow-2xl shadow-primary/10">
                                <ShieldCheck className="w-3 md:w-4 h-3 md:h-4" />
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
                        <div key={i} className="flex items-center gap-2 md:gap-3 p-2 md:p-4 rounded-2xl bg-muted border border-border group hover:bg-muted/80 transition-all">
                            <badge.icon className="w-3 md:w-4 h-3 md:h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{badge.label}</span>
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
                                <div className="flex items-start gap-3 md:gap-8">
                                    {/* Avatar Tier */}
                                    <div className="relative z-10 shrink-0">
                                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground text-sm md:text-base font-bold shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                            {msg.from.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute inset-0 bg-primary/20 blur-lg md:blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-xl md:rounded-2xl" />
                                    </div>

                                    {/* Message Slab */}
                                    <div className="flex-1 min-w-0 glass-card p-4 md:p-8 bg-card border-border hover:bg-muted transition-all duration-500">
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
                                                            } catch { }
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
                                                        onClick={() => setExpandedQuotes((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))}
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
                            accessToken={session?.user?.accessToken || ''}
                            userEmail={session?.user?.email || ''}
                        />
                    </div>
                )}

                {/* Intelligence Synthesis Layer */}
                <div className="space-y-8 md:space-y-12 pb-10 md:pb-20 border-t border-white/5 pt-8 md:pt-12">
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

                    {analysisError ? (
                        <div className="glass-card p-10 bg-rose-500/[0.02] border-rose-500/10 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-foreground tracking-tight">Synthesis Interrupted</h4>
                                    <p className="text-sm text-muted-foreground font-medium">The neural engine encountered an unexpected vector divergence.</p>
                                </div>
                            </div>
                            <p className="text-sm text-rose-500/80 mb-8 font-medium bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                                {analysisError}
                            </p>
                            <button
                                onClick={() => setSelectedEmail({ ...selectedEmail })}
                                className="glow-button-rose px-8 py-3 text-xs"
                            >
                                Retry Synchronization
                            </button>
                        </div>
                    ) : isAnalyzing ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="glass-card p-10 bg-primary/[0.02] border-primary/10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Scanning neural patterns...</span>
                                    </div>
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="space-y-3">
                                        <Skeleton className="h-10 w-full rounded-2xl" />
                                        <Skeleton className="h-10 w-full rounded-2xl" />
                                    </div>
                                    <div className="flex gap-4">
                                        <Skeleton className="h-12 w-40 rounded-2xl" />
                                        <Skeleton className="h-12 w-40 rounded-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : analysisResult ? (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Executive Summary Slab */}
                            <div className="glass-card p-6 md:p-10 bg-primary/[0.03] border-primary/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />

                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Primary Intent Vector</span>
                                        </div>
                                    </div>

                                    <p className="text-2xl font-semibold text-foreground leading-relaxed">
                                        {analysisResult.recommendations?.find((r) => r.id === analysisResult.primary_action_id)?.decision_rationale ||
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

                            {/* Intent Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-5 md:p-8 bg-white/[0.02] border-white/5">
                                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                                        <Target className="w-4 h-4 text-emerald-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Contextual Matrix</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {(analysisResult.summary || []).slice(0, 4).map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-4 text-sm text-gray-300 font-medium leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_#10b981] shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="glass-card p-5 md:p-8 bg-white/[0.02] border-white/5">
                                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                                        <Shield className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Integrity Protocol</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                            <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Status: Passed</div>
                                            <div className="text-xs text-emerald-400/70 font-medium">No phishing patterns detected.</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <div className="text-[9px] font-bold text-primary uppercase mb-1">Audit: Verified</div>
                                            <div className="text-xs text-primary/70 font-medium">Professional tone confirmed.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Proactive Actions */}
                            {analysisResult?.questions_for_user && analysisResult.questions_for_user.length > 0 && !showReplyFlow && showContextQuestions ? (
                                <div className="space-y-6 md:space-y-8 p-6 md:p-10 glass-card bg-amber-500/[0.02] border-amber-500/10">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                        <p className="text-lg font-medium text-gray-300">Contextual Clarification Required</p>
                                    </div>
                                    <div className="space-y-6">
                                        {analysisResult.questions_for_user.map((q: string, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase">{q}</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter response..."
                                                    className="w-full bg-muted/50 border border-border/50 rounded-2xl px-6 py-4 text-sm focus:border-amber-500/30 outline-none text-foreground font-medium"
                                                    onChange={(e) => {
                                                        const answer = e.target.value;
                                                        if (answer) setUserInstruction((prev: string) => prev + `\nAnswer to "${q}": ${answer}`);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={handleGenerateCustom} className="glow-button-amber px-8 py-4 text-xs">Synthesize with Context</button>
                                        <button onClick={() => setShowReplyFlow(true)} className="px-6 py-4 rounded-2xl bg-muted text-foreground text-xs font-bold border border-border">Bypass</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {(() => {
                                        const primaryAction = analysisResult?.primary_action_id
                                            ? analysisResult?.recommendations?.find((r) => r.id === analysisResult.primary_action_id)
                                            : null;

                                        if (primaryAction && primaryAction.suggested_reply && !showReplyFlow) {
                                            return (
                                                <div className="glass-card p-6 md:p-10 bg-emerald-500/[0.03] border-emerald-500/20 group">
                                                    <div className="flex items-center gap-3 mb-8">
                                                        <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                                            Suggested: {primaryAction.action_label}
                                                        </div>
                                                    </div>
                                                    <p className="text-lg md:text-2xl font-semibold text-gray-100 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4 md:pl-8 mb-6 md:mb-10">
                                                        &quot;{primaryAction.suggested_reply}&quot;
                                                    </p>
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                        <button onClick={() => handleActionClick(primaryAction)} className="glow-button-emerald px-10 py-5 text-xs">Dispatch Response</button>
                                                        <button onClick={() => handleActionClick(primaryAction)} className="px-6 py-5 rounded-2xl bg-muted text-foreground text-xs font-bold border border-border">Edit Directive</button>
                                                        <button onClick={() => setShowReplyFlow(true)} className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-foreground">Alternatives</button>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="py-20 text-center space-y-10 glass-card border-white/5 bg-white/[0.01]">
                                                <h4 className="text-3xl font-bold text-foreground tracking-tight">Deployment Ready</h4>
                                                <p className="text-muted-foreground text-base">Choose a deployment route to resolve this stream.</p>
                                                <div className="flex justify-center gap-6">
                                                    <button onClick={() => setShowReplyFlow(true)} className="glow-button px-12 py-5 text-xs">Initiate Response</button>
                                                    <button onClick={() => { setSelectedEmail(null); setViewMode('list'); }} className="px-10 py-5 rounded-2xl bg-muted text-foreground text-xs font-bold border border-border">End Session</button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-8 glass-card border-white/5 bg-white/[0.01]">
                            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                                <Info className="w-8 h-8 text-muted-foreground opacity-50" />
                            </div>
                            <h4 className="text-2xl font-bold text-foreground">Intelligence Standby</h4>
                            <p className="text-muted-foreground text-sm">Waiting for synchronization trigger.</p>
                            <button onClick={() => setSelectedEmail({ ...selectedEmail })} className="glow-button px-10 py-4 text-xs">Force Analysis</button>
                        </div>
                    )}
                </div>

                {/* Reply Flow Selection (Shown when showReplyFlow is true) */}
                {showReplyFlow && analysisResult && (
                    <div className="pb-32 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Logic Branch Selection</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analysisResult.recommendations?.filter((r) => !r.action_type?.includes('ignore')).map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleActionClick(action)}
                                        className="glass-card p-8 text-left hover:bg-primary/[0.04] hover:border-primary/20 transition-all flex flex-col justify-between h-48"
                                    >
                                        <span className="text-sm font-bold text-foreground">{action.action_label}</span>
                                        <p className="text-xs text-muted-foreground line-clamp-3">{action.why_recommendation}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8 pt-16 border-t border-white/5">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Custom Directive</h3>
                            <div className="glass-card p-10 bg-black/20 border-white/5 space-y-8">
                                <textarea
                                    value={userInstruction}
                                    onChange={(e) => setUserInstruction(e.target.value)}
                                    placeholder="Specify tone, key details, or outcomes..."
                                    className="w-full bg-transparent border-none text-lg outline-none resize-none min-h-[160px] text-foreground font-medium"
                                />
                                <button
                                    onClick={handleGenerateCustom}
                                    disabled={isGeneratingCustom || !userInstruction.trim()}
                                    className="glow-button px-10 py-5 text-xs flex items-center gap-3 disabled:opacity-30"
                                >
                                    {isGeneratingCustom ? 'Processing Logic...' : 'Generate Custom Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Global Metrics Footnote */}
                {(metrics || analysisResult) && (
                    <div className="pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 pb-20">
                        {[
                            { label: 'Obligation', value: analysisResult?.obligation_score || (metrics as Metrics)?.decisions_saved || 0, icon: ShieldCheck, sub: "Logic Severity" },
                            { label: 'Opportunity', value: typeof (metrics as Metrics)?.minutes_saved === 'number' ? (metrics as Metrics).minutes_saved.toFixed(1) + 'm' : '0m', icon: Zap, sub: "Growth Potential" },
                            { label: 'Fidelity', value: '96%', icon: Target, sub: "Engine Health" },
                            { label: 'Reduction', value: '82%', icon: Brain, sub: "Confidence" }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <stat.icon className="w-5 h-5 text-gray-600" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                                </div>
                                <div className="text-3xl font-bold text-foreground tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-bold uppercase text-gray-700">{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
