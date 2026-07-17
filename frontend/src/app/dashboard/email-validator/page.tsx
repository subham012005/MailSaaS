'use client';

import { useSession } from 'next-auth/react';
import EmailValidatorView from '@/components/EmailValidatorView';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function EmailValidatorPage() {
    const { data: session } = useSession();
    const accessToken = (session?.user as { accessToken?: string })?.accessToken;
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <EmailValidatorView
            userEmail={session?.user?.email || ''}
            accessToken={accessToken}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
