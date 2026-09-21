'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <h1 className="text-4xl font-bold text-center mb-8">Simple, Student-Friendly Pricing</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>For basic exploratory research.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">₹0<span className="text-lg text-muted-foreground font-normal">/month</span></div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 5 Code reviews / month</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 3 Research reports / month</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4 opacity-0" /> PDF export</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4 opacity-0" /> Priority processing</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Student Pro</CardTitle>
            <CardDescription>Unlimited access for students.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">₹199<span className="text-lg text-muted-foreground font-normal">/month</span></div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Code reviews</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Research reports</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> PDF export</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority processing</li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => alert('Stripe coming soon — email hello@bioai.dev to upgrade manually.')}>Verify student status & upgrade</Button>
            <p className="text-xs text-muted-foreground text-center">Requires a valid .edu, .ac.in, or .edu.in email. Discount applied automatically.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
