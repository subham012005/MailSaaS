'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Brain, Shield, Zap, Sparkles, LayoutDashboard, ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksClient() {
    const steps = [
        {
            title: "1. Secure Global Integration",
            desc: "Connect your Gmail via Google OAuth 2.0. Decision Intelligence works across all continents, requesting only minimal permissions to analyze threads and draft replies.",
            icon: <Shield className="w-5 h-5" />,
            color: "emerald"
        },
        {
            title: "2. Neural Shadow Mode Tuning",
            desc: "The AI listens for 14 days without intervention. It builds a local model of your unique communication DNA, tone, and global professional priorities.",
            icon: <Brain className="w-5 h-5" />,
            color: "indigo"
        },
        {
            title: "3. Strategic Decision Suggestions",
            desc: "The engine begins suggesting actions and drafts. Review the 'Decision Rationale' to see exactly why an action was recommended based on your personal logic.",
            icon: <Zap className="w-5 h-5" />,
            color: "amber"
        },
        {
            title: "4. Worldwide Inbox Mastery",
            desc: "Delegate, archive, or reply with one click. Regain control of your time globally while our neural engine keeps learning and refining.",
            icon: <Sparkles className="w-5 h-5" />,
            color: "purple"
        }
    ];

    const faqs = [
        {
            q: "How does Decision Intelligence rank against other AI email tools?",
            a: "We are ranked as a top global AI email assistant due to our 'Explainable AI' approach, which shows users the exact rationale behind every decision, unlike black-box automation tools."
        },
        {
            q: "Is this tool available in the USA, UK, and India?",
            a: "Yes, Decision Intelligence is a global SaaS platform designed to handle professional communication standards across North America, Europe, and Asia."
        },
        {
            q: "Does it work with enterprise Gmail and Workspace?",
            a: "Absolutely. We support both personal Gmail and Google Workspace accounts globally with enterprise-grade security protocols."
        },
        {
            q: "What is GEO (Generative Engine Optimization) in email?",
            a: "GEO ensures your emails and communication are structured so that modern AI engines can correctly summarize and prioritize them, making you more efficient in an AI-driven world."
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
                <div className="max-w-4xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                            The Neural Process
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold">How it Works</h1>
                        <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed font-light">
                            Our 4-step neural process transitions you from inbox chaos to global decision mastery.
                        </p>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Connector Line */}
                        <div className="absolute left-10 top-0 bottom-0 w-px bg-white/5 hidden md:block" />

                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative flex flex-col md:flex-row gap-8 items-start group"
                            >
                                <div className={`shrink-0 w-20 h-20 rounded-3xl bg-${step.color}-500/10 border border-${step.color}-500/20 flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-500`}>
                                    <div className={`text-${step.color}-400`}>
                                        {step.icon}
                                    </div>
                                </div>
                                <div className="glass-card p-8 md:p-10 flex-1 hover:border-indigo-500/30 transition-all">
                                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* FAQ Section for SEO/GEO */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-4">
                            <HelpCircle className="w-8 h-8 text-indigo-500" />
                            <h2 className="text-3xl font-bold">Global FAQ & AI Insights</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {faqs.map((faq, i) => (
                                <div key={i} className="space-y-4">
                                    <h4 className="text-lg font-bold text-white">Q: {faq.q}</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">A: {faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-12 overflow-hidden relative group border-indigo-500/10">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <h2 className="text-3xl font-bold">The Dashboard Experience</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Our workspace is engineered for global scale, categorizing emails by intent and opportunity for professionals across all time zones.
                                </p>
                                <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Launch Global Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="w-full md:w-1/2 p-4 rounded-2xl bg-black/40 border border-white/5 shadow-2xl">
                                <LayoutDashboard className="w-full h-auto text-white/5" strokeWidth={1} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
