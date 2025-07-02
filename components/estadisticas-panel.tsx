"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart3, Clock, CheckCircle, XCircle, TrendingUp, Users, Timer } from "lucide-react"
import type { Turno } from "@/app/page"

interface EstadisticasPanelProps {
  turnos: Turno[]
  turnosAtendidos: Turno[]
  turnosNoPresentados: Turno[]
}

export function EstadisticasPanel({ turnos, turnosAtendidos, turnosNoPresentados }: EstadisticasPanelProps) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const turnosHoy = turnos.filter((t) => t.horaCreacion >= hoy)
  const turnosAtendidosHoy = turnosAtendidos.filter((t) => t.horaCreacion >= hoy)
  const turnosNoPresentadosHoy = turnosNoPresentados.filter((t) => t.horaCreacion >= hoy)

  const tiempoPromedioAtencion =
    turnosAtendidos.length > 0
      ? turnosAtendidos.reduce((acc, turno) => {
          if (turno.horaAtencion && turno.horaLlamada) {
            return acc + (turno.horaAtencion.getTime() - turno.horaLlamada.getTime())
          }
          return acc
        }, 0) /
        turnosAtendidos.length /
        1000 /
        60 // en minutos
      : 0

  const serviciosMasUsados = turnos.reduce(
    (acc, turno) => {
      acc[turno.servicio] = (acc[turno.servicio] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const serviciosOrdenados = Object.entries(serviciosMasUsados)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const eficiencia = turnosHoy.length > 0 ? Math.round((turnosAtendidosHoy.length / turnosHoy.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Turnos Hoy</p>
                <p className="text-3xl font-bold text-slate-900">{turnosHoy.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Atendidos</p>
                <p className="text-3xl font-bold text-green-600">{turnosAtendidosHoy.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">No Presentados</p>
                <p className="text-3xl font-bold text-red-600">{turnosNoPresentadosHoy.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Eficiencia</p>
                <p className="text-3xl font-bold text-purple-600">{eficiencia}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiempo promedio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Tiempo Promedio de Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">{tiempoPromedioAtencion.toFixed(1)} min</div>
              <p className="text-slate-600">Tiempo promedio desde llamada hasta atención</p>
            </div>
          </CardContent>
        </Card>

        {/* Servicios más usados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Servicios Más Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviciosOrdenados.map(([servicio, cantidad], index) => (
                <div key={servicio} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium">{servicio}</span>
                  </div>
                  <Badge variant="secondary">{cantidad}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historial de Turnos Atendidos Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {turnosAtendidosHoy.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No hay turnos atendidos hoy</div>
            ) : (
              <div className="space-y-3">
                {turnosAtendidosHoy
                  .sort((a, b) => (b.horaAtencion?.getTime() || 0) - (a.horaAtencion?.getTime() || 0))
                  .map((turno) => (
                    <div
                      key={turno.id}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold text-green-700">#{turno.numero}</div>
                        <div>
                          <div className="font-medium">{turno.cliente}</div>
                          <div className="text-sm text-slate-600">{turno.servicio}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Ventanilla {turno.ventanilla}</div>
                        <div className="text-xs text-slate-500">{turno.horaAtencion?.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
