import { getEstimates } from '@/actions/estimates'
import { getClients } from '@/actions/clients'
import { EstimateProcessCard } from '@/components/estimates/estimate-process-card'
import { CreateEstimateButton } from '@/components/estimates/create-estimate-button'
import { StatusFilter } from '@/components/dashboard/status-filter'
import { Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EstimatesPage({ searchParams }: PageProps) {
  const [estimates, clients] = await Promise.all([getEstimates(), getClients()])
  const params = await searchParams
  const filter = typeof params.filter === 'string' ? params.filter : 'all'

  const filteredEstimates = estimates.filter((estimate) => {
    if (filter === 'all') return true
    return estimate.status === filter
  })

  // Calculate counts for each status
  const counts = estimates.reduce((acc, estimate) => {
    const status = estimate.status || 'draft'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const filterOptions = [
    { label: 'Borrador', value: 'draft', count: counts['draft'] },
    { label: 'Enviado', value: 'sent', count: counts['sent'] },
    { label: 'Seguimiento', value: 'follow_up', count: counts['follow_up'] },
    { label: 'En Aprobación', value: 'approval', count: counts['approval'] },
    { label: 'Aprobado', value: 'approved', count: counts['approved'] },
  ].filter(opt => (opt.count ?? 0) > 0)

  return (
    <div className='flex flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-gray-900'>Procesos de Estimación</h1>
          <p className='text-lg text-zinc-500 font-medium'>Visualice el estado actual de sus negociaciones.</p>
        </div>
        <CreateEstimateButton clients={clients} />
      </div>

      <div className="flex flex-col gap-6">
        <StatusFilter options={filterOptions} allLabel="Todos" />

        {filteredEstimates.length === 0 ? (
          <div className='p-12 rounded-xl bg-zinc-50 border border-zinc-200 border-dashed flex flex-col items-center justify-center gap-2 text-center'>
            <div className='p-3 bg-zinc-100 rounded-full'>
              <Info className='h-6 w-6 text-zinc-400' />
            </div>
            <h3 className="font-semibold text-zinc-900">Sin estimaciones</h3>
            <p className='text-zinc-500 text-sm max-w-sm'>
              {filter === 'all' 
                ? 'No hay presupuestos en proceso de negociación actualmente.' 
                : 'No hay presupuestos con el estado seleccionado.'}
            </p>
            {filter !== 'all' && (
              <StatusFilter options={[]} allLabel="Ver todos" />
            )}
          </div>
        ) : (
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
            {filteredEstimates.map((estimate) => (
              <EstimateProcessCard key={estimate.id} budget={estimate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
