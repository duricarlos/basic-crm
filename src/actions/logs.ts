'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { logEntries, reminders } from '../db/schema' // Asegúrate de tener 'reminders' en schema
import { revalidatePath } from 'next/cache'

export async function createLogAndReminder(clientId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const description = formData.get('description') as string
  const hasReminder = formData.get('hasReminder') === 'on' // Switch envía "on" si está activo (o manejado por estado en client pero formData standard)
  // Al usar shadcn switch controlada o no, a veces no manda value si no tiene name correcto o form submit.
  // En el componente client puse name="hasReminder" en el Switch? ShadCN switch usa button role, so we need a hidden input or use controlled state submitting custom data.
  // UPDATE: El componente AddLogDialog usa Switch de radix, que NO es un input nativo. Necesitamos un input hidden o usar server action con bind.
  // CORRECCIÓN: Examinaré AddLogDialog nuevamente. El Switch de shadcn no envía post data nativamente.

  // Vamos a asumir que "dueDate" está presente si hasReminder es true.
  // O mejor, modificaré AddLogDialog para asegurarme que envie el valor.
  // Por ahora, leamos dueDate. Si existe, asumimos recordatorio.

  const dueDateStr = formData.get('dueDate') as string

  // Crear Log
  await db.insert(logEntries).values({
    clientId,
    type: dueDateStr ? 'call' : 'info',
    description,
  })

  // Crear Reminder si hay fecha
  if (dueDateStr) {
    const dueDate = new Date(dueDateStr)
    // Set time to morning (e.g., 9:00 AM) to be safe for cron jobs running daily
    dueDate.setHours(9, 0, 0, 0)

    await db.insert(reminders).values({
      clientId,
      userId: session.user.id,
      description: `Recordatorio: ${description}`,
      dueDate: dueDate,
      isSent: false,
    })
  }

  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: true }
}
