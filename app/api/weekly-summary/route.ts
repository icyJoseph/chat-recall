import { NextResponse } from 'next/server'
import { getWeeklySummary } from '@/lib/chats'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weeksAgo = parseInt(searchParams.get('weeks_ago') || '0', 10)

  const summary = await getWeeklySummary(weeksAgo)

  return NextResponse.json(summary)
}
