'use server'

import { auth } from "@/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestReminder(clientId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized or no email");

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
  });

  if (!client) throw new Error("Client not found");

  try {
    const { data, error } = await resend.emails.send({
        from: 'CRM Senior <onboarding@resend.dev>',
        to: session.user.email,
        subject: `[PRUEBA] 🔔 Recordatorio: ${client.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; font-size: 24px;">Recordatorio de Seguimiento (PRUEBA)</h1>
                <p style="font-size: 16px; color: #555;">Hola ${session.user.name || 'Usuario'},</p>
                <p style="font-size: 16px; color: #555;">Este es un <strong>correo de prueba</strong> para verificar el formato de los recordatorios.</p>
                
                <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; margin: 20px 0; background-color: #f9fafb;">
                    <h2 style="color: #111; margin-top: 0;">${client.name}</h2>
                    <p style="font-size: 16px; margin-bottom: 5px;"><strong>Nota / Actividad:</strong></p>
                    <p style="font-size: 18px; color: #333; background-color: #fff; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                        Esto es una nota de prueba simulando un recordatorio pendiente.
                    </p>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 14px; color: #666;">
                            <strong>Teléfono:</strong> ${client.phone || '--'}<br>
                            <strong>Email:</strong> ${client.email || '--'}
                        </p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${clientId}" 
                       style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Ver Ficha del Cliente
                    </a>
                </div>
            </div>
        `,
    });

    if (error) {
        console.error("Resend Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error("Action Error:", e);
    return { success: false, error: e.message };
  }
}
