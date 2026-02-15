'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Key, Database, RefreshCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SafetyClient() {
    const safetyFeatures = [
        {
            icon: <Lock className="w-6 h-6 text-indigo-400" />,
            title: "Global AES-256 Encryption",
            desc: "All authentication tokens and sensitive metadata are encrypted at rest using industry-standard AES-256 for users in USA, Europe, and Asia."
        },
        {
            icon: <EyeOff className="w-6 h-6 text-rose-400" />,
            title: "Zero Pixel Tracking",
            desc: "We never inject tracking pixels into your emails. Your interactions remain private and invisible to trackers worldwide."
        },
        {
            icon: <Key className="w-6 h-6 text-emerald-400" />,
            title: "Worldwide BYOK",
            desc: "Optionally bring your own OpenAI or Gemini API keys to ensure data processing stays within your own jurisdictional boundaries."
        },
        {
            icon: <Shield className="w-6 h-6 text-indigo-400" />,
            title: "Global OAuth 2.0",
            desc: "Secure, revokable Google OAuth tokens manage all global access without ever requiring your account password."
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        <span className="font-bold text-xl tracking-tight">Decision Intelligence</span>
                    </Link>
                </div>
            </nav>

            <main className="pt-40 pb-24 px-6">
                <div className="max-w-5xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                            Global Security Standard
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold">Uncompromising Safety</h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Engineered for global trust. Decision Intelligence uses a decentralized security model that exceeds international data safety standards.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {safetyFeatures.map((item, i) => (
                            <div key={i} className="glass-card p-10 space-y-6 flex flex-col items-center text-center">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    {item.icon}
                                </div>
                                <h2 className="text-2xl font-bold">{item.title}</h2>
                                <p className="text-gray-400 leading-relaxed font-light">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <section className="glass-card p-8 md:p-12 bg-white/[0.02] border-indigo-500/10">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="shrink-0 w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Database className="w-10 h-10 text-indigo-400" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <h2 className="text-2xl font-bold">International Privacy Compliance</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Our neural models are strictly isolated. Data processing follows regional regulations ensuring no data leakage across corporate or geographical borders.
                                </p>
                                <div className="flex gap-4">
                                    <Link href="/privacy" className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:underline">
                                        Read Privacy Policy
                                    </Link>
                                    <Link href="/terms" className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:underline">
                                        View Terms
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="text-center py-12 border-t border-white/5 space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin-slow" />
                            <h2 className="text-3xl font-bold">Global Safety Audits</h2>
                            <p className="text-gray-500 max-w-lg mx-auto">
                                Our trust engine monitors encryption health for users in USA, UK, India, and beyond.
                            </p>
                        </div>
                        <Link href="/dashboard" className="glow-button px-10 py-5 rounded-full text-lg font-bold text-white inline-block">
                            Secure Global Access
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
