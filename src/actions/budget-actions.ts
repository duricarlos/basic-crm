'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { budgets, logEntries, reminders } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateBudgetStatus(budgetId: string, newStatus: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    // 1. Update status
    // Cast strict type if needed, but string is fine for drizzle usually if matches enum
    await db.update(budgets)
        .set({ status: newStatus as any }) 
        .where(eq(budgets.id, budgetId))

    // 2. Automate Log
    await db.insert(logEntries).values({
        clientId: (await getClientId(budgetId)),
        type: 'info',
        description: `Estado del presupuesto cambiado a: ${mapStatusToLabel(newStatus)}`
    })

    // 3. Optional: Trigger reminder logic? 
    // We will return a flag to the client to suggest opening the reminder dialog.
    // But we can also creating a default one here if we wanted. 
    // Let's keep it simple: Just update.

    revalidatePath('/dashboard/estimates')
    revalidatePath('/dashboard')
    
    return { success: true }
}

export async function cancelBudget(budgetId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    await db.update(budgets)
        .set({ status: 'cancelled' })
        .where(eq(budgets.id, budgetId))

    const clientId = await getClientId(budgetId)
    
    await db.insert(logEntries).values({
        clientId,
        type: 'info',
        description: `Presupuesto cancelado/archivado.`
    })

    revalidatePath('/dashboard/estimates')
    return { success: true }
}

export async function createBudgetReminder(clientId: string, description: string, date: Date) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    await db.insert(reminders).values({
        clientId: clientId,
        userId: session.user.id,
        description: description,
        dueDate: date,
        isSent: false
    })

    await db.insert(logEntries).values({
        clientId: clientId,
        type: 'info', // Changed from 'call' to 'info' as generic reminder log
        description: `Recordatorio creado: ${description}`
    })

    revalidatePath('/dashboard')
    return { success: true }
}

// Helper
async function getClientId(budgetId: string) {
    const res = await db.query.budgets.findFirst({
        where: eq(budgets.id, budgetId),
        columns: { clientId: true }
    })
    return res?.clientId || ''
}

function mapStatusToLabel(status: string) {
    const map:  Record<string, string> = {
        'draft': 'Borrador',
        'sent': 'Enviado',
        'follow_up': 'Seguimiento',
        'approval': 'Por Aprobar',
        'approved': 'Aprobado',
        'declined': 'Rechazado',
        'paid': 'Pagado',
        'cancelled': 'Cancelado'
    }
    return map[status] || status
}
