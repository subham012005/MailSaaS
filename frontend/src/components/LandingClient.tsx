'use client';

import { motion, Variants } from 'framer-motion';
import { LayoutDashboard, Brain, Shield, ArrowRight, Zap, ShieldCheck, Lock, Server, Globe } from 'lucide-react';
import Link from 'next/link';
import Squares from '@/components/ui/squares';
import FadeContent from '@/components/ui/fade-content';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LandingClient() {
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "circOut" } }
    };

    return (
        <div className="min-h-screen bg-black text-[#f5f5f7] selection:bg-primary/30 font-sans overflow-hidden relative">
            {/* Premium Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <Squares
                    direction="diagonal"
                    speed={0.5}
                    squareSize={40}
                    borderColor="rgba(100, 100, 255, 0.15)"
                    hoverFillColor="rgba(100, 100, 255, 0.05)"
                />
            </div>

            <div className="fixed inset-0 bg-gradient-to-b from-black via-black/90 to-black z-0 pointer-events-none" />

            {/* Navigation */}
            <Navbar />

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-32 md:pt-48 pb-20 md:pb-32">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="space-y-8 md:space-y-12"
                        >
                            <motion.div variants={item}>
                                <span className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-md">
                                    Next-Gen Decision Intelligence for Global Professionals
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={item}
                                className="text-5xl md:text-[120px] font-bold leading-[0.95] md:leading-[0.9] tracking-tighter"
                            >
                                <span className="text-white">The Future of</span> <br />
                                <span className="gradient-text pb-4">Mailing AI.</span>
                            </motion.h1>

                            <motion.p
                                variants={item}
                                className="text-base md:text-2xl text-[#86868b] max-w-3xl mx-auto leading-relaxed font-medium px-4"
                            >
                                Master your inbox from New York to Bangalore. Decision Intelligence proactive layer thinks ahead,
                                drafts with precision, and manages your global communication DNA.
                            </motion.p>

                            <motion.div
                                variants={item}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4"
                            >
                                <Link href="/dashboard" className="glow-button w-full sm:w-auto h-14 md:h-16 px-10 text-lg">
                                    Get Started <ArrowRight className="w-5 h-5 ml-1" />
                                </Link>
                                <button className="w-full sm:w-auto h-14 md:h-16 px-10 rounded-full bg-white/[0.03] border border-white/10 text-lg font-semibold hover:bg-white/[0.08] transition-all backdrop-blur-xl">
                                    Watch Demo
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* SEO Content Region Section - Beneficial for Ranking */}
                <section className="py-12 border-y border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto px-6 overflow-hidden whitespace-nowrap">
                        <div className="flex gap-12 animate-scroll-x">
                            {['USA', 'United Kingdom', 'India', 'Germany', 'Australia', 'Canada', 'Singapore', 'Japan', 'UAE', 'France'].map((region) => (
                                <span key={region} className="text-xs font-bold uppercase tracking-widest text-[#515154] opacity-50">
                                    Ranking high in {region}
                                </span>
                            ))}
                            {/* Duplicate for infinite scroll feel */}
                            {['USA', 'United Kingdom', 'India', 'Germany', 'Australia', 'Canada', 'Singapore', 'Japan', 'UAE', 'France'].map((region) => (
                                <span key={region + '_2'} className="text-xs font-bold uppercase tracking-widest text-[#515154] opacity-50">
                                    Ranking high in {region}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature Cards */}
                <section className="py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white tracking-tight">Enterprise-Grade AI Capabilities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {[
                                {
                                    icon: <Shield className="w-8 h-8 text-primary" />,
                                    title: "Shadow Mode Privacy",
                                    desc: "Hyper-personalized learning that clones your unique communication DNA securely across global nodes."
                                },
                                {
                                    icon: <Brain className="w-8 h-8 text-secondary" />,
                                    title: "Neural Thread Analysis",
                                    desc: "Identify critical business obligations and high-value opportunities hidden in your mailing threads."
                                },
                                {
                                    icon: <Zap className="w-8 h-8 text-accent" />,
                                    title: "Decision Logic Engine",
                                    desc: "Explainable AI logic providing strategic rationale behind every automated action and suggestion."
                                }
                            ].map((feature, i) => (
                                <FadeContent key={i} delay={i * 200} duration={800} threshold={0.2} blur>
                                    <div className="glass-card p-8 md:p-10 flex flex-col items-start gap-6 md:gap-8 group h-full">
                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                            {feature.icon}
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl md:text-2xl font-bold text-white">{feature.title}</h3>
                                            <p className="text-[#86868b] leading-relaxed text-base md:text-lg font-light">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                </FadeContent>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Dashboard Intelligence Ranking Section */}
                <section id="dashboard-preview" className="py-24 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">The Neural <br />Command Center.</h2>
                                <p className="text-xl text-gray-500 leading-relaxed font-light">
                                    Access your **Global Decision Dashboard**. Monitor email velocity, track delegated threads, and let the AI manage the complexity of your professional mailing lifecycle.
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-[#515154]">
                                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10">Live Metrics</span>
                                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10">AI Delegation Log</span>
                                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10">Neural Analysis</span>
                                </div>
                                <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold hover:underline underline-offset-4 text-lg">
                                    Preview the Premium Dashboard <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                            <div className="flex-1 w-full aspect-video rounded-[32px] bg-gradient-to-br from-indigo-500/20 via-black to-black border border-white/10 p-1 flex items-center justify-center overflow-hidden group">
                                <div className="w-full h-full rounded-[31px] bg-black/40 backdrop-blur-3xl flex items-center justify-center relative overflow-hidden">
                                    <LayoutDashboard className="w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                    <div className="absolute bottom-10 left-10 right-10 p-6 glass-card border-white/5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Global Status</div>
                                            <div className="text-sm font-bold text-white">Neural Engine Active</div>
                                        </div>
                                        <div className="w-10 h-1 bg-indigo-500 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Protocol Section */}
                <section className="py-24 md:py-40">
                    <div className="max-w-7xl mx-auto px-6">
                        <FadeContent duration={1200} threshold={0.1}>
                            <div className="glass-card p-8 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 md:gap-20">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                                <div className="flex-1 space-y-6 md:space-y-10 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#86868b]">Active Integrity Protocol</span>
                                    </div>
                                    <h2 className="text-4xl md:text-7xl font-bold leading-tight">Built for <br />Global Trust.</h2>
                                    <p className="text-lg md:text-xl text-[#86868b] leading-relaxed max-w-lg">
                                        Decision Intelligence is used by Fortune 500 professionals worldwide for secure mailing automation and strategic inbox management.
                                    </p>
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 italic">Available in: North America, Europe, Asia, and Middle East.</p>
                                        <Link href="/safety" className="inline-flex items-center gap-2 text-primary font-bold hover:underline underline-offset-4">
                                            Explore Global Safety Architecture <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="w-full md:w-1/2 aspect-square glass-card bg-black/40 flex items-center justify-center p-8 md:p-12 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
                                        {[
                                            { icon: ShieldCheck, label: "SOC2 Compliant" },
                                            { icon: Lock, label: "E2E Encrypted" },
                                            { icon: Server, label: "Enterprise API" },
                                            { icon: Globe, label: "Global Nodes" }
                                        ].map((item, i) => (
                                            <div key={i} className="h-24 md:h-32 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-3 group-hover:bg-white/[0.05] transition-all duration-500">
                                                <item.icon className="w-6 h-6 md:w-8 md:h-8 text-primary/50 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider text-center px-2">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeContent>
                    </div>
                </section>
            </main>

            {/* Modern Footer */}
            {/* Modern Footer */}
            <Footer />
        </div>
    );
}
