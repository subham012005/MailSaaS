'use client';

import { motion } from 'framer-motion';
import { Brain, Shield, Zap, MousePointer2, Users, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
    const features = [
        {
            icon: <Brain className="w-6 h-6 text-indigo-400" />,
            title: "Shadow Mode Learning",
            description: "Our AI observes your communication style for 14 days, building a hyper-accurate tone profile before suggesting its first reply.",
            details: ["Passive Observation", "Tone Profiling", "Contextual Awareness"]
        },
        {
            icon: <Shield className="w-6 h-6 text-emerald-400" />,
            title: "Decision-First Security",
            description: "SmartEmail never sends an email without your explicit approval. You remain the final authority on every piece of outgoing data.",
            details: ["OAuth 2.0 Secure", "AES-256 Encryption", "Manual Override"]
        },
        {
            icon: <Users className="w-6 h-6 text-purple-400" />,
            title: "Smart Delegation",
            description: "Assign threads to team members with AI-generated context. Track the progress of every delegated decision in real-time.",
            details: ["Thread Assignment", "Context Handoff", "Status Tracking"]
        },
        {
            icon: <Zap className="w-6 h-6 text-amber-400" />,
            title: "Outcome Prediction",
            description: "Our models analyze the potential impact of different response paths, helping you choose the most strategic action.",
            details: ["Impact Analysis", "Strategic Suggestions", "Scenario Modeling"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        <span className="font-bold text-xl tracking-tight">SmartEmail</span>
                    </Link>
                    <Link href="/dashboard" className="glow-button px-6 py-2.5 rounded-full text-sm font-medium">
                        Launch App
                    </Link>
                </div>
            </nav>

            <main className="pt-40 pb-24 px-6">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Technical Capabilities
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Every feature of SmartEmail is designed to turn your inbox from a chore into a strategic advantage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 md:p-12 group"
                            >
                                <div className="flex flex-col h-full space-y-6">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-fit group-hover:scale-110 transition-transform duration-500">
                                        {feature.icon}
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold">{feature.title}</h2>
                                        <p className="text-gray-400 leading-relaxed text-lg">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 mt-auto">
                                        <div className="flex flex-wrap gap-3">
                                            {feature.details.map((detail, idx) => (
                                                <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                                                    {detail}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <section className="bg-indigo-600/10 border border-indigo-600/20 rounded-[40px] p-12 md:p-20 text-center space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold">Ready to master your inbox?</h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                            Join hundreds of founders and professionals using Decision Intelligence to regain 10+ hours a week.
                        </p>
                        <div className="flex justify-center flex-wrap gap-4">
                            <Link href="/dashboard" className="glow-button px-10 py-5 rounded-full text-lg font-bold text-white">
                                Get Started for Free
                            </Link>
                            <Link href="/contact" className="px-10 py-5 rounded-full text-lg font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md">
                                Contact Sales
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
