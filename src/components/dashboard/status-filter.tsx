'use client'

import { Button } from '@/components/ui/button'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface StatusFilterProps {
  options: FilterOption[]
  allLabel?: string
  paramName?: string
}

export function StatusFilter({ options, allLabel = 'All', paramName = 'filter' }: StatusFilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentFilter = searchParams.get(paramName) || 'all'

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all') {
      params.delete(paramName)
    } else {
      params.set(paramName, value)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className='flex flex-wrap gap-2'>
      <Button variant='outline' size='sm' onClick={() => handleFilter('all')} className={cn('rounded-full border transition-all', currentFilter === 'all' ? 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900' : 'bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 border-zinc-200')}>
        {allLabel}
      </Button>
      {options.map((option) => (
        <Button key={option.value} variant='outline' size='sm' onClick={() => handleFilter(option.value)} className={cn('rounded-full border transition-all', currentFilter === option.value ? 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900' : 'bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 border-zinc-200')}>
          {option.label}
          {option.count !== undefined && <span className={cn('ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full', currentFilter === option.value ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-600')}>{option.count}</span>}
        </Button>
      ))}
    </div>
  )
}
