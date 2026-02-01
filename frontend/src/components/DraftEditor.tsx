'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DraftEditorProps {
    originalDraft: string;
    onSave: (editedDraft: string) => void;
    onSend: (editedDraft: string) => void;
    onCancel: () => void;
}

export default function DraftEditor({ originalDraft, onSave, onSend, onCancel }: DraftEditorProps) {
    const [editedDraft, setEditedDraft] = useState(originalDraft);
    const [isSending, setIsSending] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setHasChanges(editedDraft !== originalDraft);
    }, [editedDraft, originalDraft]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        >
            <div className="glass-card w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden bg-[#0a0a0a]">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Review Draft</h2>
                        {hasChanges && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                                Unsaved Changes
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(editedDraft)}
                            className="px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Log Final Decision
                        </button>
                        <button
                            onClick={async () => {
                                setIsSending(true);
                                try {
                                    await onSend(editedDraft);
                                } finally {
                                    setIsSending(false);
                                }
                            }}
                            disabled={isSending}
                            className="glow-button px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                        >
                            <CheckCircle2 className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
                            {isSending ? 'Sending...' : 'Send Reply Now'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Side-by-Side Comparison */}
                    <div className="flex-1 p-6 border-r border-white/5 bg-white/[0.01]">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Original AI Suggestion</div>
                        <div className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed font-mono">
                            {originalDraft}
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col">
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>Your Version</span>
                            {hasChanges && (
                                <button
                                    onClick={() => setEditedDraft(originalDraft)}
                                    className="flex items-center gap-1 hover:text-white transition-colors capitalize text-[9px]"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Restore Original
                                </button>
                            )}
                        </div>
                        <textarea
                            value={editedDraft}
                            onChange={(e) => setEditedDraft(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-gray-200 font-mono focus:ring-0"
                            placeholder="Start editing the draft..."
                        />
                    </div>
                </div>

                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-4 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>AI will learn from your edits to prevent repeated mistakes.</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>This draft is stored in your inbox but will NOT be sent automatically.</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
