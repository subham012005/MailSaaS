'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLScy8Q6O_j8Q7P6O_j8Q7P6O_j8Q7P6O_j8Q7P6O_j8Q7P/formResponse";
// Note: The user provided https://docs.google.com/forms/d/1BCBlNU0AJDRTMYomVRrvHN8MkGB3DA6etIcN_twUHdw/formResponse
// Standard Google Forms usually need /d/e/.../formResponse or /u/0/d/.../formResponse.
// The ID '1BCBlNU0AJDRTMYomVRrvHN8MkGB3DA6etIcN_twUHdw' looks like an edit ID, not a submission ID.
// However, I will use the URL EXACTLY as provided by the user, but standard practice is usually different.
// Wait, the user said "Correct Google Form URL: https://docs.google.com/forms/d/1BCBlNU0AJDRTMYomVRrvHN8MkGB3DA6etIcN_twUHdw/formResponse"
// I will adhere to their instruction.

const FORM_URL = "https://docs.google.com/forms/d/1BCBlNU0AJDRTMYomVRrvHN8MkGB3DA6etIcN_twUHdw/formResponse";

interface GoogleFeedbackFormProps {
    className?: string;
    onSuccess?: () => void;
}

export default function GoogleFeedbackForm({ className = "", onSuccess }: GoogleFeedbackFormProps) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.currentTarget);

        // Map to Google Form Entry IDs
        // Full Name: entry.1711202660
        // Email: entry.286211297
        // Message: entry.506741077

        const data = new FormData();
        data.append('entry.1711202660', formData.get('fullName') as string);
        data.append('entry.286211297', formData.get('email') as string);
        data.append('entry.506741077', formData.get('message') as string);

        try {
            await fetch(FORM_URL, {
                method: 'POST',
                body: data,
                mode: 'no-cors' // Important for Google Forms
            });

            // Assume success if no network error
            setStatus('success');
            if (onSuccess) onSuccess();

            // Reset form after delay? No, show success state.
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex flex-col items-center justify-center p-8 text-center space-y-4 h-full min-h-[300px] ${className}`}
            >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">
                        Thanks for your feedback. We're on it.
                    </p>
                </div>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    Send Another
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input
                        name="fullName"
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all text-white placeholder:text-gray-600 focus:bg-white/10"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input
                        name="email"
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all text-white placeholder:text-gray-600 focus:bg-white/10"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</label>
                <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="How can we help you?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all resize-none text-white placeholder:text-gray-600 focus:bg-white/10"
                />
            </div>

            {status === 'error' && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Something went wrong. Please try again.</span>
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'submitting'}
                className="glow-button w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
                {status === 'submitting' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <span>Send Message</span>
                    </>
                )}
            </button>
        </form>
    );
}
