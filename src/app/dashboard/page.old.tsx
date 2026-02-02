import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { NewClientDialog } from '@/components/clients/new-client-dialog'
import { getClients } from '@/actions/clients'
import { ClientCard } from '@/components/clients/client-card'
import { LogOut } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) redirect('/')

  const clients = await getClients()

  const newClients = clients.filter((c) => c.status === 'new')
  // 'in_progress' is deprecated, mapping active statuses
  const inProgressClients = clients.filter((c) => c.status && ['estimate', 'follow_up', 'approval', 'approved'].includes(c.status))
  const cancelledClients = clients.filter((c) => c.status === 'cancelled')

  return (
    <div className='min-h-screen bg-background p-4 md:p-8 space-y-8'>
      {/* Header */}
      <header className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6'>
        <div>
          <h1 className='text-4xl font-extrabold tracking-tight text-primary'>Tablero de Clientes</h1>
          <p className='text-xl text-muted-foreground mt-2'>Bienvenido, {session.user.name}</p>
        </div>

        <div className='flex flex-wrap gap-4 items-center'>
          <NewClientDialog />
          <form
            action={async () => {
              'use server'
              await signOut()
            }}
          >
            <Button variant='outline' className='h-14 px-6 text-lg border-2'>
              <LogOut className='mr-2 h-5 w-5' /> Salir
            </Button>
          </form>
        </div>
      </header>

      {/* Kanban Board */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Columna: Nuevos */}
        <div className='flex flex-col gap-4'>
          <div className='bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900'>
            <h2 className='text-2xl font-bold text-blue-800 dark:text-blue-100 flex items-center justify-between'>
              Nuevos
              <span className='bg-blue-200 text-blue-800 text-base px-3 py-1 rounded-full'>{newClients.length}</span>
            </h2>
          </div>

          <div className='space-y-4'>
            {newClients.length === 0 && (
              <div className='p-8 text-center border-2 border-dashed rounded-xl bg-muted/30'>
                <p className='text-xl text-muted-foreground'>No hay clientes nuevos</p>
              </div>
            )}
            {newClients.map((client) => (
              // @ts-ignore
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </div>

        {/* Columna: En Proceso */}
        <div className='flex flex-col gap-4'>
          <div className='bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border-2 border-orange-100 dark:border-orange-900'>
            <h2 className='text-2xl font-bold text-orange-800 dark:text-orange-100 flex items-center justify-between'>
              En Proceso
              <span className='bg-orange-200 text-orange-800 text-base px-3 py-1 rounded-full'>{inProgressClients.length}</span>
            </h2>
          </div>

          <div className='space-y-4'>
            {inProgressClients.map((client) => (
              // @ts-ignore
              <ClientCard key={client.id} client={client} />
            ))}
            {inProgressClients.length === 0 && (
              <div className='p-8 text-center border-2 border-dashed rounded-xl bg-muted/30'>
                <p className='text-lg text-muted-foreground'>Arrastra clientes aquí iniciando un proceso</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna: Cancelados/Archivados */}
        <div className='flex flex-col gap-4'>
          <div className='bg-gray-100 dark:bg-gray-900/40 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800'>
            <h2 className='text-2xl font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between'>
              Archivados
              <span className='bg-gray-200 text-gray-800 text-base px-3 py-1 rounded-full'>{cancelledClients.length}</span>
            </h2>
          </div>

          <div className='space-y-4 opacity-80'>
            {cancelledClients.map((client) => (
              // @ts-ignore
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
