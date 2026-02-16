'use client';

import { useState } from 'react';
import { fetchThread, analyzeEmail, fetchTaskStatus } from '@/lib/api';

interface Email {
    id: string;
    threadId?: string;
    subject: string;
    from: string;
    fromFull: string;
    preview: string;
    dateRaw?: string;
    date: string;
    body?: string;
    html_body?: string;
    quoted_body?: string;
    attachments?: Array<{
        id: string;
        filename: string;
        size: number;
        mimeType: string;
    }>;
}

interface ThreadMessage {
    id: string;
    from: string;
    date: string;
    body: string;
    html_body?: string;
    quoted_body?: string;
}

interface AnalysisResult {
    primary_action_id?: string;
    recommendations?: Array<{
        id: string;
        action_label: string;
        action_type?: string;
        decision_rationale: string;
        suggested_reply?: string;
        why_recommendation?: string;
        predicted_outcome?: string;
    }>;
    summary?: string[];
    questions_for_user?: string[];
    obligation_score?: number;
}

export const useEmailAnalysis = (session: { user?: { name?: string | null; email?: string | null; image?: string | null; accessToken?: string } } | null, assignedDelegations: { expected_action: string; original_sender: string; original_subject: string }[]) => {
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [activeThread, setActiveThread] = useState<ThreadMessage[]>([]);
    const [isFetchingThread, setIsFetchingThread] = useState(false);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [expandedQuotes, setExpandedQuotes] = useState<{ [key: string]: boolean }>({});
    const [showReplyFlow, setShowReplyFlow] = useState(false);
    const [showContextQuestions, setShowContextQuestions] = useState(true);
    const [userInstruction, setUserInstruction] = useState('');

    const handleEmailSelect = async (email: Email) => {
        setSelectedEmail(email);
        setAnalysisResult(null);
        setAnalysisError(null);
        setActiveThread([]);
        setExpandedQuotes({});
        setShowReplyFlow(false);
        setShowContextQuestions(true);
        setUserInstruction('');

        const userEmail = session?.user?.email;
        const userName = session?.user?.name;
        const token = session?.user?.accessToken;

        if (userEmail && token) {
            setIsAnalyzing(true);
            setIsFetchingThread(true);

            try {
                // Fetch thread history
                if (email.threadId) {
                    fetchThread(email.threadId, userEmail, token)
                        .then(messages => {
                            setActiveThread(messages);
                            setIsFetchingThread(false);
                        })
                        .catch(err => {
                            console.error("Failed to fetch thread:", err);
                            setIsFetchingThread(false);
                        });
                }

                // Match delegations for context
                const matchingDelegation = assignedDelegations.find(d =>
                    (d.original_sender === email.from ||
                        d.original_sender?.includes(email.from) ||
                        email.from?.includes(d.original_sender)) &&
                    (d.original_subject === email.subject ||
                        email.subject?.includes(d.original_subject) ||
                        d.original_subject?.includes(email.subject))
                );

                const { task_id } = await analyzeEmail({
                    message_id: email.id,
                    thread_id: email.threadId || 'unknown',
                    from_email: email.fromFull || email.from,
                    to_emails: [],
                    subject: email.subject,
                    body: email.preview,
                    timestamp: email.dateRaw || new Date().toISOString(),
                    delegation_instruction: matchingDelegation?.expected_action,
                    delegation_sender: matchingDelegation ? "Boss (Delegator)" : undefined
                }, userEmail, token, userName || undefined);

                // Poll for result
                let attempts = 0;
                const maxAttempts = 30; // 30 seconds max

                const poll = async () => {
                    try {
                        const task = await fetchTaskStatus(task_id, userEmail!, token);
                        if (task.status === 'completed') {
                            setAnalysisResult(task.result);
                            setIsAnalyzing(false);
                        } else if (task.status === 'failed') {
                            setAnalysisError(task.error || "Analysis failed");
                            setIsAnalyzing(false);
                        } else if (attempts < maxAttempts) {
                            attempts++;
                            setTimeout(poll, 1000); // Poll every second
                        } else {
                            setAnalysisError("Analysis timed out. Please try again.");
                            setIsAnalyzing(false);
                        }
                    } catch (err: unknown) {
                        setAnalysisError((err as Error).message || "Failed to check analysis status");
                        setIsAnalyzing(false);
                    }
                };

                setTimeout(poll, 500); // Initial delay

            } catch (error: unknown) {
                console.error("Analysis failed:", error);
                const msg = (error as Error).message || "Failed to analyze email. Please try again.";
                setAnalysisError(msg);

                if (msg.includes("API Key missing")) {
                    setShowApiKeyInput(true);
                }
                setIsAnalyzing(false);
            }
        }
    };

    return {
        selectedEmail,
        setSelectedEmail,
        analysisResult,
        setAnalysisResult,
        isAnalyzing,
        analysisError,
        setAnalysisError,
        activeThread,
        isFetchingThread,
        showApiKeyInput,
        setShowApiKeyInput,
        expandedQuotes,
        setExpandedQuotes,
        showReplyFlow,
        setShowReplyFlow,
        showContextQuestions,
        setShowContextQuestions,
        userInstruction,
        setUserInstruction,
        handleEmailSelect
    };
};
