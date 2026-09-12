"use client"

import { useEffect, useRef } from "react"

// Hook to completely disable global keyboard events when modals are open
export function useModalFocusFix(isOpen: boolean) {
  const originalAddEventListener = useRef<typeof window.addEventListener | null>(null)
  const originalRemoveEventListener = useRef<typeof window.removeEventListener | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store original methods
      if (!originalAddEventListener.current) {
        originalAddEventListener.current = window.addEventListener
        originalRemoveEventListener.current = window.removeEventListener
      }

      // Override addEventListener to block keyboard events
      window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
          // Block keyboard events when modal is open
          return
        }
        return originalAddEventListener.current!.call(window, type, listener, options)
      } as typeof window.addEventListener

      // Override removeEventListener
      window.removeEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
          // Block keyboard event removal when modal is open
          return
        }
        return originalRemoveEventListener.current!.call(window, type, listener, options)
      } as typeof window.removeEventListener

    } else {
      // Restore original methods
      if (originalAddEventListener.current && originalRemoveEventListener.current) {
        window.addEventListener = originalAddEventListener.current
        window.removeEventListener = originalRemoveEventListener.current
      }
    }

    return () => {
      // Cleanup: restore original methods
      if (originalAddEventListener.current && originalRemoveEventListener.current) {
        window.addEventListener = originalAddEventListener.current
        window.removeEventListener = originalRemoveEventListener.current
      }
    }
  }, [isOpen])
} 