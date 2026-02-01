import { useState, useEffect } from 'react';
import { fetchThread, analyzeEmail, fetchTaskStatus } from '@/lib/api';

export const useEmailAnalysis = (session: any, assignedDelegations: any[]) => {
    const [selectedEmail, setSelectedEmail] = useState<any>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [activeThread, setActiveThread] = useState<any[]>([]);
    const [isFetchingThread, setIsFetchingThread] = useState(false);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [expandedQuotes, setExpandedQuotes] = useState<{ [key: string]: boolean }>({});
    const [showReplyFlow, setShowReplyFlow] = useState(false);
    const [showContextQuestions, setShowContextQuestions] = useState(true);
    const [userInstruction, setUserInstruction] = useState('');

    const handleEmailSelect = async (email: any) => {
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
        const token = (session?.user as any)?.accessToken;

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
                    } catch (err: any) {
                        setAnalysisError(err.message || "Failed to check analysis status");
                        setIsAnalyzing(false);
                    }
                };

                setTimeout(poll, 500); // Initial delay

            } catch (error: any) {
                console.error("Analysis failed:", error);
                const msg = error.message || "Failed to analyze email. Please try again.";
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
