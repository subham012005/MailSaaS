'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Search, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function DeliverabilityPage() {
    const { data: rawSession } = useSession();
    const session = rawSession as any;
    const [domain, setDomain] = useState('');
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Spam Analyzer State
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [spamLoading, setSpamLoading] = useState(false);
    const [spamResult, setSpamResult] = useState<any>(null);
    const [spamError, setSpamError] = useState<string | null>(null);

    // Default domain to user's email domain if available
    useEffect(() => {
        if (session?.user?.email && !domain) {
            const userDomain = session.user.email.split('@')[1];
            if (userDomain && userDomain !== 'gmail.com') {
                setDomain(userDomain);
            }
        }
    }, [session]);

    const checkHealth = async () => {
        if (!domain) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/deliverability/domain-health?domain=${encodeURIComponent(domain)}`, session?.user?.accessToken, session?.user?.email);
            setHealth(res);
        } catch (err: any) {
            setError(err.message || 'Failed to check domain health');
        } finally {
            setLoading(false);
        }
    };

    const checkSpamScore = async () => {
        if (!subject || !body) return;
        setSpamLoading(true);
        setSpamError(null);
        try {
            const res = await api.post('/deliverability/spam-check', { subject, body }, session?.user?.accessToken, session?.user?.email);
            setSpamResult(res);
        } catch (err: any) {
            setSpamError(err.message || 'Failed to analyze spam score');
        } finally {
            setSpamLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <div className="p-8 border-b border-border bg-sidebar/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Deliverability Center</h1>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Ensure your domain is authenticated and emails land in the inbox.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="max-w-3xl space-y-6">
                    {/* Domain Check Input */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Domain Authentication</h2>
                        <div className="flex gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter domain (e.g., yourcompany.com)"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:bg-background focus:border-primary/50 outline-none transition-all text-foreground font-medium"
                                />
                            </div>
                            <button
                                onClick={checkHealth}
                                disabled={loading || !domain}
                                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-all flex items-center gap-2"
                            >
                                {loading ? <Activity className="w-4 h-4 animate-spin" /> : 'Analyze'}
                            </button>
                        </div>
                        {error && <p className="mt-4 text-xs font-medium text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}
                    </div>

                    {/* Results */}
                    {health && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <RecordCard 
                                    title="MX Records" 
                                    description="Mail Exchanger (Receives Mail)"
                                    status={health.mx_records.status} 
                                    details={health.mx_records.records?.length > 0 ? health.mx_records.records.join(', ') : 'No records found'}
                                />
                                <RecordCard 
                                    title="SPF" 
                                    description="Sender Policy Framework"
                                    status={health.spf_record.status} 
                                    details={health.spf_record.record || 'No SPF record found'}
                                />
                                <RecordCard 
                                    title="DMARC" 
                                    description="Domain Message Authentication"
                                    status={health.dmarc_record.status} 
                                    details={health.dmarc_record.record || 'No DMARC record found'}
                                />
                            </div>
                            
                            <div className={`p-6 rounded-2xl border ${health.overall_health === 'excellent' ? 'bg-success/5 border-success/20' : health.overall_health === 'fair' ? 'bg-warning/5 border-warning/20' : 'bg-destructive/5 border-destructive/20'}`}>
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Overall Health: {health.overall_health}</h3>
                                <p className="text-xs font-medium opacity-80">
                                    {health.overall_health === 'excellent' ? 'Your domain is fully authenticated. Excellent deliverability expected.' :
                                     health.overall_health === 'fair' ? 'You are missing some authentication records. This may impact your deliverability to strict inboxes.' :
                                     'Critical authentication records are missing. Your emails are highly likely to go to spam.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="max-w-3xl space-y-6 mt-12">
                    {/* Spam Score Analyzer */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> AI Spam Analyzer
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Email Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-muted border border-border rounded-xl py-3 px-4 text-sm focus:bg-background focus:border-primary/50 outline-none transition-all text-foreground font-medium"
                            />
                            <textarea
                                placeholder="Email Body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={6}
                                className="w-full bg-muted border border-border rounded-xl py-3 px-4 text-sm focus:bg-background focus:border-primary/50 outline-none transition-all text-foreground font-medium resize-none"
                            />
                            <button
                                onClick={checkSpamScore}
                                disabled={spamLoading || !subject || !body}
                                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {spamLoading ? <Activity className="w-4 h-4 animate-spin" /> : 'Analyze Spam Likelihood'}
                            </button>
                        </div>
                        {spamError && <p className="mt-4 text-xs font-medium text-destructive bg-destructive/10 p-3 rounded-lg">{spamError}</p>}
                    </div>

                    {/* Spam Results */}
                    {spamResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className={`p-6 rounded-2xl border ${spamResult.spam_score > 70 ? 'bg-destructive/5 border-destructive/20' : spamResult.spam_score > 30 ? 'bg-warning/5 border-warning/20' : 'bg-success/5 border-success/20'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Spam Score</h3>
                                    <span className={`text-2xl font-bold ${spamResult.spam_score > 70 ? 'text-destructive' : spamResult.spam_score > 30 ? 'text-warning' : 'text-success'}`}>
                                        {spamResult.spam_score}/100
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium mb-4">{spamResult.tone_analysis}</p>
                                
                                {spamResult.trigger_words?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Detected Trigger Words</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {spamResult.trigger_words.map((word: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs font-bold">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {spamResult.recommendations?.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Recommendations</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {spamResult.recommendations.map((rec: string, i: number) => (
                                                <li key={i} className="text-sm font-medium text-muted-foreground">{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RecordCard({ title, description, status, details }: { title: string, description: string, status: string, details: string }) {
    const isFound = status === 'found';
    return (
        <div className={`p-5 rounded-xl border ${isFound ? 'bg-card border-border' : 'bg-destructive/5 border-destructive/20'} flex flex-col`}>
            <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{title}</span>
                {isFound ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4">{description}</span>
            <div className="mt-auto">
                <p className={`text-xs font-medium truncate ${isFound ? 'text-muted-foreground' : 'text-destructive'}`} title={details}>
                    {details}
                </p>
            </div>
        </div>
    );
}
