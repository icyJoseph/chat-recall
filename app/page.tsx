import { Suspense } from 'react'
import { getChatsForApi } from '@/lib/chats'
import { ChatListClient } from '@/components/ChatListClient'
import { CircularProgress, Box } from '@mui/material'

async function getCachedChats() {
  'use cache'
  return getChatsForApi()
}

async function HomeContent() {
  const chats = await getCachedChats()
  return <ChatListClient initialChats={chats} />
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

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  )
}
