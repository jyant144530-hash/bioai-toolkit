import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-gray-900 text-white flex-col hidden md:flex">
        <div className="h-14 flex items-center px-4 font-bold border-b border-gray-800">
          BioAI Toolkit
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            <li>
              <Link href="/dashboard/code-review" className="block px-4 py-2 rounded-md hover:bg-gray-800">
                Code Review
              </Link>
            </li>
            <li>
              <Link href="/dashboard/research" className="block px-4 py-2 rounded-md hover:bg-gray-800">
                Research
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2">Tier: <span className="font-semibold text-white uppercase">{profile?.tier || 'Free'}</span></div>
          <div className="text-xs text-gray-500 mb-4 truncate">{user.email}</div>
          <form action={signOut}>
            <Button variant="secondary" size="sm" className="w-full text-black">Sign out</Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  )
}
