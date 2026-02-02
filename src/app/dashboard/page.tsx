import { getDashboardData } from '@/actions/dashboard'
import { MetricCard } from '@/components/dashboard/metric-card'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { RecentEstimates } from '@/components/dashboard/recent-estimates'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { DollarSign, Users, Clock, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/') // Or show login
  }

  const { pipelineValue, wonValue, budgetCounts, recentActivity, recentEstimates } = data

  const activeBudgets = (budgetCounts['sent'] || 0) + (budgetCounts['follow_up'] || 0) + (budgetCounts['approval'] || 0)

  // Prepare chart data
  const chartData = [
    { name: 'En Negociación', total: budgetCounts['sent'] || 0 },
    { name: 'Seguimiento', total: budgetCounts['follow_up'] || 0 },
    { name: 'Por Aprobar', total: budgetCounts['approval'] || 0 },
    { name: 'Cerrados', total: (budgetCounts['approved'] || 0) + (budgetCounts['paid'] || 0) },
  ]

  return (
    <div className='space-y-8 m-4'>
      {/* Top Metrics Row */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard 
            title='Pipeline Activo' 
            value={`$${pipelineValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
            description='Valor en negociación' 
            icon={DollarSign} 
        />
        <MetricCard 
            title='Ventas Cerradas' 
            value={`$${wonValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
            description='Total aprobado/pagado' 
            icon={CheckCircle} 
            className="border-emerald-200 bg-emerald-50"
        />
        <MetricCard 
            title='Presupuestos Activos' 
            value={activeBudgets} 
            description='Propuestas en curso' 
            icon={Clock} 
        />
        <MetricCard 
            title='Tasa de Cierre' 
            value={`${activeBudgets > 0 ? Math.round(((budgetCounts['approved'] || 0) / (activeBudgets + (budgetCounts['approved'] || 0))) * 100) : 0}%`} 
            description='Efectividad' 
            icon={Users} 
        />
      </div>

      {/* Main Content Grid */}
      <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-7 h-auto'>
        {/* Funnel Chart - Takes 4 columns */}
        <div className='lg:col-span-4 h-full'>
          <FunnelChart data={chartData} />
        </div>

        {/* Recent Estimates - Takes 3 columns */}
        <div className='lg:col-span-3 h-full'>
          <RecentEstimates estimates={recentEstimates} />
        </div>
      </div>

      {/* Activity Feed */}
      <div className='grid gap-4 md:grid-cols-1'>
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  )
}
