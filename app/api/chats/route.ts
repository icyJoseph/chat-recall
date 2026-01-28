import { NextResponse } from 'next/server'
import { getChatsForApi } from '@/lib/chats'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') || undefined
  const search = searchParams.get('search') || undefined

  const chats = await getChatsForApi(source, search)

  return NextResponse.json(chats)
}
