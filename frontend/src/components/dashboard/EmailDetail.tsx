'use client';

import { motion } from 'framer-motion';
import {
    ChevronLeft, Users, ShieldCheck, Brain, Zap, MessageSquare,
    AlertCircle, AlertTriangle, Target, Info, ArrowLeft, Mail,
    Shield, Gavel, Clock, ArrowUpRight
} from 'lucide-react';
import AttachmentViewer from '@/components/AttachmentViewer';

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
    if (!selectedEmail) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Click mail to read</h2>
                <p className="text-gray-400 max-w-xs mx-auto text-sm">
                    Select an email from the list to start the Decision Intelligence engine.
                </p>
            </div>
        );
    }

    return (
        <div className={`
            ${viewMode === 'detail' ? 'flex' : 'hidden md:flex'}
            flex-1 bg-black/20 overflow-y-auto w-full
        `}>
            <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
                {/* Mobile Back Button */}
                <button
                    onClick={() => setViewMode('list')}
                    className="md:hidden flex items-center gap-2 text-gray-400 mb-6 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back to Inbox</span>
                </button>

                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <h1 className="text-xl md:text-2xl font-bold">{selectedEmail.subject}</h1>
                        <div className="flex items-center gap-2 self-start">
                            <button
                                onClick={() => setShowDelegateModal(true)}
                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold transition-all"
                            >
                                <Users className="w-3 h-3" />
                                Delegate
                            </button>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 text-[10px] font-bold">
                                <ShieldCheck className="w-3 h-3" />
                                {isAnalyzing ? 'Analyzing...' : 'Decision Engine Active'}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm text-gray-400">
                        <span className="font-medium text-white">{selectedEmail.from}</span>
                        <span className="truncate">{selectedEmail.fromFull}</span>
                    </div>
                </div>

                {/* Conversation Thread */}
                <div className="space-y-4 mb-8">
                    {isFetchingThread ? (
                        <div className="p-12 text-center text-gray-500 text-xs animate-pulse">
                            Loading conversation history...
                        </div>
                    ) : activeThread.length > 0 ? (
                        activeThread.map((msg, idx) => (
                            <div
                                key={msg.id}
                                className={`p-6 md:p-8 rounded-2xl border transition-all ${idx === activeThread.length - 1
                                    ? 'bg-white/[0.03] border-white/10 shadow-xl'
                                    : 'bg-black/40 border-white/5 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                                            {msg.from.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{msg.from}</div>
                                            <div className="text-[10px] text-gray-500">{msg.date}</div>
                                        </div>
                                    </div>
                                    {idx === activeThread.length - 1 && (
                                        <div className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-bold uppercase tracking-widest border border-indigo-500/10">
                                            Latest
                                        </div>
                                    )}
                                </div>

                                {(() => {
                                    const isExpanded = expandedQuotes[msg.id];
                                    const cleanHtml = msg.html_body ? `
                                        <style>
                                            .gmail_quote, .gmail_extra, .outlook_quote, blockquote[type="cite"], .wordSection1 > div > p.MsoNormal:nth-child(n+3) { 
                                                display: ${isExpanded ? 'block' : 'none'} !important; 
                                            }
                                            body { font-family: sans-serif; }
                                        </style>
                                        ${msg.html_body}
                                    ` : null;

                                    return (
                                        <div className="space-y-4">
                                            {msg.html_body ? (
                                                <div className="bg-white rounded-lg p-4 overflow-hidden max-h-[500px] overflow-y-auto">
                                                    <iframe
                                                        srcDoc={cleanHtml!}
                                                        className="w-full min-h-[100px] border-none"
                                                        title={`Email-${msg.id}`}
                                                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                                        onLoad={(e) => {
                                                            const iframe = e.currentTarget;
                                                            try {
                                                                if (iframe.contentWindow && iframe.contentWindow.document.body) {
                                                                    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
                                                                }
                                                            } catch (err) {
                                                                console.warn("Auto-size failed:", err);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                                                    {msg.body}
                                                </p>
                                            )}

                                            {(msg.quoted_body || (msg.html_body && msg.html_body.toLowerCase().includes('quote'))) && (
                                                <div className="pt-2">
                                                    {!isExpanded ? (
                                                        <button
                                                            onClick={() => setExpandedQuotes((prev: any) => ({ ...prev, [msg.id]: true }))}
                                                            className="w-8 h-4 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-[10px] text-gray-400 font-black transition-all hover:text-white"
                                                            title="Show trimmed content"
                                                        >
                                                            ...
                                                        </button>
                                                    ) : (
                                                        <>
                                                            {!msg.html_body && (
                                                                <div className="border-l-2 border-white/10 pl-4 text-[11px] text-gray-500 whitespace-pre-wrap font-mono leading-relaxed mt-2">
                                                                    {msg.quoted_body}
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={() => setExpandedQuotes((prev: any) => ({ ...prev, [msg.id]: false }))}
                                                                className="text-[10px] text-gray-500 hover:text-white mt-2 font-bold tracking-tighter transition-colors"
                                                            >
                                                                Hide history
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        ))
                    ) : (
                        <div className="glass-card p-6 md:p-8 bg-white/[0.02]">
                            {selectedEmail.html_body ? (
                                <iframe
                                    srcDoc={selectedEmail.html_body}
                                    className="w-full min-h-[400px] border-none bg-white rounded-lg"
                                    title="Single Email View"
                                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                />
                            ) : (
                                <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                                    {selectedEmail.preview}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Attachments Section */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="mb-8">
                        <AttachmentViewer
                            attachments={selectedEmail.attachments}
                            messageId={selectedEmail.id}
                            accessToken={(session?.user as any)?.accessToken || ''}
                            userEmail={session?.user?.email || ''}
                        />
                    </div>
                )}

                {/* AI Summary & Insights */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <Brain className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Key Summary & Intent</h3>
                    </div>

                    {isAnalyzing ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-white/5 rounded w-3/4" />
                            <div className="h-20 bg-white/5 rounded w-full" />
                        </div>
                    ) : analysisResult ? (
                        <div className="space-y-6">
                            <div className="glass-card p-6 bg-indigo-600/5 border-indigo-600/20">
                                {/* Intelligence Summary */}
                                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                        <Brain className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">AI Strategic Summary</span>
                                    </div>
                                    <p className="text-sm text-white font-medium leading-relaxed">
                                        {analysisResult.recommendations?.find((r: any) => r.id === analysisResult.primary_action_id)?.decision_rationale ||
                                            analysisResult.recommendations?.[0]?.decision_rationale ||
                                            "Strategic analysis applied to prioritize response urgency."}
                                    </p>
                                </div>

                                {/* Decision Rationale */}
                                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                        <ShieldCheck className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Decision Rationale</span>
                                    </div>
                                    <p className="text-sm text-white font-medium leading-relaxed">
                                        {analysisResult.recommendations?.find((r: any) => r.id === analysisResult.primary_action_id)?.decision_rationale ||
                                            analysisResult.recommendations?.[0]?.decision_rationale ||
                                            "Strategic analysis applied to prioritize response urgency."}
                                    </p>
                                </div>


                                {/* Summary Bullets */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MessageSquare className="w-3.5 h-3.5 italic" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Key Extraction</span>
                                    </div>
                                    <ul className="space-y-3">
                                        {(analysisResult.summary || []).map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {(() => {
                                    const isMatch = (d: any) =>
                                        (d.original_sender === selectedEmail.from || d.original_sender?.includes(selectedEmail.from) || selectedEmail.from?.includes(d.original_sender)) &&
                                        (d.original_subject === selectedEmail.subject || selectedEmail.subject?.includes(d.original_subject) || d.original_subject?.includes(selectedEmail.subject));

                                    const linkedIncoming = assignedDelegations.find(isMatch);
                                    const linkedOutgoing = delegations.find(isMatch);

                                    if (linkedIncoming) {
                                        return (
                                            <div className="mx-6 mt-6 mb-2 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group hover:border-indigo-500/30 transition-all">
                                                <div className="flex items-center justify-between gap-4 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                                                            <ShieldCheck className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-indigo-400">Delegated Task Assigned to You</h4>
                                                            <p className="text-xs text-indigo-300/70">
                                                                Instruction: <span className="text-white italic">"{linkedIncoming.expected_action}"</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!quickReplyingId && (
                                                            <button
                                                                onClick={() => {
                                                                    setQuickReplyingId(linkedIncoming.id);
                                                                    setQuickReplyText(linkedIncoming.reply_draft || '');
                                                                }}
                                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10 flex items-center gap-2"
                                                            >
                                                                <Zap className="w-3 h-3" />
                                                                Quick Reply
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setActiveView('delegations')}
                                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                                                        >
                                                            Open Workspace
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {quickReplyingId === linkedIncoming.id && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-4 border-t border-white/5">
                                                        <textarea
                                                            value={quickReplyText}
                                                            onChange={(e) => setQuickReplyText(e.target.value)}
                                                            placeholder="Draft your response here..."
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500/50 outline-none transition-all mb-3 text-gray-200 min-h-[80px]"
                                                        />
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => setQuickReplyingId(null)}
                                                                className="px-3 py-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleInboxDelegationReply(linkedIncoming.id, true)}
                                                                disabled={isSubmittingQuickReply || !quickReplyText.trim()}
                                                                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Submit Draft
                                                            </button>
                                                            <button
                                                                onClick={() => handleInboxDelegationReply(linkedIncoming.id, false)}
                                                                disabled={isSubmittingQuickReply || !quickReplyText.trim()}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                                            >
                                                                {isSubmittingQuickReply ? 'Sending...' : 'Send Directly'}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        );
                                    }

                                    if (linkedOutgoing) {
                                        const isPending = linkedOutgoing.status === 'pending';
                                        const isReview = linkedOutgoing.status === 'awaiting_approval';

                                        if (isPending || isReview) {
                                            return (
                                                <div className={`mx-6 mt-6 mb-2 p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${isReview ? 'bg-amber-500/10 border-amber-500/20' : 'bg-gray-800/40 border-white/5'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${isReview ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'}`}>
                                                            {isReview ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <h4 className={`text-sm font-bold ${isReview ? 'text-amber-400' : 'text-gray-300'}`}>
                                                                {isReview ? "Delegation Review Needed" : "Delegation Pending"}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                Assigned to: {linkedOutgoing.delegate_email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setActiveView('delegations')}
                                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/5"
                                                        >
                                                            View Status & Approve
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }

                                    return null;
                                })()}

                                {/* GOVERNANCE & OUTCOME BREAKDOWN */}
                                <div className="pt-6 mt-6 border-t border-white/5 space-y-6">
                                    {/* Policy Enforcement Badges */}
                                    {analysisResult.policy_matches && analysisResult.policy_matches.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 text-indigo-400">
                                                <Gavel className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Governance Enforcement</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.policy_matches.map((p: any, i: number) => (
                                                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold ${p.impact === 'enforced' ? 'bg-indigo-600/10 border-indigo-600/20 text-indigo-400' :
                                                        p.impact === 'violated' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                            'bg-white/5 border-white/10 text-gray-500'
                                                        }`}>
                                                        <Shield className="w-3 h-3" />
                                                        {p.title}: {p.impact.toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Cold Outreach Badge */}
                                    {analysisResult.cold_outreach && (
                                        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                                            <div>
                                                <div className="text-[10px] font-bold text-rose-500 uppercase">Cold Outreach Immunity Trigerred</div>
                                                <div className="text-[9px] text-rose-400/80">Mass outreach pattern detected. Suggesting brutal silence.</div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Proactive Suggestion / Reply Flow */}
                            <div className="pt-8 border-t border-white/5">
                                {/* Handle Missing Context (Questions) */}
                                {analysisResult.questions_for_user && analysisResult.questions_for_user.length > 0 && !showReplyFlow && showContextQuestions ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400">Context Needed</h3>
                                        </div>

                                        <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
                                            <p className="text-sm text-gray-300 mb-4">
                                                To write the perfect reply, I need a bit more information:
                                            </p>

                                            <div className="space-y-4 mb-6">
                                                {analysisResult.questions_for_user.map((q: string, idx: number) => (
                                                    <div key={idx} className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{q}</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Type your answer..."
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-amber-500/50 outline-none transition-all"
                                                            onChange={(e) => {
                                                                const answer = e.target.value;
                                                                if (answer) setUserInstruction((prev: string) => prev + `\nAnswer to "${q}": ${answer}`);
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleGenerateCustom()}
                                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                    Generate with my answers
                                                </button>
                                                <button
                                                    onClick={() => setShowReplyFlow(true)}
                                                    className="px-4 py-2.5 text-gray-500 hover:text-white text-xs font-medium transition-colors ml-auto"
                                                >
                                                    Skip & Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {(() => {
                                    const primaryAction = analysisResult.primary_action_id
                                        ? analysisResult.recommendations.find((r: any) => r.id === analysisResult.primary_action_id)
                                        : null;

                                    if (primaryAction && primaryAction.suggested_reply && !showReplyFlow && (!analysisResult.questions_for_user || analysisResult.questions_for_user.length === 0 || !showContextQuestions)) {
                                        return (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-emerald-400" />
                                                        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">AI Suggested Reply</h3>
                                                    </div>
                                                    {analysisResult.questions_for_user && analysisResult.questions_for_user.length > 0 && (
                                                        <button
                                                            onClick={() => setShowContextQuestions(true)}
                                                            className="text-[10px] text-gray-500 hover:text-amber-400 flex items-center gap-1 transition-colors uppercase font-bold tracking-wider"
                                                        >
                                                            <ArrowLeft className="w-3 h-3" />
                                                            Edit Answers
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20">
                                                                {primaryAction.action_label}
                                                            </div>
                                                            <span className="text-xs text-emerald-400/70 font-medium">
                                                                {primaryAction.predicted_outcome}
                                                            </span>
                                                        </div>

                                                        <div className="text-sm text-gray-300 italic border-l-2 border-emerald-500/30 pl-4 py-1 mb-6 line-clamp-4">
                                                            "{primaryAction.suggested_reply}"
                                                        </div>

                                                        <div className="flex flex-wrap gap-3">
                                                            <button
                                                                onClick={() => handleActionClick(primaryAction)}
                                                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                                            >
                                                                <Mail className="w-4 h-4" />
                                                                Reply with this
                                                            </button>
                                                            <button
                                                                onClick={() => handleActionClick(primaryAction)}
                                                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-bold text-sm transition-all"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setShowReplyFlow(true)}
                                                                className="px-4 py-2.5 text-gray-500 hover:text-white text-xs font-medium transition-colors ml-auto"
                                                            >
                                                                View other options
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (primaryAction && !primaryAction.suggested_reply && !showReplyFlow) {
                                        return (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">AI Recommendation</h3>
                                                </div>

                                                <div className="glass-card p-6 border-white/5 bg-white/5 relative overflow-hidden">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="px-2 py-1 rounded bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wide border border-white/10">
                                                            {primaryAction.action_label}
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {primaryAction.predicted_outcome}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-400 mb-6">
                                                        {primaryAction.why_recommendation}
                                                    </p>

                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedEmail(null);
                                                                setViewMode('list');
                                                            }}
                                                            className="px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm transition-all hover:scale-105"
                                                        >
                                                            Okay, {primaryAction.action_label.toLowerCase()}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowReplyFlow(true)}
                                                            className="px-4 py-2.5 text-gray-500 hover:text-white text-xs font-medium transition-colors ml-auto"
                                                        >
                                                            Reply anyway
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return !showReplyFlow ? (
                                        <div className="text-center p-8 glass-card border-dashed border-white/10">
                                            <h4 className="text-lg font-bold mb-4">Do you want to reply to this mail?</h4>
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => setShowReplyFlow(true)}
                                                    className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform"
                                                >
                                                    Yes, reply manually
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmail(null);
                                                        setViewMode('list');
                                                    }}
                                                    className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                            <div>
                                                <div className="grid grid-cols-1 gap-4">
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
                                                                className="glass-card hover:border-indigo-600/50 p-6 text-left group transition-all"
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="text-sm font-bold">{action.action_label}</span>
                                                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{action.predicted_outcome}</span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-400">{action.why_recommendation}</p>
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-white/5">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Or, Describe your own reply</h4>
                                                <div className="glass-card p-6 space-y-4">
                                                    <textarea
                                                        value={userInstruction}
                                                        onChange={(e) => setUserInstruction(e.target.value)}
                                                        placeholder="e.g., Tell them I'm busy this week but can meet next Tuesday afternoon. Be polite."
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:border-indigo-600/50 transition-all resize-none"
                                                    />
                                                    <button
                                                        onClick={handleGenerateCustom}
                                                        disabled={isGeneratingCustom || !userInstruction.trim()}
                                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {isGeneratingCustom ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                                Generating customized reply...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Zap className="w-4 h-4" />
                                                                Generate Customized Reply
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : analysisError ? (
                        <div className="glass-card p-6 border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-3">
                            <AlertCircle className="w-4 h-4" />
                            {analysisError}
                        </div>
                    ) : null}
                </div>

                {/* Metrics Summary */}
                {(metrics || analysisResult) && (
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-12">
                        {[
                            {
                                label: 'Obligation',
                                value: analysisResult ? `${analysisResult.obligation_score || 0}` : metrics?.decisions_saved || 0,
                                icon: ShieldCheck,
                                sub: analysisResult ? "Risk if ignored" : "Total Decisions"
                            },
                            {
                                label: 'Opportunity',
                                value: analysisResult ? `${analysisResult.opportunity_score || 0}` : `${(metrics?.minutes_saved || 0).toFixed(1)}m`,
                                icon: Zap,
                                sub: analysisResult ? "Value of reply" : "Time Saved"
                            },
                            {
                                label: 'Inbox Health',
                                value: analysisResult ? 'Active' : `${(metrics?.consistency_score || 1) * 100}%`,
                                icon: ShieldCheck,
                                sub: analysisResult ? "Real-time analysis" : "Consistency"
                            },
                            {
                                label: 'Reduction',
                                value: analysisResult ? `${analysisResult.confidence_score || 0.92 * 100}%` : (metrics?.replies_prevented || 0),
                                icon: Brain,
                                sub: analysisResult ? "AI Confidence" : "Replies Prevented"
                            },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-4 group hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 group-hover:text-indigo-400 transition-colors">
                                    <stat.icon className="w-3.5 h-3.5" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-xl font-bold">{stat.value}</div>
                                <div className="text-[9px] text-gray-500 mt-1 font-medium italic opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
