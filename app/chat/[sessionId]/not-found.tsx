'use client'

import Link from 'next/link'
import { Box, Typography, Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        Chat Not Found
      </Typography>
      <Typography color="text.secondary">
        The chat session you&apos;re looking for doesn&apos;t exist.
      </Typography>
      <Button
        component={Link}
        href="/"
        startIcon={<ArrowBackIcon />}
        variant="contained"
        sx={{ mt: 2 }}
      >
        Back to Chats
      </Button>
    </Box>
  )
}
