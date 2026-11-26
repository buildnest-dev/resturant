'use client'

import * as React from 'react'
import { CircleCheckBig, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Helper Components ---

const DashedLine = () => <div className="w-full border-t-2 border-dashed border-border" aria-hidden="true" />

const Barcode = ({ value }: { value: string }) => {
  const hashCode = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  const seed = hashCode(value)
  const random = (s: number) => {
    const x = Math.sin(s) * 10000
    return x - Math.floor(x)
  }

  const spacing = 1.5
  const widths = Array.from({ length: 60 }, (_, i) => (random(seed + i) > 0.7 ? 2.5 : 1.5))
  const totalWidth = widths.reduce((acc, width) => acc + width + spacing, 0) - spacing
  const svgWidth = 250
  const svgHeight = 70
  const start = (svgWidth - totalWidth) / 2
  const bars = widths.map((width, i) => ({ width, x: start + widths.slice(0, i).reduce((a, b) => a + b + spacing, 0) }))

  return (
    <div className="flex flex-col items-center py-2">
      <svg xmlns="http://www.w3.org/2000/svg" width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} aria-label={`Barcode for value ${value}`} className="max-w-full fill-current text-foreground">
        {bars.map((bar, i) => <rect key={i} x={bar.x} y="10" width={bar.width} height="50" />)}
      </svg>
      <p className="mt-2 text-sm tracking-[0.3em] text-muted-foreground">{value}</p>
    </div>
  )
}

const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#f97316']
const confetti = () => Array.from({ length: 100 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  top: `${-20 + Math.random() * 10}%`,
  backgroundColor: colors[i % colors.length],
  transform: `rotate(${Math.random() * 360}deg)`,
  animation: `ticket-fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 2}s linear forwards`,
}))

const ConfettiExplosion = () => {
  // positions are picked once, so typing elsewhere on the page does not restart them
  const [pieces] = React.useState(confetti)
  return (
    <>
      <style>
        {`
          @keyframes ticket-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
        `}
      </style>
      <div className="pointer-events-none fixed inset-0 z-30 motion-reduce:hidden" aria-hidden="true">
        {pieces.map((style, i) => <div key={i} className="absolute h-4 w-2" style={style} />)}
      </div>
    </>
  )
}

// --- Main Ticket Component ---

export interface TicketProps extends React.HTMLAttributes<HTMLDivElement> {
  ticketId: string
  amount: number
  date: Date
  paymentTitle: string
  paymentDetail: string
  barcodeValue: string
  message?: string
  icon?: React.ReactNode
}

const AnimatedTicket = React.forwardRef<HTMLDivElement, TicketProps>(
  ({ className, ticketId, amount, date, paymentTitle, paymentDetail, barcodeValue, message = 'Your ticket has been issued successfully', icon, ...props }, ref) => {
    const [showConfetti, setShowConfetti] = React.useState(false)

    React.useEffect(() => {
      const mountTimer = setTimeout(() => setShowConfetti(true), 100)
      const unmountTimer = setTimeout(() => setShowConfetti(false), 6000)
      return () => {
        clearTimeout(mountTimer)
        clearTimeout(unmountTimer)
      }
    }, [])

    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
    const formattedDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date).replace(',', ' •')

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn('relative w-full max-w-sm rounded-2xl bg-card font-sans text-card-foreground shadow-lg', 'animate-in fade-in-0 zoom-in-95 duration-500', className)}
          {...props}
        >
          {/* Ticket cut-out effect */}
          <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background" />
          <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background" />

          <div className="flex flex-col items-center p-8 text-center">
            <div className="rounded-full bg-primary/10 p-3 animate-in zoom-in-50 delay-300 duration-500">
              {icon ?? <CircleCheckBig className="h-10 w-10 text-primary" />}
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Thank you!</h1>
            <p className="mt-1 text-muted-foreground">{message}</p>
          </div>

          <div className="space-y-6 px-8 pb-8">
            <DashedLine />
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="min-w-0">
                <p className="text-xs uppercase text-muted-foreground">Order ID</p>
                <p className="break-words font-mono font-medium">{ticketId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">{formattedAmount}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs uppercase text-muted-foreground">Date & Time</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
            <div className="flex items-center space-x-4 rounded-lg bg-muted/50 p-4 text-left">
              <Wallet className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{paymentTitle}</p>
                <p className="text-sm text-muted-foreground">{paymentDetail}</p>
              </div>
            </div>
            <DashedLine />
            <Barcode value={barcodeValue} />
          </div>
        </div>
      </>
    )
  },
)

AnimatedTicket.displayName = 'AnimatedTicket'

export { AnimatedTicket }
