'use client';

import { motion } from 'framer-motion';
import { Gavel, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsClient() {
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

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        <div className="space-y-4 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                <Gavel className="w-3 h-3" />
                                Global Legal Framework
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
                            <p className="text-gray-500">Effective Date: February 16, 2026</p>
                        </div>

                        <section className="glass-card p-8 md:p-12 space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">1. Worldwide Acceptance</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    By accessing Decision Intelligence, you agree to bound by these terms globally. Our AI mailing SaaS is designed for elite professionals and business entities worldwide.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">2. AI-Driven Responsibility</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Decision Intelligence provides a neural intelligence layer for mailing. While we prioritize extreme precision for global users, you acknowledge:
                                </p>
                                <ul className="space-y-3 text-sm text-gray-400 italic">
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                                        All neural-generated drafts must be reviewed before sending.
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                                        Platform performance may vary based on regional mail connectivity.
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">3. Global Security</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Users are responsible for the security of their Google credentials across all regions of operation.
                                </p>
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
