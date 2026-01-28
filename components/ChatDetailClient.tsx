'use client'

import { useRouter } from 'next/navigation'
import { Box, Typography, Chip, IconButton, Paper, Stack } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ReactMarkdown from 'react-markdown'
import type { Chat } from '@/lib/types'

interface ChatDetailClientProps {
  chat: Chat
}

export function ChatDetailClient({ chat }: ChatDetailClientProps) {
  const router = useRouter()

  const getSourceColor = (source: string) => {
    return source === 'claude' ? '#7c3aed' : '#22d3ee'
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
        <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 900, mx: 'auto' }}>
          <IconButton onClick={() => router.back()} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>

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

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {chat.project?.name || 'Unknown'}
            </Typography>
            {chat.project?.rootPath && (
              <Typography variant="caption" color="text.secondary">
                {chat.project.rootPath}
              </Typography>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            {formatDate(chat.date)}
          </Typography>
        </Stack>
      </Box>

      {/* Messages */}
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Stack spacing={3}>
          {chat.messages?.map((message, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: message.role === 'user' ? '#1a1a2e' : '#12121a',
                border: '1px solid',
                borderColor: message.role === 'user' ? '#2a2a4e' : '#1e1e2e',
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: message.role === 'user' ? '#7c3aed20' : '#22d3ee20',
                    color: message.role === 'user' ? '#7c3aed' : '#22d3ee',
                  }}
                >
                  {message.role === 'user' ? (
                    <PersonIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <SmartToyIcon sx={{ fontSize: 20 }} />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                  >
                    {message.role}
                  </Typography>

                  <Box
                    sx={{
                      mt: 1,
                      '& p': { mb: 1.5 },
                      '& p:last-child': { mb: 0 },
                      '& pre': {
                        backgroundColor: '#0a0a0f',
                        p: 2,
                        borderRadius: 1,
                        overflowX: 'auto',
                      },
                      '& code': {
                        backgroundColor: '#0a0a0f',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: '0.875em',
                      },
                      '& ul, & ol': { pl: 3, mb: 1.5 },
                      '& li': { mb: 0.5 },
                      '& blockquote': {
                        borderLeft: '3px solid #3a3a5e',
                        pl: 2,
                        ml: 0,
                        color: 'text.secondary',
                      },
                    }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
