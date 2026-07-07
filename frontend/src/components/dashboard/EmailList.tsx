'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    TrendingUp,
    AlertCircle,
    Users,
    Rocket,
    Menu,
    X,
    Zap,
    ArrowUpDown,
    Filter,
    Brain,
    ChevronDown,
} from 'lucide-react';

interface Email {
    id: string;
    threadId?: string;
    subject: string;
    from: string;
    fromFull: string;
    preview: string;
    date: string;
    isRead?: boolean;
    hasUnread?: boolean;
    threadCount?: number;
}

interface EmailListProps {
    emails: Email[];
    loadingEmails: boolean;
    emailFetchError: Error | null;
    selectedEmail: Email | null;
    handleEmailSelect: (email: Email) => void;
    viewMode: 'list' | 'detail';
    loadForecast: {
        trajectory: 'rising' | 'stable' | 'falling';
        insight: string;
        load_reduction_potential: number;
        tomorrow_expected_load: number;
    } | null;
    activePersona: string;
    personas: {
        id: string;
        label: string;
        icon: React.ElementType;
        color: string;
    }[];
    handlePersonaChange: (id: string) => void;
    setIsPersonaModalOpen: (open: boolean) => void;
    setShowDelegateModal: (open: boolean) => void;
    setIsMobileMenuOpen: (open: boolean) => void;
    isMobileMenuOpen: boolean;
    delegations: { email_id: string }[];
    activeView?: string;
}

type FilterChip = 'all' | 'action' | 'fyi' | 'delegated';

// Deterministic priority based on email index / unread state
function getEmailPriority(email: Email, idx: number): 'high' | 'medium' | 'low' {
    if (email.hasUnread || !email.isRead) {
        // Cycle high/medium for unread
        return idx % 3 === 0 ? 'high' : 'medium';
    }
    return 'low';
}

// Generate a short "AI intent" label from preview text
function getIntentLabel(preview: string): string {
    const p = preview?.toLowerCase() || '';
    if (p.includes('urgent') || p.includes('asap') || p.includes('immediately')) return 'Urgent action needed';
    if (p.includes('meeting') || p.includes('schedule') || p.includes('calendar')) return 'Meeting request';
    if (p.includes('invoice') || p.includes('payment') || p.includes('bill')) return 'Financial action';
    if (p.includes('follow up') || p.includes('following up')) return 'Follow-up required';
    if (p.includes('opportunity') || p.includes('proposal') || p.includes('offer')) return 'Business opportunity';
    if (p.includes('update') || p.includes('fyi') || p.includes('reminder')) return 'FYI / Update';
    if (p.includes('question') || p.includes('clarification') || p.includes('?')) return 'Response requested';
    if (p.includes('thank') || p.includes('congratulation')) return 'No action required';
    return 'Review recommended';
}

