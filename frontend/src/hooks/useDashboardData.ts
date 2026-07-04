import { useQuery } from '@tanstack/react-query';
import {
    fetchEmails,
    fetchSentEmails,
    fetchDraftEmails,
    fetchSpamEmails,
    fetchTrashEmails,
    fetchStarredEmails,
    fetchSnoozedEmails,
    getMetrics,
    fetchDelegations,
    fetchAssignedDelegations,
    getHistory,
    fetchLoadForecast,
    getPersonality,
    getScheduledEmails,
} from '@/lib/api';

interface DashboardSession {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        accessToken?: string;
    };
}

export const useDashboardData = (session: DashboardSession | null) => {
    const userEmail = session?.user?.email;
    const accessToken = session?.user?.accessToken;

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

    const spamEmailsQuery = useQuery({
        queryKey: ['spamEmails', userEmail],
        queryFn: () => fetchSpamEmails(userEmail!, accessToken!),
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 60000,
    });

    const trashEmailsQuery = useQuery({
        queryKey: ['trashEmails', userEmail],
        queryFn: () => fetchTrashEmails(userEmail!, accessToken!),
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 60000,
    });

    const starredEmailsQuery = useQuery({
        queryKey: ['starredEmails', userEmail],
        queryFn: () => fetchStarredEmails(userEmail!, accessToken!),
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 60000,
    });

    const snoozedEmailsQuery = useQuery({
        queryKey: ['snoozedEmails', userEmail],
        queryFn: () => fetchSnoozedEmails(userEmail!, accessToken!),
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 60000,
    });

    const metricsQuery = useQuery({
        queryKey: ['metrics', userEmail],
        queryFn: () => getMetrics(userEmail!, accessToken),
        enabled: false, // Disabled as feature is moved to later-updates
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
        enabled: false, // Disabled as feature is moved to later-updates
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
        enabled: false, // Disabled as feature is moved to later-updates
        refetchInterval: 45000,
    });

    const historyQuery = useQuery({
        queryKey: ['history', userEmail],
        queryFn: () => getHistory(userEmail!, accessToken),
        enabled: false, // Disabled as feature is moved to later-updates
    });

    const forecastQuery = useQuery({
        queryKey: ['forecast', userEmail],
        queryFn: () => fetchLoadForecast(userEmail!, accessToken),
        enabled: false, // Disabled as feature is moved to later-updates
        refetchInterval: 300000, // 5 minutes
    });

    const personalityQuery = useQuery({
        queryKey: ['personality', userEmail],
        queryFn: () => getPersonality(userEmail!, accessToken!),
        enabled: !!userEmail && !!accessToken,
    });

    const scheduledEmailsQuery = useQuery({
        queryKey: ['scheduledEmails', userEmail],
        queryFn: () => getScheduledEmails(userEmail!, accessToken!),
        enabled: !!accessToken && !!userEmail,
        refetchInterval: 10000, // Poll every 10 seconds for responsive updates
    });

    return {
        emails: emailsQuery.data || [],
        isLoadingEmails: emailsQuery.isLoading && emailsQuery.isFetching,
        emailsError: emailsQuery.error,

        sentEmails: sentEmailsQuery.data || [],
        isLoadingSentEmails: sentEmailsQuery.isLoading && sentEmailsQuery.isFetching,

        draftEmails: draftEmailsQuery.data || [],
        isLoadingDraftEmails: draftEmailsQuery.isLoading && draftEmailsQuery.isFetching,

        spamEmails: spamEmailsQuery.data || [],
        isLoadingSpamEmails: spamEmailsQuery.isLoading && spamEmailsQuery.isFetching,

        trashEmails: trashEmailsQuery.data || [],
        isLoadingTrashEmails: trashEmailsQuery.isLoading && trashEmailsQuery.isFetching,

        starredEmails: starredEmailsQuery.data || [],
        isLoadingStarredEmails: starredEmailsQuery.isLoading && starredEmailsQuery.isFetching,

        snoozedEmails: snoozedEmailsQuery.data || [],
        isLoadingSnoozedEmails: snoozedEmailsQuery.isLoading && snoozedEmailsQuery.isFetching,

        metrics: metricsQuery.data,
        isLoadingMetrics: metricsQuery.isLoading && metricsQuery.isFetching,
        delegations: delegationsQuery.data || [],
        assignedDelegations: assignedDelegationsQuery.data || [],
        history: historyQuery.data || [],
        forecast: forecastQuery.data,
        personality: personalityQuery.data,
        isLoadingPersonality: personalityQuery.isLoading && personalityQuery.isFetching,

        scheduledEmails: scheduledEmailsQuery.data || [],
        isLoadingScheduledEmails: scheduledEmailsQuery.isLoading && scheduledEmailsQuery.isFetching,

        refetchAll: () => {
            emailsQuery.refetch();
            sentEmailsQuery.refetch();
            draftEmailsQuery.refetch();
            spamEmailsQuery.refetch();
            trashEmailsQuery.refetch();
            starredEmailsQuery.refetch();
            snoozedEmailsQuery.refetch();
            metricsQuery.refetch();
            delegationsQuery.refetch();
            assignedDelegationsQuery.refetch();
            forecastQuery.refetch();
            personalityQuery.refetch();
            scheduledEmailsQuery.refetch();
        }
    };
};

interface Email {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    fromFull: string;
    to?: string;
    to_emails?: string[];
    preview: string;
    date: string;
    dateRaw: string;
    isRead: boolean;
}

interface GroupedEmail extends Email {
    threadCount: number;
    hasUnread: boolean;
}

export const groupEmailsByThread = (emails: Email[]) => {
    const groups: { [key: string]: GroupedEmail } = {};
    emails.forEach(email => {
        const threadId = email.threadId;
        if (!threadId) return;

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
    return Object.values(groups).sort((a, b) =>
        new Date(b.dateRaw).getTime() - new Date(a.dateRaw).getTime()
    );
};
