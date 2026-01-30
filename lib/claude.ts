import { readdir, readFile, stat } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'
import type { Chat, Message } from './types'

export function getClaudeBaseDir(): string {
  return join(homedir(), '.claude')
}

interface ClaudeEntry {
  type?: string
  timestamp?: string
  message?: {
    content?: string | Array<{ type: string; text?: string }>
  }
}

export async function parseClaudeSession(sessionPath: string): Promise<Chat | null> {
  try {
    const content = await readFile(sessionPath, 'utf-8')
    const lines = content.split('\n').filter((line) => line.trim())

    const messages: Message[] = []
    const sessionId = sessionPath.split('/').pop()?.replace('.jsonl', '') || ''
    const projectDir = sessionPath.split('/').slice(-2, -1)[0] || ''

    // Decode project path: -Users-foo-dev-project -> /Users/foo/dev/project
    let projectName = projectDir.replace(/-/g, '/').replace(/^\//, '')
    if (projectName.startsWith('Users/')) {
      projectName = '/' + projectName
    }

    let earliestTs: Date | null = null
    let latestTs: Date | null = null

    for (const line of lines) {
      try {
        const entry: ClaudeEntry = JSON.parse(line)

        // Extract timestamp
        if (entry.timestamp) {
          try {
            const ts = new Date(entry.timestamp.replace('Z', '+00:00'))
            if (!earliestTs || ts < earliestTs) earliestTs = ts
            if (!latestTs || ts > latestTs) latestTs = ts
          } catch {
            // Ignore timestamp parsing errors
          }
        }

        // Extract user messages
        if (entry.type === 'user') {
          const content = entry.message
          let text = ''
          if (content && typeof content === 'object') {
            text = typeof content.content === 'string' ? content.content : ''
          }
          if (text) {
            messages.push({
              role: 'user',
              content: text,
              timestamp: entry.timestamp,
            })
          }
        }

        // Extract assistant messages
        if (entry.type === 'assistant') {
          const content = entry.message
          let text = ''
          if (content && typeof content === 'object') {
            if (typeof content.content === 'string') {
              text = content.content
            } else if (Array.isArray(content.content)) {
              const textParts: string[] = []
              for (const block of content.content) {
                if (block.type === 'text' && block.text) {
                  textParts.push(block.text)
                }
              }
              text = textParts.join('\n')
            }
          }
          if (text) {
            messages.push({
              role: 'assistant',
              content: text,
              timestamp: entry.timestamp,
            })
          }
        }
      } catch {
        // Skip invalid JSON lines
        continue
      }
    }

    if (messages.length === 0) {
      return null
    }

    // Get project name from last path component
    const displayName = projectName.split('/').pop() || 'Unknown'

    return {
      session_id: `claude_${projectDir}_${sessionId}`,
      source: 'claude',
      project: {
        name: displayName,
        rootPath: projectName,
      },
      messages,
      message_count: messages.length,
      date: earliestTs ? earliestTs.getTime() : null,
      end_date: latestTs ? latestTs.getTime() : null,
    }
  } catch (error) {
    console.error(`Error parsing Claude session ${sessionPath}:`, error)
    return null
  }
}

export async function getClaudeChats(): Promise<Chat[]> {
  const claudeDir = getClaudeBaseDir()
  const projectsDir = join(claudeDir, 'projects')

  try {
    await stat(projectsDir)
  } catch {
    return []
  }

  const chats: Chat[] = []

  try {
    const projectDirs = await readdir(projectsDir)

    for (const projectDir of projectDirs) {
      const projectPath = join(projectsDir, projectDir)
      const projectStat = await stat(projectPath)

      if (!projectStat.isDirectory()) continue

      const files = await readdir(projectPath)
      const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'))

      for (const jsonlFile of jsonlFiles) {
        const sessionPath = join(projectPath, jsonlFile)
        const chat = await parseClaudeSession(sessionPath)
        if (chat) {
          chats.push(chat)
        }
      }
    }
  } catch (error) {
    console.error('Error reading Claude chats:', error)
  }

  return chats
}
