import { readdir, readFile, stat } from 'fs/promises'
import { homedir, platform } from 'os'
import { join } from 'path'
import type { Chat, Project } from './types'

export function getCursorBaseDir(): string {
  const home = homedir()
  const os = platform()

  if (os === 'win32') {
    return join(home, 'AppData', 'Roaming', 'Cursor')
  } else if (os === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Cursor')
  } else {
    return join(home, '.config', 'Cursor')
  }
}

async function getProjectFromWorkspace(workspaceDir: string): Promise<Project> {
  const project: Project = { name: 'Unknown', rootPath: '' }

  const workspaceJsonPath = join(workspaceDir, 'workspace.json')

  try {
    const content = await readFile(workspaceJsonPath, 'utf-8')
    const data = JSON.parse(content)
    const folder = data.folder || ''

    if (folder.startsWith('file://')) {
      const rootPath = folder.slice(7)
      project.rootPath = rootPath
      project.name = rootPath.replace(/\/$/, '').split('/').pop() || 'Unknown'
    }
  } catch {
    // Fallback: use workspace folder name
    project.name = workspaceDir.split('/').pop()?.slice(0, 8) || 'Unknown'
  }

  return project
}

interface CursorPrompt {
  text?: string
}

export async function parseCursorWorkspace(dbPath: string): Promise<Chat[]> {
  const chats: Chat[] = []
  const workspaceDir = join(dbPath, '..')

  try {
    // Dynamic import for better-sqlite3
    const Database = (await import('better-sqlite3')).default
    const db = new Database(dbPath, { readonly: true })

    const project = await getProjectFromWorkspace(workspaceDir)

    // Get user prompts from aiService.prompts
    const row = db.prepare("SELECT value FROM ItemTable WHERE key = 'aiService.prompts'").get() as
      | { value: string }
      | undefined

    if (row) {
      try {
        const prompts: CursorPrompt[] = JSON.parse(row.value)

        if (Array.isArray(prompts) && prompts.length > 0) {
          // Convert prompts to messages (user messages only from Cursor)
          const messages = prompts
            .filter((prompt) => prompt.text)
            .map((prompt) => ({
              role: 'user' as const,
              content: prompt.text || '',
            }))

          if (messages.length > 0) {
            // Use db file modification time as timestamp
            const dbStat = await stat(dbPath)
            const timestamp = dbStat.mtime.getTime()
            const workspaceName = workspaceDir.split('/').pop() || ''

            chats.push({
              session_id: `cursor_${workspaceName}`,
              source: 'cursor',
              project,
              messages,
              message_count: messages.length,
              date: timestamp,
            })
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    db.close()
  } catch (error) {
    // Debug: log error for Cursor workspace parsing
    console.debug(`Error parsing Cursor workspace ${dbPath}:`, error)
  }

  return chats
}

export async function getCursorChats(): Promise<Chat[]> {
  const cursorDir = getCursorBaseDir()
  const workspaceStorageDir = join(cursorDir, 'User', 'workspaceStorage')

  try {
    await stat(workspaceStorageDir)
  } catch {
    return []
  }

  const chats: Chat[] = []

  try {
    const workspaces = await readdir(workspaceStorageDir)

    for (const workspace of workspaces) {
      const workspacePath = join(workspaceStorageDir, workspace)
      const workspaceStat = await stat(workspacePath)

      if (!workspaceStat.isDirectory()) continue

      // Check for state.vscdb
      const stateDbPath = join(workspacePath, 'state.vscdb')

      try {
        await stat(stateDbPath)
        const workspaceChats = await parseCursorWorkspace(stateDbPath)
        chats.push(...workspaceChats)
      } catch {
        // state.vscdb doesn't exist, skip
      }
    }
  } catch (error) {
    console.error('Error reading Cursor chats:', error)
  }

  return chats
}
