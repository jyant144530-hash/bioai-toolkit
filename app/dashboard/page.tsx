import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let reviewsUsed = 0
  let researchUsed = 0

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('reviews_used, research_used').eq('id', user.id).single()
    if (profile) {
      reviewsUsed = profile.reviews_used || 0
      researchUsed = profile.research_used || 0
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500">Select a tool below to get started.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/code-review">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Biotech Code Review Bot</CardTitle>
              <CardDescription>Analyze scripts for silent scientific errors.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{reviewsUsed}/5 reviews used</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/research">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Literature-to-Hypothesis Agent</CardTitle>
              <CardDescription>Synthesize PubMed and ClinicalTrials into novel hypotheses.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{researchUsed}/3 reports used</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
