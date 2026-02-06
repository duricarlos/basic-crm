import { getClients } from '@/actions/clients'
import { NewClientDialog } from '@/components/clients/new-client-dialog'
import { Search, MoreHorizontal, FileText } from 'lucide-react'
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

// Helper for progress based on status
function getProgress(status: string) {
  switch (status) {
    case 'new': return 10
    case 'estimate': return 30
    case 'follow_up': return 50
    case 'approval': return 75
    case 'approved': return 100
    case 'cancelled': return 0
    default: return 0
  }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'new':
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Nuevo</Badge>
        case 'estimate':
            return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Estimación</Badge>
        case 'follow_up':
            return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Seguimiento</Badge>
        case 'approval':
             return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Por Aprobar</Badge>
        case 'approved':
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprobado</Badge>
        case 'cancelled':
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
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
              <TableHead>Presupuestos</TableHead>
              <TableHead className="w-[200px]">Progreso</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                   No hay clientes registrados.
                 </TableCell>
               </TableRow>
            ) : (
              clients.map((client) => {
                const progress = getProgress(client.status || 'new');
                
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
                        <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>{client.budgets.length} Presupuestos</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                                    style={{ width: `${progress}%` }}
                                />
                             </div>
                             <span className="text-xs font-medium text-gray-600 w-8">{progress}%</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <span className="text-sm text-gray-500">
                             {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                        </span>
                     </TableCell>
                     <TableCell>
                        {getStatusBadge(client.status || 'new')}
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
