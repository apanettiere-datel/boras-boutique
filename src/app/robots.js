import { SITE_URL } from '@/lib/site'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/cart', '/checkout', '/saved'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
