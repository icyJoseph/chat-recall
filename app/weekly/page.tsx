import { Suspense } from 'react'
import { getWeeklySummary } from '@/lib/chats'
import { WeeklySummaryClient } from '@/components/WeeklySummaryClient'
import { CircularProgress, Box } from '@mui/material'

async function getCachedWeeklySummary(weeksAgo: number) {
  'use cache'
  return getWeeklySummary(weeksAgo)
}

interface WeeklyPageProps {
  searchParams: Promise<{ weeks_ago?: string }>
}

async function WeeklyContent({ weeksAgo }: { weeksAgo: number }) {
  const summary = await getCachedWeeklySummary(weeksAgo)
  return <WeeklySummaryClient initialSummary={summary} initialWeeksAgo={weeksAgo} />
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

async function WeeklyPageContent({
  searchParams,
}: {
  searchParams: Promise<{ weeks_ago?: string }>
}) {
  const { weeks_ago } = await searchParams
  const weeksAgo = parseInt(weeks_ago || '0', 10)
  return <WeeklyContent weeksAgo={weeksAgo} />
}

export default function WeeklyPage({ searchParams }: WeeklyPageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WeeklyPageContent searchParams={searchParams} />
    </Suspense>
  )
}
