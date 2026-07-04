'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-16 px-12 border-t border-border bg-background text-body">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="space-y-6 md:w-1/4">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Decision Intelligence" width={32} height={32} className="opacity-90 invert" />
                        <span className="font-semibold text-[15px] text-foreground">Decision Intelligence</span>
                    </div>
                    <p className="text-body text-[15px] max-w-xs leading-[1.47]">
                        The world's most advanced AI email decision layer. Built for the global professional workforce.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 w-full md:w-3/4">
                    <div className="space-y-4">
                        <h4 className="text-[12px] font-semibold uppercase tracking-[0.96px] text-foreground">Market Focus</h4>
                        <ul className="space-y-2 text-[15px] text-body leading-[1.47]">
                            <li><span className="hover:text-foreground transition-colors cursor-pointer">USA & Canada AI Tools</span></li>
                            <li><span className="hover:text-foreground transition-colors cursor-pointer">UK & Europe Email AI</span></li>
                            <li><span className="hover:text-foreground transition-colors cursor-pointer">Enterprise SaaS Excellence</span></li>
                            <li><span className="hover:text-foreground transition-colors cursor-pointer">Global AI Mailing</span></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[12px] font-semibold uppercase tracking-[0.96px] text-foreground">Platform</h4>
                        <ul className="space-y-2 text-[15px] text-body leading-[1.47]">
                            <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">Process</Link></li>
                            <li><Link href="/safety" className="hover:text-foreground transition-colors">Safety</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[12px] font-semibold uppercase tracking-[0.96px] text-foreground">Legal</h4>
                        <ul className="space-y-2 text-[15px] text-body leading-[1.47]">
                            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Engineering</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[12px] font-semibold uppercase tracking-[0.96px] text-foreground">Social</h4>
                        <ul className="space-y-2 text-[15px] text-body leading-[1.47]">
                            <li><a href="#" className="hover:text-foreground transition-colors">Twitter (X)</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-border flex flex-col md:flex-row justify-between text-[12px] text-muted-foreground font-semibold uppercase tracking-[0.96px] gap-4">
                <span>© 2026 Decision Intelligence Global Labs.</span>
                <span>Designed for Worldwide Impact • Powered by Neural Logic</span>
            </div>
        </footer>
    );
}
