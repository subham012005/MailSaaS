'use client';

import React, { useState, useEffect } from 'react';
import { Rocket, Plus, Settings, Users, Activity, Play, Pause, Search, ArrowLeft, Save, Trash2, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function CampaignsPage() {
    const { data: rawSession } = useSession();
    const session = rawSession as any;
    
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [currentCampaign, setCurrentCampaign] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'sequence' | 'contacts'>('sequence');
    
    // Form States
    const [newCampaignName, setNewCampaignName] = useState('');
    const [steps, setSteps] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [newContactEmail, setNewContactEmail] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (session?.user?.accessToken) {
            fetchCampaigns();
        }
    }, [session]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const data = await api.get('/campaigns', session?.user?.accessToken, session?.user?.email);
            setCampaigns(data);
        } catch (e) {
            console.error("Failed to fetch campaigns", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async () => {
        if (!newCampaignName.trim()) return;
        setSaving(true);
        try {
            const data = await api.post('/campaigns', { name: newCampaignName }, session?.user?.accessToken, session?.user?.email);
            await fetchCampaigns();
            setNewCampaignName('');
            openCampaign(data.id);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const openCampaign = async (id: number) => {
        setLoading(true);
        try {
            const data = await api.get(`/campaigns/${id}`, session?.user?.accessToken, session?.user?.email);
            setCurrentCampaign(data);
            setSteps(data.steps || []);
            setContacts(data.contacts || []);
            setView('detail');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const addStep = () => {
        setSteps([...steps, { step_number: steps.length + 1, delay_days: 1, subject_template: '', body_template: '' }]);
    };

    const removeStep = (index: number) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        // renumber
        newSteps.forEach((s, i) => s.step_number = i + 1);
        setSteps(newSteps);
    };

    const updateStep = (index: number, field: string, value: any) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const saveSteps = async () => {
        if (!currentCampaign) return;
        setSaving(true);
        try {
            await api.post(`/campaigns/${currentCampaign.id}/steps`, steps, session?.user?.accessToken, session?.user?.email);
            alert("Sequence saved!");
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const addContact = async () => {
        if (!newContactEmail || !currentCampaign) return;
        setSaving(true);
        try {
            await api.post(`/campaigns/${currentCampaign.id}/contacts`, [{ email: newContactEmail }], session?.user?.accessToken, session?.user?.email);
            setNewContactEmail('');
            // reload campaign to get contacts
            const data = await api.get(`/campaigns/${currentCampaign.id}`, session?.user?.accessToken, session?.user?.email);
            setContacts(data.contacts || []);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const toggleCampaignStatus = async () => {
        if (!currentCampaign) return;
        setSaving(true);
        const newStatus = currentCampaign.status === 'active' ? 'paused' : 'active';
        try {
            await api.put(`/campaigns/${currentCampaign.id}`, { status: newStatus }, session?.user?.accessToken, session?.user?.email);
            setCurrentCampaign({ ...currentCampaign, status: newStatus });
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (view === 'detail' && currentCampaign) {
        return (
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
                <div className="p-8 border-b border-border bg-sidebar/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setView('list'); fetchCampaigns(); }} className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{currentCampaign.name}</h1>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                currentCampaign.status === 'active' ? 'bg-success/10 text-success' : 
                                currentCampaign.status === 'draft' ? 'bg-muted text-muted-foreground' : 'bg-warning/10 text-warning'
                            }`}>
                                {currentCampaign.status}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={toggleCampaignStatus}
                        disabled={saving}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                            currentCampaign.status === 'active' ? 'bg-warning/20 text-warning hover:bg-warning/30' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                    >
                        {currentCampaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} 
                        {currentCampaign.status === 'active' ? 'Pause Campaign' : 'Start Campaign'}
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Tabs sidebar */}
                    <div className="w-64 border-r border-border p-4 space-y-2">
                        <button 
                            onClick={() => setActiveTab('sequence')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'sequence' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                        >
                            <Settings className="w-4 h-4" /> Sequence Builder
                        </button>
                        <button 
                            onClick={() => setActiveTab('contacts')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'contacts' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                        >
                            <Users className="w-4 h-4" /> Contacts ({contacts.length})
                        </button>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-muted/20">
                        {activeTab === 'sequence' && (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold">Email Sequence</h2>
                                    <button onClick={saveSteps} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50">
                                        {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Sequence
                                    </button>
                                </div>

                                {steps.length === 0 ? (
                                    <div className="p-8 text-center bg-card border border-border rounded-2xl">
                                        <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground mb-4">No steps in this sequence yet.</p>
                                        <button onClick={addStep} className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20">
                                            Add First Email
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {steps.map((step, index) => (
                                            <div key={index} className="bg-card border border-border rounded-2xl p-6 relative">
                                                <button onClick={() => removeStep(index)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                                        {step.step_number}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold block">Step {step.step_number}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-muted-foreground">Wait</span>
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                value={step.delay_days}
                                                                onChange={(e) => updateStep(index, 'delay_days', parseInt(e.target.value) || 0)}
                                                                className="w-16 bg-muted border border-border rounded p-1 text-xs text-center outline-none focus:border-primary/50"
                                                            />
                                                            <span className="text-xs text-muted-foreground">days {index === 0 ? 'before sending' : 'after previous step'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Email Subject"
                                                        value={step.subject_template}
                                                        onChange={(e) => updateStep(index, 'subject_template', e.target.value)}
                                                        className="w-full bg-muted border border-border rounded-xl py-3 px-4 text-sm focus:bg-background focus:border-primary/50 outline-none transition-all font-medium"
                                                    />
                                                    <textarea
                                                        placeholder="Email Body (use {{name}} for variables)"
                                                        value={step.body_template}
                                                        onChange={(e) => updateStep(index, 'body_template', e.target.value)}
                                                        rows={6}
                                                        className="w-full bg-muted border border-border rounded-xl py-3 px-4 text-sm focus:bg-background focus:border-primary/50 outline-none transition-all resize-none font-medium"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={addStep} className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Add Follow-up Step
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'contacts' && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <div className="flex gap-4">
                                    <input 
                                        type="email" 
                                        placeholder="Add contact email address..."
                                        value={newContactEmail}
                                        onChange={(e) => setNewContactEmail(e.target.value)}
                                        className="flex-1 bg-card border border-border rounded-xl py-3 px-4 text-sm focus:border-primary/50 outline-none font-medium"
                                    />
                                    <button 
                                        onClick={addContact}
                                        disabled={!newContactEmail || saving}
                                        className="px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl disabled:opacity-50"
                                    >
                                        Add Contact
                                    </button>
                                </div>

                                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Email</th>
                                                <th className="px-6 py-4 font-bold">Status</th>
                                                <th className="px-6 py-4 font-bold">Current Step</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {contacts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                                        No contacts added yet.
                                                    </td>
                                                </tr>
                                            ) : contacts.map((c, i) => (
                                                <tr key={i} className="hover:bg-muted/30">
                                                    <td className="px-6 py-4 font-medium">{c.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                            c.status === 'replied' ? 'bg-success/10 text-success' :
                                                            c.status === 'active' ? 'bg-primary/10 text-primary' :
                                                            'bg-muted text-muted-foreground'
                                                        }`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">Step {c.current_step}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <div className="p-8 border-b border-border bg-sidebar/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Campaigns</h1>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Manage automated email sequences.</p>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="text" 
                        placeholder="New Campaign Name" 
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        className="bg-muted border border-border rounded-xl py-2 px-4 text-sm font-medium outline-none focus:border-primary/50"
                    />
                    <button 
                        onClick={handleCreateCampaign}
                        disabled={saving || !newCampaignName.trim()}
                        className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Activity className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Rocket className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">No Campaigns Yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">Create your first automated email sequence to start engaging contacts.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map(c => (
                            <div key={c.id} onClick={() => openCampaign(c.id)} className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col hover:border-primary transition-colors cursor-pointer group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{c.name}</h3>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                        c.status === 'active' ? 'bg-success/10 text-success' : 
                                        c.status === 'draft' ? 'bg-muted text-muted-foreground' : 'bg-warning/10 text-warning'
                                    }`}>
                                        {c.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-4 border-t border-border">
                                    <div className="flex items-center gap-1">
                                        <Settings className="w-4 h-4" /> {c.step_count} Steps
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {c.contact_count} Contacts
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
