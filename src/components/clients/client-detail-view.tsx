'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, Calendar as CalendarIcon, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AddLogDialog } from '@/components/clients/add-log-dialog'
import { TestReminderButton } from '@/components/clients/test-reminder-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Define rudimentary types based on schema
type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  description: string | null
  status: string | null
  createdAt: Date | null
}

type Budget = {
  id: string
  status: string | null
  total: string
  dateGenerated: Date | null
  title: string | null
}

type Log = {
  id: string
  description: string | null
  type: string | null
  createdAt: Date | null
}

interface ClientDetailViewProps {
  client: Client
  budgets: Budget[]
  logs: Log[]
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

export function ClientDetailView({ client, budgets, logs }: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'logs' | 'calendar'>('overview')

  const pendingBudgets = budgets.filter(b => ['draft', 'sent', 'follow_up', 'approval'].includes(b.status || ''))
  const historyBudgets = budgets.filter(b => ['approved', 'declined', 'paid', 'cancelled'].includes(b.status || ''))

  return (
    <div className='p-4 md:p-8 max-w-6xl mx-auto space-y-6 bg-gray-50/50 min-h-screen'>
      {/* Header with Navigation */}
      <div className='flex items-center gap-4 mb-6'>
         <Link href='/dashboard/clients'>
            <Button variant='ghost' size='icon' className='rounded-full'>
                <ArrowLeft className='h-6 w-6' />
            </Button>
         </Link>
         <div className='flex items-center gap-4'>
            <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.id}`} />
                <AvatarFallback className="text-xl">{getInitials(client.name)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className='text-3xl font-bold text-gray-900'>{client.name}</h1>
                <div className='flex items-center gap-2 text-muted-foreground'>
                    <span>{client.email || 'Sin email'}</span>
                    <span>•</span>
                    <Badge variant={client.status === 'approved' ? 'default' : 'secondary'}>
                        {client.status?.toUpperCase() || 'NEW'}
                    </Badge>
                </div>
            </div>
         </div>
      </div>

      {/* Custom Tabs Navigation */}
      <div className='flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm w-fit'>
        <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Resumen
        </button>
        <button
            onClick={() => setActiveTab('budgets')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'budgets' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Presupuestos
        </button>
        <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'logs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Historial
        </button>
        <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Calendario
        </button>
      </div>

      {/* Tab Content */}
      <div className='mt-6'>
        
        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                {/* Client Info */}
                <Card className='md:col-span-1 shadow-sm border-gray-200'>
                    <CardHeader>
                        <CardTitle>Información</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <p className='text-sm font-medium text-gray-500'>Teléfono</p>
                            <p className='text-base'>{client.phone || '--'}</p>
                        </div>
                        <div>
                            <p className='text-sm font-medium text-gray-500'>Notas</p>
                            <p className='text-base text-gray-700 whitespace-pre-wrap'>{client.description || 'Sin descripción'}</p>
                        </div>
                        <Separator />
                        <div className="pt-2">
                            <TestReminderButton clientId={client.id} />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className='md:col-span-2 shadow-sm border-gray-200'>
                    <CardHeader>
                        <CardTitle>Estado General</CardTitle>
                    </CardHeader>
                    <CardContent className='grid grid-cols-2 gap-4'>
                        <div className='p-4 bg-blue-50 rounded-xl border border-blue-100'>
                            <div className='flex items-center gap-2 mb-2'>
                                <Clock className='h-5 w-5 text-blue-600' />
                                <h3 className='font-semibold text-blue-900'>Pendientes</h3>
                            </div>
                            <p className='text-3xl font-bold text-blue-700'>{pendingBudgets.length}</p>
                            <p className='text-sm text-blue-600 mt-1'>Presupuestos en curso</p>
                        </div>
                        <div className='p-4 bg-green-50 rounded-xl border border-green-100'>
                            <div className='flex items-center gap-2 mb-2'>
                                <CheckCircle2 className='h-5 w-5 text-green-600' />
                                <h3 className='font-semibold text-green-900'>Aprobados</h3>
                            </div>
                            <p className='text-3xl font-bold text-green-700'>
                                {budgets.filter(b => b.status === 'approved' || b.status === 'paid').length}
                            </p>
                            <p className='text-sm text-green-600 mt-1'>Total ganados</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        {/* VIEW: BUDGETS */}
        {activeTab === 'budgets' && (
             <div className='space-y-8 animate-in fade-in zoom-in-95 duration-300'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-semibold'>Gestión de Presupuestos</h2>
                     <Link href={`/dashboard/clients/${client.id}/new-budget`}>
                        <Button>
                        <Plus className='mr-2 h-4 w-4' />
                        Nuevo Presupuesto
                        </Button>
                    </Link>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Pending Budgets */}
                    <Card className='border-l-4 border-l-blue-500 shadow-sm'>
                        <CardHeader>
                            <CardTitle className='text-blue-700 flex items-center gap-2'>
                                <Clock className='h-5 w-5' /> Pendientes / En Proceso
                            </CardTitle>
                            <CardDescription>Presupuestos enviados o en revisión</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingBudgets.length === 0 ? (
                                <div className='p-6 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed'>
                                    No hay presupuestos pendientes
                                </div>
                            ) : (
                                <ul className='space-y-3'>
                                    {pendingBudgets.map(b => (
                                        <li key={b.id} className='flex justify-between items-center p-3 bg-white border rounded-lg hover:shadow-md transition-shadow'>
                                             <div>
                                                <p className='font-semibold'>{b.title || 'Presupuesto'}</p>
                                                <p className='text-sm text-gray-500'>{parseFloat(b.total).toLocaleString()} $ • <span className='capitalize'>{b.status?.replace('_', ' ')}</span></p>
                                             </div>
                                             <Link href={`/api/budgets/${b.id}/pdf`} target='_blank'>
                                                <Button variant='outline' size='sm'>PDF</Button>
                                             </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Budgets */}
                    <Card className='border-l-4 border-l-gray-400 shadow-sm opacity-90'>
                         <CardHeader>
                            <CardTitle className='text-gray-700 flex items-center gap-2'>
                                <FileText className='h-5 w-5' /> Histórico
                            </CardTitle>
                            <CardDescription>Aprobados, cancelados o pagados</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {historyBudgets.length === 0 ? (
                                <div className='p-6 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed'>
                                    No hay historial aún
                                </div>
                            ) : (
                                <ul className='space-y-3'>
                                    {historyBudgets.map(b => (
                                        <li key={b.id} className='flex justify-between items-center p-3 bg-gray-50 border rounded-lg'>
                                             <div>
                                                <p className='font-semibold text-gray-700'>{b.title || 'Presupuesto'}</p>
                                                <p className='text-sm text-gray-500'>{parseFloat(b.total).toLocaleString()} $ • <span className='capitalize'>{b.status}</span></p>
                                             </div>
                                             <Link href={`/api/budgets/${b.id}/pdf`} target='_blank'>
                                                <Button variant='ghost' size='sm'>Ver</Button>
                                             </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
             </div>
        )}

        {/* VIEW: LOGS */}
        {activeTab === 'logs' && (
            <div className='animate-in fade-in slide-in-from-right-4'>
                <Card className='shadow-sm'>
                   <CardHeader className='flex flex-row items-center justify-between'>
                      <CardTitle>Bitácora de Actividad</CardTitle>
                      <AddLogDialog clientId={client.id} />
                   </CardHeader>
                   <CardContent>
                      <div className='relative pl-6 border-l-2 border-gray-200 space-y-8 my-4'>
                         {logs.map((log) => (
                             <div key={log.id} className='relative'>
                                <span className='absolute -left-[30px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-gray-200'>
                                   <div className='h-2 w-2 rounded-full bg-gray-400' />
                                </span>
                                <div className='flex flex-col'>
                                    <p className='text-sm text-gray-500 mb-1'>
                                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Fecha desconocida'}
                                    </p>
                                    <p className='text-base font-medium text-gray-900'>{log.description}</p>
                                    <Badge variant='outline' className='w-fit mt-2 capitalize'>{log.type}</Badge>
                                </div>
                             </div>
                         ))}
                      </div>
                   </CardContent>
                </Card>
            </div>
        )}

        {/* VIEW: CALENDAR */}
        {activeTab === 'calendar' && (
             <div className='animate-in fade-in zoom-in-95'>
                 <Card className="h-[500px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200">
                    <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600">Calendario de Eventos</h3>
                    <p className="text-gray-400 text-center max-w-sm mt-2">
                        Aquí verás las alertas y recordatorios para este cliente. (Próximamente)
                    </p>
                    <div className="mt-6">
                        <TestReminderButton clientId={client.id} />
                    </div>
                 </Card>
             </div>
        )}

      </div>
    </div>
  )
}
