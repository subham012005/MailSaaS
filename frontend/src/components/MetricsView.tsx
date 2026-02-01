'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Clock, ShieldCheck, ArrowUpRight, Activity, Target } from 'lucide-react';

interface MetricsViewProps {
    metrics: any;
}

export default function MetricsView({ metrics }: MetricsViewProps) {
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
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                            <BarChart3 className="w-6 h-6 text-pink-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Analytics
                        </h1>
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
                                        By using AI corrections, you've maintained a <span className="text-emerald-400 font-bold">{(safeMetrics.accuracy * 100).toFixed(0)}%</span> accuracy rate while reducing manual drafting time.
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
            </div>
        </div>
    );
}
