'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/actions/clients'
import { PlusCircle } from 'lucide-react'

export function NewClientDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)

    try {
      await createClient(formData)
      setOpen(false)
    } catch (error) {
      console.error(error)
      alert('Error al crear cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='lg' className='text-lg px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg'>
          <PlusCircle className='mr-2 h-6 w-6' />
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-150 bg-card border-2 border-primary/20'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-primary'>Agregar Nuevo Cliente</DialogTitle>
          <DialogDescription className='text-lg text-muted-foreground'>Ingrese los datos básicos del cliente para comenzar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-6 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name' className='text-lg font-semibold'>
              Nombre Completo *
            </Label>
            <Input id='name' name='name' required className='h-12 text-lg border-2' placeholder='Ej: Juan Pérez' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='email' className='text-lg font-semibold'>
              Correo Electrónico
            </Label>
            <Input id='email' name='email' type='email' className='h-12 text-lg border-2' placeholder='juan@ejemplo.com' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='phone' className='text-lg font-semibold'>
              Teléfono
            </Label>
            <Input id='phone' name='phone' type='tel' className='h-12 text-lg border-2' placeholder='+34 600 000 000' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='description' className='text-lg font-semibold'>
              Notas / Descripción
            </Label>
            <Textarea id='description' name='description' className='text-lg border-2 min-h-25' placeholder='Notas sobre el cliente o trabajo a realizar...' />
          </div>
          <DialogFooter>
            <Button type='submit' size='lg' className='w-full h-14 text-xl font-bold' disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
