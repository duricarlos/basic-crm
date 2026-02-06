'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowRight, CheckCircle2, Circle, Clock, Send, Archive, AlertCircle, Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateBudgetStatus, cancelBudget, createBudgetReminder } from '@/actions/budget-actions'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface EstimateProcessCardProps {
  budget: {
    id: string
    total: number
    status: string | null
    updatedAt: Date | null
    client: {
      id: string
      name: string
    }
  }
}

const STEPS = [
  { id: 'sent', label: 'Estimación' },
  { id: 'follow_up', label: 'Seguimiento' },
  { id: 'approval', label: 'Por Aprobar' },
  { id: 'approved', label: 'Aprobado' },
]

export function EstimateProcessCard({ budget }: EstimateProcessCardProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'menu' | 'reminder_prompt' | 'archive_confirm'>('menu')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderNote, setReminderNote] = useState('')

  const resetDialog = () => {
    setOpen(false)
    setTimeout(() => {
      setView('menu')
      setReminderDate('')
      setReminderNote('')
    }, 300)
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    await updateBudgetStatus(budget.id, newStatus)
    setLoading(false)

    if (newStatus === 'follow_up') {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + 3)
      setReminderDate(nextDate.toISOString().split('T')[0])
      setReminderNote(`Seguimiento Presupuesto: ${budget.client.name}`)
      setView('reminder_prompt')
    } else {
      resetDialog()
    }
  }

  const handleSaveReminder = async () => {
    if (!reminderDate || !reminderNote) return
    setLoading(true)
    const [y, m, d] = reminderDate.split('-').map(Number)
    const date = new Date(y, m - 1, d, 9, 0, 0)
    await createBudgetReminder(budget.client.id, reminderNote, date)
    setLoading(false)
    resetDialog()
  }

  const handleCancel = async () => {
    setLoading(true)
    await cancelBudget(budget.id)
    setLoading(false)
    resetDialog()
  }

  const currentStepIndex = STEPS.findIndex((step) => step.id === budget.status)

  // Custom logic: If step not found (e.g. draft), show step 0 waiting to start or similar.
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex

  return (
    <Card className='w-full border-2 border-zinc-200 shadow-sm bg-white'>
      <CardHeader className='pb-2 border-b border-zinc-100 bg-zinc-50/50'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-2xl font-black text-black tracking-tight'>{budget.client.name}</CardTitle>
              {budget.status === 'draft' && (
                <Badge variant='secondary' className='bg-zinc-100 text-zinc-600 hover:bg-zinc-200'>
                  Borrador
                </Badge>
              )}
            </div>
            <CardDescription className='text-zinc-600 font-semibold mt-1 text-sm'>
              Presupuesto #{budget.id.slice(0, 8)} • {budget.updatedAt ? new Date(budget.updatedAt).toLocaleDateString('es-ES') : 'N/A'}
            </CardDescription>
          </div>
          <div className='w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end mt-2 md:mt-0'>
            <div className='text-left md:text-right'>
              <p className='text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1'>Valor Estimado</p>
              <p className='text-3xl font-black text-emerald-600 tracking-tight'>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budget.total)}</p>
            </div>
            <Dialog
              open={open}
                onOpenChange={(val) => {
                  setOpen(val)
                  if (!val) setTimeout(() => setView('menu'), 300)
                }}
              >
                <DialogTrigger asChild>
                  <Button variant='outline' className='h-10 border-2 font-bold px-4 ml-2 md:ml-0 md:mt-2 gap-2 text-zinc-700 hover:text-black hover:border-zinc-400'>
                    Actualizar Estado
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md gap-0 p-0 overflow-hidden bg-white border-2 border-zinc-200'>
                  {view === 'menu' && (
                    <>
                      <DialogHeader className='p-6 pb-2 bg-zinc-50 border-b border-zinc-100'>
                        <DialogTitle className='text-2xl font-black tracking-tight'>Actualizar Estado</DialogTitle>
                        <DialogDescription className='text-base text-zinc-600 font-medium'>Selecciona el nuevo estado para este presupuesto.</DialogDescription>
                      </DialogHeader>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-6'>
                        <Button variant='outline' className='h-24 flex flex-col items-center justify-center gap-2 text-base font-bold hover:bg-blue-50 hover:border-blue-200 border-2' onClick={() => handleStatusChange('sent')}>
                          <Send className='h-8 w-8 text-blue-500' />
                          Enviado
                        </Button>
                        <Button variant='outline' className='h-24 flex flex-col items-center justify-center gap-2 text-base font-bold hover:bg-amber-50 hover:border-amber-200 border-2' onClick={() => handleStatusChange('follow_up')}>
                          <Clock className='h-8 w-8 text-amber-500' />
                          Seguimiento
                        </Button>
                        <Button variant='outline' className='h-24 flex flex-col items-center justify-center gap-2 text-base font-bold hover:bg-indigo-50 hover:border-indigo-200 border-2' onClick={() => handleStatusChange('approval')}>
                          <FileText className='h-8 w-8 text-indigo-500' />
                          Por Aprobar
                        </Button>
                        <Button variant='outline' className='h-24 flex flex-col items-center justify-center gap-2 text-base font-bold hover:bg-emerald-50 hover:border-emerald-200 border-2' onClick={() => handleStatusChange('approved')}>
                          <CheckCircle2 className='h-8 w-8 text-emerald-500' />
                          Aprobado
                        </Button>
                        <Button variant='outline' className='h-24 flex flex-col items-center justify-center gap-2 text-base font-bold hover:bg-red-50 hover:border-red-200 border-2' onClick={() => setView('archive_confirm')}>
                          <Archive className='h-8 w-8 text-red-500' />
                          Archivar
                        </Button>
                      </div>
                    </>
                  )}

                  {view === 'reminder_prompt' && (
                    <>
                      <DialogHeader className='p-6 pb-2 bg-amber-50 border-b border-amber-100'>
                        <DialogTitle className='text-2xl font-black tracking-tight text-amber-700 flex items-center gap-2'>
                          <Clock className='h-6 w-6' /> Crear Recordatorio
                        </DialogTitle>
                        <DialogDescription className='text-base font-medium text-amber-900/80'>Configura el recordatorio de seguimiento para este presupuesto.</DialogDescription>
                      </DialogHeader>
                      <div className='p-6 flex flex-col gap-6'>
                        <div className='space-y-2'>
                          <Label className='text-base font-bold text-zinc-900'>Fecha del Recordatorio</Label>
                          <div className='relative'>
                            <Calendar className='absolute left-3 top-3.5 h-5 w-5 text-zinc-500 pointer-events-none' />
                            <Input type='date' value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className='pl-10 h-12 text-lg font-medium border-2 border-zinc-200 focus-visible:ring-amber-500' />
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <Label className='text-base font-bold text-zinc-900'>Nota</Label>
                          <Textarea rows={3} value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} className='resize-none text-base border-2 border-zinc-200 focus-visible:ring-amber-500' />
                        </div>
                        <div className='flex flex-col gap-3 pt-2'>
                          <Button onClick={handleSaveReminder} disabled={loading} className='w-full h-12 text-lg font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm'>
                            {loading ? 'Guardando...' : 'Guardar Recordatorio'}
                          </Button>
                          <Button variant='ghost' className='w-full text-zinc-500 font-semibold' onClick={resetDialog}>
                            Omitir Recordatorio
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {view === 'archive_confirm' && (
                    <>
                      <DialogHeader className='p-6 pb-2 bg-red-50 border-b border-red-100'>
                        <DialogTitle className='text-2xl font-black tracking-tight text-red-700 flex items-center gap-2'>
                          <AlertCircle className='h-6 w-6' /> ¿Archivar Presupuesto?
                        </DialogTitle>
                        <DialogDescription className='text-base font-medium text-red-900/80'>Esta acción no se puede deshacer fácilmente.</DialogDescription>
                      </DialogHeader>
                      <div className='p-6 flex flex-col gap-4'>
                        <Button variant='destructive' className='w-full h-12 text-lg font-bold shadow-sm' onClick={handleCancel}>
                          Sí, Archivar
                        </Button>
                        <Button variant='ghost' className='w-full text-zinc-500 font-semibold' onClick={() => setView('menu')}>
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-8 pb-6 px-4 md:px-8'>
        {/* Desktop Progress Bar (Horizontal) */}
        <div className='hidden md:flex relative items-center justify-between w-full'>
          {/* Background Line */}
          <div className='absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-200 -z-10' />

          {/* Active Line (Dynamic width based on step) */}
          <div className='absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 -z-10 transition-all duration-500' style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }} />

          {STEPS.map((step, index) => {
            const isCompleted = index <= activeIndex
            const isCurrent = index === activeIndex

            return (
              <div key={step.id} className='flex flex-col items-center gap-2 px-2 z-10'>
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300', isCompleted ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-white border-zinc-300 text-zinc-300')}>{isCompleted ? <CheckCircle2 size={20} strokeWidth={3} /> : <Circle size={20} strokeWidth={3} />}</div>
                <span className={cn('text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md text-center bg-white', isCurrent ? 'text-emerald-700 bg-emerald-50' : 'text-zinc-500')}>{step.label}</span>
              </div>
            )
          })}
        </div>

        {/* Mobile Steps (Vertical List) */}
        <div className='flex md:hidden flex-col space-y-3'>
          {STEPS.map((step, index) => {
            const isCompleted = index <= activeIndex
            const isCurrent = index === activeIndex

            return (
              <div key={step.id} className={cn('flex items-center gap-4 p-3 rounded-lg border-2 transition-colors', isCurrent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-transparent')}>
                <div className={cn('min-w-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all', isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-300')}>
                  {isCompleted ? <CheckCircle2 size={20} strokeWidth={3} /> : <Circle size={20} strokeWidth={3} />}
                </div>
                <div className='flex flex-col'>
                  <span className={cn('text-sm font-black uppercase tracking-wide', isCompleted || isCurrent ? 'text-zinc-900' : 'text-zinc-400')}>{step.label}</span>
                  {isCurrent && <span className='text-xs font-bold text-emerald-600'>En Progreso</span>}
                  {isCompleted && index < activeIndex && <span className='text-xs font-medium text-zinc-500'>Completado</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className='mt-8 flex justify-end'>
          <Button asChild className='w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-white px-6 h-12 text-base font-bold shadow-sm transition-transform active:scale-95'>
            <Link href={`/dashboard/clients/${budget.client.id}`}>
              Gestionar Presupuesto
              <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
