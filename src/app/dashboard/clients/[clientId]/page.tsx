import { auth } from '@/auth'
import { db } from '@/db'
import { clients, logEntries, budgets as budgetsTable } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ClientDetailView } from '@/components/clients/client-detail-view'

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const { clientId } = await params

  const clientData = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    with: {
      logs: {
        orderBy: [desc(logEntries.createdAt)],
      },
      budgets: {
        orderBy: [desc(budgetsTable.dateGenerated)],
      },
    },
  })

  if (!clientData) return <div className="p-8 text-center text-lg text-red-500">Cliente no encontrado</div>

  // Destructure to pass cleanly, handle Drizzle relation mapping
  const { logs, budgets, ...clientInfo } = clientData;

  return (
    <ClientDetailView 
        client={clientInfo} 
        budgets={budgets} 
        logs={logs} 
    />
  )
}
