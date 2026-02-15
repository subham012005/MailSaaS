'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import ScheduleEmailModal from './ScheduleEmailModal';

interface DraftEditorProps {
    originalDraft: string;
    onSave: (editedDraft: string) => void;
    onSend: (editedDraft: string) => void;
    onSchedule: (editedDraft: string, scheduledTime: Date) => void;
    onCancel: () => void;
}

export default function DraftEditor({ originalDraft, onSave, onSend, onSchedule, onCancel }: DraftEditorProps) {
    const [editedDraft, setEditedDraft] = useState(originalDraft);
    const [isSending, setIsSending] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    useEffect(() => {
        setHasChanges(editedDraft !== originalDraft);
    }, [editedDraft, originalDraft]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-sm"
        >
            <div className="glass-card w-full max-w-5xl h-full md:h-[80vh] flex flex-col overflow-hidden bg-[#0a0a0a] rounded-none md:rounded-3xl">
                <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg md:text-xl font-bold">Review Draft</h2>
                            {hasChanges && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                                    Unsaved
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onCancel}
                            className="md:hidden px-3 py-1 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors border border-white/5"
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                        <button
                            onClick={onCancel}
                            className="hidden md:block px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(editedDraft)}
                            className="flex-1 md:flex-none px-3 md:px-6 py-2.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <Save className="w-3 md:w-4 h-3 md:h-4 text-emerald-400" />
                            Log Decision
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
                            className="flex-1 md:flex-none glow-button px-3 md:px-6 py-2.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all"
                        >
                            <CheckCircle2 className={`w-3 md:w-4 h-3 md:h-4 ${isSending ? 'animate-spin' : ''}`} />
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="flex-1 md:flex-none px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <Clock className="w-3 md:w-4 h-3 md:h-4 text-indigo-400" />
                            Schedule
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden scrollbar-hide">
                    {/* Side-by-Side Comparison */}
                    <div className="w-full md:flex-1 p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.01]">
                        <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 md:mb-4">Original AI Suggestion</div>
                        <div className="text-xs md:text-sm text-gray-500 whitespace-pre-wrap leading-relaxed font-mono italic opacity-70">
                            {originalDraft}
                        </div>
                    </div>

                    <div className="w-full md:flex-1 p-4 md:p-6 flex flex-col bg-[#0a0a0a]">
                        <div className="text-[9px] md:text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center justify-between">
                            <span>Your Version</span>
                            {hasChanges && (
                                <button
                                    onClick={() => setEditedDraft(originalDraft)}
                                    className="flex items-center gap-1 hover:text-white transition-colors capitalize text-[9px]"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Restore
                                </button>
                            )}
                        </div>
                        <textarea
                            value={editedDraft}
                            onChange={(e) => setEditedDraft(e.target.value)}
                            className="w-full h-[300px] md:flex-1 bg-transparent border-none outline-none resize-none text-xs md:text-sm leading-relaxed text-gray-200 font-mono focus:ring-0 custom-scrollbar"
                            placeholder="Start editing the draft..."
                        />
                    </div>
                </div>

                <div className="p-3 md:p-4 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-[9px] md:text-[11px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 md:w-3.5 h-3 md:h-3.5 text-emerald-500 shrink-0" />
                        <span className="leading-tight">AI will learn from your edits to prevent mistakes.</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:ml-auto">
                        <AlertTriangle className="w-3 md:w-3.5 h-3 md:h-3.5 text-amber-500 shrink-0" />
                        <span className="leading-tight">This draft will NOT be sent automatically.</span>
                    </div>
                </div>
            </div>

            <ScheduleEmailModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={(time) => onSchedule(editedDraft, time)}
                emailSubject="Response Draft"
            />
        </motion.div>
    );
}
