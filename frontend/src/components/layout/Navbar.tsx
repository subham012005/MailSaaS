'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHomePage = pathname === '/';

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-350 ${
            scrolled 
                ? 'bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]' 
                : 'bg-transparent border-b border-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center relative overflow-hidden shadow-sm">
                            <Image src="/logo.png" alt="Decision Intelligence Logo" fill className="object-contain p-1.5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-gray-900">Decision Intelligence</span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden md:flex items-center gap-8 px-6 py-2.5 rounded-full bg-white/70 border border-[#E5E7EB] backdrop-blur-xl shadow-xs"
                >
                    <Link href={isHomePage ? '#features' : '/#features'} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#6D5EF5] transition-colors">Features</Link>
                    <Link href={isHomePage ? '#process' : '/#process'} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#6D5EF5] transition-colors">Process</Link>
                    <Link href={isHomePage ? '#testimonials' : '/#testimonials'} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#6D5EF5] transition-colors">Testimonials</Link>
                    <Link href={isHomePage ? '#faq' : '/#faq'} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#6D5EF5] transition-colors">FAQ</Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link href="/dashboard" className="h-10 px-5 bg-[#6D5EF5] hover:bg-[#5b4ee0] text-white rounded-full font-semibold flex items-center justify-center gap-2 text-xs shadow-md shadow-[#6D5EF5]/15 hover:shadow-lg transition-all active:scale-[0.98]">
                        Launch App
                    </Link>
                </motion.div>
            </div>
        </nav>
    );
}
