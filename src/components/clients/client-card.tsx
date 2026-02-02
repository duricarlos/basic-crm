'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Phone, Mail, FileText, Clock, Archive, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react'
import { updateClientStatus } from '@/actions/clients'
import { useState } from 'react'
import Link from 'next/link'

interface ClientCardProps {
  client: {
    id: string
    name: string
    email: string | null
    phone: string | null
    description: string | null
    status: 'new' | 'estimate' | 'follow_up' | 'approval' | 'approved' | 'cancelled' | string | null
    updatedAt: Date | null
  }
}

export function ClientCard({ client }: ClientCardProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: any) => {
    setLoading(true)
    await updateClientStatus(client.id, newStatus)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'estimate':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approval':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Nuevo'
      case 'estimate':
        return 'Estimación'
      case 'follow_up':
        return 'Seguimiento'
      case 'approval':
        return 'Por Aprobar'
      case 'approved':
        return 'Aprobado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <Card className='border-2 shadow-sm hover:shadow-md transition-shadow'>
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-12 w-12 border-2 border-primary/10'>
              <AvatarFallback className='bg-primary/5 text-primary text-xl font-bold'>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/dashboard/clients/${client.id}`} className='hover:underline flex items-center gap-2 group'>
                <CardTitle className='text-xl font-bold group-hover:text-primary transition-colors'>{client.name}</CardTitle>
                <ExternalLink className='h-5 w-5 text-muted-foreground group-hover:text-primary' />
              </Link>
              <Badge variant='outline' className={`mt-1 text-sm font-semibold border-2 ${getStatusColor(client.status || 'new')}`}>
                {getStatusLabel(client.status || 'new')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-3 pb-3'>
        {client.email && (
          <div className='flex items-center gap-2 text-lg text-muted-foreground'>
            <Mail className='h-5 w-5' />
            <span className='truncate'>{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className='flex items-center gap-2 text-lg text-muted-foreground'>
            <Phone className='h-5 w-5' />
            <span>{client.phone}</span>
          </div>
        )}
        {client.description && (
          <div className='flex items-start gap-2 text-base text-muted-foreground bg-muted/50 p-2 rounded-md'>
            <FileText className='h-5 w-5 mt-0.5 shrink-0' />
            <p className='line-clamp-2'>{client.description}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-col gap-3 pt-2 border-t bg-muted/20'>
        <Link href={`/dashboard/clients/${client.id}`} className='w-full'>
          <Button variant='default' className='w-full font-bold text-lg h-12'>
            Ver Ficha / Gestionar
          </Button>
        </Link>

        {/* Acciones segun estado */}
        <div className='flex gap-2 w-full flex-wrap'>
          {client.status === 'new' && (
            <Button variant='outline' className='flex-1 border-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold' onClick={() => handleStatusChange('estimate')} disabled={loading}>
              Crear Estimado <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          )}

          {client.status === 'estimate' && (
            <Button variant='outline' className='flex-1 border-2 border-yellow-200 hover:bg-yellow-50 text-yellow-700 font-bold' onClick={() => handleStatusChange('follow_up')} disabled={loading}>
              A Seguimiento <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          )}

          {client.status === 'follow_up' && (
            <Button variant='outline' className='flex-1 border-2 border-orange-200 hover:bg-orange-50 text-orange-700 font-bold' onClick={() => handleStatusChange('approval')} disabled={loading}>
              Por Aprobar <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          )}

          {client.status === 'approval' && (
            <Button variant='outline' className='flex-1 border-2 border-green-200 hover:bg-green-50 text-green-700 font-bold' onClick={() => handleStatusChange('approved')} disabled={loading}>
              Aprobar <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          )}

          {client.status !== 'cancelled' && client.status !== 'approved' && (
            <Button variant='ghost' className='text-gray-500 hover:text-red-600 hover:bg-red-50' onClick={() => handleStatusChange('cancelled')} disabled={loading}>
              Cancelar
            </Button>
          )}

          {client.status === 'cancelled' && (
            <Button variant='outline' className='w-full border-2' onClick={() => handleStatusChange('new')} disabled={loading}>
              Reactivar Cliente
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
