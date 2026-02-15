const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
console.log("API_BASE_URL configured as:", API_BASE_URL);

const getHeaders = (userEmail?: string, accessToken?: string, refreshToken?: string) => {
    const headers: any = {
        'Content-Type': 'application/json',
    };
    if (userEmail) {
        headers['X-User-Email'] = userEmail;
    }
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
        headers['X-Refresh-Token'] = refreshToken;
    }
    return headers;
};

async function handleResponse(response: Response, context: string) {
    if (!response.ok) {
        let message = `HTTP Error ${response.status}`;
        try {
            const errorData = await response.json();
            message = errorData.detail || message;
        } catch (e) {
            // Not JSON or no detail
        }

        console.error(`API Error [${context}] (${response.status}):`, message);

        // Return a more descriptive error
        const error = new Error(message);
        (error as any).status = response.status;
        throw error;
    }
    return response.json();
}

export async function fetchTaskStatus(taskId: string, userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchTaskStatus');
}

export async function analyzeEmail(emailData: any, userEmail: string, accessToken?: string, userName?: string) {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify({
            ...emailData,
            user_name: userName
        }),
    });
    return handleResponse(response, 'analyzeEmail');
}

export async function logDecision(messageId: string, action: any, userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/decision?message_id=${messageId}`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify(action),
    });
    return handleResponse(response, 'logDecision');
}

export async function logCorrection(correction: any, userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/correction`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify(correction),
    });
    return handleResponse(response, 'logCorrection');
}

export async function getMetrics(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/metrics`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'getMetrics');
}

export async function fetchEmails(userEmail: string, accessToken: string) {
    const url = `${API_BASE_URL}/emails`;
    const response = await fetch(url, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchEmails');
}

export async function fetchSentEmails(userEmail: string, accessToken: string) {
    const url = `${API_BASE_URL}/emails/sent`;
    const response = await fetch(url, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchSentEmails');
}

export async function fetchDraftEmails(userEmail: string, accessToken: string) {
    const url = `${API_BASE_URL}/emails/drafts`;
    const response = await fetch(url, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchDraftEmails');
}

export async function generateCustomReply(data: { message_id: string, original_body: string, user_instruction: string, delegation_instruction?: string }, userEmail: string, accessToken?: string, userName?: string) {
    const response = await fetch(`${API_BASE_URL}/generate-custom`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify({
            ...data,
            user_name: userName
        }),
    });
    return handleResponse(response, 'generateCustomReply');
}

export async function getHistory(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/history`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'getHistory');
}

export async function getApiSettings(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/user/api-settings`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'getApiSettings');
}

export async function saveApiSettings(userEmail: string, provider: string, apiKey?: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/user/api-settings`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify({
            provider,
            api_key: apiKey || null
        }),
    });
    return handleResponse(response, 'saveApiSettings');
}

export async function updatePersonality(userEmail: string, personalityType: string, personalityContext?: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/user/personality`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify({
            personality_type: personalityType,
            personality_context: personalityContext
        }),
    });
    return handleResponse(response, 'updatePersonality');
}

export async function getPersonality(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/user/personality`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'getPersonality');
}

export async function fetchPolicies(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/policies`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchPolicies');
}

export async function createPolicy(userEmail: string, policyData: any, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/policies`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify(policyData),
    });
    return handleResponse(response, 'createPolicy');
}

export async function deletePolicy(userEmail: string, policyId: number, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/policies/${policyId}`, {
        method: 'DELETE',
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'deletePolicy');
}

export async function downloadAttachment(userEmail: string, messageId: string, attachmentId: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/attachments/${messageId}/${attachmentId}`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'downloadAttachment');
}

export async function logOverride(userEmail: string, data: any, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/override`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify(data),
    });
    return handleResponse(response, 'logOverride');
}

export async function createDelegation(userEmail: string, data: {
    email_id: string,
    thread_id: string,
    delegate_email: string,
    expected_action: string,
    original_from: string,
    original_subject: string,
    original_body: string,
    intel_report: any,
    sla_hours?: number
}, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/delegate`, {
        method: 'POST',
        headers: {
            ...getHeaders(userEmail),
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response, 'createDelegation');
}

export async function fetchDelegations(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/delegations`, {
        headers: {
            ...getHeaders(userEmail),
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
    });
    return handleResponse(response, 'fetchDelegations');
}

export async function fetchLoadForecast(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/forecast`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchLoadForecast');
}

export async function fetchAssignedDelegations(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/delegations/assigned`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchAssignedDelegations');
}

export async function submitDelegationDraft(userEmail: string, delegationId: number, replyDraft: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/delegations/${delegationId}/submit-draft`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify({ reply_draft: replyDraft }),
    });
    return handleResponse(response, 'submitDelegationDraft');
}

