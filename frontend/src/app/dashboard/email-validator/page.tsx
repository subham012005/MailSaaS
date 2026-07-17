'use client';

import EmailValidatorView from '@/components/EmailValidatorView';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function EmailValidatorPage() {
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <EmailValidatorView
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
