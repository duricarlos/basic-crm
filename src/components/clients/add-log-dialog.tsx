'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createLogAndReminder } from '../../actions/logs' // Need to create this
import { MessageSquarePlus, Calendar, Clock } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export function AddLogDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasReminder, setHasReminder] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)

    // Combinar fecha y hora para enviar en UTC
    if (hasReminder) {
      const date = formData.get('dueDate') as string
      const time = (formData.get('dueTime') as string) || '09:00'
      if (date) {
        const localDate = new Date(`${date}T${time}`)
        formData.append('dueDateISO', localDate.toISOString())
      }
    }

    try {
      await createLogAndReminder(clientId, formData)
      setOpen(false)
      setHasReminder(false)
    } catch (error) {
      console.error(error)
      alert('Error al guardar nota')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='lg' className='border-2 text-lg h-12 w-full'>
          <MessageSquarePlus className='mr-2 h-5 w-5' />
          Añadir Nota / Recordatorio
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-125'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>Nueva Actividad</DialogTitle>
          <DialogDescription>Registra una llamada, nota o configuara un seguimiento.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-6 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='description' className='text-lg font-semibold'>
              Descripción de la actividad
            </Label>
            <Textarea id='description' name='description' className='text-lg border-2 min-h-25' placeholder='Llamé al cliente y me dijo que...' required />
          </div>

          <div className='flex items-center space-x-4 border-2 p-4 rounded-lg bg-muted/20'>
            <Switch id='reminder' name='hasReminder' checked={hasReminder} onCheckedChange={setHasReminder} />
            <Label htmlFor='reminder' className='text-lg font-semibold cursor-pointer'>
              Crear recordatorio por Email
            </Label>
          </div>

          {hasReminder && (
            <div className='grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2'>
              <div className='grid gap-2'>
                <Label htmlFor='date' className='text-lg font-semibold flex items-center gap-2'>
                  <Calendar className='h-5 w-5' /> Fecha
                </Label>
                <Input type='date' id='date' name='dueDate' required={hasReminder} className='h-12 text-lg border-2' min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='time' className='text-lg font-semibold flex items-center gap-2'>
                  <Clock className='h-5 w-5' /> Hora
                </Label>
                <Input type='time' id='time' name='dueTime' required={hasReminder} defaultValue='09:00' className='h-12 text-lg border-2' />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type='submit' size='lg' className='w-full h-12 text-lg font-bold' disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
