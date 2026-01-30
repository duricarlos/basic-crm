import { auth } from '@/auth'
import { db } from '@/db'
import { budgets, clients, users } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { renderToStream } from '@react-pdf/renderer'
import { BudgetDocument } from '@/components/pdf/BudgetDocument'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ budgetId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { budgetId } = await params

  const budget = await db.query.budgets.findFirst({
    where: eq(budgets.id, budgetId),
    with: {
      client: true,
    },
  })

  if (!budget) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Verificar que el usuario sea el dueño del cliente asociado al presupuesto
  const clientOwner = await db.query.clients.findFirst({
    where: eq(clients.id, budget.clientId),
    columns: { userId: true },
  })

  if (clientOwner?.userId !== session.user.id) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Obtener datos del usuario actual para mostrarlos en el PDF
  const userInfo = session.user

  const stream = await renderToStream(<BudgetDocument budget={budget} client={budget.client} user={userInfo} />)

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="presupuesto-${clientOwner.userId}-${budget.dateGenerated}.pdf"`,
    },
  })
}
