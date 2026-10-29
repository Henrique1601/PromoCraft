import { NextResponse } from 'next/server';
import { fetchStores } from '@/lib/cheapshark';

export async function GET() {
  const stores = await fetchStores();
  return NextResponse.json(stores);
}
