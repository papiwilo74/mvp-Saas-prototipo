import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export const sitemapRouter = Router();

sitemapRouter.get('/', async (_req, res) => {
  const baseUrl = env.FRONTEND_URL || 'http://localhost:5173';

  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true }
  });

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/menu', priority: '0.9', changefreq: 'daily' },
    { loc: '/cart', priority: '0.6', changefreq: 'monthly' },
    { loc: '/login', priority: '0.3', changefreq: 'monthly' },
    { loc: '/register', priority: '0.3', changefreq: 'monthly' },
    { loc: '/terms', priority: '0.3', changefreq: 'monthly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'monthly' },
  ];

  const menuPages = restaurants.map((r) => ({
    loc: `/menu?restaurant=${r.slug}`,
    priority: '0.8',
    changefreq: 'daily',
    lastmod: r.updatedAt?.toISOString()?.split('T')[0]
  }));

  const allPages = [...staticPages, ...menuPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(xml);
});
