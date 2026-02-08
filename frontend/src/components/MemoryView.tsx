'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, MessageSquare, ArrowRight, Clock, ShieldCheck, Filter, X, ChevronRight, Sparkles, Check, Menu } from 'lucide-react';

interface MemoryViewProps {
    history: any[];
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MemoryView({ history, isMobileMenuOpen, setIsMobileMenuOpen }: MemoryViewProps) {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'decision' | 'correction'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredHistory = history.filter(item => {
        if (filter === 'all') return true;
        return item.type === 'decision' ? filter === 'decision' : filter === 'correction';
    });

    return (
        <div className="flex-1 overflow-y-auto bg-black/20 p-6 md:p-10 relative">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
                    <div className="flex items-start gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <History className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                    Personal Memory
                                </h1>
                            </div>
                            <p className="text-sm md:text-base text-gray-400 max-w-lg leading-relaxed">
                                A record of your decisions and how the AI learns from your corrections to improve future recommendations.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${filter !== 'all'
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                                }`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            {filter === 'all' ? 'Filter by Type' : filter === 'decision' ? 'Decisions Only' : 'Corrections Only'}
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#0A0A0A] border border-white/10 shadow-xl z-20 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => { setFilter('all'); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/5 transition-colors flex items-center justify-between ${filter === 'all' ? 'text-white bg-white/5' : 'text-gray-400'}`}
                                        >
                                            Show All
                                            {filter === 'all' && <Check className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={() => { setFilter('decision'); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/5 transition-colors flex items-center justify-between ${filter === 'decision' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400'}`}
                                        >
                                            Decisions
                                            {filter === 'decision' && <Check className="w-3 h-3 text-indigo-400" />}
                                        </button>
                                        <button
                                            onClick={() => { setFilter('correction'); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/5 transition-colors flex items-center justify-between ${filter === 'correction' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400'}`}
                                        >
                                            Corrections
                                            {filter === 'correction' && <Check className="w-3 h-3 text-emerald-400" />}
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {history.length === 0 ? (
                        <div className="text-center p-20 glass-card border-dashed border-white/10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <History className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-300 mb-1">No history yet</h3>
                            <p className="text-gray-500 text-sm">Decisions and corrections will appear here over time.</p>
                        </div>
                    ) : (
                        filteredHistory.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedItem(item)}
                                className="glass-card p-0 group cursor-pointer hover:border-indigo-500/30 transition-all hover:bg-white/5 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'decision' ? 'bg-indigo-500' : 'bg-emerald-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    {/* Icon Box */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${item.type === 'decision'
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-indigo-500/5'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5'
                                        }`}>
                                        {item.type === 'decision' ? <ShieldCheck className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${item.type === 'decision'
                                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                                }`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-200 truncate pr-4">{item.title}</h3>
                                        <p className="text-sm text-gray-400 truncate mt-0.5">
                                            {item.type === 'decision' ? `Action taken on: ${item.target}` : `Correction applied to: ${item.target}`}
                                        </p>
                                    </div>

                                    {/* Chevron/Action */}
                                    <div className="hidden md:flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors pl-4 border-l border-white/5">
                                        <span className="text-xs font-medium">View Details</span>
                                        <div className="p-1 rounded-full bg-white/5 group-hover:bg-white/10">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] overflow-y-auto glass-card border border-white/10 bg-[#0A0A0A] shadow-2xl z-50 p-0"
                        >
                            {/* Header */}
                            <div className="p-6 md:p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selectedItem.type === 'decision'
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        }`}>
                                        {selectedItem.type === 'decision' ? <ShieldCheck className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">{selectedItem.title}</h2>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <span>{new Date(selectedItem.timestamp).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{selectedItem.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 md:p-8 space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Context</h3>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300">
                                        <span className="text-white font-semibold">Subject/Target:</span> {selectedItem.target}
                                    </div>
                                </div>

                                {selectedItem.type === 'correction' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Original Draft</h3>
                                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-gray-300 leading-relaxed min-h-[120px]">
                                                "{selectedItem.original}"
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500">Corrected Version</h3>
                                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-sm text-gray-200 leading-relaxed min-h-[120px]">
                                                "{selectedItem.edited}"
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Outcome & Reasoning</h3>
                                        <div className="p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                            <div className="flex items-start gap-4">
                                                <ShieldCheck className="w-5 h-5 text-indigo-400 mt-1" />
                                                <div>
                                                    <div className="font-bold text-indigo-300 mb-1">Predicted Outcome</div>
                                                    <p className="text-sm text-gray-300 leading-relaxed">
                                                        {selectedItem.outcome}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
