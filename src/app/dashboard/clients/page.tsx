import { getClients } from '@/actions/clients'
import { NewClientDialog } from '@/components/clients/new-client-dialog'
import { ClientsTable } from '@/components/clients/clients-table'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className='space-y-6 p-6 bg-gray-50/50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Clientes</h1>
          <p className='text-sm text-gray-500'>Gestiona tus relaciones y presupuestos.</p>
        </div>
        <div className='flex items-center gap-2'>
          <NewClientDialog />
        </div>
      </div>

      <ClientsTable clients={clients} />
    </div>
  )
}
