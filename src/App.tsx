import { useState, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { ChatMessagesList } from '@/components/ChatMessages'
import { useTwitchChat } from '@/hooks/useTwitchChat'
import { GameArea } from './components/GameArea'
import { useGameStore } from './components/stores/useGameStore'
import { ThemeToggle } from './components/ThemeToggle'

const queryClient = new QueryClient()

function TwitchChatViewer() {
  const [channelInput, setChannelInput] = useState('')
  const [currentChannel, setCurrentChannel] = useState<string | null>(null)
  const { messages, connected } = useTwitchChat(currentChannel)
  const endGameOnCorrectTwitchMessage = useGameStore((state) => state.endGameOnCorrectTwitchMessage)
  const toggleEndGameOnCorrectTwitchMessage = useGameStore((state) => state.toggleEndGameOnCorrectTwitchMessage)
  const showMessages = useGameStore((state) => state.showMessages)
  const toggleMessages = useGameStore((state) => state.toggleMessages)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const winners = useGameStore((state) => state.winners)

  const isLoading = !connected && currentChannel !== null

  const handleConnect = () => {
    const trimmedChannel = channelInput.trim()
    if (trimmedChannel) {
      setCurrentChannel(trimmedChannel)
    }
  }

  const handleDisconnect = () => {
    setCurrentChannel(null)
    setChannelInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConnect()
    }
  }

  return (
    <div className="h-dvh bg-background p-4 md:p-8 flex gap-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className='flex flex-col min-w-[300px] gap-2 h-fit items-center'>
            <CardTitle>
              {isLoading ? 'Conectando...' : connected ? 'Conectado a: ' : 'Conectar a Twitch'}
            </CardTitle>

              {connected ? <span className='text-[30px] font-[700] text-green-500'>{currentChannel}</span> : <Input
              className='w-full'
                placeholder="Digite o nome do canal da Twitch (ex: tioorochitwitch)"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />}

              {connected ? (
                <Button onClick={handleDisconnect} variant="destructive" className='w-full'>
                  Desconectar
                </Button>
              ) : (
                <Button onClick={handleConnect} disabled={!channelInput.trim() || isLoading} className={`w-full ${isLoading ? 'bg-gray-500' : 'bg-green-500'}`}>
                  {isLoading ? 'Conectando...' : 'Conectar'}
                </Button>
              )}



<div className="flex flex-col gap-2 my-6">
      <h2 className='font-bold'>Configurações</h2>
<div className="flex self-start items-center space-x-2">
             <Switch id="showMessages" checked={showMessages} onCheckedChange={() => toggleMessages()} />
             <label htmlFor="showMessages" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
               Mostrar mensagens do chat
             </label>
           </div>
           <div className="flex self-start items-center space-x-2">
             <Switch id="endGameOnCorrectTwitchMessage" checked={endGameOnCorrectTwitchMessage} onCheckedChange={() => toggleEndGameOnCorrectTwitchMessage()} />
             <label htmlFor="endGameOnCorrectTwitchMessage" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
               Finalizar jogo ao acertar palavra no chat
             </label>
           </div>
       
</div>

{!endGameOnCorrectTwitchMessage && <div className="flex flex-col gap-2 w-full">
  <h2 className='font-bold'>Vencedores:</h2>
  {winners.length === 0 ? <p>Ninguém acertou ainda</p> : winners.map((winner) => <span key={winner.username} className='font-[600]' style={{color: winner.color}}>{winner.username}</span>)}
</div>}


        </Card>


        <GameArea />


        {connected && showMessages && (
          <Card className='flex flex-col min-w-[400px] gap-2'>
            <CardHeader>
              <CardTitle>Mensagens do Chat</CardTitle>
              <CardDescription>
                {messages.length} mensage{messages.length !== 1 ? 'ns' : 'm'}
              </CardDescription>
            </CardHeader>
            <CardContent className='h-full overflow-y-auto'>
              <ScrollArea ref={scrollAreaRef} className="h-full w-full squircle border scrollbar-thin">
                <ChatMessagesList messages={messages} scrollContainerRef={scrollAreaRef} />
              </ScrollArea>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TwitchChatViewer />
    </QueryClientProvider>
  )
}

export default App
