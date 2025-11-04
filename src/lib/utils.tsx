import { CustomSuccessToast } from "@/components/ui/custom-toast"
import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const customToast = (username: string, word: string, userColor?: string) => {
  return toast.custom(() => <CustomSuccessToast username={username} word={word} userColor={userColor} />, {closeButton: true, duration: Infinity})
}


export const customInfoToast = (message: string) => {
  return toast.custom(() => <div className="bg-white font-bold text-center text-gray-900 text-sm squircle px-4 py-2 w-[360px]" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'}}>{message}</div>, {closeButton: true, duration: 3000})
}

export const customLossToast = (message: string) => {
  return toast.custom(() => <div className="bg-white font-bold text-center text-gray-900 text-sm squircle px-4 py-2 w-[360px]" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'}}>{message}</div>, {closeButton: true, duration: Infinity})
}

export const customWinToast = (message: string) => {
  return toast.custom(() => <div className="bg-white font-bold text-center text-green-600 text-sm squircle px-4 py-2 w-[360px]" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'}}>{message}</div>, {closeButton: true, duration: Infinity})
}

export const formatWord = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()