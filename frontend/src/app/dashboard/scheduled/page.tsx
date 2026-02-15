import { Metadata } from 'next';
import ScheduledClient from './ScheduledClient';

export const metadata: Metadata = {
    title: "Mailing Schedule | Neural Automation Control",
    description: "Manage your strategically timed communications. AI-driven scheduling for global inbox mastery.",
};

export default function ScheduledPage() {
    return <ScheduledClient />;
}
