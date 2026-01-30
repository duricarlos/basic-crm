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
  const dueTimeStr = (formData.get('dueTime') as string) || '09:00'
  const dueDateISO = formData.get('dueDateISO') as string

  // Crear Log
  await db.insert(logEntries).values({
    clientId,
    type: dueDateStr ? 'call' : 'info',
    description,
  })

  // Crear Reminder si hay fecha
  if (dueDateStr) {
    let dueDate: Date

    if (dueDateISO) {
      // Si viene del cliente (con zona horaria correcta)
      dueDate = new Date(dueDateISO)
    } else {
      // Fallback (o si se deshabilitó JS): Construir en servidor (hora servidor/UTC)
      const [year, month, day] = dueDateStr.split('-').map(Number)
      const [hours, minutes] = dueTimeStr.split(':').map(Number)
      dueDate = new Date(year, month - 1, day, hours, minutes)
    }

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
