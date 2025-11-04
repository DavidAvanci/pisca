import { useMemo } from 'react'
import { useGameStore } from './stores/useGameStore'
import { Button } from './ui/button'

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

const LETTER_STATUS = ['gray', 'yellow', 'green'] as const

const getStatusStyles = (color: string) => {
  const colorMap: Record<string, string> = {
    gray: '#6b7280',
    yellow: '#eab308',
    green: '#22c55e'
  }
  return colorMap[color] || colorMap.gray
}

export const Keyboard = () => {
  const { guesses, letters, currentRow, currentCol, isGameOver, handleLetterChange, resetGame } = useGameStore()

  // Calculate the best status for each letter across all completed guesses
  const letterStatuses = useMemo(() => {
    const statuses: Record<string, number> = {}
    
    // Iterate through all completed rows (rows before currentRow)
    for (let rowIdx = 0; rowIdx < currentRow; rowIdx++) {
      const rowLetters = letters[rowIdx]
      const rowGuesses = guesses[rowIdx]
      
      for (let colIdx = 0; colIdx < rowLetters.length; colIdx++) {
        const letter = rowLetters[colIdx].toUpperCase()
        const guessStatus = rowGuesses[colIdx]
        
        if (letter && guessStatus !== undefined) {
          // Only update if this status is better (higher number) than current
          if (!statuses[letter] || guessStatus > statuses[letter]) {
            statuses[letter] = guessStatus
          }
        }
      }
    }
    
    return statuses
  }, [guesses, letters, currentRow])

  const handleKeyClick = (key: string) => {
    if (isGameOver) return
    handleLetterChange(key, currentRow, currentCol)
  }

  const getLetterStatus = (letter: string): string => {
    const status = letterStatuses[letter]
    if (status === undefined) return 'gray'
    return LETTER_STATUS[status]
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {KEYBOARD_LAYOUT.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-1.5 justify-center"
        >
          {row.map((letter) => {
            const status = getLetterStatus(letter)
            const statusColor = getStatusStyles(status)
            const hasStatus = letterStatuses[letter] !== undefined

            return (
              <Button
                key={letter}
                onClick={() => handleKeyClick(letter)}
                disabled={isGameOver}
                className={`
                  w-10 h-12 text-base font-bold uppercase
                  transition-all duration-200
                  ${hasStatus ? 'text-white hover:opacity-90' : ''}
                `}
                style={hasStatus ? {
                  backgroundColor: statusColor,
                  borderColor: statusColor,
                } : {}}
              >
                {letter}
              </Button>
            )
          })}
        </div>
      ))}
      
      <div className="flex gap-2 justify-center mt-2">
        <Button
          onClick={() => handleKeyClick('Enter')}
          disabled={isGameOver}
          className="min-w-[100px] h-12 text-sm font-bold uppercase px-4"
        >
          ENTER
        </Button>
        <Button
          onClick={() => handleKeyClick('Backspace')}
          disabled={isGameOver}
          className="min-w-[100px] h-12 text-sm font-bold uppercase px-4"
        >
          ⌫
        </Button>
        {isGameOver && 
        <div className="rainbow-border">
          <Button className="min-w-[100px] h-12 text-sm font-bold uppercase px-4" onClick={() => resetGame()}>Resetar Jogo</Button>
        </div>
      }
      </div>
    </div>
  )
}