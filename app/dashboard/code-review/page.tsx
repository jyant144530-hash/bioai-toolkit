'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

const DEFAULT_CODE = `import pandas as pd

df = pd.read_csv("/Users/me/Desktop/plate_reader_export.csv")
control = df[df["sample"] == "control"]
treated = df[df["sample"] == "treated"]

fold_change = treated["signal"].mean() / control["signal"].mean()
print("Fold change:", fold_change)
`

export default function CodeReviewPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [upgrade, setUpgrade] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleReview = async () => {
    setLoading(true)
    setError('')
    setUpgrade(false)
    setResult(null)

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filename: 'analysis.py' })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 402 && data.upgrade) setUpgrade(true)
        throw new Error(data.error || 'Failed to review code')
      }
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-red-500 hover:bg-red-600'
      case 'high': return 'bg-orange-500 hover:bg-orange-600'
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'low': return 'bg-blue-500 hover:bg-blue-600'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Code Review Bot</h1>
        <div className="flex-1 border rounded-md overflow-hidden bg-[#1e1e1e]">
          <Editor
            height="70vh"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 13 }}
          />
        </div>
        <Button 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
          onClick={handleReview} 
          disabled={loading || code.length < 30}
        >
          {loading ? 'Reviewing...' : 'Review my code'}
        </Button>
      </div>

      <div className="w-full md:w-96 flex flex-col gap-4 overflow-y-auto">
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

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        )}

        {result && (
          <div className="space-y-4 pb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-center mb-2">{result.score}/100</div>
                <p className="text-sm text-center text-muted-foreground">{result.summary}</p>
              </CardContent>
            </Card>

            {result.issues?.map((issue: any, i: number) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2 text-[10px] uppercase font-bold text-muted-foreground">
                    <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                    <span>&bull;</span>
                    <span>{issue.category}</span>
                    {issue.line && (
                      <>
                        <span>&bull;</span>
                        <span>Line {issue.line}</span>
                      </>
                    )}
                  </div>
                  <CardTitle className="text-base leading-tight">{issue.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <p>{issue.explanation}</p>
                  {issue.fix && (
                    <pre className="bg-black/40 text-gray-200 p-3 rounded-md overflow-x-auto text-xs font-mono">
                      {issue.fix}
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}

            {result.learning_points?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What to remember</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    {result.learning_points.map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
