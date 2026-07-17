'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Loader2, 
    Mail, 
    Check, 
    Server, 
    Info, 
    Menu, 
    AlertTriangle 
} from 'lucide-react';
import { validateEmail } from '@/lib/api';
import { showNotification } from '@/lib/notifications';

interface EmailValidatorViewProps {
    userEmail?: string;
    accessToken?: string;
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen?: (open: boolean) => void;
    initialEmail?: string;
}

interface ValidationResult {
    email: string;
    is_valid_format: boolean;
    has_mx_records: boolean;
    mx_servers: string[];
    smtp_status: string;
    is_disposable: boolean;
    is_catch_all: boolean;
    overall_status: 'valid' | 'invalid' | 'unknown';
    details: string;
}

export default function EmailValidatorView({ 
    userEmail = '', 
    accessToken, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen,
    initialEmail = ''
}: EmailValidatorViewProps) {
    const [targetEmail, setTargetEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [result, setResult] = useState<ValidationResult | null>(null);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedEmail = targetEmail.trim();
        if (!trimmedEmail) {
            showNotification('Please enter an email address', { type: 'error' });
            return;
        }

        setLoading(true);
        setResult(null);
        
        try {
            // Simulated visual steps for premium experience
            setLoadingStep('Checking email format...');
            await new Promise(r => setTimeout(r, 600));
            
            setLoadingStep('Resolving domain and MX records...');
            await new Promise(r => setTimeout(r, 600));
            
            setLoadingStep('Initiating SMTP handshake (mailbox verification)...');
            
            const data = await validateEmail(trimmedEmail, userEmail, accessToken);
            setResult(data);
            showNotification('Verification completed', { type: 'success' });
        } catch (error) {
            console.error('Validation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Validation failed. Please try again.';
            showNotification(errorMessage, { type: 'error' });
        } finally {
            setLoading(false);
            setLoadingStep('');
        }
    };

    // Helper to render check/cross/warning badges
    const renderStatusBadge = (status: 'success' | 'danger' | 'warning', text: string) => {
        const classes = {
            success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
            warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        };

        const icons = {
            success: <Check className="w-3.5 h-3.5" />,
            danger: <XCircle className="w-3.5 h-3.5" />,
            warning: <AlertTriangle className="w-3.5 h-3.5" />,
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${classes[status]}`}>
                {icons[status]}
                {text}
            </span>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto bg-black/20 p-4 md:p-10 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* ── HEADER ── */}
                <div className="flex items-start gap-4">
                    {setIsMobileMenuOpen && (
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            Email Validator
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Tool
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Check whether an email address exists and can receive emails.
                        </p>
                    </div>
                </div>

                {/* ── INPUT SECTION ── */}
                <div className="glass-card p-6 md:p-8">
                    <form onSubmit={handleValidate} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={targetEmail}
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                    placeholder="Enter email to validate (e.g. hello@google.com)"
                                    disabled={loading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm md:text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all text-white placeholder-gray-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="glow-button px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap min-w-[160px]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    'Validate Email'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── LOADING ANIMATION ── */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                                <Mail className="w-6 h-6 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white uppercase tracking-wider">Analyzing Address</p>
                                <p className="text-xs text-indigo-300/80 font-medium animate-pulse">{loadingStep}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── RESULTS CARD ── */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Hero Status Card */}
                            <div className={`p-8 rounded-3xl border relative overflow-hidden bg-gradient-to-br transition-all duration-500 ${
                                result.overall_status === 'valid'
                                    ? 'from-emerald-500/5 to-transparent border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
                                    : result.overall_status === 'invalid'
                                    ? 'from-rose-500/5 to-transparent border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)]'
                                    : 'from-amber-500/5 to-transparent border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]'
                            }`}>
                                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                                    <div className="flex items-center gap-4 text-center md:text-left">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                                            result.overall_status === 'valid'
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : result.overall_status === 'invalid'
                                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>
                                            {result.overall_status === 'valid' ? (
                                                <CheckCircle2 className="w-8 h-8" />
                                            ) : result.overall_status === 'invalid' ? (
                                                <XCircle className="w-8 h-8" />
                                            ) : (
                                                <AlertCircle className="w-8 h-8" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white truncate max-w-md">{result.email}</h2>
                                            <p className="text-xs text-gray-400 mt-1">{result.details}</p>
                                        </div>
                                    </div>

                                    {/* Overall Status Badge */}
                                    <div className="shrink-0">
                                        {result.overall_status === 'valid' && (
                                            <span className="px-5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold uppercase tracking-widest block text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                Valid
                                            </span>
                                        )}
                                        {result.overall_status === 'invalid' && (
                                            <span className="px-5 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-bold uppercase tracking-widest block text-center shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                                Invalid
                                            </span>
                                        )}
                                        {result.overall_status === 'unknown' && (
                                            <span className="px-5 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-bold uppercase tracking-widest block text-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                                Unknown
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed breakdown metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Format</div>
                                        <div className="text-sm font-semibold text-white">Syntax Structure</div>
                                    </div>
                                    {result.is_valid_format 
                                        ? renderStatusBadge('success', 'Valid Format') 
                                        : renderStatusBadge('danger', 'Invalid')
                                    }
                                </div>

                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Domain Status</div>
                                        <div className="text-sm font-semibold text-white">DNS Domain Active</div>
                                    </div>
                                    {result.has_mx_records 
                                        ? renderStatusBadge('success', 'Active') 
                                        : renderStatusBadge('danger', 'Inactive')
                                    }
                                </div>

                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">MX Records</div>
                                        <div className="text-sm font-semibold text-white">Mail Exchange Config</div>
                                    </div>
                                    {result.has_mx_records 
                                        ? renderStatusBadge('success', 'Records Found') 
                                        : renderStatusBadge('danger', 'Not Found')
                                    }
                                </div>

                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">SMTP Mailbox Status</div>
                                        <div className="text-sm font-semibold text-white">Inbox Existence</div>
                                    </div>
                                    {result.smtp_status === 'exists' && !result.is_catch_all && renderStatusBadge('success', 'Exists')}
                                    {result.smtp_status === 'does_not_exist' && renderStatusBadge('danger', 'Does Not Exist')}
                                    {result.smtp_status === 'unknown' && renderStatusBadge('warning', 'Unverifiable')}
                                    {result.is_catch_all && renderStatusBadge('warning', 'Catch-All')}
                                </div>

                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Disposable Email</div>
                                        <div className="text-sm font-semibold text-white">Disposable Domain Check</div>
                                    </div>
                                    {result.is_disposable 
                                        ? renderStatusBadge('danger', 'Yes (Disposable)') 
                                        : renderStatusBadge('success', 'No (Safe)')
                                    }
                                </div>

                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Catch-All Domain</div>
                                        <div className="text-sm font-semibold text-white">Accepts All Mailboxes</div>
                                    </div>
                                    {result.is_catch_all 
                                        ? renderStatusBadge('warning', 'Yes (Catch-All)') 
                                        : renderStatusBadge('success', 'No (Standard)')
                                    }
                                </div>
                            </div>

                            {/* MX Server list details */}
                            {result.mx_servers && result.mx_servers.length > 0 && (
                                <div className="glass-card p-6 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <Server className="w-4 h-4 text-indigo-400" />
                                        Resolved Mail Exchange (MX) Servers
                                    </h3>
                                    <div className="overflow-hidden border border-white/5 rounded-xl divide-y divide-white/5">
                                        {result.mx_servers.map((server, index) => (
                                            <div key={server} className="p-3.5 flex items-center justify-between text-xs hover:bg-white/[0.01] transition-all">
                                                <span className="font-mono text-gray-400">{server}</span>
                                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold font-mono">
                                                    Priority {index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── DISCLAIMER / SYSTEM INFO ── */}
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-4">
                    <Info className="w-5 h-5 text-indigo-400/70 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-300/80 uppercase tracking-wider">Limitations & Accuracy Disclaimer</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            This validator performs syntax validation, resolves DNS MX records, and communicates directly with target mail servers without sending actual emails.
                            Please note that this tool <strong>does not check if emails will land in the Inbox, Spam, or Promotions folders</strong>.
                            Furthermore, we <strong>do not claim 100% accuracy</strong> as mail servers can occasionally drop verify handshakes, implement aggressive temporary greylisting, rate-limit queries, or use catch-all configurations that accept all addresses.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
