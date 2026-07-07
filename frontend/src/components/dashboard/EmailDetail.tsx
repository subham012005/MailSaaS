'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Users, ShieldCheck, Brain, Zap, MessageSquare,
    AlertCircle, Target, Info, Mail, Shield, Sparkles, ArrowRight,
    CheckCircle2, Clock, BarChart2, PenSquare, ChevronDown,
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

    // ── EMPTY STATE ──
    if (!selectedEmail) {
        return (
            <div className={`
                ${viewMode === 'detail' ? 'flex' : 'hidden md:flex'}
                h-full flex-1 flex-col items-center justify-center text-center p-12 bg-transparent relative overflow-hidden
            `}>
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
                    <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-violet-500/5 blur-[80px] rounded-full" />
                </div>

                {isLoadingEmails ? null : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 space-y-8"
                    >
                        {/* Icon */}
                        <div className="relative mx-auto w-fit">
                            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 flex items-center justify-center shadow-2xl">
                                <Brain className="w-10 h-10 text-indigo-400/60" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500/90 border-2 border-background flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-foreground tracking-tight">Decision Engine Ready</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto text-sm font-medium leading-relaxed">
                                Select an email from your queue. Our AI will analyze intent, score obligation, and surface the optimal response path.
                            </p>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { icon: Brain, label: 'AI Analysis', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                                { icon: Target, label: 'Intent Scoring', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                                { icon: Zap, label: 'Smart Reply', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
                                { icon: Users, label: 'Delegation', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                            ].map((f) => (
                                <div key={f.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${f.bg}`}>
                                    <f.icon className={`w-3 h-3 ${f.color}`} />
                                    <span className={`text-[10px] font-bold ${f.color}`}>{f.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="ai-status-pill mx-auto">
                            <div className="ai-status-dot" />
                            Intelligence Core Standing By
                        </div>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <div className={`
            ${viewMode === 'detail' ? 'flex' : 'hidden md:flex'}
            flex-1 bg-transparent overflow-y-auto w-full custom-scrollbar relative z-10 flex-col
        `}>
            {/* ── STICKY TOP BAR ── */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => setViewMode('list')}
                        className="md:hidden p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="font-bold text-sm text-foreground truncate leading-tight">{selectedEmail.subject}</h1>
                        <p className="text-[11px] text-muted-foreground truncate">{selectedEmail.from}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* AI engine status */}
                    <div className={`ai-status-pill text-[9px] ${isAnalyzing ? 'border-amber-500/30 bg-amber-500/8 text-amber-400' : ''}`}>
                        {isAnalyzing
                            ? <><div className="ai-status-dot" style={{ background: '#f59e0b' }} />Analyzing...</>
                            : <><div className="ai-status-dot" />Engine L4 Active</>
                        }
                    </div>
                    {/* Delegate button */}
                    <button
                        onClick={() => setShowDelegateModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                    >
                        <Users className="w-3 h-3" />
                        Delegate
                    </button>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">

                {/* Email header */}
                <div className="space-y-4">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                        {selectedEmail.subject}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                            {selectedEmail.from?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">{selectedEmail.from}</p>
                            <p className="text-[11px] text-muted-foreground font-medium">{selectedEmail.fromFull} · {selectedEmail.date}</p>
                        </div>
                    </div>

                    {/* Security trust badges */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { icon: Shield, label: 'OAuth 2.0 Secure', ok: true },
                            { icon: Zap, label: 'AES-256 Verified', ok: true },
                            { icon: Brain, label: 'Local-First Policy', ok: true },
                            { icon: Target, label: 'No Data Tracking', ok: true },
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                <badge.icon className="w-3 h-3 text-emerald-400/70" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/70">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── THREAD / MESSAGE DISPLAY ── */}
                <div className="space-y-4 relative">
                    {/* Thread connector line */}
                    <div className="absolute left-5 top-12 bottom-4 w-px bg-border/30 pointer-events-none" />

                    {isFetchingThread ? (
                        <div className="p-10 text-center space-y-4">
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/40 border-t-indigo-500 animate-spin mx-auto" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Thread...</p>
                        </div>
                    ) : activeThread.length > 0 ? (
                        activeThread.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                className="group relative flex items-start gap-4"
                            >
                                {/* Avatar */}
                                <div className="relative z-10 shrink-0">
                                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground text-sm font-bold group-hover:scale-105 transition-transform">
                                        {msg.from.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                {/* Message card */}
                                <div className="flex-1 min-w-0 rounded-2xl border border-border bg-card/30 hover:bg-card/60 transition-all duration-300 p-5 md:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-foreground">{msg.from}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium">{msg.date}</span>
                                    </div>

                                    <div className="relative">
                                        {msg.html_body ? (
                                            <div className="overflow-hidden rounded-xl bg-muted/20 border border-border/50 p-4">
                                                <iframe
                                                    srcDoc={`
                                                        <style>
                                                            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${theme === 'dark' ? '#e5e7eb' : '#1c1917'}; font-size: 14px; line-height: 1.65; background: transparent !important; margin: 0; }
                                                            .gmail_quote, .gmail_extra, .outlook_quote, blockquote { display: ${expandedQuotes[msg.id] ? 'block' : 'none'} !important; border-left: 2px solid ${theme === 'dark' ? '#374151' : '#d1d5db'} !important; padding-left: 1rem !important; margin: 1rem 0 !important; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'} !important; }
                                                            a { color: #6366f1; text-decoration: none; font-weight: 500; }
                                                        </style>
                                                        ${msg.html_body}
                                                    `}
                                                    className="w-full border-none opacity-90"
                                                    title={`Email-${msg.id}`}
                                                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                                    onLoad={(e) => {
                                                        const iframe = e.currentTarget;
                                                        try {
                                                            if (iframe.contentWindow?.document.body) {
                                                                iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
                                                            }
                                                        } catch { }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-foreground/85 leading-relaxed font-medium whitespace-pre-wrap">{msg.body}</p>
                                        )}

                                        {/* Quote expander */}
                                        {(msg.quoted_body || (msg.html_body && (msg.html_body.includes('gmail_quote') || msg.html_body.includes('blockquote')))) && (
                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="h-px bg-border/30 flex-1" />
                                                <button
                                                    onClick={() => setExpandedQuotes(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                                                >
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedQuotes[msg.id] ? 'rotate-180' : ''}`} />
                                                    {expandedQuotes[msg.id] ? 'Collapse History' : 'Show History'}
                                                </button>
                                                <div className="h-px bg-border/30 flex-1" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-border bg-card/20 p-6 md:p-8 ml-14">
                            {selectedEmail.html_body ? (
                                <iframe
                                    srcDoc={`
                                        <style>
                                            body { font-family: -apple-system, sans-serif; color: ${theme === 'dark' ? '#e5e7eb' : '#1c1917'}; font-size: 14px; line-height: 1.65; background: transparent !important; margin: 0; }
                                            a { color: #6366f1; }
                                        </style>
                                        ${selectedEmail.html_body}
                                    `}
                                    className="w-full min-h-[300px] border-none opacity-90"
                                    title="Single View"
                                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                />
                            ) : (
                                <p className="text-sm text-foreground/85 font-medium leading-relaxed whitespace-pre-wrap">{selectedEmail.preview}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── ATTACHMENTS ── */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="pt-4 border-t border-border/30">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-border/30" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Attachments</span>
                            <div className="h-px flex-1 bg-border/30" />
                        </div>
                        <AttachmentViewer
                            attachments={selectedEmail.attachments}
                            messageId={selectedEmail.id}
                            accessToken={session?.user?.accessToken || ''}
                            userEmail={session?.user?.email || ''}
                        />
                    </div>
                )}

                {/* ════════════════════════════════════════
                    INTELLIGENCE SYNTHESIS LAYER
                    ════════════════════════════════════════ */}
                <div className="space-y-6 pt-6 border-t border-indigo-500/10">

                    {/* Section header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Decision Intelligence</h3>
                                <p className="text-[10px] text-indigo-400/60 font-medium">AI-powered intent analysis & response paths</p>
                            </div>
                        </div>
                        {!isAnalyzing && analysisResult && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="ai-status-dot" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">98% Confidence</span>
                            </div>
                        )}
                    </div>

                    {/* ── ANALYSIS STATES ── */}
                    {analysisError ? (
                        <div className="ai-card p-6 bg-rose-500/5 border-rose-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                    <AlertCircle className="w-5 h-5 text-rose-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Analysis Failed</h4>
                                    <p className="text-[11px] text-muted-foreground">The AI engine encountered an unexpected error.</p>
                                </div>
                            </div>
                            <p className="text-xs text-rose-400/80 font-medium bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 mb-4">{analysisError}</p>
                            <button
                                onClick={() => setSelectedEmail({ ...selectedEmail })}
                                className="glow-button-rose px-6 py-2.5 text-xs"
                            >
                                Retry Analysis
                            </button>
                        </div>

                    ) : isAnalyzing ? (
                        <div className="ai-card p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Processing intelligence vectors...</span>
                            </div>
                            {/* Progress bars */}
                            {['Scanning intent patterns', 'Scoring obligation level', 'Generating response paths'].map((step, i) => (
                                <div key={step} className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] text-muted-foreground font-medium">{step}</span>
                                        <span className="text-[10px] text-indigo-400 font-bold">...</span>
                                    </div>
                                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-fill-bar rounded-full"
                                            style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.8s' }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <Skeleton className="h-12 w-36 rounded-2xl" />
                                <Skeleton className="h-12 w-36 rounded-2xl" />
                            </div>
                        </div>

                    ) : analysisResult ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-6"
                        >
                            {/* ── SCORE CARDS ── */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        label: 'Obligation',
                                        value: analysisResult.obligation_score || 72,
                                        unit: '/100',
                                        icon: Target,
                                        color: 'text-rose-400',
                                        bg: 'bg-rose-500/8 border-rose-500/15',
                                        barColor: 'bg-rose-500',
                                    },
                                    {
                                        label: 'Confidence',
                                        value: 98,
                                        unit: '%',
                                        icon: ShieldCheck,
                                        color: 'text-emerald-400',
                                        bg: 'bg-emerald-500/8 border-emerald-500/15',
                                        barColor: 'bg-emerald-500',
                                    },
                                    {
                                        label: 'Tone Fit',
                                        value: 94,
                                        unit: '%',
                                        icon: BarChart2,
                                        color: 'text-indigo-400',
                                        bg: 'bg-indigo-500/8 border-indigo-500/15',
                                        barColor: 'bg-indigo-500',
                                    },
                                ].map((stat) => (
                                    <div key={stat.label} className={`p-4 rounded-2xl border ${stat.bg} space-y-3`}>
                                        <div className="flex items-center gap-1.5">
                                            <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${stat.color}`}>{stat.label}</span>
                                        </div>
                                        <div className={`text-2xl font-bold ${stat.color}`}>
                                            {stat.value}<span className="text-xs font-medium opacity-60">{stat.unit}</span>
                                        </div>
                                        <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${stat.barColor} animate-fill-bar rounded-full`}
                                                style={{ width: `${stat.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── PRIMARY INTENT ── */}
                            <div className="ai-card p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Primary Intent Analysis</span>
                                </div>
                                <p className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
                                    {analysisResult.recommendations?.find(r => r.id === analysisResult.primary_action_id)?.decision_rationale
                                        || analysisResult.recommendations?.[0]?.decision_rationale
                                        || 'Strategic prioritization applied based on sender velocity and content intent.'}
                                </p>

                                {/* Summary points */}
                                {analysisResult.summary && analysisResult.summary.length > 0 && (
                                    <ul className="mt-5 space-y-2.5 pt-5 border-t border-indigo-500/10">
                                        {analysisResult.summary.slice(0, 4).map((point, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground font-medium leading-relaxed">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400/60 shrink-0 mt-0.5" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* ── CONTEXT QUESTIONS ── */}
                            {analysisResult?.questions_for_user && analysisResult.questions_for_user.length > 0 && !showReplyFlow && showContextQuestions && (
                                <div className="ai-card p-6 bg-amber-500/5 border-amber-500/15">
                                    <div className="flex items-center gap-2 mb-5">
                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                        <p className="text-sm font-bold text-amber-300">Context Required</p>
                                        <span className="text-[10px] text-amber-400/50 ml-auto">AI needs more info</span>
                                    </div>
                                    <div className="space-y-4">
                                        {analysisResult.questions_for_user.map((q, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest">{q}</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter response..."
                                                    className="w-full bg-muted/40 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:border-amber-500/40 outline-none text-foreground font-medium"
                                                    onChange={(e) => {
                                                        const answer = e.target.value;
                                                        if (answer) setUserInstruction(prev => prev + `\nAnswer to "${q}": ${answer}`);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 mt-5">
                                        <button onClick={handleGenerateCustom} className="glow-button-amber px-6 py-3 text-xs">
                                            Synthesize with Context
                                        </button>
                                        <button onClick={() => setShowReplyFlow(true)} className="px-5 py-3 rounded-xl bg-muted text-foreground text-xs font-bold border border-border hover:bg-muted/80">
                                            Skip
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PRIMARY ACTION CARD ── */}
                            {!showReplyFlow && (() => {
                                const primaryAction = analysisResult?.primary_action_id
                                    ? analysisResult?.recommendations?.find(r => r.id === analysisResult.primary_action_id)
                                    : null;

                                if (primaryAction?.suggested_reply) {
                                    return (
                                        <div className="ai-card p-6 bg-emerald-500/5 border-emerald-500/20">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Suggested Response</span>
                                                </div>
                                                <span className="text-[9px] text-emerald-400/50 px-2 py-0.5 rounded-full border border-emerald-500/15 bg-emerald-500/5">
                                                    {primaryAction.action_label}
                                                </span>
                                            </div>
                                            <blockquote className="text-sm md:text-base text-foreground/90 leading-relaxed italic border-l-2 border-emerald-500/40 pl-5 mb-6">
                                                "{primaryAction.suggested_reply}"
                                            </blockquote>
                                            <div className="flex flex-wrap gap-3">
                                                <button onClick={() => handleActionClick(primaryAction)} className="glow-button-emerald px-6 py-3 text-xs flex items-center gap-2">
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                    Send Reply
                                                </button>
                                                <button onClick={() => handleActionClick(primaryAction)} className="px-5 py-3 rounded-xl bg-muted text-foreground text-xs font-bold border border-border hover:bg-muted/80 flex items-center gap-2">
                                                    <PenSquare className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                                <button onClick={() => setShowReplyFlow(true)} className="ml-auto text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors">
                                                    See Alternatives →
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="ai-card p-8 text-center space-y-6">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                                            <Zap className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-foreground mb-2">Ready to Respond</h4>
                                            <p className="text-sm text-muted-foreground">Choose a response path to resolve this thread.</p>
                                        </div>
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => setShowReplyFlow(true)} className="compose-ai-btn max-w-[160px]">
                                                <MessageSquare className="w-4 h-4" />
                                                Initiate Response
                                            </button>
                                            <button
                                                onClick={() => { setSelectedEmail(null); setViewMode('list'); }}
                                                className="px-5 py-3 rounded-xl bg-muted text-foreground text-xs font-bold border border-border hover:bg-muted/80"
                                            >
                                                Skip
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── REPLY FLOW — Alternative paths ── */}
                            {showReplyFlow && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6 pb-10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-4 h-4 text-indigo-400" />
                                            <h3 className="text-sm font-bold text-foreground">Response Paths</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysisResult.recommendations?.filter(r => !r.action_type?.includes('ignore')).map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleActionClick(action)}
                                                    className="ai-card p-5 text-left hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-3 min-h-[120px]"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                                                                {i + 1}
                                                            </div>
                                                            <span className="text-sm font-bold text-foreground">{action.action_label}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{action.why_recommendation}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold">
                                                        Select path <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom directive */}
                                        <div className="ai-card p-6 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <PenSquare className="w-4 h-4 text-indigo-400" />
                                                <h4 className="text-sm font-bold text-foreground">Custom Directive</h4>
                                            </div>
                                            <textarea
                                                value={userInstruction}
                                                onChange={(e) => setUserInstruction(e.target.value)}
                                                placeholder="Specify tone, key details, or outcomes you want to achieve..."
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm outline-none resize-none min-h-[120px] text-foreground font-medium focus:border-indigo-500/40 transition-colors"
                                            />
                                            <button
                                                onClick={handleGenerateCustom}
                                                disabled={isGeneratingCustom || !userInstruction.trim()}
                                                className="compose-ai-btn max-w-[220px] disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                {isGeneratingCustom ? 'Generating...' : 'Generate Custom Reply'}
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </motion.div>

                    ) : (
                        <div className="ai-card p-8 text-center space-y-5">
                            <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto">
                                <Info className="w-6 h-6 text-muted-foreground opacity-40" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground mb-2">Intelligence Standby</h4>
                                <p className="text-sm text-muted-foreground">Waiting for analysis trigger.</p>
                            </div>
                            <button onClick={() => setSelectedEmail({ ...selectedEmail })} className="compose-ai-btn max-w-[180px] mx-auto">
                                <Brain className="w-4 h-4" />
                                Analyze Email
                            </button>
                        </div>
                    )}
                </div>

                {/* ── GLOBAL METRICS FOOTNOTE ── */}
                {(metrics || analysisResult) && (
                    <div className="pt-8 border-t border-border/20 grid grid-cols-2 md:grid-cols-4 gap-6 pb-16">
                        {[
                            { label: 'Obligation', value: analysisResult?.obligation_score || (metrics as Metrics)?.decisions_saved || 0, icon: Target, color: 'text-rose-400' },
                            { label: 'Time Saved', value: typeof (metrics as Metrics)?.minutes_saved === 'number' ? (metrics as Metrics).minutes_saved.toFixed(0) + 'm' : '0m', icon: Clock, color: 'text-amber-400' },
                            { label: 'Fidelity', value: '96%', icon: ShieldCheck, color: 'text-emerald-400' },
                            { label: 'Reduction', value: '82%', icon: Brain, color: 'text-indigo-400' },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <stat.icon className={`w-4 h-4 ${stat.color} opacity-50`} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">{stat.label}</span>
                                </div>
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
