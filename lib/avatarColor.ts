const colors = [
  'bg-indigo-600',
  'bg-violet-600',
  'bg-pink-600',
  'bg-rose-600',
  'bg-orange-600',
  'bg-amber-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-emerald-600',
  'bg-blue-600',
]

export function getAvatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}