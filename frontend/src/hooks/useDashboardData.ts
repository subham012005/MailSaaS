import { useQuery } from '@tanstack/react-query';
import {
    fetchEmails,
    fetchSentEmails,
    fetchDraftEmails,
    getMetrics,
    fetchDelegations,
    fetchAssignedDelegations,
    getHistory,
    fetchLoadForecast,
    getPersonality,
    updatePersonality
} from '@/lib/api';

export const useDashboardData = (session: any) => {
    const userEmail = session?.user?.email;
    const accessToken = (session?.user as any)?.accessToken;

    const emailsQuery = useQuery({
        queryKey: ['emails', userEmail],
        queryFn: async () => {
            console.log('Fetching emails for:', userEmail);
            const data = await fetchEmails(userEmail!, accessToken!);
            console.log('Emails data received:', data?.length);
            return data;
        },
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 20000, // Poll every 20 seconds
    });

    const sentEmailsQuery = useQuery({
        queryKey: ['sentEmails', userEmail],
        queryFn: () => fetchSentEmails(userEmail!, accessToken!),
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 60000,
    });

    const draftEmailsQuery = useQuery({
        queryKey: ['draftEmails', userEmail],
        queryFn: () => fetchDraftEmails(userEmail!, accessToken!),
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 60000,
    });

    const metricsQuery = useQuery({
        queryKey: ['metrics', userEmail],
        queryFn: () => getMetrics(userEmail!, accessToken),
        enabled: !!userEmail && !!accessToken,
        refetchInterval: 60000,
    });

    const delegationsQuery = useQuery({
        queryKey: ['delegations', userEmail],
        queryFn: async () => {
            console.log('Fetching delegations for:', userEmail);
            const data = await fetchDelegations(userEmail!, accessToken);
            console.log('Delegations data received:', data);
            return data;
        },
        enabled: !!userEmail && !!accessToken,
        refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    });

    const assignedDelegationsQuery = useQuery({
        queryKey: ['assignedDelegations', userEmail],
        queryFn: async () => {
            console.log('Fetching assigned delegations for:', userEmail);
            const data = await fetchAssignedDelegations(userEmail!, accessToken);
            console.log('Assigned delegations data received:', data);
            return data;
        },
        enabled: !!userEmail && !!accessToken,
        refetchInterval: 45000,
    });

    const historyQuery = useQuery({
        queryKey: ['history', userEmail],
        queryFn: () => getHistory(userEmail!, accessToken),
        enabled: !!userEmail && !!accessToken,
    });

    const forecastQuery = useQuery({
        queryKey: ['forecast', userEmail],
        queryFn: () => fetchLoadForecast(userEmail!, accessToken),
        enabled: !!userEmail && !!accessToken,
        refetchInterval: 300000, // 5 minutes
    });

    const personalityQuery = useQuery({
        queryKey: ['personality', userEmail],
        queryFn: () => getPersonality(userEmail!, accessToken!),
        enabled: !!userEmail && !!accessToken,
    });

    return {
        emails: emailsQuery.data || [],
        isLoadingEmails: emailsQuery.isLoading,
        emailsError: emailsQuery.error,

        sentEmails: sentEmailsQuery.data || [],
        isLoadingSentEmails: sentEmailsQuery.isLoading,

        draftEmails: draftEmailsQuery.data || [],
        isLoadingDraftEmails: draftEmailsQuery.isLoading,

        metrics: metricsQuery.data,
        delegations: delegationsQuery.data || [],
        assignedDelegations: assignedDelegationsQuery.data || [],
        history: historyQuery.data || [],
        forecast: forecastQuery.data,
        personality: personalityQuery.data,

        refetchAll: () => {
            emailsQuery.refetch();
            sentEmailsQuery.refetch();
            draftEmailsQuery.refetch();
            metricsQuery.refetch();
            delegationsQuery.refetch();
            assignedDelegationsQuery.refetch();
            forecastQuery.refetch();
            personalityQuery.refetch();
        }
    };
};

export const groupEmailsByThread = (emails: any[]) => {
    const groups: { [key: string]: any } = {};
    emails.forEach(email => {
        const threadId = email.threadId;
        if (!groups[threadId]) {
            groups[threadId] = { ...email, threadCount: 1, hasUnread: !email.isRead };
        } else {
            const currentTopDate = new Date(groups[threadId].dateRaw).getTime();
            const thisDate = new Date(email.dateRaw).getTime();

            if (!email.isRead) groups[threadId].hasUnread = true;

            if (thisDate > currentTopDate) {
                const count = groups[threadId].threadCount;
                const accumulatedUnread = groups[threadId].hasUnread;
                groups[threadId] = { ...email, threadCount: count + 1, hasUnread: accumulatedUnread || !email.isRead };
            } else {
                groups[threadId].threadCount += 1;
            }
        }
    });
    return Object.values(groups).sort((a: any, b: any) =>
        new Date(b.dateRaw).getTime() - new Date(a.dateRaw).getTime()
    );
};
