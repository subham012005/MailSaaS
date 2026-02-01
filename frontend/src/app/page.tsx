'use client';

import { motion } from 'framer-motion';
import { Mail, Brain, Shield, MousePointer2, ArrowRight, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Antigravity Mail</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#safety" className="hover:text-white transition-colors">Safety</a>
          </div>
          <Link href="/dashboard" className="glow-button px-6 py-2.5 rounded-full text-sm font-medium">
            Launch App
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 blur-[120px] pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-indigo-600 rounded-full animate-pulse" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              {...fadeIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-400 mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>Next-Gen Decision Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight"
            >
              Your Inbox, Augmented by <br />
              <span className="gradient-text">Decision Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Stop automating. Start deciding. Our AI learns your patterns,
              predicts outcomes, and helps you master your inbox—without ever sending an email on your behalf.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/dashboard" className="glow-button px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                Start Shadow Mode <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-8 py-4 rounded-full text-lg font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all w-full sm:w-auto">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-black/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-6 h-6 text-indigo-400" />,
                  title: "Shadow Mode",
                  desc: "Silent observation for 14 days. We learn your tone and timing without touching a single email."
                },
                {
                  icon: <Brain className="w-6 h-6 text-rose-400" />,
                  title: "Explainable AI",
                  desc: "Every suggestion shows its 'Why'. Never wonder why the AI recommended an action."
                },
                {
                  icon: <MousePointer2 className="w-6 h-6 text-emerald-400" />,
                  title: "Decision-First",
                  desc: "Choose from multiple paths. Our engine predicts the outcome of every choice you make."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="glass-card p-8 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-indigo-500/50 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Status Preview */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="glass-card p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest">
                  Live Status
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Built for Inbox Safety</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                We never mass-send, never use tracking pixels, and always require your explicit click.
                Decision intelligence means you stay in control.
              </p>
              <div className="flex flex-wrap justify-center gap-12 mt-12 grayscale opacity-50">
                <div className="text-sm font-semibold tracking-widest uppercase">Gmail Native</div>
                <div className="text-sm font-semibold tracking-widest uppercase">Outlook Secure</div>
                <div className="text-sm font-semibold tracking-widest uppercase">No Tracking</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 text-sm">
            © 2026 Antigravity. Decision Intelligence for Professionals.
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
