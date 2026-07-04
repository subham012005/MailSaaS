'use client';
import { useSession } from 'next-auth/react';
import GovernanceRoom from '@/components/GovernanceRoom';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function GovernancePage() {
    const { data: session } = useSession();
    const accessToken = (session?.user as { accessToken?: string })?.accessToken;
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <GovernanceRoom
            userEmail={session?.user?.email || ''}
            accessToken={accessToken}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
