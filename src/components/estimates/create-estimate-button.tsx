'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, User, ArrowRight, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface ClientBasic {
  id: string
  name: string
  description?: string | null // Making description optional
}

interface CreateEstimateButtonProps {
  clients: ClientBasic[]
}

export function CreateEstimateButton({ clients }: CreateEstimateButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSelectClient = (clientId: string) => {
    setOpen(false)
    router.push(`/dashboard/clients/${clientId}/new-budget`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='h-12 px-6 text-base font-bold bg-black text-white hover:bg-zinc-800 shadow-md gap-2'>
          <Plus className='h-5 w-5' />
          Nueva Estimación
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg bg-white border-2 border-zinc-200 p-0 gap-0 overflow-hidden'>
        <DialogHeader className='p-6 pb-4 bg-zinc-50 border-b border-zinc-100'>
          <DialogTitle className='text-2xl font-black tracking-tight text-zinc-900'>Seleccionar Cliente</DialogTitle>
          <DialogDescription className='text-base font-medium text-zinc-600'>¿Para quién es este nuevo presupuesto?</DialogDescription>
        </DialogHeader>

        <div className='p-4'>
          <Command className='border-2 border-zinc-200 rounded-lg overflow-hidden'>
            <div className='flex items-center border-b border-zinc-200 px-3 bg-white'>
              <Search className='mr-2 h-5 w-5 shrink-0 text-zinc-500' />
              <CommandInput placeholder='Buscar cliente...' className='flex h-12 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50' />
            </div>
            <CommandList className='max-h-[300px] overflow-y-auto p-2'>
              <CommandEmpty className='py-6 text-center text-zinc-500 font-medium'>No se encontraron clientes.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem key={client.id} value={client.name} onSelect={() => handleSelectClient(client.id)} className='flex items-center justify-between p-3 mb-1 rounded-md cursor-pointer hover:bg-zinc-100 aria-selected:bg-zinc-100 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200'>
                        <User className='h-5 w-5 text-blue-700' />
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-bold text-base text-zinc-900'>{client.name}</span>
                        {client.description && <span className='text-sm text-zinc-500 line-clamp-1'>{client.description}</span>}
                      </div>
                    </div>
                    <ArrowRight className='h-5 w-5 text-zinc-400' />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  )
}
