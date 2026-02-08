'use client';
import { useSession } from 'next-auth/react';
import SettingsView from '@/components/SettingsView';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function SettingsPage() {
    const { data: session } = useSession();
    const accessToken = (session?.user as any)?.accessToken;
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <SettingsView
            userEmail={session?.user?.email || ''}
            accessToken={accessToken}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
