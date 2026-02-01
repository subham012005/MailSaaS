'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Shield, ArrowRight, Check, Sparkles, Mail, Lock, AlertTriangle } from 'lucide-react';

interface SetupWizardProps {
    userEmail: string;
    accessToken: string;
    onComplete: (data: { provider: string; apiKey: string; persona: string }) => void;
}

const steps = [
    {
        id: 'source',
        title: "Intelligence Source",
        description: "Choose your AI companion for decision intelligence.",
        icon: Brain,
    },
    {
        id: 'security',
        title: "Security & Keys",
        description: "Securely link your private AI engine.",
        icon: Lock,
    }
];

export default function SetupWizard({ userEmail, accessToken, onComplete }: SetupWizardProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [provider, setProvider] = useState('default');
    const [apiKey, setApiKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtered steps: Skip security if using system default
    const activeSteps = provider === 'default'
        ? [steps[0]]
        : steps;

    const handleNext = () => {
        if (currentStepIndex < activeSteps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            await onComplete({
                provider: provider === 'default' ? 'openai' : provider,
                apiKey: provider === 'default' ? '' : apiKey,
                persona: 'general'
            });
        } catch (error) {
            console.error("Setup failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentStep = activeSteps[currentStepIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {activeSteps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStepIndex ? 'bg-indigo-500' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="flex items-center gap-3 text-indigo-400 mb-4">
                                <currentStep.icon className="w-6 h-6" />
                                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Step {currentStepIndex + 1} of {activeSteps.length}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{currentStep.title}</h2>
                            <p className="text-gray-400">{currentStep.description}</p>
                        </div>

                        {currentStep.id === 'source' && (
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setProvider('default')}
                                    className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${provider === 'default'
                                        ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                        : 'bg-white/5 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm font-bold text-white">System Default (Hosted Intelligence)</div>
                                        {provider === 'default' && <Check className="w-4 h-4 text-indigo-400" />}
                                    </div>
                                    <div className="text-xs text-gray-400 leading-relaxed mb-3">Uses our server-side engine. No setup required.</div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 w-fit">
                                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">Limited trial usage policy applies</span>
                                    </div>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'openai', name: 'Private OpenAI', desc: 'Securely use your GPT-4o key.' },
                                        { id: 'gemini', name: 'Private Gemini', desc: 'Securely use your Google API key.' }
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setProvider(p.id)}
                                            className={`p-6 rounded-2xl border text-left transition-all ${provider === p.id
                                                ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                                : 'bg-white/5 border-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-sm font-bold text-white">{p.name}</div>
                                                {provider === p.id && <Check className="w-4 h-4 text-indigo-400" />}
                                            </div>
                                            <div className="text-xs text-gray-500 leading-relaxed">{p.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep.id === 'security' && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-indigo-300/80 leading-relaxed">
                                        Your private API key is encrypted and stored securely. We never use your key for other users.
                                    </p>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder={`Enter your ${provider === 'openai' ? 'sk-...' : 'Gemini Key'}`}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:border-indigo-500/50 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-between">
                    <button
                        onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)}
                        className={`text-sm font-bold transition-all ${currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting || (currentStep.id === 'security' && !apiKey.trim())}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Finalizing...' : (
                            currentStepIndex === activeSteps.length - 1 ? (
                                <>Enter Dashboard <ArrowRight className="w-4 h-4" /></>
                            ) : (
                                <>Next Step <ArrowRight className="w-4 h-4" /></>
                            )
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
