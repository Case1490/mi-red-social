import Sidebar from "@/components/Sidebar"
import ToastContainer from '@/components/Toast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen border-l border-gray-800">
        <div className="max-w-2xl mx-auto py-8 px-4">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}