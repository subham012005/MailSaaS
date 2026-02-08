'use client';

import { motion } from 'framer-motion';
import { Mail, MessageCircle, Globe, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import GoogleFeedbackForm from '@/components/GoogleFeedbackForm';

export default function ContactPage() {
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
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold">Get In Touch</h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Have questions about Decision Intelligence or need help setting up your team? We're here to help you master your inbox.
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
                                    label: "Email Us",
                                    value: "support@smartemail.in",
                                    sub: "24/7 Priority Support"
                                },
                                {
                                    icon: <MessageCircle className="w-5 h-5 text-indigo-400" />,
                                    label: "Live Chat",
                                    value: "Available in Dashboard",
                                    sub: "Avg. response time: 2m"
                                },
                                {
                                    icon: <Globe className="w-5 h-5 text-indigo-400" />,
                                    label: "Headquarters",
                                    value: "Bangalore, India",
                                    sub: "Global AI Operations"
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
