'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-background/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 relative overflow-hidden shrink-0">
                            <Image src="/logo.png" alt="Decision Intelligence Logo" fill className="object-contain invert" />
                        </div>
                        <span className="font-semibold text-[15px] tracking-tight text-foreground hidden sm:block">Decision Intelligence</span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden lg:flex items-center gap-8"
                >
                    <Link href="/features" className={`text-[15px] font-medium transition-colors ${pathname === '/features' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Features</Link>
                    <Link href="/how-it-works" className={`text-[15px] font-medium transition-colors ${pathname === '/how-it-works' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Process</Link>
                    <Link href="/safety" className={`text-[15px] font-medium transition-colors ${pathname === '/safety' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Safety</Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 shrink-0"
                >
                    <Button variant="tertiary" asChild className="hidden sm:inline-flex">
                        <Link href="/login">Log in</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard">Deploy Engine</Link>
                    </Button>
                </motion.div>
            </div>
        </nav>
    );
}
