'use client'

import { useState, useMemo } from 'react'
import { Search, MoreHorizontal, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { StatusFilter } from '@/components/dashboard/status-filter'

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
    return { id: 'potential', label: 'Nuevo / Potencial', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertCircle }
  }

  // Check for active budgets first (highest priority)
  const active = budgets.filter((b) => ['sent', 'follow_up', 'approval'].includes(b.status))
  if (active.length > 0) {
    // Find most critical status
    if (active.some((b) => b.status === 'approval')) return { id: 'approval', label: 'Por Aprobar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: FileText }
    if (active.some((b) => b.status === 'follow_up')) return { id: 'follow_up', label: 'Seguimiento', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock }
    return { id: 'sent', label: 'Presupuesto Enviado', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText }
  }

  // Check for approved/won
  const won = budgets.filter((b) => ['approved', 'paid'].includes(b.status))
  if (won.length > 0) {
    return { id: 'active', label: 'Cliente Activo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 }
  }

  // Check for drafts
  const drafts = budgets.filter((b) => b.status === 'draft')
  if (drafts.length > 0) {
    return { id: 'draft', label: 'Borrador', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: FileText }
  }

  return { id: 'inactive', label: 'Sin Actividad Reciente', color: 'bg-gray-50 text-gray-400 border-gray-200', icon: AlertCircle }
}

interface ClientsTableProps {
    clients: any[] // Using any for simplicity with complex ORM types, but ideally should be typed
}

export function ClientsTable({ clients }: ClientsTableProps) {
    // We can use the generic StatusFilter but we need to manage state locally here instead of URL 
    // to allow instant search + filter combination without roundtrip, 
    // BUT user asked for buttons like status. 
    // I'll reuse the UI of StatusFilter but implement local logic if I can.
    // Actually StatusFilter is hardcoded to use URL params. 
    // I will use URL params for Clients too for consistency, or I should refactor StatusFilter to be controlled.
    
    // Let's Refactor StatusFilter to be more flexible? 
    // Or just implement local filter buttons here. 
    // Implementing local filter buttons here is safer to not break the other page I am building.
    
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                client.email.toLowerCase().includes(searchTerm.toLowerCase())
            
            if (!matchesSearch) return false

            if (statusFilter === 'all') return true
            
            const status = getDerivedStatus(client.budgets)
            return status.id === statusFilter
        })
    }, [clients, searchTerm, statusFilter])

    // Calculate counts
    const counts = useMemo(() => {
        const c: Record<string, number> = {}
        clients.forEach(client => {
             const status = getDerivedStatus(client.budgets)
             c[status.id] = (c[status.id] || 0) + 1
        })
        return c
    }, [clients])

    const filterOptions = [
        { label: 'Activos', value: 'active', count: counts['active'] },
        { label: 'Por Aprobar', value: 'approval', count: counts['approval'] },
        { label: 'Seguimiento', value: 'follow_up', count: counts['follow_up'] },
        { label: 'Enviados', value: 'sent', count: counts['sent'] },
        { label: 'Borradores', value: 'draft', count: counts['draft'] },
        { label: 'Potenciales', value: 'potential', count: counts['potential'] },
        { label: 'Inactivos', value: 'inactive', count: counts['inactive'] },
    ].filter(o => (o.count ?? 0) > 0) // Only show relevant filters

    return (
        <div className="space-y-4">
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                 {/* Filters */}
                 <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusFilter('all')}
                        className={`rounded-full border transition-all ${statusFilter === 'all' ? "bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900" : "bg-white text-zinc-500 hover:text-zinc-900"}`}
                    >
                        Todos
                    </Button>
                    {filterOptions.map(opt => (
                        <Button
                            key={opt.value}
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusFilter(opt.value)}
                            className={`rounded-full border transition-all ${statusFilter === opt.value ? "bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900" : "bg-white text-zinc-500 hover:text-zinc-900"}`}
                        >
                            {opt.label}
                            <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${statusFilter === opt.value ? "bg-zinc-700 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                                {opt.count}
                            </span>
                        </Button>
                    ))}
                 </div>

                {/* Search */}
                <div className='relative md:w-auto w-full'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
                    <Input 
                        type='search' 
                        placeholder='Buscar cliente...' 
                        className='pl-9 w-full md:w-[250px] bg-white'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className='border rounded-xl bg-white shadow-sm overflow-hidden'>
                <Table>
                <TableHeader>
                    <TableRow className='bg-gray-50/50 hover:bg-gray-50/50'>
                    <TableHead className='w-[300px]'>Cliente</TableHead>
                    <TableHead>Estado Actual</TableHead>
                    <TableHead>Presupuestos</TableHead>
                    <TableHead>Última Actividad</TableHead>
                    <TableHead className='text-right'>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredClients.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                             {searchTerm || statusFilter !== 'all' ? 'No se encontraron clientes con estos filtros.' : 'No hay clientes registrados.'}
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredClients.map((client) => {
                        const status = getDerivedStatus(client.budgets)
                        const StatusIcon = status.icon

                        // Sort logs to find latest date
                        const lastLog = client.logs?.[0] // Assuming sorted from backend or we sort here
                        // Simple sorting if needed:
                        // const sortedLogs = [...(client.logs || [])].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        
                        const lastActivityDate = lastLog?.createdAt ? new Date(lastLog.createdAt).toLocaleDateString() : client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'

                        return (
                        <TableRow key={client.id} className='group hover:bg-gray-50 transition-colors cursor-pointer'>
                            <TableCell>
                            <Link href={`/dashboard/clients/${client.id}`} className="block">
                                <div className='flex items-center gap-3'>
                                <Avatar className='h-9 w-9 border'>
                                    <AvatarImage src={`https://avatar.vercel.sh/${client.email}`} />
                                    <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col'>
                                    <span className='font-medium text-gray-900 group-hover:text-primary transition-colors'>{client.name}</span>
                                    <span className='text-xs text-gray-500'>{client.email}</span>
                                </div>
                                </div>
                            </Link>
                            </TableCell>
                            <TableCell>
                            <Link href={`/dashboard/clients/${client.id}`} className="block">
                                <Badge variant='outline' className={`gap-1.5 py-1 pr-3 pl-2 font-medium border ${status.color}`}>
                                <StatusIcon className='h-3.5 w-3.5' />
                                {status.label}
                                </Badge>
                            </Link>
                            </TableCell>
                            <TableCell>
                            <Link href={`/dashboard/clients/${client.id}`} className="block">
                                <div className='flex flex-col gap-1'>
                                <span className='text-sm font-medium text-gray-700'>{client.budgets?.length || 0} presupuestos</span>
                                <span className='text-xs text-gray-400'>Total histórico</span>
                                </div>
                            </Link>
                            </TableCell>
                            <TableCell>
                            <Link href={`/dashboard/clients/${client.id}`} className="block">
                                <div className='flex items-center gap-2 text-sm text-gray-500'>
                                <Clock className='h-3.5 w-3.5' />
                                {lastActivityDate}
                                </div>
                            </Link>
                            </TableCell>
                            <TableCell className='text-right'>
                            <Button variant='ghost' size='icon' className='text-gray-400 hover:text-gray-900'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
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
