# AGENTS.md - Contexto y Especificaciones del Proyecto CRM Senior

## 1. Visión General

**Nombre del Proyecto:** Basic CRM (para Empresarios Senior)
**Objetivo:** Crear un sistema de gestión de clientes (CRM) extremadamente sencillo, amigable y minimalista para empresarios mayores de 70 años. El sistema debe reducir la carga cognitiva, automatizar tareas repetitivas y guiar al usuario con pasos claros.

## 2. Pila Tecnológica (Tech Stack)

- **Framework:** Next.js (App Router).
- **Estilos:** Tailwind CSS + ShadCN UI.
- **Base de Datos:** Neon (PostgreSQL).
- **ORM:** Drizzle ORM.
- **Autenticación:** Auth.js (NextAuth) con **Google Provider** (sin contraseñas).
- **Generación de PDF:** `@react-pdf/renderer` (Optimizado para Vercel Serverless).
- **Emails:** Resend.com (Notificaciones y Recordatorios).
- **Despliegue:** Vercel.

## 3. Principios de UX/UI (Crucial para usuarios 70+)

- **Accesibilidad Visual:**
  - Tipografía base grande (mínimo 16px-18px).
  - Alto contraste (evitar gris sobre gris, usar negro puro o colores fuertes).
  - Evitar el uso excesivo del color azul para textos (difícil de leer para seniors).
- **Navegación e Interacción:**
  - Botones grandes y fáciles de clicar (min 48px de altura).
  - Navegación plana (evitar menús anidados profundos).
  - Feedback inmediato y persistente (mensajes de "Guardado" que duran lo suficiente).
  - Lenguaje natural y directo.

## 4. Funcionalidades Principales

### A. Gestión de Clientes (CRUD Simplificado)

- **Datos:** Nombre, Email, Descripción, Teléfono.
- **Estados (Flujo de Vida):**
    1. **Creado/Nuevo:** Contacto inicial.
    2. **En Proceso:** Se envió presupuesto o hay negociación.
    3. **Cancelado/Archivado:** Negocio perdido o finalizado.

### B. Vista "Línea de Tiempo" (Dashboard Principal)

- Vista panorámica tipo Kanban simplificado o lista agrupada por los 3 estados anteriores.
- Permite ver rápidamente qué hacer hoy.

### C. Sistema de Presupuestos e Inteligencia

- **Creación:** Formulario simple para crear presupuestos.
- **Generación PDF:** Creación de documento PDF con logo y datos, descargable para enviar al cliente.
- **Log Automático:** Al generar un PDF, se crea un registro en el historial del cliente ("Presupuesto generado el [Fecha]").
- **"Pseudo Inteligencia":** El sistema recuerda servicios y precios usados anteriormente para sugerirlos (autocompletado) y ahorrar tiempo de escritura.

### D. Seguimiento y Recordatorios

- **Onboarding de Presupuesto:** Posibilidad de registrar feedback del cliente (ej: "Dame 2 semanas").
- **Configuración de Recordatorio:** El usuario selecciona una fecha (ej: "Recordarme en 2 semanas").
- **Notificación:** El backend (via Cron/API) envía un email al usuario en la fecha indicada con:
  - Datos del cliente.
  - Últimos eventos (Logs).
  - Enlace directo a la ficha del cliente.

## 5. Modelo de Datos (Esbozo)

- **User:** Id, Email, Name, Image (Auth).
- **Client:** Id, UserId, Name, Email, Phone, Description, Status, CreatedAt, UpdatedAt.
- **Budget:** Id, ClientId, Items (JSON), Total, DateGenerated.
- **LogEntry:** Id, ClientId, Type (Info, Budget, Call), Description, Date.
- **Reminder:** Id, ClientId, Details, DueDate, IsSent, UserId.

## 6. Pasos de Implementación Inmediata

1. Inicializar proyecto Next.js.
2. Configurar Tailwind y ShadCN con "Theme Senior" (fuentes grandes).
3. Configurar Drizzle + Neon.
4. Implementar Auth (Google).
5. Desarrollar componentes UI base.
