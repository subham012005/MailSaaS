'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    TrendingUp,
    AlertCircle,
    Users,
    Rocket,
    Menu,
    ChevronDown,
    ChevronRight,
    X,
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
    const [isPriorityDecantOpen, setIsPriorityDecantOpen] = useState(false);

    return (
        <div className={`
            ${viewMode === 'list' ? 'flex' : 'hidden md:flex'}
            w-full md:w-80 bg-sidebar border-r border-sidebar-border flex-col z-10
        `}>
            {/* Header / Search */}
            <div className="p-8 border-b border-sidebar-border space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                        {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>

                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${activeView}...`}
                            className="w-full bg-muted border border-border rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:bg-background focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div
                className="px-8 py-3 bg-muted border-b border-sidebar-border flex items-center justify-between cursor-pointer hover:bg-muted/80 transition-all group"
                onClick={() => setIsPriorityDecantOpen(!isPriorityDecantOpen)}
            >
                <div className="flex items-center gap-2">
                    <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                        {activeView === 'inbox' ? 'Priority Intelligence' :
                            activeView === 'sent' ? 'Dispatched' :
                                'Draft Analysis'}
                    </h2>
                </div>
                {isPriorityDecantOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Collapsible Intelligence Stats */}
                {isPriorityDecantOpen && (
                    <div className="bg-muted/10 animate-in slide-in-from-top-2 duration-300">
                        {loadForecast && (
                            <div className="p-6 mx-4 mt-4 glass-card bg-primary/[0.03] border-primary/10 group">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80">Velocity</span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-tighter ${loadForecast.trajectory === 'rising' ? 'bg-destructive/10 text-destructive' :
                                        loadForecast.trajectory === 'stable' ? 'bg-warning/10 text-warning' :
                                            'bg-success/10 text-success'
                                        }`}>
                                        {loadForecast.trajectory}
                                    </div>
                                </div>
                                <div className="text-[11px] text-muted-foreground font-medium leading-relaxed mb-4">
                                    {loadForecast.insight}
                                </div>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Efficiency</div>
                                        <div className="text-sm font-bold text-foreground">{loadForecast.load_reduction_potential}%</div>
                                    </div>
                                    <div className="h-6 w-px bg-border/40" />
                                    <div>
                                        <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Projected</div>
                                        <div className="text-sm font-bold text-foreground tracking-tight">{loadForecast.tomorrow_expected_load} <span className="text-[9px] text-muted-foreground font-normal">v-logs</span></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Perspectives */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Context Modes</span>
                                <button
                                    onClick={() => setIsPersonaModalOpen(true)}
                                    className="text-[9px] text-primary hover:text-foreground font-bold uppercase tracking-widest transition-colors"
                                >
                                    Refine
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {personas.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePersonaChange(p.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${activePersona === p.id
                                            ? 'bg-primary/10 border-primary/30 text-foreground shadow-xl shadow-primary/5'
                                            : 'bg-card/50 border-border/40 text-muted-foreground hover:border-border hover:text-foreground'
                                            }`}
                                    >
                                        <p.icon className={`w-3 h-3 ${activePersona === p.id ? p.color : 'opacity-40'}`} />
                                        <span className="text-[10px] font-bold">{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {loadingEmails ? (
                    <div className="flex-1" />
                ) : emailFetchError ? (
                    <div className="m-6 p-6 rounded-2xl bg-destructive/5 border border-destructive/10 text-center space-y-3">
                        <AlertCircle className="w-6 h-6 mx-auto text-destructive/50" />
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Protocol Override Failure</p>
                        <p className="text-[11px] text-muted-foreground font-medium">System was unable to map the incoming vector stream.</p>
                    </div>
                ) : emails.length === 0 ? (
                    <div className="p-20 text-center space-y-3 opacity-30">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/50 mx-auto flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Inbox Null Point</p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.08
                                }
                            }
                        }}
                        className="p-4 space-y-3"
                    >
                        {emails.map((email, idx) => (
                            <motion.div
                                key={email.id || idx}
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleEmailSelect(email)}
                                className={`group relative p-5 rounded-2xl transition-all duration-500 cursor-pointer border ${selectedEmail?.id === email.id
                                    ? 'bg-card border-primary/20 shadow-2xl shadow-primary/5'
                                    : 'bg-transparent border-transparent hover:bg-card hover:border-border'
                                    }`}
                            >
                                {selectedEmail?.id === email.id && (
                                    <motion.div
                                        layoutId="active-mask"
                                        className="absolute inset-0 rounded-2xl border-l-[3px] border-primary pointer-events-none"
                                    />
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`text-xs truncate font-bold ${(!email.isRead || email.hasUnread) ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                            {email.from}
                                        </span>
                                        {(!email.isRead || email.hasUnread) && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                                        )}
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tighter shrink-0">{email.date}</span>
                                </div>

                                <h3 className="text-xs font-bold text-foreground mb-2 truncate group-hover:text-primary transition-colors">{email.subject}</h3>
                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium group-hover:text-foreground transition-colors">
                                    {email.preview}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 items-center">
                                    {(email.threadCount ?? 0) > 1 && (
                                        <div className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[8px] font-black text-muted-foreground">
                                            {email.threadCount} NODES
                                        </div>
                                    )}
                                    {delegations.some(d => d.email_id === email.id) && (
                                        <div className="px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                                            Delegated
                                        </div>
                                    )}
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEmailSelect(email);
                                                setShowDelegateModal(true);
                                            }}
                                            className="p-1.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                                        >
                                            <Users className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div >
    );
}
