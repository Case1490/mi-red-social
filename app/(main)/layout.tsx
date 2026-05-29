import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import ToastContainer from '@/components/Toast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar solo en desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 lg:ml-64 min-h-screen lg:border-l border-gray-800">
        <div className="max-w-2xl mx-auto py-6 px-4 pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Nav inferior solo en móvil */}
      <MobileNav />
      <ToastContainer />
    </div>
  )
}