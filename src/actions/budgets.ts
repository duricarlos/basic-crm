'use server'

import { auth } from "@/auth";
import { db } from "@/db";
import { budgets, logEntries, clients } from "../db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc, sql } from "drizzle-orm";

interface BudgetItem {
  description: string;
  quantity: number;
  price: number;
}

interface BudgetOptions {
    title?: string;
    header?: string;
    footer?: string;
}

export async function createBudget(clientId: string, items: BudgetItem[], total: number, options?: BudgetOptions) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Crear el presupuesto
  const [newBudget] = await db.insert(budgets).values({
    clientId,
    items,
    total: total.toString(),
    title: options?.title || 'Presupuesto',
    header: options?.header || '',
    footer: options?.footer || '',
  }).returning();

  // 2. Registrar en Logs
  await db.insert(logEntries).values({
    clientId,
    type: "budget",
    description: `Presupuesto generado por valor de $${total}`,
  });

  // 3. Actualizar estado del cliente a "En Proceso" si es nuevo
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    columns: { status: true }
  });

  if (client?.status === 'new') {
    await db.update(clients)
      .set({ status: 'in_progress' })
      .where(eq(clients.id, clientId));
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  return { success: true, budgetId: newBudget.id };
}

// Pseudo Inteligencia: Buscar items usados anteriormente
export async function searchPreviousItems(query: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Esta consulta es un poco compleja en ORM puro si los items son JSONB.
  // Buscamos presupuestos de clietnes de este usuario.
  // Nota: Esto es una simplificación. Idealmente extraeríamos items únicos a una tabla separada o usaríamos funciones de postgres para jsonb.
  // Para MVP: Traemos los últimos 50 presupuestos y filtramos en memoria (no es lo más eficiente pero funciona para pocos datos).
  
  const userClients = await db.query.clients.findMany({
      where: eq(clients.userId, session.user.id),
      with: {
          budgets: {
              limit: 20,
              orderBy: [desc(budgets.dateGenerated)]
          }
      }
  });

  const allItems: BudgetItem[] = [];
  userClients.forEach(c => {
      c.budgets.forEach(b => {
          const budgetItems = b.items as BudgetItem[];
          allItems.push(...budgetItems);
      });
  });

  // Filtrar y de-duplicar
  const suggestions = allItems
    .filter(item => item.description.toLowerCase().includes(query.toLowerCase()))
    .reduce((acc, current) => {
        const x = acc.find(item => item.description === current.description);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, [] as BudgetItem[])
    .slice(0, 5); // Max 5 sugerencias

  return suggestions;
}
