'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { validateEmail } from '@/lib/api';

interface MiniResult {
    overall_status: 'valid' | 'invalid' | 'unknown';
    details: string;
    is_disposable: boolean;
    is_catch_all: boolean;
    has_mx_records: boolean;
    smtp_status: string;
}

export default function HomeEmailValidatorTeaser() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MiniResult | null>(null);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim();
        if (!trimmed) {
            inputRef.current?.focus();
            return;
        }
        setLoading(true);
        setResult(null);
        setError('');
        try {
            const data = await validateEmail(trimmed);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Validation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        valid: {
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
            label: 'Valid Email',
            labelClass: 'text-emerald-700',
            badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            bgClass: 'bg-emerald-50/50',
        },
        invalid: {
            icon: <XCircle className="w-6 h-6 text-red-500" />,
            label: 'Invalid Email',
            labelClass: 'text-red-700',
            badgeClass: 'bg-red-50 border-red-200 text-red-700',
            bgClass: 'bg-red-50/50',
        },
        unknown: {
            icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
            label: 'Unknown / Catch-All',
            labelClass: 'text-amber-700',
            badgeClass: 'bg-amber-50 border-amber-200 text-amber-700',
            bgClass: 'bg-amber-50/50',
        },
    };

    const cfg = result ? statusConfig[result.overall_status] : null;

    return (
        <div className="p-8 md:p-10">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" id="home-email-validator-form">
                <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        ref={inputRef}
                        id="home-validator-input"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setResult(null); setError(''); }}
                        placeholder="Enter any email address to verify…"
                        className="w-full h-13 pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#6D5EF5] focus:ring-2 focus:ring-[#6D5EF5]/10 outline-none text-sm font-medium text-gray-900 placeholder-gray-400 transition-all bg-gray-50 focus:bg-white"
                        autoComplete="off"
                        disabled={loading}
                    />
                </div>
                <button
                    id="home-validator-submit"
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="h-13 px-6 bg-[#6D5EF5] hover:bg-[#5b4ee0] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-[#6D5EF5]/20 active:scale-[0.99] whitespace-nowrap min-w-[140px]"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                    ) : (
                        <>Verify Now <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-3 text-sm text-red-600 font-medium flex items-center gap-1.5"
                    >
                        <XCircle className="w-4 h-4" /> {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Mini Result Card */}
            <AnimatePresence>
                {result && cfg && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.35 }}
                        className={`mt-5 rounded-2xl border p-5 ${cfg.bgClass} border-gray-200`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                {cfg.icon}
                                <div>
                                    <div className={`font-extrabold text-base ${cfg.labelClass}`}>
                                        {cfg.label}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-0.5 leading-snug max-w-sm">
                                        {result.details}
                                    </p>
                                    {/* Quick stat chips */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${result.has_mx_records ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                            MX: {result.has_mx_records ? 'Found' : 'None'}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${result.is_disposable ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                            Disposable: {result.is_disposable ? 'Yes' : 'No'}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${result.is_catch_all ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                            Catch-All: {result.is_catch_all ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={`/email-validator?email=${encodeURIComponent(email)}`}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6D5EF5] text-white font-bold text-sm hover:bg-[#5b4ee0] transition-all hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap self-start sm:self-auto"
                            >
                                See Full Details <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer hint */}
            {!result && !loading && (
                <p className="mt-4 text-xs text-gray-400 text-center">
                    🔒 No data is stored. Verification is performed live via SMTP handshake.{' '}
                    <Link href="/email-validator" className="text-[#6D5EF5] font-bold hover:underline">
                        Full Validator →
                    </Link>
                </p>
            )}
        </div>
    );
}
