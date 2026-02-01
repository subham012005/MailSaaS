'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Mail, Clock, ShieldCheck, Search } from 'lucide-react';

interface DelegateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelegate: () => void;
    delegateEmail: string;
    setDelegateEmail: (email: string) => void;
    delegateAction: string;
    setDelegateAction: (action: string) => void;
    slaHours: number;
    setSlaHours: (hours: number) => void;
    isDelegating: boolean;
    recentDelegates: string[];
    delegateSearch: string;
    setDelegateSearch: (search: string) => void;
}

export default function DelegateModal({
    isOpen,
    onClose,
    onDelegate,
    delegateEmail,
    setDelegateEmail,
    delegateAction,
    setDelegateAction,
    slaHours,
    setSlaHours,
    isDelegating,
    recentDelegates,
    delegateSearch,
    setDelegateSearch
}: DelegateModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 transition-all">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-xl overflow-hidden relative z-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)]"
            >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Assign Task</h3>
                            <p className="text-xs text-gray-500 font-medium">Delegate this decision to a teammate</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                        <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Delegate Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Assign to (Email)</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="email"
                                value={delegateEmail}
                                onChange={(e) => setDelegateEmail(e.target.value)}
                                placeholder="teammate@company.com"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-600/50 transition-all font-medium"
                            />
                        </div>

                        {/* Recent Delegates Suggestions */}
                        {recentDelegates.length > 0 && !delegateEmail && (
                            <div className="pt-2">
                                <span className="text-[9px] text-gray-600 uppercase font-black tracking-tighter mb-2 block pl-1">Quick Select</span>
                                <div className="flex flex-wrap gap-2">
                                    {recentDelegates.slice(0, 3).map((email, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setDelegateEmail(email)}
                                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            {email}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instruction */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Directive / Expectation</label>
                        <textarea
                            value={delegateAction}
                            onChange={(e) => setDelegateAction(e.target.value)}
                            placeholder="e.g. Please review the proposal and draft a polite decline or request more info on pricing."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm min-h-[120px] focus:outline-none focus:border-indigo-600/50 transition-all resize-none font-medium leading-relaxed"
                        />
                    </div>

                    {/* SLA Setting */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Completion SLA</label>
                            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4">
                                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                                <select
                                    value={slaHours}
                                    onChange={(e) => setSlaHours(parseInt(e.target.value))}
                                    className="bg-transparent text-sm font-bold w-full focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value={4} className="bg-black">4 Hours</option>
                                    <option value={8} className="bg-black">8 Hours</option>
                                    <option value={24} className="bg-black">24 Hours</option>
                                    <option value={48} className="bg-black">2 Days</option>
                                    <option value={168} className="bg-black">1 Week</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3 opacity-60">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Integrity Mode</label>
                            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-4 cursor-not-allowed">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="text-[10px] font-black uppercase text-gray-500">Auto-Enforced</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-black/40 border-t border-white/5">
                    <button
                        onClick={onDelegate}
                        disabled={isDelegating || !delegateEmail.trim()}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {isDelegating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Transacting...
                            </>
                        ) : (
                            <>
                                <Users className="w-4 h-4" />
                                Push to Delegate
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
