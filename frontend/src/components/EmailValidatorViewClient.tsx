'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EmailValidatorView from '@/components/EmailValidatorView';

function EmailValidatorContent() {
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get('email') || '';

    return <EmailValidatorView initialEmail={initialEmail} />;
}

export default function EmailValidatorViewClient() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 flex flex-col">
            <Navbar />
            
            <main className="pt-32 pb-20 px-4 md:px-6 flex-grow flex flex-col justify-center">
                <div className="w-full max-w-4xl mx-auto">
                    <Suspense fallback={<EmailValidatorView />}>
                        <EmailValidatorContent />
                    </Suspense>
                </div>
            </main>

            <Footer />
        </div>
    );
}
