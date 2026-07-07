'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Zap, Brain, Sparkles, Check, 
  ChevronDown, Star, Mail, AlertCircle, AlertTriangle, 
  FileText, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CountUp from '@/components/ui/CountUp';
import DomainSpamChecker from '@/components/ui/DomainSpamChecker';
import { ease, stagger } from '@/lib/motion-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ----------------------------------------------------
// 1. Hero Console Loop Hook
// ----------------------------------------------------
function useConsoleLoop() {
  const [spamGone, setSpamGone] = useState(false);
  const [typed, setTyped] = useState('');
  const fullReply = "Hi Priya — following up on the Q3 numbers we discussed May 2nd. Let me know if you need the detailed reports.";
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      // In reduced motion, skip loop and render settled end-state
      setSpamGone(true);
      setTyped(fullReply);
      return;
    }

    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function run() {
      while (!cancelled) {
        setSpamGone(false); 
        setTyped('');
        await wait(2000);
        
        if (cancelled) return;
        setSpamGone(true); // Spam row collapses
        await wait(1200);
        
        if (cancelled) return;
        // Typing reply loop
        for (let i = 0; i <= fullReply.length; i++) {
          if (cancelled) return;
          setTyped(fullReply.slice(0, i));
          await wait(25);
        }
        await wait(4500); // Wait in settled state
      }
    }

    run();
    return () => { 
      cancelled = true; 
    };
  }, [prefersReduced]);

  return { spamGone, typed };
}

// ----------------------------------------------------
// 2. FAQ Accordion Item Component
// ----------------------------------------------------
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-gray-900 hover:text-[#6D5EF5] transition-colors"
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-350 ${isOpen ? 'rotate-180 text-[#6D5EF5]' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: ease.standard }}
          >
            <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// 3. Main LandingClient Component
