'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ViewListIcon from '@mui/icons-material/ViewList'
import TimelineIcon from '@mui/icons-material/Timeline'
import FolderIcon from '@mui/icons-material/Folder'
import ChatIcon from '@mui/icons-material/Chat'
import type { WeeklySummary } from '@/lib/types'

interface WeeklySummaryClientProps {
  initialSummary: WeeklySummary
  initialWeeksAgo: number
}

export function WeeklySummaryClient({ initialSummary, initialWeeksAgo }: WeeklySummaryClientProps) {
  const router = useRouter()
  const [summary, setSummary] = useState(initialSummary)
  const [loading, setLoading] = useState(false)
  const [weeksAgo, setWeeksAgo] = useState(initialWeeksAgo)
  const [viewMode, setViewMode] = useState<'grouped' | 'timeline'>('grouped')

  const fetchSummary = async (weeks: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/weekly-summary?weeks_ago=${weeks}`)
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
    setLoading(false)
  }

  const handleWeekChange = (delta: number) => {
    const newWeeksAgo = Math.max(0, weeksAgo + delta)
    setWeeksAgo(newWeeksAgo)
    fetchSummary(newWeeksAgo)
  }

  const getSourceColor = (source: string) => {
    return source === 'claude' ? '#7c3aed' : '#22d3ee'
  }

  const formatWeekLabel = () => {
    if (!summary) return ''
    const start = new Date(summary.week_start)
    const end = new Date(summary.week_end)

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    if (weeksAgo === 0) return `This Week (${startStr} - ${endStr})`
    if (weeksAgo === 1) return `Last Week (${startStr} - ${endStr})`
    return `${weeksAgo} Weeks Ago (${startStr} - ${endStr})`
  }

  const formatTime = (timestamp: number) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderGroupedView = () => {
    if (!summary?.by_project?.length) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No activity this week</Typography>
        </Box>
      )
    }

    return (
      <Stack spacing={3}>
        {summary.by_project.map((group, index) => (
          <Card
            key={index}
            sx={{
              backgroundColor: '#12121a',
              border: '1px solid #1e1e2e',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: `${getSourceColor(group.source)}20`,
                    color: getSourceColor(group.source),
                  }}
                >
                  <FolderIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {group.project}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={group.source}
                      size="small"
                      sx={{
                        backgroundColor: `${getSourceColor(group.source)}20`,
                        color: getSourceColor(group.source),
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {group.chats.length} sessions / {group.total_messages} messages
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ mb: 2, borderColor: '#1e1e2e' }} />

              <Stack spacing={1.5}>
                {group.chats.map((chat, chatIndex) => (
                  <Box
                    key={chatIndex}
                    onClick={() => router.push(`/chat/${chat.session_id}`)}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: '#0a0a0f',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#1a1a2e',
                      },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {chat.summary || 'No preview available'}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 2, flexShrink: 0 }}
                      >
                        {chat.message_count} msgs
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    )
  }

  const renderTimelineView = () => {
    if (!summary?.timeline?.length) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No activity this week</Typography>
        </Box>
      )
    }

    return (
      <Stack spacing={4}>
        {summary.timeline.map((day, dayIndex) => (
          <Box key={dayIndex}>
            <Paper
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: '#1a1a2e',
                border: '1px solid #2a2a4e',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {day.day}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(day.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
            </Paper>

            <Stack spacing={2} sx={{ pl: 3, borderLeft: '2px solid #2a2a4e' }}>
              {day.chats
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((chat, chatIndex) => (
                  <Box
                    key={chatIndex}
                    onClick={() => router.push(`/chat/${chat.session_id}`)}
                    sx={{
                      position: 'relative',
                      p: 2,
                      backgroundColor: '#12121a',
                      border: '1px solid #1e1e2e',
                      borderRadius: 2,
                      cursor: 'pointer',
                      ml: 2,
                      '&:hover': {
                        borderColor: getSourceColor(chat.source),
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -19,
                        top: '50%',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: getSourceColor(chat.source),
                        transform: 'translateY(-50%)',
                      },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {formatTime(chat.timestamp)}
                          </Typography>
                          <Chip
                            label={chat.source}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: `${getSourceColor(chat.source)}20`,
                              color: getSourceColor(chat.source),
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {chat.project}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {chat.summary || 'No preview available'}
                        </Typography>
                      </Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{ ml: 2, flexShrink: 0 }}
                      >
                        <ChatIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {chat.message_count}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#0a0a0f',
          borderBottom: '1px solid #1e1e2e',
          p: 2,
        }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <IconButton component={Link} href="/" sx={{ color: 'text.secondary' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={700}>
              Weekly Summary
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Week navigation */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={() => handleWeekChange(1)} sx={{ color: 'text.secondary' }}>
                <ChevronLeftIcon />
              </IconButton>

              <Box sx={{ minWidth: 250, textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatWeekLabel()}
                </Typography>
              </Box>

              <IconButton
                onClick={() => handleWeekChange(-1)}
                disabled={weeksAgo === 0}
                sx={{ color: weeksAgo === 0 ? 'text.disabled' : 'text.secondary' }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>

            {/* View toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
              size="small"
            >
              <ToggleButton value="grouped">
                <ViewListIcon sx={{ mr: 1 }} />
                Grouped
              </ToggleButton>
              <ToggleButton value="timeline">
                <TimelineIcon sx={{ mr: 1 }} />
                Timeline
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Stats */}
          {summary && (
            <Stack direction="row" spacing={3} mt={2} justifyContent="center">
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {summary.total_chats}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sessions
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h4" fontWeight={700} color="secondary">
                  {summary.total_messages}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Messages
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'grouped' ? (
          renderGroupedView()
        ) : (
          renderTimelineView()
        )}
      </Box>
    </Box>
  )
}
