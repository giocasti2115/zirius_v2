"use client"

import type React from "react"
import axios from "axios";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    // Aquí va la lógica de autenticación, por ejemplo:
    // try { ... } catch { ... } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="flex-1 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center mx-auto">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 px-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ZIRIUZ</h1>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Sistema de Gestión de Equipos Odontológicos
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Plataforma integral para la gestión de suministros, mantenimiento y servicios de equipos dentales.
              Optimice sus operaciones con nuestra solución profesional.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">500+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Equipos Gestionados</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">98%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Satisfacción</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">24/7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Soporte</div>
            </div>
          </div>
        </div>
        {/* Right side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-xl">
            <CardHeader className="space-y-3 pb-6">
              <div className="lg:hidden flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">ZIRIUZ</h1>
              </div>
              <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
              <CardDescription className="text-base">Ingrese sus credenciales para acceder al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingrese su email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                    required
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground pt-2">
                  <p>Credenciales de prueba:</p>
                  <p className="font-mono text-xs mt-1">Email: admin@example.com | Contraseña: password</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <footer className="w-full text-center text-xs text-muted-foreground py-4 opacity-80">
        © {new Date().getFullYear()} ZIRIUZ. Todos los derechos reservados.
      </footer>
    </div>
  )
}
