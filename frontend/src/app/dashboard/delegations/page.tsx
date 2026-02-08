'use client';
import { useSession } from 'next-auth/react';
import DelegationView from '@/components/DelegationView'; // Original import path from dashboard/page.tsx
import { useDashboardData } from '@/hooks/useDashboardData';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function DelegationsPage() {
    const { data: session } = useSession();
    const dashboardData = useDashboardData(session);
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <DelegationView
            delegations={dashboardData.delegations}
            assignedDelegations={dashboardData.assignedDelegations}
            userEmail={session?.user?.email || ''}
            accessToken={(session?.user as any)?.accessToken}
            onRefresh={() => dashboardData.refetchAll()}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
