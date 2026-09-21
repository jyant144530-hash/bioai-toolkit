import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json({ error: 'Not Implemented: Stripe integration disabled' }, { status: 501 });
}