export async function approveDelegation(userEmail: string, accessToken: string, delegationId: number, sendMode: 'thread' | 'new' = 'thread') {
    const response = await fetch(`${API_BASE_URL}/delegations/${delegationId}/approve`, {
        method: 'POST',
        headers: {
            ...getHeaders(userEmail),
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ send_mode: sendMode }),
    });
    return handleResponse(response, 'approveDelegation');
}

export async function requestDelegationChanges(userEmail: string, delegationId: number, feedback: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/delegations/${delegationId}/request-changes`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify({ feedback }),
    });
    return handleResponse(response, 'requestDelegationChanges');
}

export async function deleteDelegation(userEmail: string, delegationId: number, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/delegations/${delegationId}`, {
        method: 'DELETE',
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'deleteDelegation');
}

export async function delegationSendDirect(userEmail: string, delegationId: number, replyDraft: string) {
    const response = await fetch(`${API_BASE_URL}/delegations/${delegationId}/send-direct`, {
        method: 'POST',
        headers: getHeaders(userEmail),
        body: JSON.stringify({ reply_draft: replyDraft }),
    });
    return handleResponse(response, 'delegationSendDirect');
}

export async function delegationUnifiedSend(userEmail: string, delegationId: number, data: {
    reply_draft: string,
    send_mode: 'thread' | 'new',
    approval_required: boolean
}, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/delegations/${delegationId}/send`, {
        method: 'POST',
        headers: {
            ...getHeaders(userEmail),
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response, 'delegationUnifiedSend');
}

export async function addDelegationInstruction(userEmail: string, delegationId: number, data: {
    instruction: string,
    sla_hours?: number
}) {
    const response = await fetch(`${API_BASE_URL}/delegations/${delegationId}/instructions`, {
        method: 'POST',
        headers: getHeaders(userEmail),
        body: JSON.stringify(data),
    });
    return handleResponse(response, 'addDelegationInstruction');
}

export async function fetchThread(threadId: string, userEmail: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/thread/${threadId}`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'fetchThread');
}

export async function sendDirectReply(userEmail: string, accessToken: string, data: {
    thread_id: string,
    email_id?: string,
    recipient: string,
    subject: string,
    body: string,
    in_reply_to?: string,
    references?: string
}) {
    const response = await fetch(`${API_BASE_URL}/reply`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify(data),
    });
    return handleResponse(response, 'sendDirectReply');
}

export async function fetchRecentDelegates(userEmail: string, accessToken?: string) {
    const response = await fetch(`${API_BASE_URL}/delegates/recent`, {
        headers: getHeaders(userEmail, accessToken),
    });
}

// Email Scheduling API Functions
export async function scheduleEmail(userEmail: string, accessToken: string, data: {
    recipient: string,
    subject: string,
    body: string,
    scheduled_time: string, // ISO 8601 format
    thread_id?: string,
    in_reply_to?: string,
    references?: string
}, refreshToken?: string) {
    const response = await fetch(`${API_BASE_URL}/emails/schedule`, {
        method: 'POST',
        headers: getHeaders(userEmail, accessToken, refreshToken),
        body: JSON.stringify(data),
    });
    return handleResponse(response, 'scheduleEmail');
}

export async function getScheduledEmails(userEmail: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/emails/scheduled`, {
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'getScheduledEmails');
}

export async function cancelScheduledEmail(userEmail: string, accessToken: string, scheduledEmailId: number) {
    const response = await fetch(`${API_BASE_URL}/emails/scheduled/${scheduledEmailId}`, {
        method: 'DELETE',
        headers: getHeaders(userEmail, accessToken),
    });
    return handleResponse(response, 'cancelScheduledEmail');
}

export async function updateScheduledEmail(userEmail: string, accessToken: string, scheduledEmailId: number, data: {
    scheduled_time: string // ISO 8601 format
}) {
    const response = await fetch(`${API_BASE_URL}/emails/scheduled/${scheduledEmailId}`, {
        method: 'PUT',
        headers: getHeaders(userEmail, accessToken),
        body: JSON.stringify(data),
    });
    return handleResponse(response, 'updateScheduledEmail');
}

