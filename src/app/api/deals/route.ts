import { NextRequest, NextResponse } from 'next/server';
import { fetchDeals } from '@/lib/cheapshark';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const storeID = searchParams.get('storeID') || undefined;
  const title = searchParams.get('title') || undefined;
  const sortBy = (searchParams.get('sortBy') as any) || 'Deal Rating';
  const desc = searchParams.get('desc') === '1';
  const pageNumber = searchParams.get('pageNumber') ? Number(searchParams.get('pageNumber')) : 0;
  const upperPrice = searchParams.get('upperPrice') ? Number(searchParams.get('upperPrice')) : undefined;

  const deals = await fetchDeals({
    storeID,
    title,
    sortBy,
    desc,
    pageNumber,
    upperPrice,
    pageSize: 32,
  });

  return NextResponse.json(deals);
}
