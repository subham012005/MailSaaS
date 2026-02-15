'use client';
import ScheduledEmailsView from '@/components/ScheduledEmailsView';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function ScheduledClient() {
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <ScheduledEmailsView
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
