import { db } from "@/db";
import { reminders, clients, users } from "../../../../db/schema";
import { eq, and, lte } from "drizzle-orm";
import { Resend } from 'resend';
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    // Validar autenticación de Vercel Cron (Opcional pero recomendado en prod)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        const now = new Date();
        
        // Buscar recordatorios pendientes hasta hoy
        const pendingReminders = await db.query.reminders.findMany({
            where: and(
                lte(reminders.dueDate, now),
                eq(reminders.isSent, false)
            ),
            with: {
                client: true,
                user: true // Necesitamos el email del usuario
            }
        });

        if (pendingReminders.length === 0) {
            return NextResponse.json({ message: "No pending reminders" });
        }

        for (const reminder of pendingReminders) {
            if (!reminder.user.email) continue;

            try {
                // Enviar Email
                await resend.emails.send({
                    from: 'CRM Senior <onboarding@resend.dev>', // Usar dominio verificado en prod
                    to: reminder.user.email,
                    subject: `🔔 Recordatorio: ${reminder.client.name}`,
                    html: `
                        <h1>Recordatorio de Seguimiento</h1>
                        <p>Hola ${reminder.user.name},</p>
                        <p>Tienes un recordatorio pendiente para hoy:</p>
                        <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h2>${reminder.client.name}</h2>
                            <p><strong>Nota:</strong> ${reminder.description}</p>
                            <p><strong>Teléfono:</strong> ${reminder.client.phone || ''}</p>
                            <br/>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${reminder.client.id}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                                Ver Cliente
                            </a>
                        </div>
                    `
                });

                // Marcar como enviado
                await db.update(reminders)
                    .set({ isSent: true })
                    .where(eq(reminders.id, reminder.id));

            } catch (emailError) {
                console.error(`Error enviando email a ${reminder.user.email}`, emailError);
            }
        }

        return NextResponse.json({ 
            success: true, 
            processed: pendingReminders.length 
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
