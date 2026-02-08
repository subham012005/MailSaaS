'use client';
import { useSession } from 'next-auth/react';
import MemoryView from '@/components/MemoryView';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function MemoryPage() {
    const { data: session } = useSession();
    const dashboardData = useDashboardData(session);
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <MemoryView
            history={dashboardData.history}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
