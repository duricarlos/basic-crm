'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = {
  Estimación: '#3b82f6', // blue-500
  Seguimiento: '#eab308', // yellow-500
  'Por Aprobar': '#f97316', // orange-500
  Aprobado: '#22c55e', // green-500
}

export function FunnelChart({ data }: { data: { name: string; total: number; fill?: string }[] }) {
  // data expected: { name: 'Estimación', total: 10 }

  // Assign colors if not present, though we can handle in render
  const dataWithColors = data.map((d) => ({
    ...d,
    fill: COLORS[d.name as keyof typeof COLORS] || '#8884d8',
  }))

  return (
    <Card className='col-span-4 h-full'>
      <CardHeader>
        <CardTitle className='text-xl'>Estado de Clientes</CardTitle>
      </CardHeader>
      <CardContent className='pl-0'>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={dataWithColors}>
            <XAxis dataKey='name' stroke='#888888' fontSize={14} tickLine={false} axisLine={false} tickMargin={10} />
            {/* Remove YAxis for cleaner look or keep it? Senior might like grids. Let's keep it simple. */}
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '16px' }} />
            <Bar dataKey='total' radius={[8, 8, 0, 0]} barSize={80}>
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
