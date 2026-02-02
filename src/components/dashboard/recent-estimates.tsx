import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Map status to color/label
const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
  stale: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
}

export function RecentEstimates({ estimates }: { estimates: any[] }) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-xl'>Últimos Presupuestos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {estimates.length === 0 && <p className='text-zinc-600 text-lg font-medium'>No hay presupuestos recientes.</p>}
          {estimates.map((est) => {
            const statusInfo = statusMap[est.status] || { label: est.status, color: 'bg-gray-100' }

            return (
              <Link key={est.id} href={`/dashboard/clients/${est.clientId}`} className='flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors'>
                <div className='flex items-center gap-4'>
                  <Avatar className='h-12 w-12 border-2 border-white shadow-sm'>
                    <AvatarFallback className='bg-emerald-100 text-emerald-800 text-lg font-extrabold'>{est.clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='space-y-1'>
                    <p className='text-base font-bold leading-none text-black group-hover:text-emerald-800'>{est.clientName}</p>
                    <p className='text-sm text-zinc-600 font-medium'>{est.date ? new Date(est.date).toLocaleDateString() : 'Sin fecha'}</p>
                  </div>
                </div>
                <div className='flex flex-col items-end gap-2'>
                  <div className='text-lg font-bold text-gray-900'>${Number(est.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <Badge variant='outline' className={`${statusInfo.color} border-0 text-xs px-2 py-1`}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
