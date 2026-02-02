import { db } from './index'
import { sql } from 'drizzle-orm'

async function fix() {
  console.log('Fixing enum...')
  // Forcefully drop the enum types and check constraints to allow re-creation
  // This is a rough fix for "push" conflicts on enums
  // Neon/Drizzle serverless sometimes struggles with enum updates if values don't match.

  // 1. Update existing rows to a safe value. 'pending' -> 'draft'
  // Pure SQL since drizzle schema is out of sync
  await db.execute(sql`ALTER TABLE budgets ALTER COLUMN status TYPE text`)
  await db.execute(sql`UPDATE budgets SET status = 'draft' WHERE status = 'pending'`)
  await db.execute(sql`UPDATE budgets SET status = 'approved' WHERE status = 'paid'`)

  console.log('Values updated. Now run db:push again.')
}

fix()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
