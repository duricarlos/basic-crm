'use server'

import { auth } from "@/auth";
import { db } from "@/db";
import { clients, logEntries } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";

export async function createClient(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const description = formData.get("description") as string;

  if (!name) {
    throw new Error("El nombre es requerido");
  }

  // Create client
  const [newClient] = await db.insert(clients).values({
    userId: session.user.id!,
    name,
    email,
    phone,
    description,
    status: "new",
  }).returning();

  // Create initial log
  await db.insert(logEntries).values({
    clientId: newClient.id,
    type: "info",
    description: "Cliente creado en el sistema",
  });

  revalidatePath("/dashboard");
  return { success: true, clientId: newClient.id };
}

export async function getClients() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.clients.findMany({
    where: eq(clients.userId, session.user.id),
    orderBy: [desc(clients.createdAt)],
    with: {
      logs: {
        orderBy: [desc(logEntries.createdAt)],
        limit: 1,
      }
    }
  });
}

export async function updateClientStatus(clientId: string, newStatus: "new" | "in_progress" | "cancelled") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.update(clients)
      .set({ status: newStatus })
      .where(eq(clients.id, clientId));

    revalidatePath("/dashboard");
}
