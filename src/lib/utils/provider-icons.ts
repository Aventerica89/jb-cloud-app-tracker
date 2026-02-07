import {
  Triangle,
  Cloud,
  Github,
  Server,
  Flame,
  Database,
  Globe,
  Cpu,
  Box,
  Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const providerIconMap: Record<string, LucideIcon> = {
  vercel: Triangle,
  cloudflare: Cloud,
  github: Github,
  railway: Flame,
  aws: Cpu,
  'google-cloud': Globe,
  netlify: Layers,
  digitalocean: Database,
  supabase: Database,
  'fly-io': Box,
  render: Server,
}

const defaultProviderIcon: LucideIcon = Server

export function getProviderIcon(slug: string): LucideIcon {
  return providerIconMap[slug] ?? defaultProviderIcon
}
