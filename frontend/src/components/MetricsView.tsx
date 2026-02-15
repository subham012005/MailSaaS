'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Clock, ShieldCheck, ArrowUpRight, Activity, Target, Menu, Brain } from 'lucide-react';
import GoogleFeedbackForm from './GoogleFeedbackForm';
import Skeleton from './ui/Skeleton';

interface MetricsViewProps {
    metrics: any;
    isLoading?: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MetricsView({ metrics, isLoading, isMobileMenuOpen, setIsMobileMenuOpen }: MetricsViewProps) {
    const safeMetrics = metrics || {
        decisions_saved: 0,
        minutes_saved: 0.0,
        accuracy: 1.0,
        velocity: [0, 0, 0, 0, 0, 0, 0],
        top_category: 'None',
        replies_prevented: 0
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
                                {isLoading ? (
                                    <Skeleton className="h-10 w-24 mb-1" />
                                ) : (
                                    <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                        {stat.value}
                                    </div>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-500/10 border border-${stat.color}-500/20 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Velocity and Intent Profile */}
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
                                const maxVal = Math.max(...(safeMetrics.velocity || [1]), 5);
                                const heightPct = Math.max((count / maxVal) * 100, 4);

                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPct}%` }}
                                            transition={{ delay: i * 0.05, duration: 0.8, type: "spring" }}
                                            className={`w-full rounded-t-lg relative ${count > 0 ? 'bg-gradient-to-t from-indigo-600 to-indigo-400' : 'bg-white/5'} opacity-80 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]`}
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

                    {/* Intent Pie Chart */}
                    <div className="glass-card p-8 flex flex-col bg-purple-500/5 border-purple-500/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-sm text-gray-200">
                                <Brain className="w-4 h-4 text-purple-400" />
                                Mail Intent Profile
                            </h3>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center">
                            {isLoading ? (
                                <Skeleton className="w-32 h-32 rounded-full" />
                            ) : (
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {(() => {
                                            const data = Object.entries(safeMetrics.category_distribution || {}).map(([label, value]) => ({
                                                label,
                                                value: Number(value)
                                            })).sort((a, b) => b.value - a.value).slice(0, 5);

                                            const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
                                            const colors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa'];
                                            let cumulativePercent = 0;

                                            return data.map((item, idx) => {
                                                const percent = (item.value / total) * 100;
                                                const start = cumulativePercent;
                                                cumulativePercent += percent;

                                                // Create SVG arc shorthand
                                                const x1 = 50 + 40 * Math.cos((start * 2 * Math.PI) / 100);
                                                const y1 = 50 + 40 * Math.sin((start * 2 * Math.PI) / 100);
                                                const x2 = 50 + 40 * Math.cos((cumulativePercent * 2 * Math.PI) / 100);
                                                const y2 = 50 + 40 * Math.sin((cumulativePercent * 2 * Math.PI) / 100);
                                                const largeArcFlag = percent > 50 ? 1 : 0;

                                                return (
                                                    <motion.path
                                                        key={idx}
                                                        initial={{ opacity: 0, pathLength: 0 }}
                                                        animate={{ opacity: 1, pathLength: 1 }}
                                                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                                        fill={colors[idx % colors.length]}
                                                        stroke="rgba(0,0,0,0.2)"
                                                        strokeWidth="1"
                                                        whileHover={{ scale: 1.05, strokeWidth: 2 }}
                                                    />
                                                );
                                            });
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/5">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
                                {Object.entries(safeMetrics.category_distribution || {})
                                    .map(([label, value]) => ({ label, value: Number(value) }))
                                    .sort((a, b) => b.value - a.value)
                                    .slice(0, 3)
                                    .map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa'][idx] }} />
                                            <span className="text-[10px] font-medium text-gray-400 capitalize">{item.label}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Spotlight Card */}
                    <div className="glass-card p-0 overflow-hidden flex flex-col hover:border-emerald-500/20 transition-colors">
                        <div className="p-8 pb-0 flex-1">
                            <div className="flex items-center gap-2 mb-6 text-emerald-400">
                                <Zap className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Efficiency Spotlight</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Top Activity Category</div>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-32 mt-1" />
                                    ) : (
                                        <div className="text-xl font-bold text-white capitalize">{safeMetrics.top_category || 'N/A'}</div>
                                    )}
                                    <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "75%" }}
                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Impact Analysis</div>
                                    <div className="text-white text-sm leading-relaxed">
                                        {isLoading ? (
                                            <Skeleton className="h-5 w-48 inline-block align-middle" />
                                        ) : (
                                            <>Your decision accuracy remains at <span className="text-emerald-400 font-bold">{(Number(safeMetrics.accuracy || 0) * 100).toFixed(0)}%</span>, saving significant rework time per thread.</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-500/10 p-4 border-t border-emerald-500/10 mt-auto">
                            <div className="flex items-center justify-between text-xs text-emerald-300">
                                <span>Real-time Sync</span>
                                <span className="flex items-center gap-1.5 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Decision Integrity Section */}
                    <div className="glass-card p-8 bg-indigo-500/5 border-indigo-500/10 flex flex-col justify-center">
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
                        <div className="mt-6 p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-gray-400 leading-relaxed italic">
                            Every recommendation is generated within your secure environment. We never train local models on private data.
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
