'use client';

import { motion, Variants } from 'framer-motion';
import { Mail, Brain, Shield, MousePointer2, ArrowRight, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Removed automatic redirection to dashboard


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
    <div className="min-h-screen bg-black text-[#f5f5f7] selection:bg-primary/30 font-sans overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb w-[500px] h-[500px] bg-primary/20 top-[-100px] left-[-100px]" />
        <div className="orb w-[600px] h-[600px] bg-secondary/10 bottom-[-200px] right-[-100px] animation-delay-2000" />
        <div className="orb w-[400px] h-[400px] bg-accent/10 top-[20%] right-[10%] animate-pulse" />
      </div>

      <div className="fixed inset-0 bg-grid-pattern opacity-20 z-0 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <img src="/logo.png" alt="SmartEmail Logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">SmartEmail</span>
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
            <Link href="/dashboard" className="glow-button">
              Launch App
            </Link>
          </motion.div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-48 pb-32">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-12"
            >
              <motion.div variants={item}>
                <span className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-md">
                  Next-Gen Decision Intelligence
                </span>
              </motion.div>

              <motion.h1
                variants={item}
                className="text-6xl md:text-[120px] font-bold leading-[0.9] tracking-tighter"
              >
                <span className="text-white">The Future of</span> <br />
                <span className="gradient-text">Intelligence.</span>
              </motion.h1>

              <motion.p
                variants={item}
                className="text-lg md:text-2xl text-[#86868b] max-w-3xl mx-auto leading-relaxed font-medium"
              >
                SmartEmail isn't just an assistant. It's a proactive layer that thinks ahead,
                predicts your needs, and masters your legacy inbox.
              </motion.p>

              <motion.div
                variants={item}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Link href="/dashboard" className="glow-button h-16 px-10 text-lg">
                  Get Started <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
                <button className="h-16 px-10 rounded-full bg-white/[0.03] border border-white/10 text-lg font-semibold hover:bg-white/[0.08] transition-all backdrop-blur-xl">
                  Watch Demo
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-8 h-8 text-primary" />,
                  title: "Shadow Mode",
                  desc: "Hyper-personalized learning that clones your unique communication DNA over 14 days."
                },
                {
                  icon: <Brain className="w-8 h-8 text-secondary" />,
                  title: "Neural Extraction",
                  desc: "Identify critical obligations and opportunities hidden within complex email threads."
                },
                {
                  icon: <Zap className="w-8 h-8 text-accent" />,
                  title: "Decision Logic",
                  desc: "Explainable AI that shows the strategic rationale behind every suggested action."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="glass-card p-10 flex flex-col items-start gap-8 group"
                >
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                    <p className="text-[#86868b] leading-relaxed text-lg font-light">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Protocol Section */}
        <section className="py-40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="glass-card p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center gap-20">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="flex-1 space-y-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#86868b]">Active Integrity Protocol</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold leading-tight">Built to be <br />unbreakable.</h2>
                <p className="text-xl text-[#86868b] leading-relaxed max-w-lg">
                  We never mass-send, we never track, and every decision goes through your final approval.
                </p>
                <Link href="/safety" className="inline-flex items-center gap-2 text-primary font-bold hover:underline underline-offset-4">
                  Explore Safety Architecture <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="w-full md:w-1/2 aspect-square glass-card bg-black/40 flex items-center justify-center p-12 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="grid grid-cols-2 gap-8 w-full">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-white/[0.03] border border-white/10 blur-[1px] group-hover:blur-0 transition-all duration-700" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="py-24 border-t border-white/5 relative z-10 bg-black/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="w-8 h-8 opacity-80" />
              <span className="font-bold text-lg text-white">SmartEmail</span>
            </div>
            <p className="text-[#86868b] text-sm max-w-xs">
              Empowering professional intelligence through bespoke email mastery. Built in India for the world.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
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
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">Company</h4>
              <ul className="space-y-2 text-sm text-[#86868b]">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between text-xs text-[#515154] font-medium uppercase tracking-widest">
          <span>© 2026 SmartEmail Intelligence Lab.</span>
          <span>Designed in Bangalore • Powered by Apple-style UX</span>
        </div>
      </footer>
    </div>
  );
}
