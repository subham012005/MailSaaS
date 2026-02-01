'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    ShieldCheck,
    GraduationCap,
    Rocket,
    Target,
    Code,
    Briefcase,
    Sparkles,
    Search,
    Users
} from 'lucide-react';

// Components
import MemoryView from '@/components/MemoryView';
import MetricsView from '@/components/MetricsView';
import SettingsView from '@/components/SettingsView';
import GovernanceRoom from '@/components/GovernanceRoom';
import DelegationView from '@/components/DelegationView';
import Sidebar from '@/components/dashboard/Sidebar';
import EmailList from '@/components/dashboard/EmailList';
import EmailDetail from '@/components/dashboard/EmailDetail';
import DelegateModal from '@/components/dashboard/DelegateModal';
import DraftEditor from '@/components/DraftEditor';
import PersonaModal from '@/components/dashboard/PersonaModal';
import SetupWizard from '@/components/onboarding/SetupWizard';
import NotificationPanel from '@/components/NotificationPanel';

// Hooks
import { useDashboardData, groupEmailsByThread } from '@/hooks/useDashboardData';
import { useEmailAnalysis } from '@/hooks/useEmailAnalysis';

// API & Lib
import {
    updatePersonality,
    createDelegation,
    delegationUnifiedSend,
    approveDelegation,
    saveApiSettings,
    generateCustomReply,
    fetchLoadForecast,
    sendDirectReply,
    logDecision,
    logCorrection
} from '@/lib/api';

export type ViewState = 'inbox' | 'sent' | 'memory' | 'drafts' | 'settings' | 'governance' | 'delegations' | 'metrics';

