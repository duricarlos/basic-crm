'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { clients, budgets, logEntries } from '@/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'

export async function getDashboardData() {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = session.user.id

  // 1. Get all client IDs for this user
  const userClients = await db.select({ id: clients.id, status: clients.status }).from(clients).where(eq(clients.userId, userId))
  const clientIds = userClients.map((c) => c.id)

  if (clientIds.length === 0) {
    return {
      pipelineValue: 0,
      wonValue: 0,
      budgetCounts: {},
      recentActivity: [],
      recentEstimates: [],
    }
  }

  // 2. Metrics based on BUDGETS, not Clients
  const budgetCounts: Record<string, number> = {
    draft: 0,
    sent: 0,
    follow_up: 0,
    approval: 0,
    approved: 0,
    declined: 0,
    paid: 0,
    cancelled: 0,
  }

  // Get all budgets for these clients
  const userBudgets = await db
    .select({
      id: budgets.id,
      status: budgets.status,
      total: budgets.total,
    })
    .from(budgets)
    .where(inArray(budgets.clientId, clientIds))

  let pipelineValue = 0 // Values in negotiation (sent, follow_up, approval)
  let wonValue = 0 // Values closed (approved, paid)

  userBudgets.forEach((budget) => {
    const status = budget.status || 'draft'

    // Increment count
    if (budgetCounts[status] !== undefined) {
      budgetCounts[status]++
    }

    // Sum values
    const value = Number(budget.total)
    if (['sent', 'follow_up', 'approval'].includes(status)) {
      pipelineValue += value
    } else if (['approved', 'paid'].includes(status)) {
      wonValue += value
    }
  })

  // 3. Recent Activity
  const recentActivity = await db
    .select({
      id: logEntries.id,
      type: logEntries.type,
      description: logEntries.description,
      date: logEntries.createdAt,
      clientName: clients.name,
      clientId: clients.id,
    })
    .from(logEntries)
    .innerJoin(clients, eq(logEntries.clientId, clients.id))
    .where(inArray(logEntries.clientId, clientIds))
    .orderBy(desc(logEntries.createdAt))
    .limit(5)

  // 4. Recent Estimates
  const recentEstimates = await db
    .select({
      id: budgets.id,
      clientName: clients.name,
      total: budgets.total,
      status: budgets.status,
      date: budgets.dateGenerated,
      clientId: clients.id,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .where(inArray(budgets.clientId, clientIds))
    .orderBy(desc(budgets.dateGenerated))
    .limit(5)

  return {
    pipelineValue,
    wonValue,
    budgetCounts,
    recentActivity,
    recentEstimates,
  }
}