export default function EmailList({
    emails,
    loadingEmails,
    emailFetchError,
    selectedEmail,
    handleEmailSelect,
    viewMode,
    loadForecast,
    activePersona,
    personas,
    handlePersonaChange,
    setIsPersonaModalOpen,
    setShowDelegateModal,
    setIsMobileMenuOpen,
    isMobileMenuOpen,
    delegations,
    activeView = 'inbox'
}: EmailListProps) {
    const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
    const [showForecast, setShowForecast] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filterChips: { key: FilterChip; label: string; color: string }[] = [
        { key: 'all', label: 'All', color: '' },
        { key: 'action', label: 'Action', color: 'text-rose-400' },
        { key: 'fyi', label: 'FYI', color: 'text-sky-400' },
        { key: 'delegated', label: 'Delegated', color: 'text-violet-400' },
    ];

    const filteredEmails = emails.filter(email => {
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!email.subject?.toLowerCase().includes(q) && !email.from?.toLowerCase().includes(q)) return false;
        }
        if (activeFilter === 'delegated') return delegations.some(d => d.email_id === email.id);
        if (activeFilter === 'fyi') {
            const intent = getIntentLabel(email.preview);
            return intent.includes('FYI') || intent.includes('No action');
        }
        if (activeFilter === 'action') {
            const intent = getIntentLabel(email.preview);
            return !intent.includes('FYI') && !intent.includes('No action');
        }
        return true;
    });

    const unreadCount = emails.filter(e => e.hasUnread || !e.isRead).length;

    return (
        <div className={`
            ${viewMode === 'list' ? 'flex' : 'hidden md:flex'}
            w-full md:w-80 bg-sidebar border-r border-sidebar-border flex-col z-10
        `}>
            {/* ── HEADER ── */}
            <div className="p-4 border-b border-sidebar-border space-y-3">
                {/* Top row: mobile menu + search */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                        {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>

                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeView}...`}
                            className="w-full bg-muted/60 border border-border rounded-xl py-2 pl-9 pr-4 text-xs focus:bg-background focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/40 font-medium"
                        />
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <Brain className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-bold text-foreground">{emails.length}</span>
                            <span className="text-[10px] text-muted-foreground">vectors</span>
                        </div>
                        {unreadCount > 0 && (
                            <div className="priority-chip high">{unreadCount} urgent</div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowForecast(!showForecast)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <TrendingUp className="w-3 h-3" />
                        <ChevronDown className={`w-3 h-3 transition-transform ${showForecast ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5">
                    {filterChips.map(chip => (
                        <button
                            key={chip.key}
                            onClick={() => setActiveFilter(chip.key)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                ${activeFilter === chip.key
                                    ? chip.key === 'all'
                                        ? 'bg-primary/15 border-primary/30 text-primary'
                                        : chip.key === 'action'
                                            ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                                            : chip.key === 'fyi'
                                                ? 'bg-sky-500/10 border-sky-500/25 text-sky-400'
                                                : 'bg-violet-500/10 border-violet-500/25 text-violet-400'
                                    : 'bg-transparent border-transparent text-muted-foreground/50 hover:text-foreground hover:border-border'
                                }`}
                        >
                            {chip.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setIsPersonaModalOpen(true)}
                        className="ml-auto p-1.5 rounded-lg border border-border text-muted-foreground/50 hover:text-foreground hover:border-primary/30 transition-all"
                        title="Configure persona"
                    >
                        <Filter className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* ── COLLAPSIBLE FORECAST ── */}
            <AnimatePresence>
                {showForecast && loadForecast && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="mx-3 my-2 p-4 ai-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="w-3 h-3 text-indigo-400" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Load Forecast</span>
                                </div>
                                <div className={`priority-chip ${loadForecast.trajectory === 'rising' ? 'high' : loadForecast.trajectory === 'stable' ? 'medium' : 'low'}`}>
                                    {loadForecast.trajectory}
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{loadForecast.insight}</p>
                            <div className="flex items-center gap-4">
                                <div>
                                    <div className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">Efficiency</div>
                                    <div className="text-sm font-bold glow-text-emerald">{loadForecast.load_reduction_potential}%</div>
                                </div>
                                <div className="h-5 w-px bg-border/40" />
                                <div>
                                    <div className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">Projected</div>
                                    <div className="text-sm font-bold text-foreground">{loadForecast.tomorrow_expected_load} <span className="text-[9px] text-muted-foreground font-normal">msgs</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Persona switcher */}
                        <div className="px-3 pb-3">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-[9px] uppercase font-bold text-indigo-400/70 tracking-widest">Context Mode</span>
                                <button onClick={() => setIsPersonaModalOpen(true)} className="text-[9px] text-primary hover:text-foreground font-bold uppercase tracking-widest transition-colors">
                                    Refine
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {personas.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePersonaChange(p.id)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-[10px] font-bold
                                            ${activePersona === p.id
                                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                                                : 'bg-card/50 border-border/40 text-muted-foreground hover:border-border hover:text-foreground'
                                            }`}
                                    >
                                        <p.icon className={`w-3 h-3 ${activePersona === p.id ? p.color : 'opacity-40'}`} />
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── EMAIL LIST BODY ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loadingEmails ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 rounded-xl bg-muted/30 animate-pulse space-y-2">
                                <div className="h-3 bg-muted rounded-lg w-1/2" />
                                <div className="h-2.5 bg-muted rounded-lg w-3/4" />
                                <div className="h-2 bg-muted rounded-lg w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : emailFetchError ? (
                    <div className="m-4 p-5 rounded-2xl bg-destructive/5 border border-destructive/10 text-center space-y-3">
                        <AlertCircle className="w-6 h-6 mx-auto text-destructive/50" />
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Sync Failed</p>
                        <p className="text-[11px] text-muted-foreground font-medium">Unable to fetch email stream.</p>
                    </div>
                ) : filteredEmails.length === 0 ? (
                    <div className="p-16 text-center space-y-3 opacity-40">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 mx-auto flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Queue Empty</p>
                        {activeFilter !== 'all' && (
                            <button onClick={() => setActiveFilter('all')} className="text-[10px] text-primary hover:underline">Clear filter</button>
                        )}
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                        }}
                        className="p-3 space-y-1.5"
                    >
                        {filteredEmails.map((email, idx) => {
                            const priority = getEmailPriority(email, idx);
                            const intentLabel = getIntentLabel(email.preview);
                            const isDelegated = delegations.some(d => d.email_id === email.id);
                            const isSelected = selectedEmail?.id === email.id;

                            return (
                                <motion.div
                                    key={email.id || idx}
                                    variants={{
                                        hidden: { opacity: 0, y: 8 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ x: 2 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleEmailSelect(email)}
                                    className={`group relative p-4 rounded-xl transition-all duration-300 cursor-pointer border overflow-hidden
                                        ${isSelected
                                            ? 'bg-card border-primary/25 shadow-lg shadow-primary/5'
                                            : 'bg-transparent border-transparent hover:bg-card hover:border-border/60'}
                                    `}
                                >
                                    {/* Priority left bar */}
                                    <div className={`priority-bar-${priority}`} />

                                    {/* Selected indicator */}
                                    {isSelected && (
                                        <motion.div
                                            layoutId="active-email-mask"
                                            className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                                        />
                                    )}

                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {/* Sender avatar */}
                                            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold
                                                ${(email.hasUnread || !email.isRead) ? 'bg-indigo-500/20 text-indigo-300' : 'bg-muted text-muted-foreground'}`}>
                                                {email.from?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className={`text-xs truncate font-bold
                                                ${(!email.isRead || email.hasUnread) ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                {email.from}
                                            </span>
                                            {(!email.isRead || email.hasUnread) && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-[9px] font-medium text-muted-foreground/60 shrink-0">{email.date}</span>
                                    </div>

                                    {/* Subject */}
                                    <h3 className={`text-[12px] font-bold mb-1.5 truncate transition-colors leading-snug
                                        ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-foreground'}`}>
                                        {email.subject}
                                    </h3>

                                    {/* AI Intent label */}
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Zap className="w-2.5 h-2.5 text-indigo-400/60 shrink-0" />
                                        <span className="text-[10px] text-indigo-400/70 font-semibold italic truncate">{intentLabel}</span>
                                    </div>

                                    {/* Preview text — subtle */}
                                    <p className="text-[11px] text-muted-foreground/50 line-clamp-1 leading-relaxed font-medium group-hover:text-muted-foreground/70 transition-colors">
                                        {email.preview}
                                    </p>

                                    {/* Footer badges + quick actions */}
                                    <div className="mt-3 flex items-center gap-1.5">
                                        {priority === 'high' && (
                                            <span className="priority-chip high">urgent</span>
                                        )}
                                        {priority === 'medium' && (
                                            <span className="priority-chip medium">review</span>
                                        )}
                                        {isDelegated && (
                                            <span className="intelligence-badge">Delegated</span>
                                        )}
                                        {(email.threadCount ?? 0) > 1 && (
                                            <span className="text-[9px] font-bold text-muted-foreground/50 px-1.5 py-0.5 rounded-md border border-border/50">
                                                {email.threadCount} nodes
                                            </span>
                                        )}

                                        {/* Quick delegate button — revealed on hover */}
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEmailSelect(email);
                                                    setShowDelegateModal(true);
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all"
                                            >
                                                <Users className="w-2.5 h-2.5" />
                                                Delegate
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* ── BOTTOM STATS BAR ── */}
            {!loadingEmails && filteredEmails.length > 0 && (
                <div className="p-3 border-t border-sidebar-border">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] text-muted-foreground/50 font-medium">
                            {filteredEmails.length} of {emails.length} shown
                        </span>
                        <button className="flex items-center gap-1 text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                            <ArrowUpDown className="w-2.5 h-2.5" />
                            Sort
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
