import { getClaudeChats } from './claude'
import { getCursorChats } from './cursor'
import type { Chat, ChatPreview, WeeklySummary, ProjectGroup, TimelineDay } from './types'

export async function getAllChats(): Promise<Chat[]> {
  const [claudeChats, cursorChats] = await Promise.all([getClaudeChats(), getCursorChats()])

  const chats = [...claudeChats, ...cursorChats]

  // Sort by date descending
  chats.sort((a, b) => (b.date || 0) - (a.date || 0))

  return chats
}

export async function getChatById(sessionId: string): Promise<Chat | null> {
  const chats = await getAllChats()
  return chats.find((chat) => chat.session_id === sessionId) || null
}

export function filterByDateRange(chats: Chat[], startDate: Date, endDate: Date): Chat[] {
  const startTs = startDate.getTime()
  const endTs = endDate.getTime()

  return chats.filter((chat) => {
    const chatDate = chat.date
    return chatDate && startTs <= chatDate && chatDate <= endTs
  })
}

export function getWeekRange(weeksAgo: number = 0): { start: Date; end: Date } {
  const today = new Date()

  // Find this week's Monday at midnight
  const daysSinceMonday = today.getDay() === 0 ? 6 : today.getDay() - 1
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() - daysSinceMonday)
  thisMonday.setHours(0, 0, 0, 0)

  // Go back the specified number of weeks
  const targetMonday = new Date(thisMonday)
  targetMonday.setDate(thisMonday.getDate() - weeksAgo * 7)

  const targetFriday = new Date(targetMonday)
  targetFriday.setDate(targetMonday.getDate() + 4)
  targetFriday.setHours(23, 59, 59, 999)

  return { start: targetMonday, end: targetFriday }
}

export function chatToChatPreview(chat: Chat): ChatPreview {
  let preview = ''

  // Get first user message as preview
  for (const msg of chat.messages) {
    if (msg.role === 'user') {
      preview = msg.content.slice(0, 200)
      break
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { messages, ...rest } = chat

  return {
    ...rest,
    preview,
  }
}

export async function getChatsForApi(source?: string, search?: string): Promise<ChatPreview[]> {
  let chats = await getAllChats()

  // Optional source filter
  if (source === 'claude' || source === 'cursor') {
    chats = chats.filter((c) => c.source === source)
  }

  // Optional search filter
  if (search) {
    const searchLower = search.toLowerCase()
    chats = chats.filter((chat) => {
      // Search in messages
      for (const msg of chat.messages) {
        if (msg.content.toLowerCase().includes(searchLower)) {
          return true
        }
      }
      // Search in project name
      const projectName = chat.project.name.toLowerCase()
      return projectName.includes(searchLower)
    })
  }

  // Convert to previews
  return chats.map(chatToChatPreview)
}

export async function getWeeklySummary(weeksAgo: number = 0): Promise<WeeklySummary> {
  const { start: startDate, end: endDate } = getWeekRange(weeksAgo)
  const allChats = await getAllChats()
  const weekChats = filterByDateRange(allChats, startDate, endDate)

  // Group by project
  const byProjectMap: Record<string, ProjectGroup> = {}

  for (const chat of weekChats) {
    const projectName = chat.project.name || 'Unknown'
    const source = chat.source
    const key = `${projectName} (${source})`

    if (!byProjectMap[key]) {
      byProjectMap[key] = {
        project: projectName,
        source,
        chats: [],
        total_messages: 0,
      }
    }

    // Get summary of what was done
    let summary = ''
    for (const msg of chat.messages) {
      if (msg.role === 'user') {
        summary = msg.content.slice(0, 300)
        break
      }
    }

    byProjectMap[key].chats.push({
      session_id: chat.session_id,
      date: chat.date,
      summary,
      message_count: chat.message_count,
    })
    byProjectMap[key].total_messages += chat.message_count
  }

  // Build timeline (day by day)
  const timelineMap: Record<string, TimelineDay> = {}

  for (const chat of weekChats) {
    if (!chat.date) continue

    const date = new Date(chat.date)
    const dateStr = date.toISOString().split('T')[0]
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })

    if (!timelineMap[dateStr]) {
      timelineMap[dateStr] = {
        date: dateStr,
        day: dayName,
        chats: [],
      }
    }

    let summary = ''
    for (const msg of chat.messages) {
      if (msg.role === 'user') {
        summary = msg.content.slice(0, 200)
        break
      }
    }

    timelineMap[dateStr].chats.push({
      session_id: chat.session_id,
      source: chat.source,
      project: chat.project.name || 'Unknown',
      summary,
      message_count: chat.message_count,
      timestamp: chat.date,
    })
  }

  // Sort timeline by date
  const sortedTimeline = Object.keys(timelineMap)
    .sort()
    .map((k) => timelineMap[k])

  return {
    week_start: startDate.toISOString(),
    week_end: endDate.toISOString(),
    weeks_ago: weeksAgo,
    by_project: Object.values(byProjectMap),
    timeline: sortedTimeline,
    total_chats: weekChats.length,
    total_messages: weekChats.reduce((sum, c) => sum + c.message_count, 0),
  }
}
