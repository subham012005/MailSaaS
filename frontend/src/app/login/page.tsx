'use client';

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mail, LogIn, ChevronRight, Lock, Shield, Sparkles, Rocket, Target } from "lucide-react";
import { showNotification } from "@/lib/notifications";

// React Bits Components
import Squares from "@/components/ui/squares";
import DecryptedText from "@/components/ui/decrypted-text";
import ShinyText from "@/components/ui/shiny-text";

const SLIDES = [
    {
        id: '1',
        title: 'SmartEmail AI',
        description: 'Next-gen decision intelligence that understands your context and masters your inbox.',
        icon: Brain,
        color: 'from-indigo-500 to-purple-500'
    },
    {
        id: '2',
        title: 'Delegation Master',
        description: 'Securely delegate emails and oversee your team with AI-powered clarity.',
        icon: Rocket,
        color: 'from-emerald-500 to-teal-500'
    },
    {
        id: '3',
        title: 'Impact Analytics',
        description: 'Track your productivity growth and decision accuracy with smart metrics.',
        icon: Target,
        color: 'from-orange-500 to-rose-500'
    },
];

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        setIsMounted(true);
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    if (!isMounted || status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">

            {/* Premium Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <Squares
                    direction="diagonal"
                    speed={0.3}
                    squareSize={50}
                    borderColor="rgba(120, 110, 255, 0.2)"
                    hoverFillColor="rgba(120, 110, 255, 0.05)"
                />
            </div>

            <div className="max-w-[400px] w-full space-y-10 md:space-y-12 relative z-10">

                {/* Carousel Section */}
                <div className="relative h-[250px] md:h-[300px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="flex flex-col items-center text-center space-y-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                                <img src="/logo.png" alt="SmartEmail Logo" className="relative w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                    <DecryptedText
                                        text={SLIDES[currentSlide].title}
                                        speed={40}
                                        maxIterations={5}
                                        sequential
                                        animateOn="view"
                                    />
                                </h1>
                                <p className="text-gray-400 text-sm max-w-[280px] leading-relaxed">
                                    {SLIDES[currentSlide].description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination Dots */}
                    <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {SLIDES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-indigo-500' : 'w-4 bg-white/10'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Action Section */}
                <div className="space-y-4 pt-4">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => signIn("google")}
                        className="w-full bg-white text-black font-bold py-4 rounded-full flex items-center justify-center gap-3 shadow-xl hover:bg-gray-100 transition-all border-b-4 border-gray-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => showNotification("Other options coming soon!", { type: 'info' })}
                        className="w-full bg-black border border-white/10 font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/5 transition-colors relative group text-gray-400"
                    >
                        <ShinyText text="More Options" speed={4} />
                        <ChevronRight className="w-4 h-4" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-full">
                            <span className="text-[10px] uppercase font-bold text-indigo-400">Coming Soon</span>
                        </div>
                    </motion.button>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center pt-8 md:pt-12 opacity-30">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">OAuth 2.0 Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Intelligence Lab</span>
                    </div>
                </div>
            </div>
        </div >
    );
}
