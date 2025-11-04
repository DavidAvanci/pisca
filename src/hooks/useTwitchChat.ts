import { useEffect, useRef, useState } from 'react'
import tmi from 'tmi.js'
import { ChatMessage } from '@/types/chat'
import { useGameStore } from '@/components/stores/useGameStore'

export function useTwitchChat(channel: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<tmi.Client | null>(null)
  const checkWord = useGameStore((state) => state.checkWord)


  useEffect(() => {
    if (!channel) {
      setMessages([])
      setConnected(false)
      return
    }

    // Normalize channel name (remove # if present, make lowercase)
    const normalizedChannel = channel.toLowerCase().replace(/^#/, '')

    // Create Twitch client
    const client = new tmi.Client({
      options: { debug: false },
      connection: {
        reconnect: true,
        secure: true,
      },
      channels: [normalizedChannel],
    })

    clientRef.current = client

    // Handle connection
    client.on('connected', () => {
      setConnected(true)
      setError(null)
      console.log(`Connected to Twitch channel: ${normalizedChannel}`)
    })

    // Handle disconnection
    client.on('disconnected', () => {
      setConnected(false)
      console.log(`Disconnected from Twitch channel: ${normalizedChannel}`)
    })

    // Handle connection errors
    client.on('join', (channel: string) => {
      console.log(`Joined channel: ${channel}`)
    })

    client.on('part', (channel: string) => {
      console.log(`Left channel: ${channel}`)
    })

    // Handle chat messages
    client.on('message', (_: any, tags: any, message: string) => {
      const username = tags['display-name'] || tags.username || 'Anonymous'
      const chatMessage: ChatMessage = {
        id: tags.id || `${Date.now()}-${Math.random()}`,
        username: username,
        message: message,
        timestamp: new Date(),
        color: tags.color || undefined,
        badges: tags.badges as Record<string, string> || {},
        mod: tags.mod === true,
        subscriber: tags.subscriber === true,
      }
      
      checkWord(message.trim().toUpperCase(), username, tags.color)

      setMessages((prev) => {
        // Keep only the last 500 messages to prevent memory issues
        const newMessages = [...prev, chatMessage]
        return newMessages.slice(-500)
      })
    })

    // Handle errors
    client.on('notice', (_: any, msgid: string, message: string) => {
      console.warn('Twitch notice:', msgid, message)
      if (msgid === 'msg_channel_suspended') {
        setError('Channel is suspended')
      } else if (msgid === 'msg_channel_not_found' as string) {
        setError('Channel not found')
      }
    })

    // Connect to Twitch
    client.connect().catch((err: any) => {
      console.error('Failed to connect to Twitch:', err)
      setError(`Failed to connect: ${err.message}`)
      setConnected(false)
    })

    // Cleanup on unmount or channel change
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
      setMessages([])
      setConnected(false)
      setError(null)
    }
  }, [channel])

  return {
    messages,
    connected,
    error,
  }
}

