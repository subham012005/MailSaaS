'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Send, ChevronRight } from 'lucide-react';

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

    const presetOptions = [
        { id: 'tomorrow-morning', label: 'Tomorrow Morning', sublabel: '9:00 AM' },
        { id: 'tomorrow-afternoon', label: 'Tomorrow Afternoon', sublabel: '2:00 PM' },
        { id: 'monday-morning', label: 'Monday Morning', sublabel: '9:00 AM' },
        { id: 'next-week', label: 'Next Week', sublabel: '7 days from now' },
    ];

    const handleSchedule = () => {
        let scheduledTime: Date;

        if (showCustom && customDate && customTime) {
            scheduledTime = new Date(`${customDate}T${customTime}`);
        } else if (selectedPreset) {
            scheduledTime = getPresetTime(selectedPreset);
        } else {
            return; // No selection made
        }

        onSchedule(scheduledTime);
        onClose();
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal - Full screen on mobile, centered on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                                   w-full md:w-[500px] md:max-h-[90vh] 
                                   bg-background border-0 md:border md:border-border md:rounded-2xl 
                                   shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="shrink-0 p-6 border-b border-border bg-muted/5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Schedule Send</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted/20 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {emailSubject && (
                                <p className="text-sm text-muted-foreground truncate">
                                    Re: {emailSubject}
                                </p>
                            )}
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Preset Options */}
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Quick Options
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {presetOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSelectedPreset(option.id);
                                                setShowCustom(false);
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all text-left min-h-[88px] ${selectedPreset === option.id && !showCustom
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50 bg-muted/5'
                                                }`}
                                        >
                                            <div className="font-bold text-sm text-foreground mb-1">
                                                {option.label}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {option.sublabel}
                                            </div>
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
                                    }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                             border-border hover:border-primary/50 bg-muted/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <span className="font-bold text-sm text-foreground">Custom Date & Time</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showCustom ? 'rotate-90' : ''}`} />
                                </button>

                                {showCustom && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 space-y-3"
                                    >
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={customDate}
                                                onChange={(e) => setCustomDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 bg-muted/10 border border-border rounded-xl 
                                                         text-foreground focus:border-primary focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                Time
                                            </label>
                                            <input
                                                type="time"
                                                value={customTime}
                                                onChange={(e) => setCustomTime(e.target.value)}
                                                className="w-full px-4 py-3 bg-muted/10 border border-border rounded-xl 
                                                         text-foreground focus:border-primary focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Preview */}
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                                    Scheduled For
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                    {formatPreviewTime()}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="shrink-0 p-6 border-t border-border bg-muted/5 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold 
                                         text-muted-foreground hover:text-foreground 
                                         hover:bg-muted/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={!selectedPreset && (!showCustom || !customDate || !customTime)}
                                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold 
                                         bg-primary text-primary-foreground 
                                         hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                                         transition-all flex items-center justify-center gap-2
                                         shadow-lg shadow-primary/20"
                            >
                                <Send className="w-4 h-4" />
                                Schedule Send
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
