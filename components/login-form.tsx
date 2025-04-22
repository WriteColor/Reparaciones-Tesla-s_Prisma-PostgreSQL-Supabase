"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { notify } from "@/components/ui/notification"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardFooter,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { login } from "@/app/actions/auth"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState({ username: false, password: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setTouched({ username: true, password: true })
      return
    }

    setIsLoading(true)
    try {
      const result = await login(username, password, rememberMe)
      if (result.success) {
        notify("success", "Inicio de sesión exitoso", `¡Bienvenido, ${username}!`)
        router.push("/dashboard")
      } else {
        setError(result.error || "Credenciales inválidas")
      }
    } catch (err) {
      console.error("Error durante el inicio de sesión:", err)
      setError("Ocurrió un error durante el inicio de sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="mt-8">
            <CardTitle className="text-2xl font-bold text-center">Inicio de Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus Credenciales para Acceder al Sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
                  className={touched.username && !username ? "border-destructive" : ""}
                />
                {touched.username && !username && (
                  <p className="text-sm text-destructive">El nombre de usuario es obligatorio</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  className={touched.password && !password ? "border-destructive" : ""}
                />
                {touched.password && !password && (
                  <p className="text-sm text-destructive">La contraseña es obligatoria</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Mantener activa la sesión más tiempo</TooltipContent>
                </Tooltip>
                <Label htmlFor="remember" className="text-sm font-normal">
                  Recordar sesión
                </Label>
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <Button type="submit" className="w-full text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
              <CardFooter />
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
