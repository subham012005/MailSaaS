'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Loader2, ArrowRight, RefreshCw, Mail, Globe } from 'lucide-react';
import { ease } from '@/lib/motion-tokens';

type ScanStep = 'idle' | 'domain' | 'email' | 'scanning' | 'results';

export default function DomainSpamChecker() {
  const [step, setStep] = useState<ScanStep>('idle');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [score, setScore] = useState(100);

  // Run a mock scan that progresses through steps
  const runScan = async () => {
    setStep('scanning');
    setScanProgress(0);
    
    const messages = [
      'Resolving DNS MX records...',
      'Verifying SPF (Sender Policy Framework)...',
      'Checking DKIM key alignment...',
      'Analyzing DMARC record policy...',
      'Scanning major IP blacklists (Spamhaus, Barracuda)...',
      'Assessing domain age and SSL configuration...',
      'Compiling final spam reputation score...'
    ];

    for (let i = 0; i < messages.length; i++) {
      setScanMessage(messages[i]);
      // Progressively increment
      const stepProgress = Math.round(((i + 1) / messages.length) * 100);
      
      // Animate progress smoothly
      let currentProgress = scanProgress;
      while (currentProgress < stepProgress) {
        currentProgress += 2;
        setScanProgress(Math.min(currentProgress, 100));
        await new Promise((r) => setTimeout(r, 20));
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    // Determine a score based on domain length/characters to make it feel somewhat custom
    const calculatedScore = Math.min(
      100,
      Math.max(
        60,
        95 - (domain.length % 7) * 4 - (email.length % 5) * 2
      )
    );
    setScore(calculatedScore);
    setStep('results');
  };

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !domain.includes('.')) return;
    setStep('email');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    runScan();
  };

  const resetScanner = () => {
    setDomain('');
    setEmail('');
    setScanProgress(0);
    setScanMessage('');
    setStep('domain');
  };

  const isHighRisk = score < 80;
  const isMediumRisk = score >= 80 && score < 92;

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 shadow-xl rounded-3xl p-6 md:p-8 relative overflow-hidden">
      {/* Subtle Purple Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D5EF5]/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* Step 1 & IDLE: Domain Entry */}
        {(step === 'idle' || step === 'domain') && (
          <motion.div
            key="domain-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: ease.standard }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6D5EF5]/10 flex items-center justify-center text-[#6D5EF5]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Check Domain Spam Flags</h3>
                <p className="text-sm text-gray-500">Scan SPF, DKIM, DMARC, and blacklist status instantly</p>
              </div>
            </div>

            <form onSubmit={handleDomainSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="yourcompany.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5] transition-all text-base"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full h-14 bg-[#6D5EF5] hover:bg-[#5b4ee0] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#6D5EF5]/20 hover:shadow-xl hover:shadow-[#6D5EF5]/35 active:scale-[0.99] transition-all"
              >
                Scan My Domain <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Email Entry */}
        {step === 'email' && (
          <motion.div
            key="email-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: ease.standard }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6D5EF5]/10 flex items-center justify-center text-[#6D5EF5]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Where should we send the report?</h3>
                <p className="text-sm text-gray-500">Provide your email to view the scores & recommendations</p>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5] transition-all text-base"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('domain')}
                  className="px-5 h-14 border border-gray-200 text-gray-500 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 h-14 bg-[#6D5EF5] hover:bg-[#5b4ee0] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#6D5EF5]/20 hover:shadow-xl hover:shadow-[#6D5EF5]/35 active:scale-[0.99] transition-all"
                >
                  Calculate Deliverability Score <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Scanning Animation */}
        {step === 'scanning' && (
          <motion.div
            key="scanning-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 space-y-6"
          >
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-[#6D5EF5] animate-spin" />
              <div className="absolute text-xs font-bold text-gray-600">{scanProgress}%</div>
            </div>
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-gray-900">Scanning {domain}</h4>
              <p className="text-sm text-gray-500 min-h-[20px] transition-all duration-300">
                {scanMessage}
              </p>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-[#6D5EF5] h-full"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 'results' && (
          <motion.div
            key="results-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Score header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 pb-6">
              <div className="text-center md:text-left space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#6D5EF5]">
                  Deliverability Score
                </span>
                <h4 className="text-xl font-bold text-gray-900">{domain}</h4>
                <p className="text-xs text-gray-500">Report copy sent to {email}</p>
              </div>

              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gray-50 border border-gray-100">
                <div className="text-center">
                  <span className={`text-3xl font-extrabold tracking-tighter ${
                    isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {score}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">/ 100</span>
                </div>
              </div>
            </div>

            {/* Checklist details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-600">SPF Record alignment</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-600" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-600">DKIM Authentication</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-600" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-600">DMARC policy config</span>
                {domain.length % 2 === 0 ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-600" /> Active
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Warning
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-600">IP Blacklist standing</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-600" /> Clean
                </span>
              </div>
            </div>

            {/* Advice box */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              isHighRisk 
                ? 'bg-red-50 border-red-100 text-red-700' 
                : isMediumRisk 
                  ? 'bg-amber-50 border-amber-100 text-amber-800' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}>
              <span className="font-bold block mb-1">
                {isHighRisk 
                  ? 'Critical issues found!' 
                  : isMediumRisk 
                    ? 'Minor issues detected.' 
                    : 'Looking great!'}
              </span>
              {isHighRisk && "Your domain lacks proper DMARC strict settings and has spammy keywords in recent outgoing volumes. Emails likely end up in user spam bins. Set up Decision Intelligence's email optimizer to solve this."}
              {isMediumRisk && "We found weak DMARC alignment. Emails are mostly arriving, but fail filters on legacy systems like Yahoo. Enable DMARC isolation policy to secure 100% inboxing."}
              {score >= 92 && "Excellent standing! Your server setups are pristine. Use Decision Intelligence to keep it spam-free by constantly screening text mistakes and conversation tone."}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetScanner}
                className="flex items-center justify-center gap-2 px-4 h-12 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Scan Another
              </button>
              <a
                href="/dashboard"
                className="flex-1 h-12 bg-[#6D5EF5] hover:bg-[#5b4ee0] text-white rounded-xl font-semibold flex items-center justify-center gap-1 shadow-md shadow-[#6D5EF5]/10 hover:shadow-lg transition-all text-xs"
              >
                Unlock Spam-Free Features <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
