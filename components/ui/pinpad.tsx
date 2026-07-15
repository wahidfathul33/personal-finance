import * as React from "react"
import { cn } from "@/lib/utils"
import { Delete } from "lucide-react"

export interface PinPadProps {
  onPinComplete: (pin: string) => void
  onBackspace?: () => void
  pinLength?: number
  className?: string
}

const PinPad = React.forwardRef<HTMLDivElement, PinPadProps>(
  ({ onPinComplete, onBackspace, pinLength = 4, className }, ref) => {
    const [pin, setPin] = React.useState("")

    const handleNumberClick = (number: string) => {
      if (pin.length < pinLength) {
        const newPin = pin + number
        setPin(newPin)
        if (newPin.length === pinLength) {
          setTimeout(() => {
            onPinComplete(newPin)
            setPin("")
          }, 200)
        }
      }
    }

    const handleBackspace = () => {
      if (pin.length > 0) {
        setPin(pin.slice(0, -1))
        onBackspace?.()
      }
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center gap-6", className)}
      >
        {/* PIN Display */}
        <div className="flex items-center gap-3">
          {[...Array(pinLength)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-4 rounded-full transition-all duration-200",
                i < pin.length
                  ? "bg-base-600 scale-110"
                  : "bg-base-300 dark:bg-base-700 scale-100"
              )}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              onClick={() => handleNumberClick(number.toString())}
              className="h-14 w-14 rounded-xl bg-base-100 dark:bg-base-800 text-base-900 dark:text-base-100 font-semibold text-xl shadow-sm hover:bg-base-200 dark:hover:bg-base-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-base-500 focus:ring-offset-2"
            >
              {number}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="h-14 w-14 rounded-xl bg-base-100 dark:bg-base-800 text-base-900 dark:text-base-100 font-semibold text-xl shadow-sm hover:bg-base-200 dark:hover:bg-base-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-base-500 focus:ring-offset-2 flex items-center justify-center"
            aria-label="Backspace"
          >
            <Delete size={24} />
          </button>
          <button
            onClick={() => handleNumberClick("0")}
            className="h-14 w-14 rounded-xl bg-base-100 dark:bg-base-800 text-base-900 dark:text-base-100 font-semibold text-xl shadow-sm hover:bg-base-200 dark:hover:bg-base-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-base-500 focus:ring-offset-2"
          >
            0
          </button>
        </div>
      </div>
    )
  }
)
PinPad.displayName = "PinPad"

export { PinPad }
