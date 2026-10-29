import { NextResponse } from 'next/server';
import { getUSDtoBRLRate } from '@/lib/currency';

export async function GET() {
  const rate = await getUSDtoBRLRate();
  return NextResponse.json({ rate });
}
