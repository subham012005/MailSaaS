'use client';
import ScheduledEmailsView from '@/components/ScheduledEmailsView';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

export default function ScheduledPage() {
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

    return (
        <ScheduledEmailsView
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
    );
}
