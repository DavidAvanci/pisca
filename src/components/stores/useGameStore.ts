import {  TRIES, WIN_MESSAGES, WORD_LETTERS } from "@/lib/consts"
import { create } from "zustand"
import { wordsWithDescriptions } from "../../lib/wordsWithDescriptions"

type GameState = {
    showMessages: boolean,
    toggleMessages: () => void,
    endGameOnCorrectTwitchMessage: boolean,
    toggleEndGameOnCorrectTwitchMessage: () => void,
    chosenWord: {
      text: string,
      description: string
    },
    guesses: (0 | 1 | 2)[][],
    wordsInThisSession: string[],
    setWordsInThisSession: (words: string[]) => void,
  letters: string[][],
  currentRow: number,
  currentCol: number,
  isGameOver: boolean,
  winners: {username: string, color?: string}[],
  setWinners: (winners: {username: string, color?: string}[]) => void,
  checkWord: (word: string, username: string, userColor?: string) => void
  setIsGameOver: (isGameOver: boolean) => void
  handleLetterChange: (key: string, rowIdx: number, colIdx: number) => void
  handleFocus: (rowIdx: number, colIdx: number) => void
  resetGame: () => void
}

import { immer } from "zustand/middleware/immer"
import { customInfoToast, customLossToast, customToast, customWinToast, formatWord } from "@/lib/utils"
import { toast } from "sonner"


const getNewWord = (wordsInThisSession: string[]) => {
  const newWord = wordsWithDescriptions[Math.floor(Math.random() * wordsWithDescriptions.length)]
  if(wordsInThisSession.includes(newWord.text)){
    return getNewWord(wordsInThisSession)
  }
  return newWord
}

export const useGameStore = create<GameState>()(
  immer((set) => ({
    showMessages: true,
    toggleMessages: () => set((state) => {
      state.showMessages = !state.showMessages
    }),
    endGameOnCorrectTwitchMessage: true,
    toggleEndGameOnCorrectTwitchMessage: () => set((state) => {
      state.endGameOnCorrectTwitchMessage = !state.endGameOnCorrectTwitchMessage
    }),
    winners: [],
    setWinners: (winners) => set((state) => {
      state.winners = winners
    }),
    wordsInThisSession: [],
    setWordsInThisSession: (words) => set((state) => {
      state.wordsInThisSession = words
    }),
    chosenWord: getNewWord([]),
    guesses: Array.from({ length: TRIES }, () => Array.from({ length: WORD_LETTERS }, () => 0)),
    letters: Array.from({ length: TRIES }, () => Array.from({ length: WORD_LETTERS }, () => '')),
    currentRow: 0,
    currentCol: 0,
    isGameOver: false,

   checkWord: (word, username, userColor) => set((state) => {
    if(formatWord(word) !== formatWord(state.chosenWord.text)){
      return
    }

    if(!state.endGameOnCorrectTwitchMessage){
      state.winners = [...state.winners, {username: username, color: userColor}]
      return
    }

   customToast(username, state.chosenWord.text, state.chosenWord.description, userColor)
      state.isGameOver = true
      return
   }),
   
    setIsGameOver: (isGameOver) =>
      set((state) => {
        state.isGameOver = isGameOver
      }),
    handleLetterChange: (key, rowIdx, colIdx) =>
      set((state) => {
        if (/^[a-zA-Z]$/.test(key)) {
          state.letters[rowIdx][colIdx] = key
          state.currentCol = Math.min(state.currentCol + 1, WORD_LETTERS - 1)
          return
        }

        if (key === 'Backspace') {
          if (state.letters[rowIdx][colIdx] === '') {
            const previousCol = Math.max(state.currentCol - 1, 0)
            state.currentCol = previousCol
            state.letters[rowIdx][previousCol] = ''
          } else {
            state.letters[rowIdx][colIdx] = ''
          }
          return
        }

        if (key === ' ') {
          state.currentCol = Math.min(state.currentCol + 1, WORD_LETTERS - 1)
          return
        }

        if (key === 'ArrowRight') {
          state.currentCol = Math.min(state.currentCol + 1, WORD_LETTERS - 1)
          return
        }

        if (key === 'ArrowLeft') {
          state.currentCol = Math.max(state.currentCol - 1, 0)
          return
        }

        if (key === 'Enter') {
          const word = state.letters[rowIdx].join('').toUpperCase()
          const targetWord = formatWord(state.chosenWord.text)

          if (word.length !== WORD_LETTERS) {
            customInfoToast("TEM QUE TER 5 LETRAS PORRA")
            return
          }

          if (wordsWithDescriptions.findIndex((wordObject) => formatWord(wordObject.text) === word) === -1) {
            customInfoToast("QUE PALAVRA É ESSA??")
            return
          }

          const targetCounts: Record<string, number> = {}
          for (let i = 0; i < targetWord.length; i++) {
            const ch = targetWord[i]
            targetCounts[ch] = (targetCounts[ch] || 0) + 1
          }

          const result: (0 | 1 | 2)[] = Array.from({ length: WORD_LETTERS }, () => 0)

          for (let i = 0; i < WORD_LETTERS; i++) {
            const g = word[i]
            if (g === targetWord[i]) {
              result[i] = 2
              targetCounts[g] = (targetCounts[g] || 0) - 1
            }
          }

          for (let i = 0; i < WORD_LETTERS; i++) {
            if (result[i] !== 0) continue
            const g = word[i]
            if ((targetCounts[g] || 0) > 0) {
              result[i] = 1
              targetCounts[g] = targetCounts[g] - 1
            }
          }

          if (TRIES - 1 === rowIdx && word !== targetWord) {
            customLossToast(state.chosenWord.text.toUpperCase(), state.chosenWord.description)
            state.isGameOver = true
            state.guesses[rowIdx] = result
            return
          }

          state.guesses[rowIdx] = result
          state.currentRow = Math.min(state.currentRow + 1, TRIES - 1)
          state.currentCol = 0

          if (word === targetWord) {
            customWinToast(WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)], state.chosenWord.text.toUpperCase(), state.chosenWord.description)
            state.isGameOver = true
            return
          }
        }
      }),
    handleFocus: (rowIdx, colIdx) =>
      set((state) => {
        state.currentRow = rowIdx
        state.currentCol = colIdx
      }),
    resetGame: () =>

      set((state) => {
        toast.dismiss()
        state.wordsInThisSession = [...state.wordsInThisSession, state.chosenWord.text]
        state.chosenWord = getNewWord(state.wordsInThisSession)
        state.guesses = Array.from({ length: TRIES }, () => Array.from({ length: WORD_LETTERS }, () => 0))
        state.letters = Array.from({ length: TRIES }, () => Array.from({ length: WORD_LETTERS }, () => ''))
        state.currentRow = 0
        state.currentCol = 0
        state.isGameOver = false
        state.winners = []
      }),
  })))



  

