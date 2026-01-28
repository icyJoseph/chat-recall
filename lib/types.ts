export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface Project {
  name: string
  rootPath: string
}

export interface Chat {
  session_id: string
  source: 'claude' | 'cursor'
  project: Project
  messages: Message[]
  message_count: number
  date: number | null
  end_date?: number | null
}

export interface ChatPreview extends Omit<Chat, 'messages'> {
  preview: string
}

export interface ProjectGroup {
  project: string
  source: 'claude' | 'cursor'
  chats: {
    session_id: string
    date: number | null
    summary: string
    message_count: number
  }[]
  total_messages: number
}

export interface TimelineDay {
  date: string
  day: string
  chats: {
    session_id: string
    source: 'claude' | 'cursor'
    project: string
    summary: string
    message_count: number
    timestamp: number
  }[]
}

export interface WeeklySummary {
  week_start: string
  week_end: string
  weeks_ago: number
  by_project: ProjectGroup[]
  timeline: TimelineDay[]
  total_chats: number
  total_messages: number
}
