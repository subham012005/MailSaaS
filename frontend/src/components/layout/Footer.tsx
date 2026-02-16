'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-16 md:py-24 border-t border-white/5 relative z-10 bg-black/50 backdrop-blur-3xl text-[#f5f5f7]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Decision Intelligence" width={32} height={32} className="opacity-80" />
                        <span className="font-bold text-lg text-white">Decision Intelligence</span>
                    </div>
                    <p className="text-[#86868b] text-sm max-w-xs">
                        The world&apos;s most advanced AI email decision layer. Built for the global professional workforce.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white">Market Focus</h4>
                        <ul className="space-y-2 text-sm text-[#86868b]">
                            <li><span className="hover:text-white transition-colors">USA & Canada AI Tools</span></li>
                            <li><span className="hover:text-white transition-colors">UK & Europe Email AI</span></li>
                            <li><span className="hover:text-white transition-colors">Enterprise SaaS Excellence</span></li>
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
    );
}
