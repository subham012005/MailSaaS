'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Sparkles } from 'lucide-react';

interface PersonaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (personaId: string, context: string) => Promise<void>;
    currentPersonaId: string;
    currentContext: string;
    personas: any[];
}

export default function PersonaModal({
    isOpen,
    onClose,
    onSave,
    currentPersonaId,
    currentContext,
    personas
}: PersonaModalProps) {
    const [personaId, setPersonaId] = useState(currentPersonaId);
    const [context, setContext] = useState(currentContext);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setPersonaId(currentPersonaId);
        setContext(currentContext);
    }, [currentPersonaId, currentContext, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(personaId, context);
            onClose();
        } catch (error) {
            console.error("Failed to save personality:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Personalize Perspective</h3>
                            <p className="text-xs text-gray-400">Define how the AI perceives and handles your inbox</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Persona Selector */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Core Perspective</label>
                        <div className="grid grid-cols-4 gap-2">
                            {personas.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPersonaId(p.id)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${personaId === p.id
                                            ? 'bg-indigo-600/10 border-indigo-600/40 text-white'
                                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                        }`}
                                >
                                    <p.icon className={`w-5 h-5 ${personaId === p.id ? p.color : ''}`} />
                                    <span className="text-[10px] font-bold truncate w-full text-center">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Context */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Additional Context & Instructions</label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="e.g. 'I am a final year CS student at Stanford. I prefer a concise, data-driven tone. Prioritize internship offers over general networking.'"
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-600 focus:border-indigo-500/50 outline-none transition-all resize-none"
                        />
                        <p className="text-[10px] text-gray-500 mt-2 px-1 leading-relaxed">
                            Tell the AI more about your background, preferences, or specific rules you want it to follow. This context will be injected into every decision cycle.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isSaving}
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        SAVE PERSPECTIVE
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
