# AGENTS.md - Contexto y Especificaciones del Proyecto CRM Senior

## 1. Visión General

**Nombre del Proyecto:** Basic CRM (para Empresarios Senior)
**Objetivo:** Crear un sistema de gestión de clientes (CRM) extremadamente sencillo, amigable y minimalista para empresarios mayores de 70 años. El sistema debe reducir la carga cognitiva, automatizar tareas repetitivas y guiar al usuario con pasos claros.

## 2. Pila Tecnológica (Tech Stack)

- **Framework:** Next.js 15 (App Router).
  - **Nota Importante:** Uso de `params` asíncronos (`Promise<{ id: string }>`) en rutas dinámicas.
- **Estilos:** Tailwind CSS + ShadCN UI.
  - **Tema:** "High Contrast Senior" (Fuentes grandes, negros puros, bordes definidos).
- **Base de Datos:** Neon (PostgreSQL Serverless).
  - **Driver:** `@neondatabase/serverless` (HTTP puro, sin WebSockets para conexión simple).
  - **Restricción:** No soporta transacciones interactivas complejas.
- **ORM:** Drizzle ORM.
- **Autenticación:** Auth.js (NextAuth v5) con **Google Provider**.
- **Generación de PDF:** `@react-pdf/renderer` (Renderizado en servidor y cliente).
- **Emails:** Resend.com (Notificaciones y Recordatorios en segundo plano).
- **Despliegue:** Vercel.

## 3. Comandos Clave

- `npm run dev`: Iniciar servidor de desarrollo.
- `npm run db:push`: Sincronizar cambios del esquema local (`src/db/schema.ts`) con Neon DB.
- `npm run db:studio`: Abrir Drizzle Studio para ver datos crudos.
- `npx tsc --noEmit`: Verificar tipos TypeScript (útil para detectar errores de `params` en Next.js 15).

## 4. Estructura del Proyecto

```
/src
  /actions       -> Server Actions (Mutaciones de datos: clients, budgets, logs, testing)
  /app           -> Rutas (App Router)
    /api         -> Endpoints (Cron jobs para recordatorios, generación de PDF)
    /dashboard   -> Vistas protegidas (Lista de clientes, Ficha detalle, Creación de presupuesto)
  /components    -> Componentes UI (ShadCN + Componentes de negocio)
    /clients     -> Tarjetas, Diálogos, Formularios específicos
    /budgets     -> Formulario de presupuesto, lógica de cálculo
    /pdf         -> Plantillas React-PDF
  /db            -> Configuración de Drizzle y Esquema
    schema.ts    -> Definición de tablas y relaciones
  /lib           -> Utilidades generales
  auth.ts        -> Configuración de NextAuth
```

## 5. Modelo de Datos Actual

**Importante:** Todos los IDs son `text` (UUIDs) para compatibilidad con Auth.js.

- **User**: Sistema de autenticación (Google).
- **Client**:
  - `id` (UUID), `userId` (FK), `name`, `email`, `phone`, `description`
  - `status` (Enum: 'new', 'in_progress', 'cancelled')
- **Budget**:
  - `id` (UUID), `clientId` (FK)
  - `items` (JSONB: Array de desc, precio, cant)
  - `total` (Decimal), `dateGenerated`
  - **Nuevos campos:** `title`, `header`, `footer` (Personalización del documento).
- **LogEntry**:
  - `id` (UUID), `clientId` (FK), `type` ('info', 'budget', 'call'), `description`.
- **Reminder**:
  - `id` (UUID), `clientId` (FK), `dueDate`, `isSent`.

## 6. Estado Actual y Funcionalidades Completas

### A. Gestión de Clientes

- [x] CRUD completo.
- [x] Estados traducidos y codificados por color (Nuevo = Azul, En Proceso = Naranja, Cancelado = Gris).
- [x] Navegación directa desde Dashboard a Ficha de Cliente.

### B. Presupuestos Avanzados

- [x] Creación de presupuestos con ítems dinámicos.
- [x] **Pseudo-Inteligencia:** Autocompletado de precios basado en ítems previos.
- [x] **Configuración de Documento:** Personalización de Título, Cabecera y Pie de Página.
- [x] **Moneda:** Estandarizado a Dólares ($).
- [x] Generación de PDF accesible vía botón directo.

### C. Seguimiento

- [x] Registro automático de actividades (Logs) al crear cliente o generar presupuesto.
- [x] Adición manual de notas.
- [x] Creación de recordatorios con fecha futura.
- [x] **Sistema de Testing:** Botón "Enviar Recordatorio de Prueba" en la ficha del cliente para simular emails reales.

### D. UX/UI Senior

- [x] Corrección de contraste en modales (Fondo sólido, no transparente).
- [x] Textos grandes y botones de acción claros ("Ver Ficha / Gestionar").

## 7. Notas de Mantenimiento

1. **Migraciones DB:** Al usar Neon HTTP, preferimos `db:push` para prototipado rápido. Si hay conflictos de tipos (ej: int vs uuid), puede requerir limpieza de tablas.
2. **Next.js 15:** Recordar siempre usar `await params` en `page.tsx` y `route.ts`.
3. **Transacciones:** No usar `db.transaction()` con este driver. Hacer operaciones secuenciales simples.
