"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeTransition() {
  const { theme, setTheme: originalSetTheme } = useTheme()
  const [prevTheme, setPrevTheme] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pendingTheme, setPendingTheme] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const setTheme = useCallback((newTheme: string) => {
    if (theme !== newTheme) {
      setPendingTheme(newTheme)
      setIsTransitioning(true)
      setTimeout(() => {
        originalSetTheme(newTheme)
      }, 100)
    } else {
      originalSetTheme(newTheme)
    }
  }, [theme, originalSetTheme])

  useEffect(() => {
    if (theme && prevTheme !== theme) {
      setPrevTheme(theme)
    }
  }, [theme, prevTheme])

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setPendingTheme(null)
      }, 550)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const originalSetThemeGlobal = (window as any).setTheme
    // @ts-ignore
    window.setTheme = setTheme
    return () => {
      // @ts-ignore
      window.setTheme = originalSetThemeGlobal
    }
  }, [setTheme])

  if (!isTransitioning) return null

  const isDarkMode = pendingTheme === "dark" || (pendingTheme === null && theme === "dark")

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isDarkMode ? "dark" : "light"}
        initial={{ clipPath: `circle(0px at ${mousePosition.x}px ${mousePosition.y}px)` }}
        animate={{ clipPath: `circle(150% at ${mousePosition.x}px ${mousePosition.y}px)` }}
        exit={{
          clipPath: `circle(150% at ${mousePosition.x}px ${mousePosition.y}px)`,
          opacity: 0
        }}
        transition={{
          duration: 0.55,
          ease: [0.19, 1, 0.22, 1]
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30,30,30,0.8), rgba(10,10,10,0.85))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(240,240,240,0.75))',
          backdropFilter: 'blur(3px)',
        }}
      />
    </AnimatePresence>
  )
}