const PERSONAS = [
    { id: 'general', label: 'General', icon: Sparkles, color: 'text-sky-400' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-amber-400' },
    { id: 'founder', label: 'Founder', icon: Rocket, color: 'text-rose-400' },
    { id: 'developer', label: 'Developer', icon: Code, color: 'text-emerald-400' },
    { id: 'manager', label: 'Manager', icon: Briefcase, color: 'text-indigo-400' },
    { id: 'sales', label: 'Sales', icon: Target, color: 'text-orange-400' },
    { id: 'researcher', label: 'Researcher', icon: Search, color: 'text-purple-400' },
    { id: 'recruiter', label: 'Recruiter', icon: Users, color: 'text-pink-400' },
];

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const accessToken = (session?.user as any)?.accessToken;

    // View State
    const [activeView, setActiveView] = useState<ViewState>('inbox');
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Persona State
    const [activePersona, setActivePersona] = useState('general');
    const [personaContexts, setPersonaContexts] = useState<Record<string, string>>({});
    const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

    // Delegation State
    const [showDelegateModal, setShowDelegateModal] = useState(false);
    const [delegateEmail, setDelegateEmail] = useState('');
    const [delegateAction, setDelegateAction] = useState('');
    const [slaHours, setSlaHours] = useState(24);
    const [isDelegating, setIsDelegating] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Inbox Delegation Reply State
    const [quickReplyText, setQuickReplyText] = useState('');
    const [quickReplyingId, setQuickReplyingId] = useState<number | null>(null);
    const [isSubmittingQuickReply, setIsSubmittingQuickReply] = useState(false);

    // Custom Reply State
    const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

    // AI/Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [currentAction, setCurrentAction] = useState<any>(null);

    // Hooks
    const dashboardData = useDashboardData(session);
    const emailAnalysis = useEmailAnalysis(session, dashboardData.assignedDelegations);

    // Grouping emails
    const groupedEmails = useMemo(() =>
        groupEmailsByThread(dashboardData.emails),
        [dashboardData.emails]);

    const sentGroupedEmails = useMemo(() =>
        groupEmailsByThread(dashboardData.sentEmails),
        [dashboardData.sentEmails]);

    const draftGroupedEmails = useMemo(() =>
        groupEmailsByThread(dashboardData.draftEmails),
        [dashboardData.draftEmails]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        if (session?.user && (session.user as any).error === "RefreshAccessTokenError") {
            signIn("google");
        }
    }, [status, router, session]);

    // Sync persona with backend
    useEffect(() => {
        if (dashboardData.personality?.personality_type) {
            setActivePersona(dashboardData.personality.personality_type);
        }
        if (dashboardData.personality?.personality_contexts) {
            setPersonaContexts(dashboardData.personality.personality_contexts);
        }
    }, [dashboardData.personality]);

    // Handle incoming assigned delegations for notifications
    const prevAssignedRef = useRef<any[]>([]);
    const prevOwnedRef = useRef<any[]>([]);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        const currentAssigned = dashboardData.assignedDelegations || [];
        const prevAssigned = prevAssignedRef.current;
        const currentOwned = dashboardData.delegations || [];
        const prevOwned = prevOwnedRef.current;

        // Skip the very first run to avoid notifying for existing items on login
        if (!isInitializedRef.current) {
            if (currentAssigned.length > 0 || currentOwned.length > 0) {
                prevAssignedRef.current = currentAssigned;
                prevOwnedRef.current = currentOwned;
                isInitializedRef.current = true;
            }
            return;
        }

        // Delegate View: Detect new assignments
        if (currentAssigned.length > prevAssigned.length) {
            const newItems = currentAssigned.filter((curr: any) => !prevAssigned.find((prev: any) => prev.id === curr.id));
            newItems.forEach((item: any) => {
                const newNotification = {
                    id: Date.now() + Math.random(),
                    type: 'delegation',
                    message: `New delegation assigned: ${item.original_subject}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    targetView: 'delegations',
                    targetId: item.id
                };
                setNotifications(prev => [newNotification, ...prev]);
                toast.success(`New assignment: ${item.original_subject}`, {
                    icon: '📧',
                    duration: 5000,
                });
            });
        }
        prevAssignedRef.current = currentAssigned;

        // Delegate View: Detect status changes in assigned items (e.g. Boss gave feedback)
        if (prevAssigned.length > 0) {
            currentAssigned.forEach((curr: any) => {
                const prev = prevAssigned.find((p: any) => p.id === curr.id);
                if (prev && prev.status !== curr.status) {
                    if (curr.status === 'needs_changes') {
                        setNotifications(prevNotifs => [{
                            id: Date.now() + Math.random(),
                            type: 'delegation',
                            message: `Changes requested on: ${curr.original_subject}`,
                            timestamp: new Date().toISOString(),
                            read: false,
                            badgeColor: 'bg-orange-500',
                            targetView: 'delegations',
                            targetId: curr.id
                        }, ...prevNotifs]);
                        toast("Feedback received on delegation", { icon: '📝' });
                    } else if (curr.status === 'sent') {
                        setNotifications(prevNotifs => [{
                            id: Date.now() + Math.random(),
                            type: 'system',
                            message: `Approved & Sent: ${curr.original_subject}`,
                            timestamp: new Date().toISOString(),
                            read: false,
                            badgeColor: 'bg-emerald-500',
                            targetView: 'delegations',
                            targetId: curr.id
                        }, ...prevNotifs]);
                        toast.success("Delegation approved and sent!");
                    }
                }
            });
        }

        // Boss View: Detect status changes in owned delegations
        if (currentOwned.length > 0) {
            currentOwned.forEach((curr: any) => {
                const prev = prevOwned.find((p: any) => p.id === curr.id);
                if (prev && prev.status !== curr.status) {
                    let message = '';
                    let type = 'system';
                    let badgeColor = 'bg-gray-500';

                    if (curr.status === 'awaiting_approval') {
                        message = `Review required: Delegate submitted a draft for "${curr.original_subject}"`;
                        type = 'approval';
                    } else if (curr.status === 'sent') {
                        message = `Success: Delegation completed and sent for "${curr.original_subject}"`;
                        type = 'system';
                    } else if (curr.status === 'needs_changes') {
                        message = `Feedback provided for "${curr.original_subject}"`;
                        type = 'system';
                    }

                    if (message) {
                        setNotifications(prev => [{
                            id: Date.now() + Math.random(),
                            type,
                            message,
                            timestamp: new Date().toISOString(),
                            read: false,
                            targetView: 'delegations',
                            targetId: curr.id
                        }, ...prev]);

                        if (type === 'approval') {
                            toast(message, { icon: '🔔', duration: 6000 });
                        }
                    }
                }
            });
        }
        prevOwnedRef.current = currentOwned;
    }, [dashboardData.assignedDelegations, dashboardData.delegations]);

    if (!mounted) {
        return <div className="h-screen bg-[#050505]" />;
    }

    if (status === "loading") {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full"
                    />
                    <p className="text-gray-400 text-sm animate-pulse">Initializing Antigravity...</p>
                </div>
            </div>
        );
    }


    const runTokenDebug = async () => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/debug/token`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${(session?.user as any)?.accessToken}`,
                    'X-User-Email': session?.user?.email || ''
                }
            });
            const data = await response.json();
            console.log('TOKEN DEBUG RESULT:', data);
            toast.success('Token debug info logged to console');
        } catch (error) {
            console.error('Token debug failed:', error);
            toast.error('Token debug failed');
        }
    };

    if (!session) return null;

    // Handlers
    const handlePersonaChange = async (personaId: string) => {
        if (!session?.user?.email) return;
        setActivePersona(personaId);

        // Use the saved context for this persona if it exists
        const context = personaContexts[personaId] || "";

        try {
            await updatePersonality(session.user.email, personaId, context, accessToken);
            dashboardData.refetchAll();
            if (emailAnalysis.selectedEmail) {
                emailAnalysis.handleEmailSelect(emailAnalysis.selectedEmail);
            }
        } catch (error) {
            console.error("Failed to update persona:", error);
            toast.error("Failed to update perspective");
        }
    };

    const handleSavePersonality = async (personaId: string, context: string) => {
        if (!session?.user?.email) return;
        setActivePersona(personaId);
        setPersonaContexts(prev => ({ ...prev, [personaId]: context }));

        try {
            await updatePersonality(session.user.email, personaId, context, accessToken);
            toast.success("Perspective updated successfully");
            dashboardData.refetchAll();
            if (emailAnalysis.selectedEmail) {
                emailAnalysis.handleEmailSelect(emailAnalysis.selectedEmail);
            }
        } catch (error) {
            console.error("Failed to save personality:", error);
            toast.error("Failed to save perspective");
            throw error;
        }
    };

    const handleDelegate = async () => {
        const userEmail = session?.user?.email;
        if (!userEmail || !emailAnalysis.selectedEmail || !delegateEmail.trim()) return;
        setIsDelegating(true);
        try {
            const token = (session?.user as any)?.accessToken;
            await createDelegation(userEmail, {
                email_id: emailAnalysis.selectedEmail.id,
                thread_id: emailAnalysis.selectedEmail.threadId,
                delegate_email: delegateEmail,
                expected_action: delegateAction || "Please review and handle this email.",
                original_from: emailAnalysis.selectedEmail.fromFull,
                original_subject: emailAnalysis.selectedEmail.subject,
                original_body: emailAnalysis.selectedEmail.preview,
                intel_report: emailAnalysis.analysisResult,
                sla_hours: slaHours
            }, token);
            toast.success(`Email delegated to ${delegateEmail}`);
            dashboardData.refetchAll();
            setShowDelegateModal(false);
            setDelegateEmail('');
            setDelegateAction('');
        } catch (error) {
            console.error("Delegation failed:", error);
            toast.error("Failed to delegate email");
        } finally {
            setIsDelegating(false);
        }
    };

    const handleInboxDelegationReply = async (delegationId: number, asDraft: boolean = true) => {
        if (!quickReplyText.trim()) return;
        setIsSubmittingQuickReply(true);
        try {
            const token = (session?.user as any)?.accessToken;
            await delegationUnifiedSend(session!.user!.email!, delegationId, {
                reply_draft: quickReplyText,
                send_mode: 'thread',
                approval_required: asDraft
            }, token);

            toast.success(asDraft ? "Draft submitted" : "Reply sent");
            setQuickReplyingId(null);
            setQuickReplyText('');
            dashboardData.refetchAll();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send");
        } finally {
            setIsSubmittingQuickReply(false);
        }
    };

    const handleGenerateCustom = async () => {
        if (!emailAnalysis.selectedEmail || !emailAnalysis.userInstruction.trim()) return;
        setIsGeneratingCustom(true);
        try {
            const token = (session?.user as any)?.accessToken;
            const reply = await generateCustomReply(
                {
                    message_id: emailAnalysis.selectedEmail.id,
                    original_body: emailAnalysis.selectedEmail.preview,
                    user_instruction: emailAnalysis.userInstruction
                },
                session!.user!.email!,
                session?.user?.name || undefined
            );
            emailAnalysis.setAnalysisResult({
                ...emailAnalysis.analysisResult,
                primary_action_id: 'custom_generated',
                recommendations: [
                    ...(emailAnalysis.analysisResult?.recommendations || []),
                    {
                        id: 'custom_generated',
                        action_label: 'Custom Reply',
                        suggested_reply: reply,
                        predicted_outcome: 'Requested Context Included',
                        why_recommendation: 'Generated based on your specific instructions.'
                    }
                ]
            });
            emailAnalysis.setShowReplyFlow(false);
            emailAnalysis.setShowContextQuestions(false);
            toast.success("Custom reply generated");
        } catch (error) {
            console.error("Custom generation failed:", error);
            toast.error("Failed to generate custom reply");
        } finally {
            setIsGeneratingCustom(false);
        }
    };

    const handleSetupComplete = async (data: { provider: string; apiKey: string; persona: string }) => {
        if (!session?.user?.email) return;
        try {
            // Save API Settings
            await saveApiSettings(session.user.email, data.provider, data.apiKey, accessToken);

            // Save initial Persona Context if we have one (or just use default)
            await updatePersonality(session.user.email, data.persona, "", accessToken);

            toast.success("Intelligence Engine Configured!");
            dashboardData.refetchAll();
        } catch (error) {
            console.error("Setup failed:", error);
            toast.error("Failed to complete setup");
            throw error;
        }
    };

    const handleActionClick = (action: any) => {
        setCurrentAction(action);
        setIsEditing(true);
    };

    const handleSaveDraft = async (editedDraft: string) => {
        if (!session?.user?.email || !emailAnalysis.selectedEmail) return;
        try {
            await logDecision(emailAnalysis.selectedEmail.id, {
                action_taken: currentAction?.action_label || 'Manual Edit',
                rationale: currentAction?.why_recommendation || 'User refined the draft',
                outcome_forecast: currentAction?.predicted_outcome,
                is_correction: false
            }, session.user.email);
            toast.success("Decision logged & draft saved");
            setIsEditing(false);
            dashboardData.refetchAll();
        } catch (error) {
            console.error(error);
            toast.error("Failed to log decision");
        }
    };

    const handleNotificationClick = (notification: any) => {
        if (notification.targetView) {
            setActiveView(notification.targetView as ViewState);
            setViewMode('list');
            setShowNotifications(false);

            // If it's a delegation, we might want to select it, but currently 
            // the delegations view doesn't easily support deep linking to a specific item.
            // For now, switching view is a good start.
        }
    };

    const handleViewAllActivity = () => {
        setActiveView('memory'); // 'History' represents activity log
        setViewMode('list');
        setShowNotifications(false);
    };

    const handleSendReply = async (editedDraft: string) => {
        if (!session?.user?.email || !emailAnalysis.selectedEmail) return;
        try {
            const token = (session?.user as any)?.accessToken;
            await sendDirectReply(
                session.user.email,
                token,
                {
                    thread_id: emailAnalysis.selectedEmail.threadId,
                    email_id: emailAnalysis.selectedEmail.id,
                    recipient: emailAnalysis.selectedEmail.fromFull || emailAnalysis.selectedEmail.from,
                    subject: `Re: ${emailAnalysis.selectedEmail.subject}`,
                    body: editedDraft
                }
            );
            toast.success("Reply dispatched successfully");
            setIsEditing(false);
            emailAnalysis.setSelectedEmail(null);
            setViewMode('list');
            dashboardData.refetchAll();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send reply");
        }
    };

    const renderMainContent = () => {
        if (isEditing && currentAction) {
            return (
                <DraftEditor
                    originalDraft={currentAction.suggested_reply || ""}
                    onSave={handleSaveDraft}
                    onSend={handleSendReply}
                    onCancel={() => setIsEditing(false)}
                />
            );
        }

        switch (activeView) {
            case 'memory': return <MemoryView history={dashboardData.history} />;
            case 'metrics': return <MetricsView metrics={dashboardData.metrics} />;
            case 'settings': return <SettingsView userEmail={session?.user?.email || ''} accessToken={(session?.user as any)?.accessToken} />;
            case 'governance': return <GovernanceRoom userEmail={session?.user?.email || ''} accessToken={(session?.user as any)?.accessToken} />;
            case 'delegations':
                return (
                    <DelegationView
                        delegations={dashboardData.delegations}
                        assignedDelegations={dashboardData.assignedDelegations}
                        userEmail={session?.user?.email || ''}
                        accessToken={(session?.user as any)?.accessToken}
                        onRefresh={() => dashboardData.refetchAll()}
                    />
                );
            case 'sent':
            case 'drafts':
                const currentEmails = activeView === 'sent' ? sentGroupedEmails : draftGroupedEmails;
                const isLoading = activeView === 'sent' ? dashboardData.isLoadingSentEmails : dashboardData.isLoadingDraftEmails;
                return (
                    <div className="flex flex-1 h-full">
                        <EmailList
                            emails={currentEmails}
                            loadingEmails={isLoading}
                            emailFetchError={null}
                            selectedEmail={emailAnalysis.selectedEmail}
                            handleEmailSelect={emailAnalysis.handleEmailSelect}
                            viewMode={viewMode}
                            loadForecast={dashboardData.forecast}
                            activePersona={activePersona}
                            personas={PERSONAS}
                            handlePersonaChange={handlePersonaChange}
                            setIsPersonaModalOpen={setIsPersonaModalOpen}
                            setShowDelegateModal={setShowDelegateModal}
                            delegations={dashboardData.delegations}
                            assignedDelegations={dashboardData.assignedDelegations}
                            activeView={activeView}
                        />
                        <EmailDetail
                            selectedEmail={emailAnalysis.selectedEmail}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            setShowDelegateModal={setShowDelegateModal}
                            isAnalyzing={emailAnalysis.isAnalyzing}
                            isFetchingThread={emailAnalysis.isFetchingThread}
                            activeThread={emailAnalysis.activeThread}
                            expandedQuotes={emailAnalysis.expandedQuotes}
                            setExpandedQuotes={emailAnalysis.setExpandedQuotes}
                            session={session}
                            analysisResult={emailAnalysis.analysisResult}
                            analysisError={emailAnalysis.analysisError}
                            assignedDelegations={dashboardData.assignedDelegations}
                            delegations={dashboardData.delegations}
                            quickReplyingId={quickReplyingId}
                            setQuickReplyingId={setQuickReplyingId}
                            quickReplyText={quickReplyText}
                            setQuickReplyText={setQuickReplyText}
                            handleInboxDelegationReply={handleInboxDelegationReply}
                            isSubmittingQuickReply={isSubmittingQuickReply}
                            setActiveView={setActiveView as any}
                            showReplyFlow={emailAnalysis.showReplyFlow}
                            setShowReplyFlow={emailAnalysis.setShowReplyFlow}
                            showContextQuestions={emailAnalysis.showContextQuestions}
                            setShowContextQuestions={emailAnalysis.setShowContextQuestions}
                            userInstruction={emailAnalysis.userInstruction}
                            setUserInstruction={emailAnalysis.setUserInstruction}
                            handleGenerateCustom={handleGenerateCustom}
                            handleActionClick={handleActionClick}
                            setSelectedEmail={emailAnalysis.setSelectedEmail}
                            metrics={dashboardData.metrics}
                            isGeneratingCustom={isGeneratingCustom}
                        />
                    </div>
                );
            case 'inbox':
            default:
                return (
                    <div className="flex flex-1 h-full">
                        <EmailList
                            emails={groupedEmails}
                            loadingEmails={dashboardData.isLoadingEmails}
                            emailFetchError={dashboardData.emailsError}
                            selectedEmail={emailAnalysis.selectedEmail}
                            handleEmailSelect={emailAnalysis.handleEmailSelect}
                            viewMode={viewMode}
                            loadForecast={dashboardData.forecast}
                            activePersona={activePersona}
                            personas={PERSONAS}
                            handlePersonaChange={handlePersonaChange}
                            setIsPersonaModalOpen={setIsPersonaModalOpen}
                            setShowDelegateModal={setShowDelegateModal}
                            delegations={dashboardData.delegations}
                            assignedDelegations={dashboardData.assignedDelegations}
                        />
                        <EmailDetail
                            selectedEmail={emailAnalysis.selectedEmail}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            setShowDelegateModal={setShowDelegateModal}
                            isAnalyzing={emailAnalysis.isAnalyzing}
                            isFetchingThread={emailAnalysis.isFetchingThread}
                            activeThread={emailAnalysis.activeThread}
                            expandedQuotes={emailAnalysis.expandedQuotes}
                            setExpandedQuotes={emailAnalysis.setExpandedQuotes}
                            session={session}
                            analysisResult={emailAnalysis.analysisResult}
                            analysisError={emailAnalysis.analysisError}
                            assignedDelegations={dashboardData.assignedDelegations}
                            delegations={dashboardData.delegations}
                            quickReplyingId={quickReplyingId}
                            setQuickReplyingId={setQuickReplyingId}
                            quickReplyText={quickReplyText}
                            setQuickReplyText={setQuickReplyText}
                            handleInboxDelegationReply={handleInboxDelegationReply}
                            isSubmittingQuickReply={isSubmittingQuickReply}
                            setActiveView={setActiveView as any}
                            showReplyFlow={emailAnalysis.showReplyFlow}
                            setShowReplyFlow={emailAnalysis.setShowReplyFlow}
                            showContextQuestions={emailAnalysis.showContextQuestions}
                            setShowContextQuestions={emailAnalysis.setShowContextQuestions}
                            userInstruction={emailAnalysis.userInstruction}
                            setUserInstruction={emailAnalysis.setUserInstruction}
                            handleGenerateCustom={handleGenerateCustom}
                            handleActionClick={handleActionClick}
                            setSelectedEmail={emailAnalysis.setSelectedEmail}
                            metrics={dashboardData.metrics}
                            isGeneratingCustom={isGeneratingCustom}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden relative">
            <Toaster position="top-right" />

            {/* Setup Wizard for new users */}
            {dashboardData.personality && !dashboardData.personality.is_onboarded && (
                <SetupWizard
                    userEmail={session.user?.email || ''}
                    accessToken={accessToken}
                    onComplete={handleSetupComplete}
                />
            )}

            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView as any}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                setViewMode={setViewMode}
                isPolling={dashboardData.isLoadingEmails}
                notifications={notifications}
                showNotifications={showNotifications}
                toggleNotificationPanel={() => setShowNotifications(!showNotifications)}
                handleMarkNotificationAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                handleClearAllNotifications={() => setNotifications([])}
                onNotificationClick={handleNotificationClick}
                onViewAllNotifications={handleViewAllActivity}
                user={session?.user}
                runTokenDebug={runTokenDebug}
            />

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {renderMainContent()}
            </main>

            <AnimatePresence>
                {showDelegateModal && (
                    <DelegateModal
                        isOpen={showDelegateModal}
                        onClose={() => setShowDelegateModal(false)}
                        onDelegate={handleDelegate}
                        delegateEmail={delegateEmail}
                        setDelegateEmail={setDelegateEmail}
                        delegateAction={delegateAction}
                        setDelegateAction={setDelegateAction}
                        slaHours={slaHours}
                        setSlaHours={setSlaHours}
                        isDelegating={isDelegating}
                        recentDelegates={[]} // Can be fetched
                        delegateSearch={""}
                        setDelegateSearch={() => { }}
                    />
                )}

                {isPersonaModalOpen && (
                    <PersonaModal
                        isOpen={isPersonaModalOpen}
                        onClose={() => setIsPersonaModalOpen(false)}
                        onSave={handleSavePersonality}
                        currentPersonaId={activePersona}
                        currentContext={personaContexts[activePersona] || ""}
                        personas={PERSONAS}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
