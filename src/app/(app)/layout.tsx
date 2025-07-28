import { Header } from '@/components/Header'
import { MobileNav } from '@/components/MobileNav'

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}