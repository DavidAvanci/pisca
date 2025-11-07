import { toast } from "sonner"

// Helper function to format text with underscores as italic
function formatTextWithItalics(text: string) {
  const parts = text.split('_')
  
  return parts.map((part, index) => {
    // Odd indices are between underscores, so they should be italic
    if (index % 2 === 1) {
      return <em key={index}>{part}</em>
    }
    return <span key={index}>{part}</span>
  })
}

interface CustomSuccessToastProps {
  username: string
  word: string
  description: string
  userColor?: string
  toastId: string | number
  onReset: () => void
}

export function CustomSuccessToast({ username, word, description, userColor, toastId, onReset }: CustomSuccessToastProps) {
  
  return (
    <div className="relative font-family flex flex-col items-center gap-3 bg-gray-950 px-12 py-8 w-[480px] rounded-[32px] border-2 border-white" style={{boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'}}>
      {/* Close button */}
      <button 
        onClick={() => toast.dismiss(toastId)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white/10"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <h2 className="font-bold text-white text-center text-[28px] leading-tight">
        O pisquete <span style={{ color: userColor }}>{username}</span>
      </h2>
      
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-white text-base text-center">
          acertou a palavra:
        </p>
        <p className="font-[900] text-white uppercase tracking-wider text-center text-[48px] leading-none">
          {word}
        </p>
      </div>
      
      <p className="text-white text-sm text-center mt-1">
        Descrição: {formatTextWithItalics(description)}
      </p>
      
      {/* Reset button */}
      <button
        onClick={onReset}
        className="mt-4 px-8 py-3 bg-white text-gray-950 font-bold rounded-full hover:bg-gray-200 transition-colors uppercase tracking-wide text-sm"
      >
        Próxima Palavra
      </button>
    </div>
  )
}

interface CustomLossToastProps {
  word: string
  description: string
  toastId: string | number
}

export function CustomLossToast({ word, description, toastId }: CustomLossToastProps) {
  return (
    <div className="relative font-family flex flex-col items-center gap-3 bg-gray-950 px-12 py-8 w-[480px] rounded-[32px] border-2 border-white" style={{boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'}}>
      {/* Close button */}
      <button 
        onClick={() => toast.dismiss(toastId)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white/10"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <h2 className="font-bold text-white text-center text-[28px] leading-tight">
        Meu cabrito está lavado!!
      </h2>
      
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-white text-base text-center">
          A palavra era:
        </p>
        <p className="font-[900] text-white uppercase tracking-wider text-center text-[48px] leading-none">
          {word}
        </p>
      </div>
      
      <p className="text-white text-sm text-center mt-1">
        Descrição: {formatTextWithItalics(description)}
      </p>
    </div>
  )
}

interface CustomWinToastProps {
  message: string
  word: string
  description: string
  toastId: string | number
  onReset: () => void
}

export function CustomWinToast({ message, word, description, toastId, onReset }: CustomWinToastProps) {
  
  return (
    <div className="relative font-family flex flex-col items-center gap-3 bg-gray-950 px-12 py-8 w-[480px] rounded-[32px] border-2 border-white" style={{boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'}}>
      {/* Close button */}
      <button 
        onClick={() => toast.dismiss(toastId)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white/10"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <h2 className="font-bold text-white text-center text-[28px] leading-tight uppercase">
        {message}
      </h2>
      
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-white text-base text-center">
          Acertou:
        </p>
        <p className="font-[900] text-white uppercase tracking-wider text-center text-[48px] leading-none">
          {word}
        </p>
      </div>
      
      <p className="text-white text-sm text-center mt-1">
        Descrição: {formatTextWithItalics(description)}
      </p>
      
      {/* Reset button */}
      <button
        onClick={onReset}
        className="mt-4 px-8 py-3 bg-white text-gray-950 font-bold rounded-full hover:bg-gray-200 transition-colors uppercase tracking-wide text-sm"
      >
        Próxima Palavra
      </button>
    </div>
  )
}

