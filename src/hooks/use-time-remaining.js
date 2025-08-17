"use client"

import { useState, useEffect } from "react"

export function useTimeRemaining(initialMinutes) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60) // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isExpired = timeLeft <= 0

  return {
    minutes,
    seconds,
    isExpired,
    totalSeconds: timeLeft,
  }
}
