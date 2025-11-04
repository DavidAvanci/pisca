import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { useGameStore } from "@/components/stores/useGameStore"
import { TRIES, WORD_LETTERS } from "@/lib/consts"
import { Keyboard } from "./keyboard"



const LETTER_STATUS = ['gray', 'yellow', 'green']

export const GameArea = () => {
const { guesses, letters, currentRow, currentCol, isGameOver, handleLetterChange, handleFocus, chosenWord } = useGameStore()


  useEffect(() => {
    const input = document.getElementById(`${currentRow}-${currentCol}`) as HTMLInputElement
    if (input) {
      input.focus()
    }
  }, [currentCol, currentRow])


  return (
    <Card className="w-full flex flex-col gap-4">
      <CardHeader>
        <CardTitle className="text-center font-black uppercase text-[48px]">PISCA</CardTitle>
        {/* @ts-ignore Debug: show current target word */}
       {import.meta.env.DEV && <div className="text-center text-sm text-gray-500 mt-1">Target: {chosenWord.toUpperCase()}</div>}
      </CardHeader>

      <CardContent>
        <div
          className="grid gap-2 justify-center"
          style={{ gridTemplateColumns: `repeat(${WORD_LETTERS}, 80px)` }}
        >
          {Array.from({ length: TRIES }).map((_, rowIdx) =>
            Array.from({ length: WORD_LETTERS }).map((_, colIdx) => {

                const letter = letters[rowIdx][colIdx] || ''
                const statusColor = LETTER_STATUS[guesses[rowIdx][colIdx]]

                const getStatusStyles = (color: string) => {
                  const colorMap: Record<string, string> = {
                    gray:  '#6b7280' ,
                    yellow:  '#eab308' ,
                    green: '#22c55e'
                  }
                  return colorMap[color] || colorMap.gray
                }

                const statusStyles = getStatusStyles(statusColor)
                
                return (
              <Input
              className={`w-[80px] h-[80px] text-[40px] text-center font-black uppercase border-4`}
                id={`${rowIdx}-${colIdx}`}
                key={`${rowIdx}-${colIdx}`}
                value={letter}
                maxLength={1}
                disabled={currentRow !== rowIdx || isGameOver}
                onKeyDown={(e) => handleLetterChange(e.key, rowIdx, colIdx)}
                onFocus={() => handleFocus(rowIdx, colIdx)}
                style={currentRow > rowIdx || isGameOver ? {
                  borderColor: `transparent`,
                  backgroundColor: statusStyles,
                  color: 'white'
                } : {}}
              />
            )})
          )}
        </div>
      </CardContent>

      <Keyboard />
    </Card>
  )
}