import { timestamp, pgTable, text, primaryKey, integer, boolean, pgEnum, jsonb, decimal } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { AdapterAccount } from 'next-auth/adapters'

// Enums
export const statusEnum = pgEnum('status', ['new', 'estimate', 'follow_up', 'approval', 'approved', 'cancelled'])
export const logTypeEnum = pgEnum('log_type', ['info', 'budget', 'call'])
export const budgetStatusEnum = pgEnum('budget_status', ['draft', 'sent', 'follow_up', 'approval', 'approved', 'declined', 'paid', 'cancelled'])

// NextAuth Tables
export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  }),
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)

// CRM Tables

export const clients = pgTable('clients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  description: text('description'),
  status: statusEnum('status').default('new'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const budgets = pgTable('budgets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),

  // Customization Fields
  title: text('title').default('Presupuesto'),
  header: text('header'),
  footer: text('footer'), // Notes or terms
  status: budgetStatusEnum('status').default('draft'),

  items: jsonb('items').notNull(), // Array of { description, quantity, price }
  total: decimal('total').notNull(),
  dateGenerated: timestamp('date_generated').defaultNow(),
})

export const logEntries = pgTable('log_entries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  type: logTypeEnum('type').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const reminders = pgTable('reminders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  dueDate: timestamp('due_date').notNull(),
  isSent: boolean('is_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  reminders: many(reminders),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  budgets: many(budgets),
  logs: many(logEntries),
  reminders: many(reminders),
}))

export const budgetRelations = relations(budgets, ({ one }) => ({
  client: one(clients, { fields: [budgets.clientId], references: [clients.id] }),
}))

export const logsRelations = relations(logEntries, ({ one }) => ({
  client: one(clients, { fields: [logEntries.clientId], references: [clients.id] }),
}))

export const remindersRelations = relations(reminders, ({ one }) => ({
  client: one(clients, { fields: [reminders.clientId], references: [clients.id] }),
  user: one(users, { fields: [reminders.userId], references: [users.id] }),
}))