// ----------------------------------------------------
export default function LandingClient() {
  const { spamGone, typed } = useConsoleLoop();
  
  // Shared staggered reveal transition for viewport entry
  const revealVariant = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.standard } },
  };

  const containerVariant = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger.base
      }
    }
  };

  const faqs = [
    {
      q: "How does Decision Intelligence guarantee spam-free emails?",
      a: "Our AI scans drafts in real-time against major spam filter algorithms (like SpamAssassin and Gmail's neural filters) before you hit send. It flags spam trigger words, links, and formatting, then suggests deliverable alternatives."
    },
    {
      q: "What kind of mistakes does the email analyzer catch?",
      a: "Beyond typical grammar checks, it scans for contextual errors. For example, if you mention 'refer to the document' but forget to upload the attachment, it stops the mail. It also checks if your tone matches the client's cultural region."
    },
    {
      q: "How does contextual conversation mapping work?",
      a: "Decision Intelligence builds a secure vector graph of the entire correspondence from the first mail. When you need to follow up, the AI synthesizes the exact milestones and timelines, producing replies that respect the full context."
    },
    {
      q: "Is this tool available globally?",
      a: "Yes, Decision Intelligence is fully compliant with security standards in the USA, UK, India, and APAC. It is optimized to support standard corporate email architectures, including Google Workspace and Outlook."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#12151C] selection:bg-[#6D5EF5]/20 font-sans relative overflow-x-hidden">
      
      {/* Sticky Navigation */}
      <Navbar />

      <main className="relative pt-20">
        
        {/* ========================================================
            HERO SECTION
            ======================================================== */}
        <section className="pt-24 md:pt-36 pb-16 md:pb-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-7 space-y-8 text-left"
            variants={containerVariant}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={revealVariant}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6D5EF5]/5 border border-[#6D5EF5]/15 text-xs font-bold tracking-wide text-[#6D5EF5]">
                <Sparkles className="w-3.5 h-3.5 fill-[#6D5EF5]/10" /> Next-Gen AI Mailing SaaS
              </span>
            </motion.div>

            <motion.h1 
              variants={revealVariant}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05]"
            >
              Email with <span className="text-[#6D5EF5]">Intelligence.</span> <br />
              Delivered with context.
            </motion.h1>

            <motion.p 
              variants={revealVariant}
              className="text-lg md:text-xl text-gray-500 font-medium max-w-xl leading-relaxed"
            >
              The world&apos;s first proactive mailing assistant that analyzes deliverability, prevents embarrassing draft mistakes, and drafts replies with complete timeline context.
            </motion.p>

            <motion.div 
              variants={revealVariant}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link 
                href="/dashboard" 
                className="h-14 px-8 bg-[#6D5EF5] hover:bg-[#5b4ee0] text-white rounded-full font-bold flex items-center justify-center gap-2 text-base transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-[#6D5EF5]/20 active:scale-[0.99]"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#demo" 
                className="h-14 px-8 border border-gray-200 hover:border-gray-300 text-gray-700 bg-white rounded-full font-bold flex items-center justify-center gap-2 text-base transition-all hover:bg-gray-50 active:scale-[0.99]"
              >
                Watch Product Demo
              </a>
            </motion.div>
          </motion.div>

          <motion.div 
            className="lg:col-span-5 w-full flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: ease.standard }}
          >
            {/* Inline Domain reputation scanner tool in Hero */}
            <DomainSpamChecker />
          </motion.div>
        </section>

        {/* ========================================================
            HERO CONSOLE (Product Mockup)
            ======================================================== */}
        <section id="demo" className="py-12 md:py-20 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Watch the Neural Inbox in action
              </h2>
              <p className="text-gray-500 text-base md:text-lg">
                See how Decision Intelligence automatically clears spam blocks, structures deliverables, and drafts contextual follow-ups in real time.
              </p>
            </div>

            {/* High-fidelity Mock Browser console */}
            <div className="max-w-4xl mx-auto bg-white border border-gray-200/80 rounded-3xl shadow-2xl overflow-hidden">
              {/* Browser chrome headers */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto bg-white border border-gray-200/60 rounded-lg px-8 py-1 text-xs text-gray-400 font-medium tracking-wide shadow-xs select-none">
                  mail.decisionintelligence.ai
                </div>
              </div>

              {/* Console Workspace Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px] text-gray-900 text-sm font-sans">
                {/* Left Sidebar */}
                <div className="md:col-span-3 border-r border-gray-200 bg-gray-50/50 p-4 space-y-6 hidden md:block">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block px-2">INBOX FLows</span>
                    <div className="bg-white border border-[#E5E7EB] text-[#6D5EF5] font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-xs cursor-default">
                      <Mail className="w-4 h-4" /> Inbox
                      <span className="ml-auto text-xs bg-[#6D5EF5]/10 px-1.5 py-0.5 rounded-md text-[#6D5EF5]">2</span>
                    </div>
                    <div className="text-gray-500 hover:text-gray-900 font-medium px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-100 transition-all cursor-pointer">
                      <Shield className="w-4 h-4" /> Spam Shields
                    </div>
                  </div>
                </div>

                {/* Middle - Email List */}
                <div className="md:col-span-4 border-r border-gray-200 p-4 space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block px-1">Recent Messages</span>
                  
                  {/* Spam email row to collapse */}
                  <AnimatePresence>
                    {!spamGone && (
                      <motion.div
                        initial={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ 
                          opacity: 0, 
                          x: 30, 
                          height: 0,
                          padding: 0,
                          marginBottom: 0,
                          borderWidth: 0,
                          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
                        }}
                        className="p-3 border border-red-100 bg-red-50/40 rounded-xl space-y-1.5 cursor-default relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> High Risk Spam
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 truncate">RE: CASH LOAN IN 5 MINS!</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">Hi Subham, act immediately to claim...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Standard active thread */}
                  <div className="p-3 border border-[#6D5EF5]/30 bg-[#6D5EF5]/5 rounded-xl space-y-1.5 cursor-default relative">
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6D5EF5] animate-pulse" />
                      <span className="text-[10px] text-[#6D5EF5] font-bold uppercase tracking-wider">Follow Up</span>
                    </div>
                    <span className="font-bold text-xs text-gray-500">Priya Sharma</span>
                    <h4 className="font-bold text-gray-900 truncate">Q3 Numbers Alignment</h4>
                    <p className="text-xs text-gray-600 line-clamp-1">Reviewing the sheet we shared...</p>
                  </div>
                </div>

                {/* Right - AI Composition Pane */}
                <div className="md:col-span-5 p-4 flex flex-col justify-between bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-xs text-gray-400">Recipient</span>
                        <div className="font-bold text-gray-900">Priya Sharma (priya@salesforce.com)</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-[#6D5EF5] font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Deliverability Shield Active
                      </span>
                      {/* Simulated text typing */}
                      <div className="text-gray-700 leading-relaxed min-h-[140px] text-xs p-3 bg-gray-50 border border-gray-100 rounded-2xl whitespace-pre-wrap select-none font-medium">
                        {typed}
                        <span className="w-1.5 h-4 bg-[#6D5EF5] inline-block animate-pulse ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Checked - Spam Free
                    </span>
                    <button className="h-9 px-4 bg-[#6D5EF5] text-white rounded-lg font-bold text-xs hover:bg-[#5b4ee0] shadow-sm select-none pointer-events-none">
                      Approve & Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            KPI / STATISTICS SECTION
            ======================================================== */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
              
              <div className="space-y-2 p-6 border border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="text-4xl md:text-5xl font-extrabold text-[#6D5EF5]">
                  <CountUp to={30} prefix="+" suffix="%" />
                </div>
                <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                  Reply Rate Increase
                </div>
              </div>

              <div className="space-y-2 p-6 border border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="text-4xl md:text-5xl font-extrabold text-gray-900">
                  <CountUp to={470000} suffix="+" />
                </div>
                <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                  Emails Delivered
                </div>
              </div>

              <div className="space-y-2 p-6 border border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="text-4xl md:text-5xl font-extrabold text-[#6D5EF5]">
                  <CountUp to={12} duration={800} formatValue={(v) => `< ${(v / 10).toFixed(1)}s`} />
                </div>
                <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                  Analysis Latency
                </div>
              </div>

              <div className="space-y-2 p-6 border border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="text-4xl md:text-5xl font-extrabold text-gray-900">
                  <CountUp to={999} duration={1200} formatValue={(v) => `${(v / 10).toFixed(1)}%`} />
                </div>
                <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                  Spam-Free Standing
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================
            CORE CAPABILITIES / DETAILED FEATURES
            ======================================================== */}
        <section id="features" className="py-20 md:py-28 space-y-24 md:space-y-36">
          
          {/* Feature 1: Create Spam Free Emails */}
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#6D5EF5]/5 border border-[#6D5EF5]/20 flex items-center justify-center text-[#6D5EF5]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Create spam-free emails, automatically.
              </h3>
              <p className="text-gray-500 text-base md:text-lg leading-relaxed font-medium">
                Deliverability is won at the draft level. Decision Intelligence constantly tests email structures and words against known ISP spam filters.
              </p>
              <ul className="space-y-3 pt-2">
                {['Filter bypass scoring in real-time', 'Trigger word warning highlights', 'Adaptive text variations suggestions'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#6D5EF5]/10 flex items-center justify-center text-[#6D5EF5] shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 bg-gray-50 border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-md">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#6D5EF5] block">
                  Interactive Deliverability Scan
                </span>
                
                <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-800">
                    <div className="font-bold flex items-center gap-1 mb-1">
                      <AlertCircle className="w-4 h-4" /> Trigger word flagged: &quot;ACT IMMEDIATELY&quot;
                    </div>
                    High risk of landing in Google Promoted/Spam folder. Recommended rewrite.
                  </div>
                  
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
                    <div className="font-bold flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Rewrite Suggested
                    </div>
                    &quot;Let&apos;s connect early next week when you have a moment.&quot; (No flags)
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Feature 2: Analyze Email Mistakes (Alternating layout) */}
          <div className="bg-gray-50/70 border-y border-gray-200/60 py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              <div className="lg:col-span-7 order-2 lg:order-1 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-md">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4 shadow-xs">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 block">
                    Real-time draft audits
                  </span>

                  <div className="space-y-3 text-xs leading-relaxed text-gray-800">
                    <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-bold">Subject: Q3 budget figures attachment</span>
                      </div>
                      <p className="text-gray-500 italic">&quot;As promised, I have attached the spreadsheet for your review below...&quot;</p>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Missing Attachment Alert</span>
                        You referenced an attachment in line 2, but no file is selected. Upload the document before sending.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Stop email mistakes before they send.
                </h3>
                <p className="text-gray-500 text-base md:text-lg leading-relaxed font-medium">
                  We verify attachment references, URL integrity, correct placeholders, and tone alignment dynamically as you type.
                </p>
                <ul className="space-y-3 pt-2">
                  {['Reference checks (attachments, schedules)', 'Dead link and placeholder auditing', 'Tone and regional vocabulary checks'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Feature 3: Timeline Context Follow-ups */}
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#6D5EF5]/5 border border-[#6D5EF5]/20 flex items-center justify-center text-[#6D5EF5]">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Follow up with complete context of the conversation.
              </h3>
              <p className="text-gray-500 text-base md:text-lg leading-relaxed font-medium">
                Never lose thread milestones. Decision Intelligence builds a history vector map to draft follow-up emails that read with flawless continuity.
              </p>
              <ul className="space-y-3 pt-2">
                {['Chronological thread context maps', 'Auto-summarization of milestones', 'Proactive nudge alerts for pending tasks'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#6D5EF5]/10 flex items-center justify-center text-[#6D5EF5] shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 bg-gray-50 border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-md">
              {/* Context map timeline mockup */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm text-xs text-gray-800">
                <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400 block">
                  Context History Timeline Map
                </span>
                
                <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[30px] w-4 h-4 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center" />
                    <span className="text-gray-400 font-bold block">May 2</span>
                    <span className="font-bold">Initial call (Priya)</span> — discussed sales alignment for Q3 figures.
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] w-4 h-4 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center" />
                    <span className="text-gray-400 font-bold block">May 5</span>
                    <span className="font-bold">Outbox Draft Sent</span> — email containing links to spreadsheets.
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] w-4 h-4 rounded-full bg-[#6D5EF5] border-2 border-white flex items-center justify-center" />
                    <span className="text-[#6D5EF5] font-extrabold block">Today (AI Suggested)</span>
                    <span className="font-extrabold text-gray-900">Follow-up Draft generated</span> — nudge Priya on May 5th spreadsheets.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================
            PROCESS / HOW IT WORKS SECTION
            ======================================================== */}
        <section id="process" className="py-20 md:py-28 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#6D5EF5]">
                How It Works
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Four simple steps to absolute control
              </h2>
              <p className="text-gray-500 text-base md:text-lg">
                Decision Intelligence integrates into your existing setups in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Oauth Connection", desc: "Link your inbox using secure Google OAuth credentials." },
                { step: "02", title: "Shadow Mode Learning", desc: "The engine observes tone profiles passively for 14 days." },
                { step: "03", title: "Smart Draft Auditing", desc: "Get real-time warning indicators for spam risk and draft mistakes." },
                { step: "04", title: "Master Your Inbox", desc: "Send, review, and follow up with correct timing and rationale." }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 p-8 rounded-3xl shadow-xs text-left space-y-4 hover:border-[#6D5EF5]/30 transition-all">
                  <span className="text-xs font-extrabold text-[#6D5EF5] bg-[#6D5EF5]/5 px-3 py-1.5 rounded-lg">
                    {item.step}
                  </span>
                  <h4 className="font-extrabold text-lg text-gray-900 pt-2">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            TESTIMONIALS SECTION
            ======================================================== */}
        <section id="testimonials" className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#6D5EF5]">
                Trust & Reviews
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Used by elite professionals worldwide
              </h2>
              <p className="text-gray-500 text-base md:text-lg">
                See how founders and managers optimize their daily workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Decision Intelligence has saved us hundreds of lost replies. The context follow-up is frighteningly accurate.",
                  name: "Siddharth Mehta",
                  role: "Co-Founder, TechRise India",
                  rating: 5
                },
                {
                  quote: "DMARC and SPF auditing alone saved our customer onboarding flow from falling into bulk junk categories. Absolute must-have.",
                  name: "Sarah Jenkins",
                  role: "Head of Growth, ApexGlobal UK",
                  rating: 5
                },
                {
                  quote: "The mistake analyzer saved me from sending 4 emails without files attached this month alone. It pays for itself immediately.",
                  name: "Marcus Vance",
                  role: "Product Lead, Stripe USA",
                  rating: 5
                }
              ].map((t, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200/60 p-8 rounded-3xl space-y-6 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#6D5EF5] text-[#6D5EF5]" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      &quot;{t.quote}&quot;
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200/80 pt-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#6D5EF5]/10 flex items-center justify-center text-xs font-bold text-[#6D5EF5]">
                      {t.name[0]}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-gray-900 block">{t.name}</span>
                      <span className="text-xs text-gray-400 font-bold block">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            FAQ SECTION
            ======================================================== */}
        <section id="faq" className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#6D5EF5]">
                Common Questions
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            GRADIENT CTA BANNER SECTION
            ======================================================== */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative rounded-3xl md:rounded-[40px] bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] text-white p-10 md:p-16 shadow-2xl overflow-hidden">
              {/* Background Shapes */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-6 text-left">
                <span className="text-xs font-extrabold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg inline-block">
                  Launch Today
                </span>
                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                  Take control of your inbox.
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  Start drafting spam-free replies, prevent core mailing errors, and track thread milestones with explainable context. Connect Gmail in under 2 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link 
                    href="/dashboard" 
                    className="h-12 px-6 bg-white hover:bg-gray-50 text-[#6D5EF5] rounded-xl font-bold flex items-center justify-center gap-1.5 text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    href="/contact" 
                    className="h-12 px-6 border border-white/20 hover:border-white/30 text-white rounded-xl font-bold flex items-center justify-center text-sm hover:bg-white/5 transition-all"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Dark Footer */}
      <Footer />

    </div>
  );
}
