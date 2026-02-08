'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        <span className="font-bold text-xl tracking-tight">SmartEmail</span>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        <div className="space-y-4 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                <Shield className="w-3 h-3" />
                                Data Protection
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                            <p className="text-gray-500 italic">Last updated: February 7, 2026</p>
                        </div>

                        <section className="glass-card p-8 md:p-12 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-indigo-400" />
                                    Our Commitment to Privacy
                                </h2>
                                <p className="text-gray-400 leading-relaxed">
                                    SmartEmail is built on the philosophy of "Privacy by Design". Unlike traditional email tools that scrape your data for advertising, we act as a secure intelligence layer that works for you, and only you.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Eye className="w-5 h-5 text-indigo-400" />
                                    What Data We Collect
                                </h2>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span><strong>Email Content:</strong> We temporarily process email metadata and bodies to generate strategic summaries and suggestions. This data is processed securely through your chosen LLM provider (Google Gemini or OpenAI).</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span><strong>Auth Tokens:</strong> We securely store Google OAuth 2.0 refresh tokens to maintain your session. These are encrypted at rest using AES-256 standards.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span><strong>Decision Logs:</strong> We keep a log of your manual approvals and corrections to improve the "Shadow Mode" tone matching specific to your account.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">How We Use Data</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We use your data exclusively to:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        "Generate email summaries",
                                        "Predict strategic outcomes",
                                        "Maintain delegation logs",
                                        "Tune shadow mode tone"
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <h2 className="text-2xl font-bold text-indigo-400">Your Control</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    You have full authority over your data. You can disconnect your Google account and wipe all stored tokens and logs instantly from the Settings dashboard. We do not sell, trade, or share your private data with any third-party advertising networks.
                                </p>
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
