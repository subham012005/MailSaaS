import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://smartemail.in';

    const staticRoutes = [
        { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
        { path: '/email-validator', priority: 0.95, changeFrequency: 'daily' as const },
        { path: '/dashboard', priority: 0.9, changeFrequency: 'weekly' as const },
        { path: '/features', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/how-it-works', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/india-ai-email-assistant-market', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
        { path: '/privacy', priority: 0.5, changeFrequency: 'monthly' as const },
        { path: '/terms', priority: 0.5, changeFrequency: 'monthly' as const },
        { path: '/safety', priority: 0.5, changeFrequency: 'monthly' as const },
    ];

    return staticRoutes.map(({ path, priority, changeFrequency }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));
}
