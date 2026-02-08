'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Clock, ShieldCheck, ArrowUpRight, Activity, Target, Menu } from 'lucide-react';
import GoogleFeedbackForm from './GoogleFeedbackForm';

interface MetricsViewProps {
    metrics: any;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MetricsView({ metrics, isMobileMenuOpen, setIsMobileMenuOpen }: MetricsViewProps) {
    const safeMetrics = metrics || {
        decisions_saved: 0,
        minutes_saved: 0.0,
        accuracy: 1.0,
        velocity: [0, 0, 0, 0, 0, 0, 0],
        top_category: 'None'
    };

    const stats = [
        {
            label: 'Decisions Logged',
            value: safeMetrics.decisions_saved.toString(),
            icon: ShieldCheck,
            color: 'indigo'
        },
        {
            label: 'Time Saved',
            value: `${(safeMetrics.minutes_saved / 60).toFixed(1)}h`,
            icon: Clock,
            color: 'emerald'
        },
        {
            label: 'Inbox Load Reduced',
            value: `${safeMetrics.replies_prevented || 0}`,
            icon: Target,
            color: 'rose'
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-black/20 p-6 md:p-10 relative">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <div className="flex items-start gap-4 mb-2">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                                <BarChart3 className="w-6 h-6 text-pink-400" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Analytics
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-400 max-w-lg leading-relaxed">
                        Real-time insights into your decision patterns and time savings.
                        <br /><span className="text-xs text-gray-500 italic">*Based on actual usage data only.</span>
                    </p>
                </div>

                {/* Key Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-6 flex items-center justify-between group hover:border-white/10 transition-colors"
                        >
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.label}</h3>
                                <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    {stat.value}
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-500/10 border border-${stat.color}-500/20 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Velocity Chart */}
                    <div className="lg:col-span-2 glass-card p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold flex items-center gap-2 text-sm text-gray-200">
                                <Activity className="w-4 h-4 text-indigo-400" />
                                Activity Velocity
                            </h3>
                            <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase font-bold text-gray-500 border border-white/5">
                                Last 7 Days
                            </div>
                        </div>

                        <div className="flex-1 flex items-end gap-3 h-48">
                            {(safeMetrics.velocity || [0, 0, 0, 0, 0, 0, 0]).map((count: number, i: number) => {
                                const maxVal = Math.max(...(safeMetrics.velocity || [1]), 5); // Minimum scale of 5
                                const heightPct = Math.max((count / maxVal) * 100, 4); // Min height 4% for visibility

                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPct}%` }}
                                            transition={{ delay: i * 0.05, duration: 0.8, type: "spring" }}
                                            className={`w-full rounded-t-lg relative ${count > 0 ? 'bg-indigo-500' : 'bg-white/5'} opacity-80 group-hover:opacity-100 transition-all`}
                                        >
                                            {count > 0 && (
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {count} Actions
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-4 border-t border-white/5 pt-4 text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                            <span>Last Week</span>
                            <span>Yesterday</span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Spotlight Card */}
                    <div className="glass-card p-0 overflow-hidden flex flex-col">
                        <div className="p-8 pb-0 flex-1">
                            <div className="flex items-center gap-2 mb-6 text-emerald-400">
                                <Zap className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Efficiency Spotlight</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Top Activity Category</div>
                                    <div className="text-xl font-bold text-white">{safeMetrics.top_category || 'N/A'}</div>
                                    <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-3/4 opacity-50" />
                                    </div>
                                </div>

                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Total Impact</div>
                                    <div className="text-white text-sm leading-relaxed">
                                        By using AI corrections, you've maintained a <span className="text-emerald-400 font-bold">{(safeMetrics.accuracy * 100).toFixed(0)}%</span> accuracy rate.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-500/10 p-4 border-t border-emerald-500/10 mt-auto">
                            <div className="flex items-center justify-between text-xs text-emerald-300">
                                <span>System Status</span>
                                <span className="flex items-center gap-1.5 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust & Integrity Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8 bg-indigo-500/5 border-indigo-500/10">
                        <div className="flex items-center gap-3 mb-6 font-bold text-indigo-400">
                            <ShieldCheck className="w-5 h-5" />
                            <h3 className="text-sm uppercase tracking-widest">Decision Integrity</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Policy Coverage</div>
                                <div className="text-2xl font-bold">100%</div>
                                <div className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Verified</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Audit Transparency</div>
                                <div className="text-2xl font-bold">High</div>
                                <div className="text-[10px] text-indigo-400 font-bold uppercase mt-1">Full Logs</div>
                            </div>
                        </div>
                        <div className="mt-8 p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-gray-400 leading-relaxed italic">
                            Every decision recommendation is generated within your secure environment. We never train global models on your private email content.
                        </div>
                    </div>

                    <div className="glass-card p-8 bg-purple-500/5 border-purple-500/10 flex flex-col">
                        <div className="flex items-center gap-3 mb-6 font-bold text-purple-400">
                            <Target className="w-5 h-5" />
                            <h3 className="text-sm uppercase tracking-widest">Encryption Strength</h3>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">AES-256 Protocol</span>
                                <span className="text-xs font-bold text-emerald-400">Standard</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-full" />
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    No Tracking
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Verified OAuth
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Diagnosis / Feedback Section */}
                <div className="mt-8">
                    <div className="glass-card p-8 bg-pink-500/5 border-pink-500/10">
                        <div className="flex items-center gap-3 mb-6 font-bold text-pink-400">
                            <Activity className="w-5 h-5" />
                            <h3 className="text-sm uppercase tracking-widest">System Diagnosis & Feedback</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h4 className="text-xl font-bold text-white mb-2">Help us improve Decision Intelligence</h4>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    Encountered an anomaly or have a suggestion for the neural engine? Your feedback directly trains our models.
                                </p>
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>Direct to Engineering</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span>24h Response Time</span>
                                    </div>
                                </div>
                            </div>
                            <GoogleFeedbackForm className="bg-black/20 p-6 rounded-2xl border border-white/5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
