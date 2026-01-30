import { auth } from '@/auth'
import { db } from '@/db'
import { clients, logEntries, budgets } from '../../../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { AddLogDialog } from '@/components/clients/add-log-dialog'
import { TestReminderButton } from '@/components/clients/test-reminder-button'

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { clientId } = await params

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    with: {
      logs: {
        orderBy: [desc(logEntries.createdAt)],
      },
      budgets: {
        orderBy: [desc(budgets.dateGenerated)],
      },
    },
  })

  if (!client) return <div>Cliente no encontrado</div>

  return (
    <div className='p-4 md:p-8 max-w-5xl mx-auto space-y-6'>
      <Link href='/dashboard'>
        <Button variant='ghost' size='lg' className='mb-4 text-lg'>
          <ArrowLeft className='mr-2 h-6 w-6' /> Volver al Tablero
        </Button>
      </Link>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Columna Izquierda: Datos del Cliente */}
        <div className='md:col-span-1 space-y-6'>
          <Card className='border-2 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-2xl font-bold'>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-lg'>
              <div>
                <p className='font-semibold text-muted-foreground'>Nombre</p>
                <p>{client.name}</p>
              </div>
              <div>
                <p className='font-semibold text-muted-foreground'>Email</p>
                <p>{client.email || '--'}</p>
              </div>
              <div>
                <p className='font-semibold text-muted-foreground'>Teléfono</p>
                <p>{client.phone || '--'}</p>
              </div>
              <div>
                <p className='font-semibold text-muted-foreground'>Estado Actual</p>
                <Badge className='mt-1 text-base'>{client.status === 'new' ? 'Nuevo' : client.status === 'in_progress' ? 'En Proceso' : client.status === 'cancelled' ? 'Cancelado' : client.status}</Badge>
              </div>
              <Separator />
              <div>
                <p className='font-semibold text-muted-foreground'>Notas</p>
                <p className='text-base'>{client.description || 'Sin notas'}</p>
              </div>

              <Separator />
              <div>
                <p className='font-semibold text-muted-foreground mb-2'>Herramientas</p>
                <TestReminderButton clientId={clientId} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Acciones y Logs */}
        <div className='md:col-span-2 space-y-6'>
          {/* Presupuestos */}
          <Card className='border-2 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-2xl font-bold'>Presupuestos</CardTitle>
              <Link href={`/dashboard/clients/${clientId}/new-budget`}>
                <Button size='lg' className='text-lg font-bold'>
                  <Plus className='mr-2 h-5 w-5' />
                  Crear Nuevo
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {client.budgets.length === 0 ? (
                <p className='text-muted-foreground text-center py-4 text-lg'>No hay presupuestos generados.</p>
              ) : (
                <ul className='space-y-3'>
                  {client.budgets.map((b) => (
                    <li key={b.id} className='flex justify-between items-center p-3 bg-muted rounded-lg'>
                      <div>
                        <p className='font-bold text-lg'>Total: {parseFloat(b.total).toLocaleString()} $</p>
                        <p className='text-sm text-muted-foreground'>{b.dateGenerated ? new Date(b.dateGenerated).toLocaleDateString() : 'Sin fecha'}</p>
                      </div>
                      <Link href={`/api/budgets/${b.id}/pdf`} target='_blank'>
                        <Button variant='outline'>Ver PDF</Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Historial (Logs) */}
          <Card className='border-2 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-2xl font-bold'>Historial de Actividad</CardTitle>
              <div className='w-auto'>
                {/* AddLogDialog importado dinámicamente o estático arriba no importa, pero hay que importarlo */}
                <AddLogDialog clientId={clientId} />
              </div>
            </CardHeader>
            <CardContent>
              <ul className='space-y-4 relative border-l-2 border-muted ml-3 pl-6'>
                {client.logs.map((log) => (
                  <li key={log.id} className='relative pb-4'>
                    <span className='absolute -left-8.25 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background' />
                    <p className='text-lg font-medium'>{log.description}</p>
                    <p className='text-sm text-muted-foreground'>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''} • {log.type}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
