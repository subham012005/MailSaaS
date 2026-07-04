'use client';

import { motion, Variants } from 'framer-motion';
import { Shield, BrainCircuit, ArrowRight, CheckCircle2, Activity, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { FeatureCard } from '@/components/ui/FeatureCard';

export default function LandingClient() {
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
            <Navbar />

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="relative flex items-center justify-center overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32 bg-background">
                    <GradientOrb color="mint" className="w-[600px] h-[600px] top-[-100px] left-[-100px]" />
                    <GradientOrb color="peach" className="w-[500px] h-[500px] bottom-[-100px] right-[-100px]" />

                    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl z-10">
                        <div className="text-center">
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="space-y-8"
                            >
                                <motion.h1
                                    variants={item}
                                    className="font-display text-[64px] leading-[1.05] tracking-[-1.92px] max-w-4xl mx-auto"
                                >
                                    Send AI Emails. <br className="hidden md:block"/>
                                    Never Hit Spam.
                                </motion.h1>

                                <motion.p
                                    variants={item}
                                    className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-[1.5] tracking-[0.16px] px-4 font-normal"
                                >
                                    The world's first AI Command Center that drafts context-aware replies and actively rewrites them to bypass spam filters.
                                </motion.p>

                                <motion.div
                                    variants={item}
                                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                                >
                                    <Button size="lg" asChild>
                                        <Link href="/dashboard">
                                            Deploy Command Center <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        Enterprise Security
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Feature 1: Deliverability Shield */}
                <section className="py-24 relative z-10 bg-accent">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-strong border border-border mb-4">
                                    <Shield className="w-5 h-5 text-ink" />
                                </div>
                                <h2 className="text-4xl font-display tracking-[-0.96px] text-foreground">
                                    Deliverability Shield.
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    AI emails are notorious for landing in spam. Our neural engine actively scores your drafts and sanitizes aggressive triggers, ensuring your messages hit the primary inbox.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {['Real-time Spam Trigger Detection', 'Semantic Rewrite Engine', 'Domain Reputation Protection'].map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-3 text-foreground font-medium text-[15px]">
                                            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full relative">
                                <GradientOrb color="sky" className="w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                <FeatureCard className="relative z-10 p-8">
                                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                                        <div className="space-y-1">
                                            <div className="text-[12px] uppercase tracking-[0.96px] text-muted-foreground font-semibold">Inbox Probability</div>
                                            <div className="text-3xl font-display tracking-[-0.32px] text-foreground">99.8%</div>
                                        </div>
                                        <Activity className="w-8 h-8 text-foreground" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-1 rounded-full bg-border overflow-hidden">
                                            <div className="h-full bg-foreground w-full" />
                                        </div>
                                        <div className="text-sm font-medium text-foreground text-right">Spam triggers neutralized</div>
                                    </div>
                                </FeatureCard>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 2: Shadow Mode */}
                <section className="py-24 relative z-10 bg-background border-y border-border">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col-reverse md:flex-row items-center gap-16">
                            <div className="flex-1 w-full relative">
                                <GradientOrb color="lavender" className="w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                <FeatureCard className="relative z-10 p-8">
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                                                <EyeOff className="w-5 h-5 text-foreground" />
                                            </div>
                                            <div>
                                                <div className="text-base font-semibold text-foreground">Silent Observation Active</div>
                                                <div className="text-sm text-muted-foreground mt-1 leading-[1.47]">Drafting responses locally. Waiting for manual approval before sending.</div>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-dashed border-border bg-accent">
                                            <div className="text-[12px] uppercase tracking-[0.96px] text-muted-foreground font-semibold mb-2">AI Draft (Unsent)</div>
                                            <p className="text-[15px] text-foreground leading-[1.5]">"Hi John, I've reviewed the proposal. Let's proceed with the phase 2 timeline as discussed."</p>
                                        </div>
                                    </div>
                                </FeatureCard>
                            </div>
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-strong border border-border mb-4">
                                    <BrainCircuit className="w-5 h-5 text-ink" />
                                </div>
                                <h2 className="text-4xl font-display tracking-[-0.96px] text-foreground">
                                    Shadow Mode.
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Never let AI "go rogue" again. Run our engine in Shadow Mode to silently generate contextual drafts in the background. Review, edit, and build trust at your own pace.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {['Zero-Risk Onboarding', 'Learns from your corrections', 'Total Manual Override'].map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-3 text-foreground font-medium text-[15px]">
                                            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEO Detail Section: Why Choose Decision Intelligence */}
                <section className="py-24 relative z-10 bg-accent border-b border-border">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl font-display tracking-[-0.32px] text-foreground">
                                The Leading Enterprise AI Email Assistant
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Understanding why global teams choose our Smart Mailing SaaS for inbox management.
                            </p>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">What makes this Email Decision Intelligence different?</h3>
                                <p className="text-body text-[15px] leading-[1.6]">
                                    Unlike generic AI wrappers, our neural inbox logic actively parses semantic intent, urgency, and stakeholder relationships. By utilizing advanced Generative AI for Email, we don't just summarize threads; we securely automate email delegation and craft responses that strictly adhere to enterprise compliance, ensuring you maintain a pristine domain reputation and never hit the spam folder.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">How does the Smart Mailing SaaS improve productivity?</h3>
                                <p className="text-body text-[15px] leading-[1.6]">
                                    Professional Inbox Management requires more than just templates. Our AI Email Engine works in the background (Shadow Mode) to prepare contextual drafts before you even open your inbox. This automated email workflow reduces the time spent on repetitive communication by up to 70%, allowing decision makers to focus on high-leverage tasks.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">Is this AI Inbox Assistant secure for enterprise use?</h3>
                                <p className="text-body text-[15px] leading-[1.6]">
                                    Security is our baseline. As a top-rated AI Mailing Engine deployed across the USA, UK, and India, our infrastructure relies on explainable AI and local data sandboxing. Your proprietary business context never leaves your isolated environment, making it the most secure email productivity tool available for enterprise professionals.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 relative z-10 text-center bg-background">
                    <GradientOrb color="rose" className="w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
                    <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10">
                        <h2 className="text-[48px] leading-[1.08] tracking-[-0.96px] font-display font-light text-foreground">
                            Take Control of the Chaos.
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Join elite decision makers managing their global inboxes with absolute precision.
                        </p>
                        <div className="pt-8">
                            <Button size="lg" asChild>
                                <Link href="/dashboard">
                                    Access Command Center
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

