import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Gavel, X, Menu } from 'lucide-react';
import { fetchPolicies, createPolicy, deletePolicy } from '@/lib/api';
import Skeleton from './ui/Skeleton';

interface Policy {
    id: number;
    title: string;
    description: string;
    policy_type: string;
    action_constraint: string;
    severity: string;
    priority: number;
    is_active: boolean;
}

export default function GovernanceRoom({
    userEmail,
    accessToken,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}: {
    userEmail: string,
    accessToken?: string,
    isMobileMenuOpen: boolean,
    setIsMobileMenuOpen: (open: boolean) => void
}) {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPolicy, setNewPolicy] = useState({
        title: '',
        description: '',
        policy_type: 'PRICING',
        action_constraint: 'DENY_REPLY',
        severity: 'HARD',
        priority: 10
    });

    useEffect(() => {
        if (userEmail && accessToken) {
            loadPolicies();
        }
    }, [userEmail, accessToken]);

    const loadPolicies = async () => {
        if (!userEmail || !accessToken) {
            setLoading(false);
            return;
        }
        try {
            const data = await fetchPolicies(userEmail, accessToken);
            setPolicies(data);
        } catch (error) {
            console.error("Failed to load policies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await createPolicy(userEmail, newPolicy, accessToken);
            setShowAddModal(false);
            loadPolicies();
            setNewPolicy({
                title: '',
                description: '',
                policy_type: 'PRICING',
                action_constraint: 'DENY_REPLY',
                severity: 'HARD',
                priority: 10
            });
        } catch (error) {
            console.error("Failed to create policy", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deletePolicy(userEmail, id, accessToken);
            loadPolicies();
        } catch (error) {
            console.error("Failed to delete policy", error);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
                <div className="flex items-start gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Gavel className="w-8 h-8 text-primary" />
                            Governance Room
                        </h1>
                        <p className="text-muted-foreground">Define hard constraints and deterministic rules for your AI.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Policy
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-card p-6 border-white/5 bg-white/[0.02]">
                            <div className="flex items-start gap-4 mb-4">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            <Skeleton className="h-16 w-full mb-6" />
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : policies.length === 0 ? (
                <div className="text-center p-20 glass-card border-dashed border-white/10">
                    <Shield className="w-16 h-16 mx-auto mb-6 text-gray-700" />
                    <h2 className="text-xl font-bold text-gray-400 mb-2">No active policies</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">Establish guardrails to prevent AI errors and enforce business rules.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                    >
                        Create your first rule &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policies.map((policy) => (
                        <div key={policy.id} className="glass-card p-6 border-white/5 bg-white/[0.02] hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                            {policy.severity === 'HARD' && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-rose-500/10 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20">
                                        ENFORCED
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${policy.severity === 'HARD' ? 'bg-rose-500/10 text-rose-500' :
                                    policy.severity === 'SOFT' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{policy.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{policy.policy_type}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{policy.action_constraint}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                {policy.description}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${policy.is_active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                    <span className="text-xs font-medium text-gray-500">{policy.is_active ? 'Active' : 'Disabled'}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(policy.id)}
                                    className="p-2 text-gray-600 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold">New Governance Policy</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Policy Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Pricing Integrity"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all"
                                    value={newPolicy.title}
                                    onChange={e => setNewPolicy({ ...newPolicy, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Constraint</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all appearance-none [&>option]:bg-[#0A0A0A] [&>option]:text-foreground"
                                        value={newPolicy.action_constraint}
                                        onChange={e => setNewPolicy({ ...newPolicy, action_constraint: e.target.value })}
                                    >
                                        <option value="DENY_REPLY">Deny Auto-Reply</option>
                                        <option value="FORCE_DRAFT">Force Manual Review</option>
                                        <option value="NOTIFY_ONLY">Notify Only</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Severity</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all appearance-none [&>option]:bg-[#0A0A0A] [&>option]:text-foreground"
                                        value={newPolicy.severity}
                                        onChange={e => setNewPolicy({ ...newPolicy, severity: e.target.value })}
                                    >
                                        <option value="HARD">HARD (Enforced)</option>
                                        <option value="SOFT">SOFT (Preferred)</option>
                                        <option value="ADVISORY">ADVISORY</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description (Machine Instruction)</label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g. Never negotiate pricing over email. Always push to a call if money is mentioned."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all resize-none"
                                    value={newPolicy.description}
                                    onChange={e => setNewPolicy({ ...newPolicy, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newPolicy.title || !newPolicy.description}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/20"
                            >
                                Establish Policy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
