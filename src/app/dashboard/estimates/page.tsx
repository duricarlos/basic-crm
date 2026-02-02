import { getEstimates } from '@/actions/estimates'
import { getClients } from '@/actions/clients'
import { EstimateProcessCard } from '@/components/estimates/estimate-process-card'
import { CreateEstimateButton } from '@/components/estimates/create-estimate-button'
import { Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EstimatesPage() {
  const [estimates, clients] = await Promise.all([
    getEstimates(),
    getClients()
  ])

  return (
    <div className='flex flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-gray-900'>Procesos de Estimación</h1>
          <p className='text-lg text-zinc-500 font-medium'>Visualice el estado actual de sus negociaciones.</p>
        </div>
        <CreateEstimateButton clients={clients} />
      </div>

      {estimates.length === 0 ? (
        <div className='p-6 rounded-xl bg-zinc-100 border border-zinc-200 flex flex-col gap-2'>
          <div className='flex items-center gap-2 font-bold text-zinc-900'>
            <Info className='h-5 w-5' />
            <span>Sin estimaciones activas</span>
          </div>
          <p className='text-zinc-500 text-base'>No hay presupuestos en proceso de negociación actualmente.</p>
        </div>
      ) : (
        <div className='grid gap-6'>
          {estimates.map((budget) => (
             <EstimateProcessCard 
                key={budget.id} 
                budget={{
                   ...budget,
                   updatedAt: budget.updatedAt || new Date()
                }}
             />
          ))}
        </div>
      )}
    </div>
  )
}
