"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

declare global {
  interface Window {
    setTheme?: (theme: string) => void
  }
}

export function ThemeSwitcher() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>()

  useEffect(() => {
    setMounted(true)

    if (!theme) {
      const htmlTheme =
        document.documentElement.getAttribute("data-theme") ||
        document.documentElement.className

      if (htmlTheme === "dark" || htmlTheme === "light") {
        setCurrentTheme(htmlTheme)
      }
    } else {
      setCurrentTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    if (resolvedTheme) {
      setCurrentTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  const handleThemeChange = async () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    if (typeof window.setTheme === "function") {
      await window.setTheme(newTheme)
    } else {
      setNextTheme(newTheme)
    }

    setCurrentTheme(newTheme)
  }

  if (!mounted || !currentTheme) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
      </Button>
    )
  }

  const isDark = currentTheme === "dark"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeChange}
            className="h-9 w-9 relative"
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          >
            <div className="relative h-5 w-5">
              <motion.div
                initial={false}
                animate={{
                  rotate: isDark ? 45 : 0,
                  opacity: isDark ? 0 : 1,
                  scale: isDark ? 0.5 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sun className="h-5 w-5" />
              </motion.div>
              <motion.div
                initial={false}
                animate={{
                  rotate: isDark ? 0 : -45,
                  opacity: isDark ? 1 : 0,
                  scale: isDark ? 1 : 0.5,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Moon className="h-5 w-5" />
              </motion.div>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isDark ? "Cambiar a Tema Claro" : "Cambiar a Tema Oscuro"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
