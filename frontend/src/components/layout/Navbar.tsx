'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                            <Image src="/logo.png" alt="Decision Intelligence Logo" fill className="object-contain p-1.5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Decision Intelligence</span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden md:flex items-center gap-10 px-8 py-3 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl"
                >
                    <Link href="/features" className={`text-sm font-medium transition-colors ${pathname === '/features' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Features</Link>
                    <Link href="/how-it-works" className={`text-sm font-medium transition-colors ${pathname === '/how-it-works' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Process</Link>
                    <Link href="/safety" className={`text-sm font-medium transition-colors ${pathname === '/safety' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Safety</Link>
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
    );
}
