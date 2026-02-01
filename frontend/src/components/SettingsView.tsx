'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Shield, Bell, Key, Zap, Save, Check } from 'lucide-react';
import { getApiSettings, saveApiSettings } from '@/lib/api';

interface SettingsViewProps {
    userEmail: string;
    accessToken?: string;
}

export default function SettingsView({ userEmail, accessToken }: SettingsViewProps) {
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
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-black/20 p-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-400">Configure your decision engine and account preferences.</p>
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
                                    <div className="flex gap-4">
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder={hasCustomKey ? "••••••••••••••••" : "Enter your API key"}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-indigo-500 outline-none transition-all"
                                        />
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

                    {/* Security Section */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Security & Access
                        </h3>
                        <div className="glass-card p-8">
                            <div className="text-xs text-gray-500 mb-4">
                                <Key className="w-4 h-4 inline mr-2" />
                                Your API keys are encrypted and stored securely. We never have access to your keys.
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
                                    Saved!
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
