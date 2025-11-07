import { CustomSuccessToast, CustomLossToast, CustomWinToast } from "@/components/ui/custom-toast"
import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import { useGameStore } from "@/components/stores/useGameStore"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const customToast = (username: string, word: string, description: string, userColor?: string) => {
  const resetGame = useGameStore.getState().resetGame
  return toast.custom((t) => <CustomSuccessToast username={username} word={word} description={description} userColor={userColor} toastId={t} onReset={resetGame} />, {closeButton: false, duration: Infinity})
}


export const customInfoToast = (message: string) => {
  return toast.custom(() => <div className="bg-white font-bold text-center text-gray-900 text-sm squircle px-4 py-2 w-[360px]" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'}}>{message}</div>, {closeButton: true, duration: 3000})
}

export const customLossToast = (word: string, description: string) => {
  return toast.custom((t) => <CustomLossToast word={word} description={description} toastId={t} />, {closeButton: false, duration: Infinity})
}

export const customWinToast = (message: string, word: string, description: string) => {
  const resetGame = useGameStore.getState().resetGame
  return toast.custom((t) => <CustomWinToast message={message} word={word} description={description} toastId={t} onReset={resetGame} />, {closeButton: false, duration: Infinity})
}

export const formatWord = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()