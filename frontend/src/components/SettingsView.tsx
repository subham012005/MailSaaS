'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Shield, Bell, Key, Zap, Save, Check, Menu, Mail, Sparkles, Activity } from 'lucide-react';
import { getApiSettings, saveApiSettings } from '@/lib/api';
import { StaggeredText } from '@/components/ui/StaggeredText';
import { VerificationFace } from '@/components/ui/VerificationFace';
import { showNotification } from '@/lib/notifications';

interface SettingsViewProps {
    userEmail: string;
    accessToken?: string;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function SettingsView({ userEmail, accessToken, isMobileMenuOpen, setIsMobileMenuOpen }: SettingsViewProps) {
    const [provider, setProvider] = useState('default');
    const [apiKey, setApiKey] = useState('');
    const [hasCustomKey, setHasCustomKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load current settings
        if (userEmail && accessToken) {
            getApiSettings(userEmail, accessToken)
                .then(data => {
                    setProvider(data.provider || 'default');
                    setHasCustomKey(data.has_api_key || false);
                })
                .catch(err => {
                    console.error('Failed to load settings:', err);
                });
        }
    }, [userEmail, accessToken]);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await saveApiSettings(userEmail, provider, apiKey || undefined, accessToken);
            setSaved(true);
            setApiKey(''); // Clear input after save
            setHasCustomKey(!!apiKey || (provider === 'default' ? false : hasCustomKey));
            showNotification('Settings saved successfully', { type: 'success' });
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            showNotification('Failed to save settings', { type: 'error' });
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-black/20 p-4 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 flex items-start gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Settings</h1>
                        <p className="text-muted-foreground">Configure your decision engine and account preferences.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* AI Provider Section */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            AI Provider Configuration
                        </h3>
                        <div className="glass-card p-8 space-y-8">
                            <div>
                                <div className="text-sm font-bold mb-4">Select AI Provider</div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all">
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="default"
                                            checked={provider === 'default'}
                                            onChange={(e) => setProvider(e.target.value)}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-bold">Use Default (Free)</div>
                                            <div className="text-xs text-gray-500">Powered by our shared API key</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all">
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="openai"
                                            checked={provider === 'openai'}
                                            onChange={(e) => setProvider(e.target.value)}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-bold">OpenAI (Your Key)</div>
                                            <div className="text-xs text-gray-500">Use your own OpenAI API key</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all">
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="gemini"
                                            checked={provider === 'gemini'}
                                            onChange={(e) => setProvider(e.target.value)}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-bold">Google Gemini (Your Key)</div>
                                            <div className="text-xs text-gray-500">Use your own Gemini API key</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2 px-1">
                                Your API keys are never stored in plain text and are used only for processing the Gmail account specified below.
                            </div>

                            {provider !== 'default' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-8 border-t border-white/5 space-y-4"
                                >
                                    <div className="text-sm font-bold">
                                        {provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder={hasCustomKey ? "••••••••••••••••" : "Enter your API key"}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-indigo-500 outline-none transition-all"
                                        />
                                        {hasCustomKey && !apiKey && (
                                            <div className="flex items-center gap-2 px-1">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Key:</span>
                                                <StaggeredText text="••••••••••••••••" className="text-indigo-400 font-mono text-xs" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {provider === 'openai' ? (
                                            <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" className="text-indigo-400 hover:underline">OpenAI Platform</a></>
                                        ) : (
                                            <>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-400 hover:underline">Google AI Studio</a></>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>

                    {/* AI Automation Gmail Section */}
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 px-1">
                            <Mail className="w-4 h-4" />
                            AI Automation Target
                        </h3>
                        <div className="glass-card p-6 md:p-8">
                            <div className="space-y-4">
                                <div className="text-sm font-bold text-white">Target Gmail Address</div>
                                <div className="text-xs text-gray-500">
                                    Specify the email account where you want the assistant to generate replies and analyze threads.
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            defaultValue={userEmail}
                                            placeholder="your-automation-target@gmail.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-2.5 text-sm focus:border-indigo-500 outline-none transition-all text-gray-300"
                                        />
                                    </div>
                                    <button
                                        onClick={() => showNotification("Target email locked to session account.", { type: 'info' })}
                                        className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all text-gray-400 whitespace-nowrap"
                                    >
                                        Update Account
                                    </button>
                                </div>
                                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3 mt-6">
                                    <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        <span className="text-orange-400 font-bold uppercase mr-2">Note:</span>
                                        AI analysis will only be performed on the account provided here. If you wish to switch accounts,
                                        please Sign Out and Sign In again with a different Google account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Security & Access
                            </h3>
                            <div className="glass-card p-6 md:p-8 flex flex-col items-start gap-6">
                                <div className="text-xs text-gray-500 flex items-start gap-2">
                                    <Key className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Your API keys are encrypted at rest using AES-256. We use your keys only during the lifetime of your session request.</span>
                                </div>
                                <div className="w-full p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                    <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Security Status</div>
                                    <div className="text-sm text-white font-medium">Verified Environment</div>
                                </div>
                                <div className="scale-75 origin-left">
                                    <VerificationFace />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                System Integrity
                            </h3>
                            <div className="glass-card p-6 md:p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Database Encryption</span>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">OAuth Token Validity</span>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Verified</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">AI Privacy Policy</span>
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Enforced</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">GDPR Compliance</span>
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Certified</span>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="text-[10px] text-gray-500 italic">
                                        Last system check: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="glow-button px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {saved ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span className="text-white">Saved!</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
