import type { AppStatus, DeploymentStatus } from '@/types/database'

export const appStatusColors: Record<AppStatus, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  archived: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  maintenance: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

export const deploymentStatusColors: Record<DeploymentStatus, string> = {
  deployed: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  building: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  rolled_back: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

export const environmentColors: Record<string, string> = {
  development: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  staging: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  production: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
}

export const defaultStatusColor = 'bg-gray-500/10 text-gray-500 border-gray-500/20'

export const githubPRStateColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-500 border-green-500/20',
  merged: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  closed: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export const githubIssueStateColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-500 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

export const githubActionStatusColors: Record<string, string> = {
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  failure: 'bg-red-500/10 text-red-500 border-red-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  skipped: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  timed_out: 'bg-red-500/10 text-red-500 border-red-500/20',
  action_required: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
}
