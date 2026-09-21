'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

const STAGES = [
  "Extracting entities...",
  "Querying databases...",
  "Synthesizing report..."
]

export default function ResearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(0)
  const [error, setError] = useState('')
  const [upgrade, setUpgrade] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setStage(s => Math.min(s + 1, 2))
    }, 4000)
    return () => clearInterval(interval)
  }, [loading])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setStage(0)
    setError('')
    setUpgrade(false)
    setResult(null)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 402 && data.upgrade) setUpgrade(true)
        throw new Error(data.error || 'Failed to research')
      }
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getConfColor = (conf: string) => {
    switch(conf) {
      case 'high': return 'bg-green-500 hover:bg-green-600'
      case 'moderate': return 'bg-blue-500 hover:bg-blue-600'
      case 'low': return 'bg-yellow-500 hover:bg-yellow-600 text-black'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Literature-to-Hypothesis Agent</h1>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input 
          className="flex-1 text-lg py-6"
          placeholder="e.g. Metformin and Alzheimer's disease" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" size="lg" className="h-auto" disabled={loading || query.length < 8}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            {upgrade && (
              <Link href="/pricing" className="underline font-bold">
                Upgrade to Pro
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      {loading && !error && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium text-primary animate-pulse">{STAGES[stage]}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{result.headline}</h2>
            <Badge className={getConfColor(result.confidence)}>Confidence: {result.confidence}</Badge>
          </div>
          
          <Tabs defaultValue="literature">
            <TabsList>
              <TabsTrigger value="literature">Literature</TabsTrigger>
              <TabsTrigger value="trials">Trials</TabsTrigger>
              <TabsTrigger value="mechanism">Mechanism</TabsTrigger>
              <TabsTrigger value="gaps">Gaps</TabsTrigger>
              <TabsTrigger value="next_steps">Next Steps</TabsTrigger>
            </TabsList>
            
            <TabsContent value="literature" className="space-y-6 mt-4">
              <Card>
                <CardContent className="pt-6 prose max-w-none">
                  {result.literature}
                </CardContent>
              </Card>
              <div>
                <h3 className="font-bold mb-4">Sources ({result.sources?.papers?.length || 0})</h3>
                <div className="space-y-3">
                  {result.sources?.papers?.map((p: any, i: number) => (
                    <div key={i} className="text-sm border-l-2 border-primary pl-3">
                      <a href={p.url} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline block">{p.title}</a>
                      <span className="text-muted-foreground">{p.authors} &bull; {p.journal} ({p.year})</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="trials" className="mt-4">
              <Card className="mb-6">
                <CardContent className="pt-6 prose max-w-none">
                  {result.trials}
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                {result.sources?.trials?.map((t: any, i: number) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <a href={t.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-blue-600 hover:underline">{t.nctId}</a>
                        <Badge variant="outline">{t.status}</Badge>
                      </div>
                      <CardTitle className="text-base line-clamp-2">{t.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {t.phase && <p><strong>Phase:</strong> {t.phase}</p>}
                        <p className="line-clamp-2"><strong>Conditions:</strong> {t.conditions?.join(', ')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!result.sources?.trials || result.sources.trials.length === 0) && (
                  <p className="text-muted-foreground">No clinical trials found.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="mechanism" className="mt-4">
              <Card>
                <CardContent className="pt-6 prose max-w-none">
                  {result.mechanism}
                </CardContent>
              </Card>
              {result.sources?.compound && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Compound Data: {result.sources.compound.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Formula:</strong> {result.sources.compound.formula}</p>
                    <p><strong>Weight:</strong> {result.sources.compound.weight} g/mol</p>
                    <p className="break-all"><strong>SMILES:</strong> {result.sources.compound.smiles}</p>
                    <a href={result.sources.compound.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View on PubChem</a>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="gaps" className="mt-4">
              <Card>
                <CardContent className="pt-6 prose max-w-none">
                  {result.gaps}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="next_steps" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ul className="list-decimal pl-5 space-y-2">
                    {result.next_steps?.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      )}
    </div>
  )
}
