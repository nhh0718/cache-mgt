import { useCallback, useEffect, useState } from "react"

interface ToastMessage {
  id: number
  text: string
  type: "success" | "error" | "info"
}

let toastId = 0
let addToastGlobal: ((text: string, type?: ToastMessage["type"]) => void) | null = null

/** Call this from anywhere to show a toast notification */
export function showToast(text: string, type: ToastMessage["type"] = "success") {
  addToastGlobal?.(text, type)
}

/** Toast container — mount once at the root of each view */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((text: string, type: ToastMessage["type"] = "success") => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [])

  useEffect(() => {
    addToastGlobal = addToast
    return () => { addToastGlobal = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-up rounded-lg px-3 py-2 text-xs font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-white"
          }`}
        >
          {toast.text}
        </div>
      ))}
    </div>
  )
}
