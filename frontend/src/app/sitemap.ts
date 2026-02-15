import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://smartemail.in';

    const routes = [
        '',
        '/features',
        '/how-it-works',
        '/privacy',
        '/terms',
        '/safety',
        '/contact',
        '/dashboard',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : route === '/dashboard' ? 0.9 : 0.8,
    }));
}
