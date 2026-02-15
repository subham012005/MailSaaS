'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyClient() {
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
                                <Shield className="w-3 h-3" />
                                Global Data Protection
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                            <p className="text-gray-500 italic">Last updated: February 16, 2026</p>
                        </div>

                        <section className="glass-card p-8 md:p-12 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-indigo-400" />
                                    Global Commitment to Privacy
                                </h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Decision Intelligence is built on the philosophy of "Privacy by Design". Our platform is used by professionals across the USA, UK, India, and beyond, providing a secure intelligence layer that works for you, and only you.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Eye className="w-5 h-5 text-indigo-400" />
                                    Information Collection (Worldwide)
                                </h2>
                                <p className="text-gray-400 text-sm mb-4 italic">Compliance: GDPR (EU), CCPA (USA), and DPDP (India) standards.</p>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span><strong>Email Content Analysis:</strong> We temporarily process email metadata to generate strategic summaries. Data is encrypted and managed through secure global nodes.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span><strong>OAuth Security:</strong> We securely store Google OAuth 2.0 refresh tokens with AES-256 standards, ensuring secure access to your global inbox.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span><strong>Neural Logs:</strong> Decision logs are used locally to tune your personal shadow mode, never shared with third-party networks for advertising.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Strategic Data Usage</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Processed data is used exclusively for decision optimization and inbox mastery globally.
                                </p>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <h2 className="text-2xl font-bold text-indigo-400">Global Data Control</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    You have full authority over your data. Disconnect and wipe all stored tokens and neural logs instantly from the Settings dashboard anywhere in the world.
                                </p>
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
