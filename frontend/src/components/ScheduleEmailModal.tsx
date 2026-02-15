'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Send, ChevronRight, Plus, AlertCircle } from 'lucide-react';

interface ScheduleEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (scheduledTime: Date) => void;
    emailSubject?: string;
}

export default function ScheduleEmailModal({
    isOpen,
    onClose,
    onSchedule,
    emailSubject
}: ScheduleEmailModalProps) {
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [customDate, setCustomDate] = useState('');
    const [customTime, setCustomTime] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize with current time + 2 mins (to ensure it's in the future)
    useEffect(() => {
        if (isOpen) {
            const defaultTime = new Date();
            defaultTime.setMinutes(defaultTime.getMinutes() + 2);

            const dateStr = defaultTime.toISOString().split('T')[0];
            const timeStr = defaultTime.toTimeString().split(' ')[0].substring(0, 5);

            setCustomDate(dateStr);
            setCustomTime(timeStr);
            setError(null);
            setShowCustom(false);
            setSelectedPreset(null);
        }
    }, [isOpen]);

    const getPresetTime = (preset: string): Date => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (preset) {
            case 'tomorrow-morning':
                tomorrow.setHours(9, 0, 0, 0);
                return tomorrow;
            case 'tomorrow-afternoon':
                tomorrow.setHours(14, 0, 0, 0);
                return tomorrow;
            case 'monday-morning':
                const monday = new Date(now);
                const daysUntilMonday = (8 - monday.getDay()) % 7 || 7;
                monday.setDate(monday.getDate() + daysUntilMonday);
                monday.setHours(9, 0, 0, 0);
                return monday;
            case 'next-week':
                const nextWeek = new Date(now);
                nextWeek.setDate(nextWeek.getDate() + 7);
                nextWeek.setHours(9, 0, 0, 0);
                return nextWeek;
            default:
                return tomorrow;
        }
    };

    const addMinutes = (mins: number) => {
        const current = (showCustom && customDate && customTime)
            ? new Date(`${customDate}T${customTime}`)
            : new Date();

        const updated = new Date(current.getTime() + mins * 60000);
        setCustomDate(updated.toISOString().split('T')[0]);
        setCustomTime(updated.toTimeString().split(' ')[0].substring(0, 5));
        setShowCustom(true);
        setSelectedPreset(null);
        setError(null);
    };

    const presetOptions = [
        { id: 'tomorrow-morning', label: 'Tomorrow Morning', sublabel: '9:00 AM' },
        { id: 'tomorrow-afternoon', label: 'Tomorrow Afternoon', sublabel: '2:00 PM' },
        { id: 'monday-morning', label: 'Monday Morning', sublabel: '9:00 AM' },
        { id: 'next-week', label: 'Next Week', sublabel: '7 days from now' },
    ];

    const validateTime = (time: Date): boolean => {
        const now = new Date();
        if (time.getTime() <= now.getTime()) {
            setError("Cannot schedule an email in the past");
            return false;
        }
        setError(null);
        return true;
    };

    const handleSchedule = () => {
        let scheduledTime: Date;

        if (showCustom && customDate && customTime) {
            // Create a date object from the local date/time inputs
            // This creates a Date in the user's local timezone
            scheduledTime = new Date(`${customDate}T${customTime}`);
            console.log('📅 Custom schedule - Input:', `${customDate}T${customTime}`);
            console.log('📅 Created Date object:', scheduledTime);
            console.log('📅 ISO String (sent to backend):', scheduledTime.toISOString());
        } else if (selectedPreset) {
            scheduledTime = getPresetTime(selectedPreset);
            console.log('📅 Preset schedule:', selectedPreset, scheduledTime.toISOString());
        } else {
            return; // No selection made
        }

        if (validateTime(scheduledTime)) {
            // Pass the Date object directly - it will be serialized to ISO string
            // which includes timezone information
            onSchedule(scheduledTime);
            onClose();
        }
    };

    const formatPreviewTime = (): string => {
        let time: Date;
        if (showCustom && customDate && customTime) {
            time = new Date(`${customDate}T${customTime}`);
        } else if (selectedPreset) {
            time = getPresetTime(selectedPreset);
        } else {
            return 'Select a time to schedule';
        }

        if (isNaN(time.getTime())) return 'Invalid date selection';

        return time.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                                   w-full h-full md:h-auto md:max-h-[90vh] md:w-[480px] 
                                   bg-background/80 backdrop-blur-2xl border-0 md:border md:border-white/10 md:rounded-[2rem] 
                                   shadow-[0_0_100px_rgba(0,0,0,0.5)] z-[101] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="shrink-0 p-8 border-b border-white/5 bg-white/2">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10">
                                        <Clock className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Schedule Send</h2>
                                        <p className="text-sm text-muted-foreground/60 font-medium">Pick a convenient time</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-white/5 rounded-2xl transition-all text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {emailSubject && (
                                <div className="bg-black/20 rounded-xl px-4 py-2 border border-white/5">
                                    <p className="text-xs text-muted-foreground truncate font-medium">
                                        <span className="text-primary font-bold mr-1">RE:</span> {emailSubject}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            {/* Preset Options */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Quick Options</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {presetOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSelectedPreset(option.id);
                                                setShowCustom(false);
                                                setError(null);
                                            }}
                                            className={`group p-4 rounded-3xl border-2 transition-all text-left min-h-[96px] relative overflow-hidden ${selectedPreset === option.id && !showCustom
                                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                                                : 'border-white/5 hover:border-white/10 bg-white/2 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="relative z-10">
                                                <div className={`font-bold text-sm mb-1 transition-colors ${selectedPreset === option.id ? 'text-primary' : 'text-foreground'}`}>
                                                    {option.label}
                                                </div>
                                                <div className="text-xs text-muted-foreground/60 font-medium italic">
                                                    {option.sublabel}
                                                </div>
                                            </div>
                                            {selectedPreset === option.id && !showCustom && (
                                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Adjust Buttons */}
                            <div>
                                <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Quick Adjust</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[15, 60, 120].map((mins) => (
                                        <button
                                            key={mins}
                                            onClick={() => addMinutes(mins)}
                                            className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 text-xs font-bold text-foreground transition-all flex items-center gap-2"
                                        >
                                            <Plus className="w-3 h-3 text-primary" />
                                            +{mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Date/Time */}
                            <div>
                                <button
                                    onClick={() => {
                                        setShowCustom(!showCustom);
                                        setSelectedPreset(null);
                                        setError(null);
                                    }}
                                    className={`w-full flex items-center justify-between p-6 rounded-[1.5rem] border-2 transition-all ${showCustom
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                                        : 'border-white/5 hover:border-primary/30 bg-white/2 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl transition-colors ${showCustom ? 'bg-primary/20' : 'bg-white/5'}`}>
                                            <Calendar className={`w-5 h-5 ${showCustom ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <span className={`font-bold text-sm ${showCustom ? 'text-foreground' : 'text-muted-foreground'}`}>Pick Specific Date & Time</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-500 ${showCustom ? 'rotate-90 text-primary' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showCustom && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Date</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="date"
                                                            value={customDate}
                                                            onChange={(e) => {
                                                                setCustomDate(e.target.value);
                                                                setError(null);
                                                            }}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl 
                                                                     text-foreground focus:border-primary focus:outline-none transition-all
                                                                     group-hover:border-white/10 font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Time</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="time"
                                                            value={customTime}
                                                            onChange={(e) => {
                                                                setCustomTime(e.target.value);
                                                                setError(null);
                                                            }}
                                                            className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl 
                                                                     text-foreground focus:border-primary focus:outline-none transition-all
                                                                     group-hover:border-white/10 font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        <p className="text-xs font-bold text-red-500">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Preview */}
                            <div className="p-6 rounded-[1.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                                <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Final Confirmation</div>
                                <div className="text-sm font-bold text-foreground leading-relaxed flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {formatPreviewTime()}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 p-8 border-t border-white/5 bg-white/2 flex gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-4 rounded-2xl text-xs font-bold 
                                         text-muted-foreground hover:text-foreground 
                                         hover:bg-white/5 transition-all flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={!selectedPreset && (!showCustom || !customDate || !customTime)}
                                className="flex-[2] px-8 py-4 rounded-2xl text-xs font-bold 
                                         bg-primary text-primary-foreground 
                                         hover:brightness-110 disabled:opacity-30 disabled:grayscale
                                         transition-all flex items-center justify-center gap-3
                                         shadow-2xl shadow-primary/20 group/btn active:scale-95"
                            >
                                <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                Schedule Send
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

