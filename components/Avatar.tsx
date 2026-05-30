import { getAvatarColor } from '@/lib/avatarColor'

type Props = {
  userId: string
  username: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-20 h-20 text-3xl',
}

export default function Avatar({ userId, username, avatarUrl, size = 'md' }: Props) {
  const color = getAvatarColor(userId)

  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0`}>
      {avatarUrl
        ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
        : username[0]?.toUpperCase()
      }
    </div>
  )
}