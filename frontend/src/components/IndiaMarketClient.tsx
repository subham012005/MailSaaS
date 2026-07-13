'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Sparkles, Check, 
  ChevronDown, ArrowRight, Scale, Clock, 
  Globe, AlertCircle, TrendingUp, Award
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ease } from '@/lib/motion-tokens';

// ----------------------------------------------------
// FAQ Accordion Item Component
// ----------------------------------------------------
function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white hover:text-indigo-400 transition-colors"
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: ease.standard }}
          >
            <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IndiaMarketClient() {
  const faqs = [
    {
      q: "Why is Decision Intelligence considered the leading solution in the India AI email assistant market?",
      a: "Unlike generic black-box AI tools, Decision Intelligence uses explainable AI, offering users a clear 'Decision Rationale' before sending or delegating. Coupled with deep integration for Indian business workflows and local regulatory standards, it provides unparalleled control over enterprise communication."
    },
    {
      q: "Is Decision Intelligence compliant with the Indian Digital Personal Data Protection (DPDP) Act, 2023?",
      a: "Yes. Data privacy is our highest priority. All data parsed by our neural models is encrypted in transit and at rest using AES-256 standards. Our secure Google OAuth setup uses granular permissions, ensuring strict alignment with the DPDP consent frameworks."
    },
    {
      q: "How does the timezone-aware delegation feature benefit remote teams in India?",
      a: "Indian tech hubs frequently collaborate with Western offices (USA, UK). Our AI automatically parses email context and models timeline summaries, preparing perfect handover logs and response recommendations optimized for regional deadlines across timezones."
    },
    {
      q: "Does it support local English idioms and professional contexts?",
      a: "Yes, our models are trained to adapt to regional context. They support standard Indian professional communication styles as well as global templates, ensuring your drafts sound natural, respectful, and clear to international clients."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      
      {/* Sticky Navigation */}
      <Navbar />

      <main className="relative pt-36">
        
        {/* Animated Background Orbs */}
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-[600px] right-1/4 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none -z-10" />

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold tracking-wide text-indigo-400">
              <Award className="w-3.5 h-3.5" /> Market Leadership Report 2026
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-tight max-w-4xl mx-auto">
              Leading the India AI Email Assistant Market
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Why Indian startups, tech hubs, and elite professionals choose Decision Intelligence to automate context-rich, secure, and compliant email management.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Link 
              href="/dashboard" 
              className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold flex items-center justify-center gap-2 text-base transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99]"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#market-details" 
              className="h-14 px-8 border border-white/10 hover:border-white/20 text-gray-300 bg-white/5 rounded-full font-bold flex items-center justify-center gap-2 text-base transition-all hover:bg-white/10 active:scale-[0.99]"
            >
              Read Market Dynamics
            </a>
          </motion.div>
        </section>

        {/* MARKET STATS / KEY METRICS */}
        <section className="py-12 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            
            <div className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl space-y-2">
              <TrendingUp className="w-6 h-6 text-indigo-400 mx-auto" />
              <div className="text-4xl md:text-5xl font-extrabold text-white">4.8x</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Email Volume Acceleration
              </div>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Typical professional inbox traffic increase in India&apos;s digital workforce over 2 years.
              </p>
            </div>

            <div className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl space-y-2">
              <Clock className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="text-4xl md:text-5xl font-extrabold text-white">45m</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Daily Workspace Hours Saved
              </div>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Time saved on thread sorting, draft synthesis, and manual calendar follow-up audits.
              </p>
            </div>

            <div className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl space-y-2">
              <Shield className="w-6 h-6 text-purple-400 mx-auto" />
              <div className="text-4xl md:text-5xl font-extrabold text-white">100%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                DPDP Data Consent Compliant
              </div>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Fully aligned with Indian Digital Personal Data Protection guidelines, ensuring local sovereignty.
              </p>
            </div>

          </div>
        </section>

        {/* MARKET DYNAMICS & DRIVERS */}
        <section id="market-details" className="py-20 bg-white/[0.01] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Answering the Needs of the Growing India AI Email Assistant Market
              </h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
                As India solidifies its position as a global technology powerhouse, the volume of digital correspondence managed by Indian enterprises, founders, and cross-border teams has surged exponentially. Traditional inbox clients are no longer sufficient to separate signal from noise.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Cross-Border Continuity</h4>
                    <p className="text-sm text-gray-400">
                      Seamless coordination between teams on IST (Indian Standard Time) and Western partners, eliminating lag in communications.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">DPDP Regulatory Alignment</h4>
                    <p className="text-sm text-gray-400">
                      Local compliance with data-consent guidelines under the new Indian DPDP Act of 2023, protecting sensitive user data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Deliverability Shielding</h4>
                    <p className="text-sm text-gray-400">
                      Indian corporate emails frequently trigger strict global ISP spam filters. Our built-in checker stops deliverability issues before they occur.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* High-fidelity feature card */}
            <div className="lg:col-span-6 bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold text-sm uppercase tracking-wider text-indigo-400">Explainable AI Core</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 rounded-full">
                    DPDP Secure
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider">AI Suggested Draft</span>
                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                      &quot;Hi Siddharth, I have compiled the client onboarding numbers for the Delhi and Bengaluru offices as requested. Let&apos;s align on the compliance sheet today.&quot;
                    </p>
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-2xl">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">Decision Rationale</span>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      - Triggered by Siddharth&apos;s email sent at 10:30 AM IST asking for regional updates.<br />
                      - Verified: Compliance sheet attachment reference exists in the active workspace.<br />
                      - Verified: Regional vocabulary conforms to standard professional templates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* COMPARISON MATRIX */}
        <section className="py-20 max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Why We Lead the Market
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Compare how Decision Intelligence fares against generic email tools and standard CRM integrations.
            </p>
          </div>

          <div className="overflow-x-auto border border-white/10 rounded-3xl bg-white/[0.01]">
            <table className="w-full text-left border-collapse min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-5 font-bold text-white text-base">Key Feature</th>
                  <th className="p-5 font-bold text-indigo-400 text-base">Decision Intelligence</th>
                  <th className="p-5 font-bold text-gray-400 text-base">Generic AI Wrappers</th>
                  <th className="p-5 font-bold text-gray-400 text-base">Traditional CRM Bots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-5 font-medium text-white">Explainable AI (Decision Rationale)</td>
                  <td className="p-5 text-indigo-400 font-bold"><Check className="w-5 h-5" /></td>
                  <td className="p-5 text-gray-600">—</td>
                  <td className="p-5 text-gray-600">—</td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-white">DPDP Act (India) Compliance</td>
                  <td className="p-5 text-indigo-400 font-bold"><Check className="w-5 h-5" /></td>
                  <td className="p-5 text-red-500/70 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Risk</td>
                  <td className="p-5 text-gray-600">—</td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-white">ISP Spam-Filter Auditing</td>
                  <td className="p-5 text-indigo-400 font-bold"><Check className="w-5 h-5" /></td>
                  <td className="p-5 text-gray-600">—</td>
                  <td className="p-5 text-indigo-400 font-bold"><Check className="w-5 h-5" /></td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-white">Timezone-Aware Thread Delegation</td>
                  <td className="p-5 text-indigo-400 font-bold"><Check className="w-5 h-5" /></td>
                  <td className="p-5 text-gray-600">—</td>
                  <td className="p-5 text-gray-600">—</td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-white">14-Day Shadow Mode (Style Matching)</td>
                  <td className="p-5 text-indigo-400 font-bold"><Check className="w-5 h-5" /></td>
                  <td className="p-5 text-gray-600">—</td>
                  <td className="p-5 text-gray-600">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* MARKET FAQ SECTION */}
        <section className="py-20 bg-white/[0.01] border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
                FAQ & Insights
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Market FAQs
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQAccordionItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-20 max-w-5xl mx-auto px-6">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] text-white p-12 md:p-16 shadow-2xl overflow-hidden text-center space-y-6">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Own your inbox. Dominate your market.
            </h3>
            <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Experience why we lead the India AI email assistant market. Connect your corporate Google account in under 2 minutes and start with our 14-day shadow mode learning today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="/dashboard" 
                className="h-12 px-8 bg-white hover:bg-gray-100 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-1.5 text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/contact" 
                className="h-12 px-8 border border-white/25 hover:border-white/40 text-white rounded-xl font-bold flex items-center justify-center text-sm hover:bg-white/5 transition-all"
              >
                Book Enterprise Demo
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Dark Footer */}
      <Footer />

    </div>
  );
}
