'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { clients, budgets, logEntries } from '@/db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'

export async function getEstimates() {
  const session = await auth()
  if (!session?.user?.id) return []
  const userId = session.user.id

  // Fetch ACTIVE BUDGETS instead of clients.
  // This allows one client to have multiple budgets in progress.
  const activeBudgets = await db.query.budgets.findMany({
    with: {
      client: true, // We need client info
    },
    // Filter budgets that are in an active lifecycle
    where: (budgets, { eq, and, inArray }) =>
      and(
        // We need to filter by user, but budgets don't have userId directly, they have clientId.
        // However, we can filter using the JOIN or just fetch relevant ones.
        // Drizzle query builder 'where' on relationship often requires a different approach if userId is not on budget.
        // Let's assume we can filter by client.userId via JOIN or we fetch all user clients first.
        // For simplicity in this action, we might filtering in memory or using a raw SQL/advanced query if needed.
        // BUT, schema says budget.clientId references client.id.
        // Let's rely on the client relation for ownership check if possible, or perform a manual join.

        inArray(budgets.status, ['draft', 'sent', 'follow_up', 'approval', 'approved']),
        // We exclude 'cancelled' / 'declined' / 'paid' from the "Active Process" view.
        // Although 'paid' means success, usually we move it to "Sales" history.
        // But user wanted 4 states: Estimate -> Follow up -> Approval -> Approved.
        // So 'paid' might be 'approved' or separate. Let's keep it clean.
      ),
    orderBy: [desc(budgets.dateGenerated)],
  })

  // Filter by user ownership (since budget doesn't have userId)
  // This is a bit inefficient but safe for small data.
  // Ideally we should add userId to budgets or do a proper join.
  const userBudgets = activeBudgets.filter((b) => b.client.userId === userId)

  return userBudgets.map((b) => ({
    id: b.id,
    status: b.status, // sent, follow_up, approval, approved
    total: Number(b.total),
    updatedAt: b.dateGenerated, // Using budget date as update for now
    client: {
      id: b.client.id,
      name: b.client.name,
      status: b.client.status,
    },
  }))
}
