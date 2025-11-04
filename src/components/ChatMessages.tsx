import { useEffect } from 'react'
import { ChatMessage } from '@/types/chat'

interface ChatMessageItemProps {
  message: ChatMessage
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const getUsernameColor = () => {
    if (message.color) {
      return message.color
    }
    // Default color based on username hash for consistency
    const hash = message.username.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="flex flex-col gap-1 px-4 py-2 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 text-sm">
        <span
          className="font-semibold"
          style={{ color: getUsernameColor() }}
        >
          {message.username}
        </span>
        {message.mod && (
          <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
            MOD
          </span>
        )}
        {message.subscriber && (
          <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
            SUB
          </span>
        )}
        <span className="text-muted-foreground text-xs">
          {formatTime(message.timestamp)}
        </span>
      </div>
      <div className="text-sm break-words">{message.message}</div>
    </div>
  )
}

interface ChatMessagesListProps {
  messages: ChatMessage[]
  scrollContainerRef?: React.RefObject<HTMLDivElement>
}

export function ChatMessagesList({ messages, scrollContainerRef }: ChatMessagesListProps) {
  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    // Only scroll within the scroll container, not the whole page
    if (scrollContainerRef?.current) {
      const container = scrollContainerRef.current
      // Scroll to bottom of the container with smooth behavior
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, scrollContainerRef])

  return (
    <div className="flex flex-col">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground p-4">
          <p>Nenhuma mensagem ainda. As mensagens do chat aparecerão aqui.</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
        </>
      )}
    </div>
  )
}
