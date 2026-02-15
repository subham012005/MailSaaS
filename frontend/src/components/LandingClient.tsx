'use client';

import { motion, Variants } from 'framer-motion';
import { Mail, Brain, Shield, MousePointer2, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import Squares from '@/components/ui/squares';
import BlurText from '@/components/ui/blur-text';
import FadeContent from '@/components/ui/fade-content';

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
            <nav className="fixed top-0 w-full z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                            <img src="/logo.png" alt="Decision Intelligence Logo" className="w-7 h-7 object-contain" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Decision Intelligence</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hidden md:flex items-center gap-10 px-8 py-3 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl"
                    >
                        <Link href="/features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>
                        <Link href="/how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Process</Link>
                        <Link href="/safety" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Safety</Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href="/dashboard" className="glow-button px-4 py-2 md:px-6 md:py-3 text-sm md:text-base">
                            Launch App
                        </Link>
                    </motion.div>
                </div>
            </nav>

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
                                <BlurText
                                    text="Mailing AI."
                                    delay={100}
                                    animateBy="words"
                                    direction="bottom"
                                    className="gradient-text inline-block pb-4"
                                />
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
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-20 md:h-24 rounded-2xl bg-white/[0.03] border border-white/10 blur-[1px] group-hover:blur-0 transition-all duration-700" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeContent>
                    </div>
                </section>
            </main>

            {/* Modern Footer */}
            <footer className="py-16 md:py-24 border-t border-white/5 relative z-10 bg-black/50 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Decision Intelligence" className="w-8 h-8 opacity-80" />
                            <span className="font-bold text-lg text-white">Decision Intelligence</span>
                        </div>
                        <p className="text-[#86868b] text-sm max-w-xs">
                            The world's most advanced AI email decision layer. Built for the global professional workforce.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Market Focus</h4>
                            <ul className="space-y-2 text-sm text-[#86868b]">
                                <li><span className="hover:text-white transition-colors">USA & Canada AI Tools</span></li>
                                <li><span className="hover:text-white transition-colors">UK & Europe Email AI</span></li>
                                <li><span className="hover:text-white transition-colors">India SaaS Excellence</span></li>
                                <li><span className="hover:text-white transition-colors">Global AI Mailing</span></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Platform</h4>
                            <ul className="space-y-2 text-sm text-[#86868b]">
                                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-white transition-colors">Process</Link></li>
                                <li><Link href="/safety" className="hover:text-white transition-colors">Safety</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Legal</h4>
                            <ul className="space-y-2 text-sm text-[#86868b]">
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Engineering</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 mt-12 md:mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between text-[10px] md:text-xs text-[#515154] font-medium uppercase tracking-widest gap-4">
                    <span>© 2026 Decision Intelligence Global Labs.</span>
                    <span>Designed for Worldwide Impact • Powered by Neural Logic</span>
                </div>
            </footer>
        </div>
    );
}
