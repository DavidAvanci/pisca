export interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  color?: string
  badges?: Record<string, string>
  mod?: boolean
  subscriber?: boolean
}

