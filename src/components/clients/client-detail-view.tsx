'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, Calendar as CalendarIcon, FileText, Clock, CheckCircle2, AlertCircle, MoreHorizontal, Send, Archive, Trash2, CreditCard, XCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import Link from 'next/link'
import { AddLogDialog } from '@/components/clients/add-log-dialog'
import { TestReminderButton } from '@/components/clients/test-reminder-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateBudgetStatus, cancelBudget, createBudgetReminder } from '@/actions/budget-actions'
import { cn } from '@/lib/utils'

// Types
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
  updatedAt?: Date | null
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
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount))
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviado',
  follow_up: 'Seguimiento',
  approval: 'Por Aprobar',
  approved: 'Aprobado',
  declined: 'Rechazado',
  paid: 'Pagado',
  cancelled: 'Cancelado',
}

const STATUS_Map: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText },
  sent: { label: 'Enviado', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Send },
  follow_up: { label: 'Seguimiento', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  approval: { label: 'Por Aprobar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: FileText },
  approved: { label: 'Aprobado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  declined: { label: 'Rechazado', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-200', icon: CreditCard },
  cancelled: { label: 'Cancelado', color: 'bg-zinc-100 text-zinc-500 border-zinc-200', icon: Archive },
}

export function ClientDetailView({ client, budgets, logs }: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'logs' | 'calendar'>('budgets') // Default to budgets as requested focus
  const [loading, setLoading] = useState(false)

  // Interaction State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogView, setDialogView] = useState<'menu' | 'reminder_prompt' | 'archive_confirm'>('menu')
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  // Reminder State
  const [reminderDate, setReminderDate] = useState('')
  const [reminderNote, setReminderNote] = useState('')

  const pendingBudgets = budgets.filter((b) => ['draft', 'sent', 'follow_up', 'approval'].includes(b.status || ''))
  const historyBudgets = budgets.filter((b) => ['approved', 'declined', 'paid', 'cancelled'].includes(b.status || ''))

  const handleOpenAction = (budget: Budget) => {
    setSelectedBudget(budget)
    setDialogView('menu')
    setDialogOpen(true)
  }

  const resetDialog = () => {
    setDialogOpen(false)
    setTimeout(() => {
      setDialogView('menu')
      setSelectedBudget(null)
      setReminderDate('')
      setReminderNote('')
    }, 300)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedBudget) return
    setLoading(true)
    await updateBudgetStatus(selectedBudget.id, newStatus)
    setLoading(false)

    if (newStatus === 'follow_up') {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + 3)
      setReminderDate(nextDate.toISOString().split('T')[0])
      setReminderNote(`Seguimiento Presupuesto: ${client.name} - ${selectedBudget.title}`)
      setDialogView('reminder_prompt')
    } else {
      resetDialog()
    }
  }

  const handleSaveReminder = async () => {
    if (!reminderDate || !reminderNote || !selectedBudget) return
    setLoading(true)
    const [y, m, d] = reminderDate.split('-').map(Number)
    const date = new Date(y, m - 1, d, 9, 0, 0)
    await createBudgetReminder(client.id, reminderNote, date)
    setLoading(false)
    resetDialog()
  }

  const handleCancelBudget = async () => {
    if (!selectedBudget) return
    setLoading(true)
    await cancelBudget(selectedBudget.id)
    setLoading(false)
    resetDialog()
  }

  return (
    <div className='p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen'>
      {/* Header with Navigation */}
      <div className='flex items-center gap-4 mb-6'>
        <Link href='/dashboard/clients'>
          <Button variant='ghost' size='icon' className='rounded-full'>
            <ArrowLeft className='h-6 w-6' />
          </Button>
        </Link>
        <div className='flex items-center gap-4'>
          <Avatar className='h-16 w-16 border-4 border-white shadow-sm'>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.id}`} />
            <AvatarFallback className='text-xl'>{getInitials(client.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>{client.name}</h1>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <span>{client.email || 'Sin email'}</span>
              <span className='text-gray-300'>•</span>
              <span className='text-sm'>{client.phone || 'Sin teléfono'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tabs Navigation */}
      <div className='flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm w-fit'>
        <button onClick={() => setActiveTab('overview')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'overview' ? 'bg-zinc-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100')}>
          Resumen
        </button>
        <button onClick={() => setActiveTab('budgets')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'budgets' ? 'bg-zinc-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100')}>
          Presupuestos
        </button>
        <button onClick={() => setActiveTab('logs')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'logs' ? 'bg-zinc-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100')}>
          Historial
        </button>
        <button onClick={() => setActiveTab('calendar')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'calendar' ? 'bg-zinc-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100')}>
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
                <CardTitle>Información Detallada</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1'>
                  <Label className='text-xs font-bold text-gray-500 uppercase tracking-wide'>Notas</Label>
                  <p className='text-base text-gray-700 whitespace-pre-wrap pt-1'>{client.description || 'Sin descripción adicional.'}</p>
                </div>
                <Separator />
                <div>
                  <Label className='text-xs font-bold text-gray-500 uppercase tracking-wide'>Registro</Label>
                  <p className='text-sm text-gray-600 pt-1'>Cliente desde {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className='md:col-span-2 shadow-sm border-gray-200'>
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Clock className='h-5 w-5 text-blue-600' />
                    <h3 className='font-semibold text-gray-600'>En Proceso</h3>
                  </div>
                  <div>
                    <p className='text-3xl font-black text-blue-700'>{pendingBudgets.length}</p>
                    <p className='text-xs text-gray-500 mt-1 font-medium'>PRESUPUESTOS</p>
                  </div>
                </div>
                <div className='p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CheckCircle2 className='h-5 w-5 text-emerald-600' />
                    <h3 className='font-semibold text-gray-600'>Ganados</h3>
                  </div>
                  <div>
                    <p className='text-3xl font-black text-emerald-700'>{budgets.filter((b) => b.status === 'approved' || b.status === 'paid').length}</p>
                    <p className='text-xs text-gray-500 mt-1 font-medium'>PRESUPUESTOS</p>
                  </div>
                </div>
                <div className='p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CreditCard className='h-5 w-5 text-violet-600' />
                    <h3 className='font-semibold text-gray-600'>Total Valorado</h3>
                  </div>
                  <div>
                    <p className='text-3xl font-black text-violet-700'>{formatCurrency(budgets.filter((b) => b.status === 'approved' || b.status === 'paid').reduce((acc, b) => acc + parseFloat(b.total), 0))}</p>
                    <p className='text-xs text-gray-500 mt-1 font-medium'>EN VENTAS CERRADAS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW: BUDGETS */}
        {activeTab === 'budgets' && (
          <div className='space-y-8 animate-in fade-in zoom-in-95 duration-300'>
            <div className='flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm'>
              <div className='flex flex-col'>
                <h2 className='text-xl font-bold text-gray-900'>Gestión de Presupuestos</h2>
                <p className='text-gray-500 text-sm'>Administra el ciclo de vida de los presupuestos.</p>
              </div>
              <Link href={`/dashboard/clients/${client.id}/new-budget`}>
                <Button className='bg-zinc-900 text-white hover:bg-zinc-800 font-bold shadow-sm'>
                  <Plus className='mr-2 h-4 w-4' />
                  Nuevo Presupuesto
                </Button>
              </Link>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
              {/* Active Column */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-blue-700 mb-2'>
                  <Clock className='h-5 w-5' />
                  <h3 className='font-bold text-lg'>Activos / En Proceso</h3>
                  <Badge className='ml-2 bg-blue-100 text-blue-800 border-none'>{pendingBudgets.length}</Badge>
                </div>

                {pendingBudgets.length === 0 ? (
                  <div className='p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center opacity-70'>
                    <FileText className='h-10 w-10 text-gray-300 mb-2' />
                    <p className='text-gray-500 font-medium'>No hay presupuestos activos</p>
                  </div>
                ) : (
                  pendingBudgets.map((budget) => {
                    const statusInfo = STATUS_Map[budget.status || 'draft'] || STATUS_Map.draft
                    const StatusIcon = statusInfo.icon

                    return (
                      <div key={budget.id} className='group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5'>
                        <div className='flex justify-between items-start mb-4'>
                          <div>
                            <h4 className='font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors'>{budget.title || 'Presupuesto Sin Título'}</h4>
                            <p className='text-xs text-gray-400 font-medium uppercase tracking-wider mt-1'>
                              #{budget.id.substring(0, 8)} • {budget.dateGenerated ? new Date(budget.dateGenerated).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon' className='h-8 w-8'>
                                <MoreHorizontal className='h-4 w-4 text-gray-500' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenAction(budget)}>Cambiar Estado / Recordatorio</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <Link href={`/api/budgets/${budget.id}/pdf`} target='_blank'>
                                <DropdownMenuItem>Ver PDF</DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className='flex items-center justify-between mt-6'>
                          <Badge variant='outline' className={cn('px-3 py-1 flex items-center gap-1.5', statusInfo.color)}>
                            <StatusIcon className='h-3.5 w-3.5' />
                            {statusInfo.label}
                          </Badge>
                          <span className='text-2xl font-black text-gray-900 tracking-tight'>{formatCurrency(budget.total)}</span>
                        </div>

                        <div className='mt-4 pt-4 border-t border-gray-50 flex gap-2'>
                          <Button variant='outline' size='sm' className='flex-1 font-semibold text-gray-600 border-gray-200 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50' onClick={() => handleOpenAction(budget)}>
                            Gestionar
                          </Button>
                          <Link href={`/api/budgets/${budget.id}/pdf`} target='_blank' className='flex-1'>
                            <Button variant='outline' size='sm' className='w-full font-semibold text-gray-600 border-gray-200 hover:text-gray-900'>
                              PDF
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* History Column */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-gray-500 mb-2'>
                  <Archive className='h-5 w-5' />
                  <h3 className='font-bold text-lg'>Histórico</h3>
                  <Badge className='ml-2 bg-gray-100 text-gray-600 border-none'>{historyBudgets.length}</Badge>
                </div>

                {historyBudgets.length === 0 ? (
                  <div className='p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center opacity-60'>
                    <p className='text-gray-400 text-sm'>No hay historial de presupuestos cerrados.</p>
                  </div>
                ) : (
                  <div className='flex flex-col gap-3'>
                    {historyBudgets.map((budget) => {
                      const statusInfo = STATUS_Map[budget.status || 'draft'] || STATUS_Map.draft

                      return (
                        <div key={budget.id} className='flex justify-between items-center p-4 bg-gray-50/50 hover:bg-white border text-gray-500 hover:text-gray-900 border-gray-200 rounded-lg transition-all'>
                          <div>
                            <p className='font-semibold text-sm'>{budget.title || 'Presupuesto'}</p>
                            <div className='flex items-center gap-2 mt-1'>
                              <Badge variant='outline' className={cn('text-[10px] px-1.5 h-5', statusInfo.color)}>
                                {statusInfo.label}
                              </Badge>
                              <span className='text-xs text-gray-400'>{budget.dateGenerated ? new Date(budget.dateGenerated).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='font-bold text-sm tracking-tight'>{formatCurrency(budget.total)}</p>
                            <Link href={`/api/budgets/${budget.id}/pdf`} target='_blank' className='text-xs text-blue-600 hover:underline'>
                              Ver PDF
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: LOGS & CALENDAR - KEEPING SIMPLE FOR NOW AS REQUESTED FOCUS IS BUDGETS */}
        {activeTab === 'logs' && (
          <div className='animate-in fade-in slide-in-from-right-4'>
            <Card className='shadow-sm border-gray-200'>
              <CardHeader className='flex flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50'>
                <CardTitle>Bitácora de Actividad</CardTitle>
                <div className='w-fit'>
                  <AddLogDialog clientId={client.id} />
                </div>
              </CardHeader>
              <CardContent>
                <div className='relative pl-6 border-l-2 border-gray-200 space-y-8 my-6'>
                  {logs.map((log) => (
                    <div key={log.id} className='relative'>
                      <span className={cn('absolute -left-[29px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white', log.type === 'budget' ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-400')}>
                        <div className={cn('h-2 w-2 rounded-full', log.type === 'budget' ? 'bg-emerald-500' : 'bg-gray-300')} />
                      </span>
                      <div className='flex flex-col p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                        <div className='flex items-center justify-between mb-1'>
                          <Badge variant='outline' className='w-fit capitalize text-[10px]'>
                            {log.type}
                          </Badge>
                          <span className='text-xs text-gray-400'>{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</span>
                        </div>
                        <p className='text-sm font-medium text-gray-800'>{log.description}</p>
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
            <Card className='h-[500px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200'>
              <CalendarIcon className='h-16 w-16 text-gray-300 mb-4' />
              <h3 className='text-xl font-semibold text-gray-600'>Calendario de Eventos</h3>
              <div className='mt-6'>
                <TestReminderButton clientId={client.id} />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* --- DIALOG COMPONENT FOR ACTIONS --- */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(val) => {
          if (!val) resetDialog()
          else setDialogOpen(val)
        }}
      >
        <DialogContent className='sm:max-w-md gap-0 p-0 overflow-hidden bg-white border-2 border-zinc-200'>
          {dialogView === 'menu' && (
            <>
              <DialogHeader className='p-6 pb-2 bg-zinc-50 border-b border-zinc-100'>
                <DialogTitle className='text-xl font-black tracking-tight'>Actualizar Estado</DialogTitle>
                <DialogDescription>
                  Presupuesto: <span className='font-semibold text-black'>{selectedBudget?.title}</span>
                </DialogDescription>
              </DialogHeader>
              <div className='grid grid-cols-2 gap-3 p-6'>
                <Button variant='outline' className='h-20 flex flex-col gap-1 hover:bg-blue-50 hover:border-blue-200' onClick={() => handleStatusChange('sent')}>
                  <Send className='h-6 w-6 text-blue-500' />
                  <span className='text-xs font-bold'>Enviado</span>
                </Button>
                <Button variant='outline' className='h-20 flex flex-col gap-1 hover:bg-amber-50 hover:border-amber-200' onClick={() => handleStatusChange('follow_up')}>
                  <Clock className='h-6 w-6 text-amber-500' />
                  <span className='text-xs font-bold'>Seguimiento</span>
                </Button>
                <Button variant='outline' className='h-20 flex flex-col gap-1 hover:bg-emerald-50 hover:border-emerald-200' onClick={() => handleStatusChange('approved')}>
                  <CheckCircle2 className='h-6 w-6 text-emerald-500' />
                  <span className='text-xs font-bold'>Aprobado</span>
                </Button>
                <Button variant='outline' className='h-20 flex flex-col gap-1 hover:bg-red-50 hover:border-red-200' onClick={() => handleStatusChange('declined')}>
                  <XCircle className='h-6 w-6 text-red-500' />
                  <span className='text-xs font-bold'>Rechazado</span>
                </Button>
              </div>
              <div className='px-6 pb-6 pt-0'>
                <Button variant='ghost' className='w-full text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold' onClick={() => setDialogView('archive_confirm')}>
                  <Archive className='h-4 w-4 mr-2' />
                  Archivar Presupuesto
                </Button>
              </div>
            </>
          )}

          {dialogView === 'reminder_prompt' && (
            <>
              <DialogHeader className='p-6 pb-2 bg-amber-50 border-b border-amber-100'>
                <DialogTitle className='text-lg font-bold text-amber-700 flex items-center gap-2'>
                  <Clock className='h-5 w-5' /> Crear Recordatorio
                </DialogTitle>
                <DialogDescription>¿Cuándo deseas realizar el seguimiento?</DialogDescription>
              </DialogHeader>
              <div className='p-6 flex flex-col gap-4'>
                <div className='space-y-2'>
                  <Label>Fecha</Label>
                  <Input type='date' value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
                </div>
                <div className='space-y-2'>
                  <Label>Nota</Label>
                  <Textarea value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} />
                </div>
                <Button onClick={handleSaveReminder} disabled={loading} className='w-full bg-amber-600 hover:bg-amber-700 text-white'>
                  {loading ? 'Guardando...' : 'Guardar Recordatorio'}
                </Button>
                <Button variant='ghost' onClick={resetDialog}>
                  Cancelar
                </Button>
              </div>
            </>
          )}

          {dialogView === 'archive_confirm' && (
            <>
              <DialogHeader className='p-6 pb-2 bg-red-50 border-b border-red-100'>
                <DialogTitle className='text-lg font-bold text-red-700'>¿Estás seguro?</DialogTitle>
                <DialogDescription>El presupuesto pasará a estado Cancelado y se moverá al histórico.</DialogDescription>
              </DialogHeader>
              <div className='p-6 flex flex-col gap-3'>
                <Button variant='destructive' onClick={handleCancelBudget} disabled={loading}>
                  Sí, Archivar
                </Button>
                <Button variant='ghost' onClick={() => setDialogView('menu')}>
                  Volver
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
