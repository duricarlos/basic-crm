import { getClients } from '@/actions/clients'
import { ClientCard } from '@/components/clients/client-card'
import { NewClientDialog } from '@/components/clients/new-client-dialog'
import { Users } from 'lucide-react'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Users className='h-8 w-8 text-emerald-600' />
          <h1 className='text-3xl font-bold text-gray-900'>Gestión de Clientes</h1>
        </div>
        <NewClientDialog />
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {clients.length === 0 ? (
          <div className='col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400'>
            <Users className='h-16 w-16 mb-4 opacity-20' />
            <p className='text-xl font-medium'>No tienes clientes registrados aún.</p>
            <p className='text-sm'>Agrega el primero usando el botón "Nuevo Cliente"</p>
          </div>
        ) : (
          clients.map((client) => <ClientCard key={client.id} client={client} />)
        )}
      </div>
    </div>
  )
}
