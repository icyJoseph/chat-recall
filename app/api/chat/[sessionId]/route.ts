import { NextResponse } from 'next/server'
import { getChatById } from '@/lib/chats'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const chat = await getChatById(sessionId)

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  return NextResponse.json(chat)
}
