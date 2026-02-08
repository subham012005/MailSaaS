'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { showNotification } from '@/lib/notifications';
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
import EmailList from '@/components/dashboard/EmailList';
import EmailDetail from '@/components/dashboard/EmailDetail';
import DelegateModal from '@/components/dashboard/DelegateModal';
import DraftEditor from '@/components/DraftEditor';
import PersonaModal from '@/components/dashboard/PersonaModal';

// Hooks
import { useDashboardData, groupEmailsByThread } from '@/hooks/useDashboardData';
import { useEmailAnalysis } from '@/hooks/useEmailAnalysis';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

// API & Lib
import {
    updatePersonality,
    createDelegation,
    delegationUnifiedSend,
    generateCustomReply,
    sendDirectReply,
    logDecision,
} from '@/lib/api';

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

interface EmailViewProps {
    view: 'inbox' | 'sent' | 'drafts' | 'starred' | 'spam' | 'trash' | 'snoozed';
}

export default function EmailView({ view }: EmailViewProps) {
    const { data: session } = useSession();
    const accessToken = (session?.user as any)?.accessToken;
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    // View State
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

    // Data Hooks
    const dashboardData = useDashboardData(session);
    const emailAnalysis = useEmailAnalysis(session, dashboardData.assignedDelegations);

    // Derived State
    const groupedEmails = useMemo(() => groupEmailsByThread(dashboardData.emails || []), [dashboardData.emails]);
    const sentGroupedEmails = useMemo(() => groupEmailsByThread(dashboardData.sentEmails || []), [dashboardData.sentEmails]);
    const draftGroupedEmails = useMemo(() => groupEmailsByThread(dashboardData.draftEmails || []), [dashboardData.draftEmails]);

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

    // Local State
    const [currentAction, setCurrentAction] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [quickReplyText, setQuickReplyText] = useState('');
    const [isSubmittingQuickReply, setIsSubmittingQuickReply] = useState(false);
    const [quickReplyingId, setQuickReplyingId] = useState<number | null>(null);
    const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

    // Handlers
    const handlePersonaChange = async (personaId: string) => {
        if (!session?.user?.email) return;
        setActivePersona(personaId);

        const context = personaContexts[personaId] || "";

        try {
            await updatePersonality(session.user.email, personaId, context, accessToken);
            dashboardData.refetchAll();
            if (emailAnalysis.selectedEmail) {
                emailAnalysis.handleEmailSelect(emailAnalysis.selectedEmail);
            }
        } catch (error) {
            console.error("Failed to update persona:", error);
            showNotification("Failed to update perspective", { type: 'error' });
        }
    };

    const handleSavePersonality = async (personaId: string, context: string) => {
        if (!session?.user?.email) return;
        setActivePersona(personaId);
        setPersonaContexts(prev => ({ ...prev, [personaId]: context }));

        try {
            await updatePersonality(session.user.email, personaId, context, accessToken);
            showNotification("Perspective updated successfully", { type: 'success' });
            dashboardData.refetchAll();
            if (emailAnalysis.selectedEmail) {
                emailAnalysis.handleEmailSelect(emailAnalysis.selectedEmail);
            }
        } catch (error) {
            console.error("Failed to save personality:", error);
            showNotification("Failed to save perspective", { type: 'error' });
            throw error;
        }
    };

    const handleDelegate = async () => {
        const userEmail = session?.user?.email;
        if (!userEmail || !emailAnalysis.selectedEmail || !delegateEmail.trim()) return;
        setIsDelegating(true);
        try {
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
            }, accessToken);
            showNotification(`Email delegated to ${delegateEmail}`, { type: 'success' });
            dashboardData.refetchAll();
            setShowDelegateModal(false);
            setDelegateEmail('');
            setDelegateAction('');
        } catch (error) {
            console.error("Delegation failed:", error);
            showNotification("Failed to delegate email", { type: 'error' });
        } finally {
            setIsDelegating(false);
        }
    };

    const handleInboxDelegationReply = async (delegationId: number, asDraft: boolean = true) => {
        if (!quickReplyText.trim()) return;
        setIsSubmittingQuickReply(true);
        try {
            await delegationUnifiedSend(session!.user!.email!, delegationId, {
                reply_draft: quickReplyText,
                send_mode: 'thread',
                approval_required: asDraft
            }, accessToken);

            showNotification(asDraft ? "Draft submitted" : "Reply sent", { type: 'success' });
            setQuickReplyingId(null);
            setQuickReplyText('');
            dashboardData.refetchAll();
        } catch (error) {
            console.error(error);
            showNotification("Failed to send", { type: 'error' });
        } finally {
            setIsSubmittingQuickReply(false);
        }
    };

    const handleGenerateCustom = async () => {
        if (!emailAnalysis.selectedEmail || !emailAnalysis.userInstruction.trim()) return;
        setIsGeneratingCustom(true);
        try {
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
            showNotification("Custom reply generated", { type: 'success' });
        } catch (error) {
            console.error("Custom generation failed:", error);
            showNotification("Failed to generate custom reply", { type: 'error' });
        } finally {
            setIsGeneratingCustom(false);
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
            showNotification("Decision logged & draft saved", { type: 'success' });
            setIsEditing(false);
            dashboardData.refetchAll();
        } catch (error) {
            console.error(error);
            showNotification("Failed to log decision", { type: 'error' });
        }
    };

    const handleSendReply = async (editedDraft: string) => {
        if (!session?.user?.email || !emailAnalysis.selectedEmail) return;
        try {
            await sendDirectReply(
                session.user.email,
                accessToken,
                {
                    thread_id: emailAnalysis.selectedEmail.threadId,
                    email_id: emailAnalysis.selectedEmail.id,
                    recipient: emailAnalysis.selectedEmail.fromFull || emailAnalysis.selectedEmail.from,
                    subject: `Re: ${emailAnalysis.selectedEmail.subject}`,
                    body: editedDraft
                }
            );
            showNotification("Reply dispatched successfully", { type: 'success' });
            setIsEditing(false);
            emailAnalysis.setSelectedEmail(null);
            setViewMode('list');
            dashboardData.refetchAll();
        } catch (error) {
            console.error(error);
            showNotification("Failed to send reply", { type: 'error' });
        }
    };

    // Determine data based on view
    let currentEmails = groupedEmails;
    let isLoading = dashboardData.isLoadingEmails;

    if (view === 'sent') {
        currentEmails = sentGroupedEmails;
        isLoading = dashboardData.isLoadingSentEmails;
    } else if (view === 'drafts') {
        currentEmails = draftGroupedEmails;
        isLoading = dashboardData.isLoadingDraftEmails;
    }

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

    return (
        <div className="flex flex-1 h-full">
            <EmailList
                emails={currentEmails}
                loadingEmails={isLoading}
                emailFetchError={view === 'inbox' ? dashboardData.emailsError : null}
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
                activeView={view}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
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
                setActiveView={() => { }} // No-op props or wire up if needed
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
                        recentDelegates={[]}
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
