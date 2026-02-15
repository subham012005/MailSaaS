import { Metadata } from 'next';
import MetricsView from '@/components/MetricsView';
import MetricsClient from './MetricsClient';

export const metadata: Metadata = {
    title: "Intelligence Metrics | Strategic Email ROI",
    description: "Analyze your AI mailing efficiency. Track time saved, decision accuracy, and neural inbox reduction stats.",
};

export default function MetricsPage() {
    return <MetricsClient />;
}
