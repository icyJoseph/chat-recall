import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getChatById } from '@/lib/chats'
import { ChatDetailClient } from '@/components/ChatDetailClient'
import { CircularProgress, Box } from '@mui/material'

async function getCachedChat(sessionId: string) {
  'use cache'
  return getChatById(sessionId)
}

interface ChatPageProps {
  params: Promise<{ sessionId: string }>
}

async function ChatContent({ sessionId }: { sessionId: string }) {
  const chat = await getCachedChat(sessionId)

  if (!chat) {
    notFound()
  }

  return <ChatDetailClient chat={chat} />
}

function LoadingFallback() {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <CircularProgress />
    </Box>
  )
}

async function ChatPageContent({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  return <ChatContent sessionId={sessionId} />
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChatPageContent params={params} />
    </Suspense>
  )
}
