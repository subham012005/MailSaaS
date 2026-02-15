'use client';
import { useSession } from 'next-auth/react';
import MetricsView from '@/components/MetricsView';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function MetricsPage() {
    const { data: session } = useSession();
    const dashboardData = useDashboardData(session);
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <MetricsView
            metrics={dashboardData.metrics}
            isLoading={dashboardData.isLoadingMetrics}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
