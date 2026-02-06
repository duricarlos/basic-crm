import { getClients } from '@/actions/clients'
import { NewClientDialog } from '@/components/clients/new-client-dialog'
import { Search, MoreHorizontal, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Helper to get initials
function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Logic to determine "Client Status" based on Budgets
function getDerivedStatus(budgets: any[]) {
    if (!budgets || budgets.length === 0) {
        return { label: 'Nuevo / Potencial', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertCircle }
    }

    // Check for active budgets first (highest priority)
    const active = budgets.filter(b => ['sent', 'follow_up', 'approval'].includes(b.status))
    if (active.length > 0) {
        // Find most critical status
        if (active.some(b => b.status === 'approval')) return { label: 'Por Aprobar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: FileText }
        if (active.some(b => b.status === 'follow_up')) return { label: 'Seguimiento', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock }
        return { label: 'Presupuesto Enviado', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText }
    }

    // Check for approved/won
    const won = budgets.filter(b => ['approved', 'paid'].includes(b.status))
    if (won.length > 0) {
        return { label: 'Cliente Activo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 }
    }

    // Check for drafts
    const drafts = budgets.filter(b => b.status === 'draft')
    if (drafts.length > 0) {
         return { label: 'Borrador', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: FileText }
    }

    return { label: 'Sin Actividad Reciente', color: 'bg-gray-50 text-gray-400 border-gray-200', icon: AlertCircle }
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className='space-y-6 p-6 bg-gray-50/50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Clientes</h1>
          <p className='text-sm text-gray-500'>Gestiona tus relaciones y presupuestos.</p>
        </div>
        <div className='flex items-center gap-2'>
           <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar cliente..."
                className="pl-9 w-[250px] bg-white ring-offset-0 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>
          <NewClientDialog />
        </div>
      </div>

      {/* Table Card */}
      <div className='border rounded-xl bg-white shadow-sm overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50/50 hover:bg-gray-50/50'>
              <TableHead className="w-[300px]">Cliente</TableHead>
              <TableHead>Estado Actual</TableHead>
              <TableHead>Presupuestos</TableHead>
              <TableHead>Última Actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                   No hay clientes registrados.
                 </TableCell>
               </TableRow>
            ) : (
              clients.map((client) => {
                const status = getDerivedStatus(client.budgets);
                const StatusIcon = status.icon;

                // Sort logs to find latest date (createdAt might be string or Date depending on driver, assuming Date here from ORM)
                const lastLog = client.logs?.[0]; 
                const lastActivityDate = lastLog?.createdAt 
                    ? new Date(lastLog.createdAt).toLocaleDateString() 
                    : (client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-');

                return (
                  <TableRow key={client.id} className='group hover:bg-gray-50 transition-colors cursor-pointer'>
                     <TableCell className="font-medium">
                        <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.id}`} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(client.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold text-gray-900">{client.name}</div>
                                <div className="text-xs text-gray-500">{client.email || client.phone || "Sin contacto"}</div>
                            </div>
                        </Link>
                     </TableCell>
                     <TableCell>
                        <Badge variant="outline" className={`px-2 py-1 gap-1.5 ${status.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                        </Badge>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-2 py-1 rounded-md w-fit border border-gray-100">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs font-semibold">{client.budgets.length}</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <span className="text-xs text-gray-500 font-medium">
                             {lastActivityDate}
                        </span>
                     </TableCell>
                     <TableCell className="text-right">
                        <Link href={`/dashboard/clients/${client.id}`}>
                            <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </Link>
                     </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
