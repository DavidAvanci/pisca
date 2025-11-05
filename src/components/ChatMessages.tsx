import { useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
  const internalScrollRef = useRef<HTMLDivElement | null>(null)
  const parentRef = useMemo(() => scrollContainerRef ?? internalScrollRef, [scrollContainerRef])

  const atBottomRef = useRef<boolean>(true)

  useEffect(() => {
    const el = parentRef.current
    if (!el) return

    const handleScroll = () => {
      const threshold = 48 // px tolerance to still consider at bottom
      atBottomRef.current = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
    }

    // Initialize state and listen to scroll updates
    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [parentRef])

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 12,
    // Let the virtualizer measure dynamic item heights for accuracy
    measureElement: (el) => el?.getBoundingClientRect().height ?? 56,
  })

  // Stick to bottom when new messages arrive if user was already at bottom
  useEffect(() => {
    if (messages.length === 0) return
    if (!parentRef.current) return
    if (!atBottomRef.current) return
    rowVirtualizer.scrollToIndex(messages.length - 1, { align: 'end' })
  }, [messages, parentRef, rowVirtualizer])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        <p>Nenhuma mensagem ainda. As mensagens do chat aparecerão aqui.</p>
      </div>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div ref={!scrollContainerRef ? internalScrollRef : undefined} className="relative">
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {virtualItems.map((virtualRow) => {
          const message = messages[virtualRow.index]
          return (
            <div
              key={message.id}
              ref={rowVirtualizer.measureElement as React.Ref<HTMLDivElement>}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ChatMessageItem message={message} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
