'use client'

import { useState } from 'react'
import { photoUrl } from '@/lib/photos'
import { cn } from '@/lib/utils'

// round dish picture; shows the emoji when there is no photo or it cannot load
export function DishPhoto({ id, emoji, className }: { id: string; emoji: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const src = photoUrl(id)
  return (
    <span className={cn('grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-3xl', className)}>
      {src && !failed ? <img src={src} alt="" loading="lazy" className="size-full object-cover" onError={() => setFailed(true)} /> : emoji}
    </span>
  )
}
