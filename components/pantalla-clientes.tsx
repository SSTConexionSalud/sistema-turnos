"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Activity } from "lucide-react"
import type { Turno } from "@/app/page"
import { useEffect } from "react"

interface PantallaClientesProps {
  turnoActual: Turno | null
  turnosEsperando: Turno[]
  onVolver: () => void
  onMarcarAtendido: (id: string) => void
  onMarcarNoPresentado: (id: string) => void
  onLlamarSiguiente: () => void
}

export function PantallaClientes({
  turnoActual,
  turnosEsperando,
  onVolver,
  onMarcarAtendido,
  onMarcarNoPresentado,
  onLlamarSiguiente,
}: PantallaClientesProps) {
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "bg-red-500"
      case "preferencial":
        return "bg-amber-500"
      default:
        return "bg-emerald-500"
    }
  }

  // Controles por teclado y pantalla completa
  useEffect(() => {
    // Entrar en pantalla completa solo una vez al montar
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (error) {
        console.log("No se pudo entrar en pantalla completa:", error)
      }
    }

    enterFullscreen()

    // Cleanup: salir de pantalla completa al desmontar
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, []) // Array vacío para que solo se ejecute una vez

  // Event listener separado para las teclas
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "0":
          if (turnoActual) onMarcarAtendido(turnoActual.id)
          break
        case "1":
          if (turnoActual) onMarcarNoPresentado(turnoActual.id)
          break
        case "Enter":
          onLlamarSiguiente()
          break
        case "Escape":
          // Salir de pantalla completa y volver
          if (document.fullscreenElement) {
            document.exitFullscreen()
          }
          onVolver()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [turnoActual, onMarcarAtendido, onMarcarNoPresentado, onLlamarSiguiente, onVolver])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-emerald-700/50 backdrop-blur-sm bg-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              🧪 Laboratorio Clínico
            </h1>
            <p className="text-emerald-200 text-xl">Sistema de Turnos - Pantalla de Información</p>
          </div>
          <Button
            onClick={onVolver}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Turno Actual */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-3xl flex items-center gap-3">
                <Activity className="w-8 h-8 text-emerald-400" />
                Turno Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {turnoActual ? (
                <div className="text-center py-12">
                  <div className="text-9xl font-bold text-emerald-400 mb-6 animate-pulse">
                    Turno {turnoActual.numero}
                  </div>
                  <div className="text-3xl font-semibold mb-4 text-white">{turnoActual.servicio}</div>
                  <div className="text-2xl text-emerald-300 mb-8">📍 Recepción {turnoActual.recepcion}</div>
                  <div className="p-6 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 backdrop-blur-sm">
                    <p className="text-emerald-200 text-2xl font-medium">
                      🔔 Por favor diríjase a la recepción indicada
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-emerald-200">
                  <Users className="w-20 h-20 mx-auto mb-6 opacity-50" />
                  <p className="text-2xl font-medium">No hay turnos siendo atendidos</p>
                  <p className="text-lg opacity-75 mt-2">Esperando próximo llamado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximos Turnos */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-3xl flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-400" />
                Próximos Turnos ({turnosEsperando.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {turnosEsperando.length === 0 ? (
                <div className="text-center py-16 text-emerald-200">
                  <Clock className="w-20 h-20 mx-auto mb-6 opacity-50" />
                  <p className="text-2xl font-medium">No hay turnos en espera</p>
                  <p className="text-lg opacity-75 mt-2">Sistema listo para nuevos turnos</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {turnosEsperando.slice(0, 8).map((turno, index) => (
                    <div
                      key={turno.id}
                      className={`flex items-center justify-between p-5 rounded-xl transition-all ${
                        index === 0
                          ? "bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400/50 shadow-lg"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`text-3xl font-bold ${index === 0 ? "text-emerald-400" : "text-white"}`}>
                          Turno {turno.numero}
                        </div>
                        <div>
                          <div className="font-medium text-white text-lg">{turno.servicio}</div>
                          <div className="text-sm text-emerald-200">{turno.horaCreacion.toLocaleTimeString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getPrioridadColor(turno.prioridad)} text-white text-sm px-3 py-1`}>
                          {turno.prioridad === "urgente"
                            ? "🔴 Urgente"
                            : turno.prioridad === "preferencial"
                              ? "🟡 Preferencial"
                              : "🟢 Normal"}
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse text-sm px-3 py-1">
                            Siguiente
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-3">{new Date().toLocaleTimeString()}</div>
              <p className="text-emerald-200 text-lg">Hora Actual</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-amber-400 mb-3">{turnosEsperando.length}</div>
              <p className="text-emerald-200 text-lg">Turnos en Espera</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-3">1</div>
              <p className="text-emerald-200 text-lg">Recepciones Activas</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer informativo con controles discretos */}
        <div className="mt-12 flex justify-between items-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-200 text-lg">Sistema activo - Esperando turnos</span>
          </div>

          {/* Controles discretos */}
          <div className="text-right opacity-30 hover:opacity-100 transition-opacity">
            <div className="text-xs text-emerald-300 space-y-1">
              <div>0: Atendido | 1: No presentado</div>
              <div>ENTER: Siguiente | ESC: Salir</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
