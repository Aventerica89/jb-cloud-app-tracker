export interface ProviderLogoInfo {
  logo: string
  color: string
  darkColor?: string
}

export const PROVIDER_LOGOS: Record<string, ProviderLogoInfo> = {
  vercel: { logo: '/logos/vercel.svg', color: '#000000', darkColor: '#ffffff' },
  cloudflare: { logo: '/logos/cloudflare.svg', color: '#f38020' },
  github: { logo: '/logos/github.svg', color: '#24292f', darkColor: '#ffffff' },
  railway: { logo: '/logos/railway.svg', color: '#a855f7' },
  netlify: { logo: '/logos/netlify.svg', color: '#00c7b7' },
  aws: { logo: '/logos/aws.svg', color: '#ff9900' },
  'fly-io': { logo: '/logos/fly-io.svg', color: '#7c3aed' },
  render: { logo: '/logos/render.svg', color: '#46e3b7' },
  digitalocean: { logo: '/logos/digitalocean.svg', color: '#0080ff' },
  heroku: { logo: '/logos/heroku.svg', color: '#430098' },
  supabase: { logo: '/logos/supabase.svg', color: '#3ecf8e' },
  firebase: { logo: '/logos/firebase.svg', color: '#ffca28' },
  azure: { logo: '/logos/azure.svg', color: '#0078d4' },
}

function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim().replace(/\s+/g, '-')
}

export function getProviderLogo(slug: string): ProviderLogoInfo | null {
  const normalized = normalizeSlug(slug)
  return PROVIDER_LOGOS[normalized] ?? null
}

export function getProviderColor(slug: string): string | null {
  const info = getProviderLogo(slug)
  return info?.color ?? null
}

export function getAppFaviconUrl(url: string): string {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch {
    return `https://www.google.com/s2/favicons?domain=${url}&sz=32`
  }
}
