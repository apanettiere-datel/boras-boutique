import nextVitals from 'eslint-config-next/core-web-vitals'

// Next 16 removed `next lint`; `npm run lint` runs ESLint directly with
// Next's recommended rules.
const config = [
  ...nextVitals,
  {
    ignores: ['.next/**', '.open-next/**', '.wrangler/**', 'node_modules/**', 'public/**'],
  },
  {
    rules: {
      // Catalog and design-system images are plain <img> by design: they're
      // static files served straight from Workers assets, and next/image's
      // optimizer would need the Cloudflare Images binding configured.
      '@next/next/no-img-element': 'off',
    },
  },
]

export default config
