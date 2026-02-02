import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  className?: string
}

export function MetricCard({ title, value, description, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-lg font-bold text-zinc-700 uppercase'>{title}</CardTitle>
        <Icon className='h-8 w-8 text-zinc-700' />
      </CardHeader>
      <CardContent>
        <div className='text-4xl font-extrabold text-black'>{value}</div>
        {description && <p className='text-sm text-zinc-600 mt-2 font-bold'>{description}</p>}
      </CardContent>
    </Card>
  )
}
