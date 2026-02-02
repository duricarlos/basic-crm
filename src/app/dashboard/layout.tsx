import { AppSidebar } from '@/components/app-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen w-full overflow-hidden bg-slate-50'>
      <AppSidebar />
      <main className='flex-1 overflow-y-auto'>
        {/* We remove header here if we want the dashboard page to control the header or if we want a global header */}
        {/* Let's keep a simple header or none, the sidebar is enough for navigation. The content will have its own titles */}
        <div className='min-h-full'>{children}</div>
      </main>
    </div>
  )
}
