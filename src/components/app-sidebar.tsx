'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calculator, Activity, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/dashboard', label: 'Tablero Principal', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Mis Clientes', icon: Users },
  { href: '/dashboard/estimates', label: 'Estimaciones', icon: Calculator },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className='flex h-screen w-64 flex-col bg-zinc-950 text-white shrink-0'>
      <div className='flex h-20 items-center px-6 border-b border-zinc-800'>
        <span className='text-2xl font-bold tracking-tight text-emerald-400'>Basic CRM</span>
      </div>
      <nav className='flex-1 space-y-4 px-4 py-8'>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium transition-all hover:bg-zinc-800 hover:scale-105', isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-300')}>
              <Icon size={28} />
              <span className='text-xl'>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className='p-6 border-t border-zinc-800'>
        <p className='text-xs text-zinc-400 text-center'>Versión Senior 1.0</p>
      </div>
    </div>
  )
}
