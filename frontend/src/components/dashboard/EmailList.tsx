'use client';

import {
    Search,
    TrendingUp,
    AlertCircle,
    Users,
    ShieldCheck,
    GraduationCap,
    Rocket,
    Target,
    Code,
    Briefcase,
    Sparkles
} from 'lucide-react';

interface EmailListProps {
    emails: any[];
    loadingEmails: boolean;
    emailFetchError: any;
    selectedEmail: any;
    handleEmailSelect: (email: any) => void;
    viewMode: 'list' | 'detail';
    loadForecast: any;
    activePersona: string;
    personas: any[];
    handlePersonaChange: (id: string) => void;
    setIsPersonaModalOpen: (open: boolean) => void;
    setShowDelegateModal: (open: boolean) => void;
    delegations: any[];
    assignedDelegations: any[];
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
    delegations,
    assignedDelegations,
    activeView = 'inbox'
}: EmailListProps) {
    return (
        <div className={`
            ${viewMode === 'list' ? 'flex' : 'hidden md:flex'}
            w-full md:w-md border-r border-white/5 flex-col
        `}>
            <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder={`Search ${activeView}...`}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-indigo-500/50 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="px-4 md:px-6 py-2 border-b border-white/5 bg-white/[0.01]">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    {activeView === 'inbox' ? 'Priority Decant' :
                        activeView === 'sent' ? 'Dispatched Intelligence' :
                            'Draft Intelligence'}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Load Trajectory Widget */}
                {loadForecast && (
                    <div className="p-4 mx-4 mt-4 bg-indigo-600/5 border border-indigo-600/10 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Load Trajectory</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${loadForecast.trajectory === 'rising' ? 'bg-rose-500/10 text-rose-500' :
                                loadForecast.trajectory === 'stable' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                {loadForecast.trajectory}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 font-medium leading-tight mb-2">
                            {loadForecast.insight}
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <div className="text-[8px] text-gray-500 uppercase font-bold">Reduction Potential</div>
                                <div className="text-sm font-bold text-emerald-400">{loadForecast.load_reduction_potential}%</div>
                            </div>
                            <div className="h-6 w-px bg-white/5" />
                            <div>
                                <div className="text-[8px] text-gray-500 uppercase font-bold">Expected Load</div>
                                <div className="text-sm font-bold text-white">{loadForecast.tomorrow_expected_load} <span className="text-[10px] text-gray-600 font-normal">msgs</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personality Bar */}
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest pl-1">Perspective</span>
                        <button
                            onClick={() => setIsPersonaModalOpen(true)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider transition-colors"
                        >
                            Edit Context
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {personas.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handlePersonaChange(p.id)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${activePersona === p.id
                                    ? 'bg-indigo-600/10 border-indigo-600/40 text-white'
                                    : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                    }`}
                            >
                                <p.icon className={`w-3 h-3 ${activePersona === p.id ? p.color : ''}`} />
                                <span className="text-[10px] font-bold">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {loadingEmails ? (
                    <div className="p-10 text-center text-gray-500 text-xs">Fetching your inbox...</div>
                ) : emailFetchError ? (
                    <div className="p-6 text-center text-red-500 text-xs bg-red-500/5 m-4 rounded border border-red-500/20">
                        <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50" />
                        {emailFetchError.message || "Failed to fetch emails"}
                    </div>
                ) : emails.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-xs">No emails found.</div>
                ) : (
                    emails.map((email, idx) => (
                        <div
                            key={email.id || idx}
                            onClick={() => handleEmailSelect(email)}
                            className={`w-full p-4 md:p-6 text-left border-b border-white/5 transition-all cursor-pointer group ${selectedEmail?.id === email.id ? 'bg-indigo-600/5 border-l-4 border-l-indigo-600' : 'hover:bg-white/[0.02]'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={`text-sm truncate pr-2 ${(!email.isRead || email.hasUnread) ? 'font-bold text-white' : 'font-semibold text-gray-300'}`}>{email.from}</span>
                                    {email.threadCount > 1 && (
                                        <span className="text-[10px] text-indigo-400 font-black bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                            {email.threadCount}
                                        </span>
                                    )}
                                    {delegations.some(d => d.email_id === email.id) && (
                                        <span className="shrink-0 px-1.5 py-0.5 rounded-[4px] bg-indigo-500/10 text-[8px] font-black uppercase tracking-widest text-indigo-500 border border-indigo-500/20">
                                            Delegated
                                        </span>
                                    )}
                                    {assignedDelegations.some(d =>
                                        (d.original_sender === email.from || d.original_sender?.includes(email.from) || email.from?.includes(d.original_sender)) &&
                                        (d.original_subject === email.subject || email.subject?.includes(d.original_subject) || d.original_subject?.includes(email.subject))
                                    ) && (
                                            <span className="shrink-0 px-1.5 py-0.5 rounded-[4px] bg-amber-500/10 text-[8px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20 flex items-center gap-1">
                                                <ShieldCheck className="w-2 h-2" />
                                                Assigned
                                            </span>
                                        )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{email.date}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmailSelect(email);
                                            setShowDelegateModal(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Users className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs font-medium mb-1 truncate">{email.subject}</div>
                            <div className="text-[11px] text-gray-400 line-clamp-2">{email.preview}</div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
