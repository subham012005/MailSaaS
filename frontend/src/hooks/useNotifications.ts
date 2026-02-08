import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export interface Notification {
    id: number;
    type: 'delegation' | 'system' | 'approval' | 'new_email';
    message: string;
    read: boolean;
    target_view?: string;
    target_id?: string;
    created_at: string;
}

export function useNotifications() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const token = (session?.user as any)?.accessToken;

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            if (!token) return [];
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch notifications');
            return res.json() as Promise<Notification[]>;
        },
        enabled: !!token,
        refetchInterval: 30000, // Poll every 30s
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications/${id}/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications/read-all`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return {
        notifications,
        isLoading,
        markAsRead: markReadMutation.mutate,
        markAllAsRead: markAllReadMutation.mutate
    };
}
