import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, FileText, Info } from 'lucide-react'

const iconMap = {
  call: Phone,
  budget: FileText,
  info: Info,
}

const colorMap = {
  call: 'bg-blue-100 text-blue-700',
  budget: 'bg-green-100 text-green-700',
  info: 'bg-gray-100 text-gray-700',
}

export function RecentActivity({ activities }: { activities: any[] }) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-xl'>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {activities.length === 0 && <p className='text-muted-foreground text-lg'>No hay actividad reciente.</p>}
          {activities.map((act) => {
            const Icon = iconMap[act.type as keyof typeof iconMap] || Info
            const colorClass = colorMap[act.type as keyof typeof colorMap] || 'bg-gray-100'

            return (
              <div key={act.id} className='flex gap-4 items-start'>
                <div className={`p-3 rounded-full ${colorClass}`}>
                  <Icon size={20} />
                </div>
                <div className='space-y-1'>
                  <p className='text-base font-medium text-gray-900'>{act.clientName}</p>
                  <p className='text-sm text-gray-600'>{act.description}</p>
                  <p className='text-xs text-gray-400'>{act.date ? new Date(act.date).toLocaleString() : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
