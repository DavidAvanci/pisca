
interface CustomSuccessToastProps {
  username: string
  word: string
  userColor?: string
}

export function CustomSuccessToast({ username, word, userColor }: CustomSuccessToastProps) {
  return (
    <div className="font-family flex flex-col items-center gap-2 bg-white squircle px-10 py-4 w-[360px]" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'}}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-center text-gray-900">
            O PISQUETE <span style={{ color: userColor }}>{username}</span>
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900 text-center">
          ACERTOU A PALAVRA:
        </p>
        <p className="font-[900] text-green-600 uppercase tracking-wider text-center text-[36px]">
          {word}
        </p>
        <p className="text-xs text-gray-600 mt-1 text-center">
          MEU CABRITO ESTA LAVADO!
        </p>
    </div>
  )
}

