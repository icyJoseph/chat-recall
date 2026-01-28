'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Chip,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Stack,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ChatIcon from '@mui/icons-material/Chat'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import type { ChatPreview } from '@/lib/types'

interface ChatListClientProps {
  initialChats: ChatPreview[]
}

export function ChatListClient({ initialChats }: ChatListClientProps) {
  const [chats, setChats] = useState(initialChats)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'claude' | 'cursor'>('all')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchChats = async (source: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (source !== 'all') {
        params.append('source', source)
      }
      const response = await fetch(`/api/chats?${params}`)
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
    setLoading(false)
  }

  const handleSourceChange = (
    _: React.MouseEvent<HTMLElement>,
    value: 'all' | 'claude' | 'cursor' | null
  ) => {
    if (value) {
      setSourceFilter(value)
      fetchChats(value)
    }
  }

  const filteredChats = chats.filter((chat) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    const projectName = chat.project?.name?.toLowerCase() || ''
    const preview = chat.preview?.toLowerCase() || ''
    return projectName.includes(searchLower) || preview.includes(searchLower)
  })

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown date'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSourceColor = (source: string) => {
    return source === 'claude' ? '#7c3aed' : '#22d3ee'
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Week Work
          </Typography>
          <Button
            component={Link}
            href="/weekly"
            variant="contained"
            startIcon={<CalendarMonthIcon />}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6d28d9, #06b6d4)',
              },
            }}
          >
            Weekly Summary
          </Button>
        </Stack>

        {/* Search and filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#12121a',
              },
            }}
          />

          <ToggleButtonGroup
            value={sourceFilter}
            exclusive
            onChange={handleSourceChange}
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="claude" sx={{ color: '#7c3aed' }}>
              Claude
            </ToggleButton>
            <ToggleButton value="cursor" sx={{ color: '#22d3ee' }}>
              Cursor
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Stats */}
        <Typography variant="body2" color="text.secondary" mb={2}>
          {filteredChats.length} chats found
        </Typography>
      </Box>

      {/* Chat list */}
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Stack spacing={2} sx={{ opacity: loading ? 0.5 : 1 }}>
          {filteredChats.map((chat) => (
            <Card
              key={chat.session_id}
              onClick={() => router.push(`/chat/${chat.session_id}`)}
              sx={{
                cursor: 'pointer',
                backgroundColor: '#12121a',
                border: '1px solid #1e1e2e',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: getSourceColor(chat.source),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Chip
                        label={chat.source}
                        size="small"
                        sx={{
                          backgroundColor: `${getSourceColor(chat.source)}20`,
                          color: getSourceColor(chat.source),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {chat.project?.name || 'Unknown'}
                      </Typography>
                    </Stack>

                    {chat.preview && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {chat.preview}
                      </Typography>
                    )}
                  </Box>

                  <Stack alignItems="flex-end" spacing={0.5} sx={{ ml: 2, flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(chat.date)}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <ChatIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {chat.message_count}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {filteredChats.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">No chats found</Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
