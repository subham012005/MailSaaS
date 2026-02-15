'use client';

import { motion } from 'framer-motion';
import { Mail, MessageCircle, Globe, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import GoogleFeedbackForm from '@/components/GoogleFeedbackForm';

export default function ContactClient() {
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
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                            Connect Worldwide
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Global Engineering Support</h1>
                        <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
                            Have questions about our global AI mailing SaaS? Our engineers in India and support teams in USA/UK are ready to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <GoogleFeedbackForm className="glass-card p-8 md:p-10" />
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: <Mail className="w-5 h-5 text-indigo-400" />,
                                    label: "Global Support",
                                    value: "support@smartemail.in",
                                    sub: "24/7 Priority Support"
                                },
                                {
                                    icon: <MessageCircle className="w-5 h-5 text-indigo-400" />,
                                    label: "Neural Assistance",
                                    value: "Dashboard Support",
                                    sub: "Avg. response time: 2m"
                                },
                                {
                                    icon: <Globe className="w-5 h-5 text-indigo-400" />,
                                    label: "Global HQ",
                                    value: "Bangalore, India",
                                    sub: "Heart of AI Innovation"
                                }
                            ].map((item, i) => (
                                <div key={i} className="glass-card p-6 flex flex-col items-start gap-4">
                                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</div>
                                        <div className="font-bold text-lg">{item.value}</div>
                                        <div className="text-xs text-gray-500 italic mt-1">{item.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
