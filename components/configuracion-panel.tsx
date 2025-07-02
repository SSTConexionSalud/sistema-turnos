"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Plus, Trash2, Volume2, VolumeX, Save, RotateCcw } from "lucide-react"
import type { Configuracion } from "@/app/page"

interface ConfiguracionPanelProps {
  configuracion: Configuracion
  onConfiguracionChange: (config: Configuracion) => void
}

export function ConfiguracionPanel({ configuracion, onConfiguracionChange }: ConfiguracionPanelProps) {
  const [nuevoServicio, setNuevoServicio] = useState("")
  const [configuracionTemp, setConfiguracionTemp] = useState(configuracion)

  const agregarServicio = () => {
    if (!nuevoServicio.trim()) return

    const nuevaConfig = {
      ...configuracionTemp,
      servicios: [...configuracionTemp.servicios, nuevoServicio.trim()],
    }
    setConfiguracionTemp(nuevaConfig)
    setNuevoServicio("")
  }

  const eliminarServicio = (servicio: string) => {
    const nuevaConfig = {
      ...configuracionTemp,
      servicios: configuracionTemp.servicios.filter((s) => s !== servicio),
    }
    setConfiguracionTemp(nuevaConfig)
  }

  const guardarConfiguracion = () => {
    onConfiguracionChange(configuracionTemp)
  }

  const resetearConfiguracion = () => {
    setConfiguracionTemp(configuracion)
  }

  const limpiarDatos = () => {
    if (confirm("¿Está seguro de que desea limpiar todos los turnos? Esta acción no se puede deshacer.")) {
      localStorage.removeItem("turnos-laboratorio")
      localStorage.setItem("siguienteNumero-laboratorio", "1")
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Servicios */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Servicios del Laboratorio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={nuevoServicio}
                onChange={(e) => setNuevoServicio(e.target.value)}
                placeholder="Nuevo servicio (ej: Hemograma)"
                onKeyPress={(e) => e.key === "Enter" && agregarServicio()}
                className="border-slate-200"
              />
              <Button onClick={agregarServicio} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {configuracionTemp.servicios.map((servicio) => (
                <div
                  key={servicio}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                >
                  <span className="font-medium text-slate-700">{servicio}</span>
                  <Button
                    onClick={() => eliminarServicio(servicio)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuración General */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle>Configuración General</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="recepciones" className="text-sm font-medium text-slate-700">
                Número de Recepciones
              </Label>
              <Input
                id="recepciones"
                type="number"
                min="1"
                max="4"
                value={configuracionTemp.recepciones}
                onChange={(e) =>
                  setConfiguracionTemp({
                    ...configuracionTemp,
                    recepciones: Number.parseInt(e.target.value) || 1,
                  })
                }
                className="border-slate-200 mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Máximo 4 recepciones para el laboratorio</p>
            </div>

            <div>
              <Label htmlFor="tiempoEspera" className="text-sm font-medium text-slate-700">
                Tiempo de Espera (segundos)
              </Label>
              <Input
                id="tiempoEspera"
                type="number"
                min="10"
                max="300"
                value={configuracionTemp.tiempoEsperaLlamada}
                onChange={(e) =>
                  setConfiguracionTemp({
                    ...configuracionTemp,
                    tiempoEsperaLlamada: Number.parseInt(e.target.value) || 30,
                  })
                }
                className="border-slate-200 mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Tiempo antes de marcar un turno como no presentado</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {configuracionTemp.sonidoActivado ? (
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <Label htmlFor="sonido" className="font-medium text-slate-700">
                    Sonido de Notificación
                  </Label>
                  <p className="text-xs text-slate-500">Reproducir sonido al llamar turnos</p>
                </div>
              </div>
              <Switch
                id="sonido"
                checked={configuracionTemp.sonidoActivado}
                onCheckedChange={(checked) =>
                  setConfiguracionTemp({
                    ...configuracionTemp,
                    sonidoActivado: checked,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle>Acciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={guardarConfiguracion} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>

            <Button onClick={resetearConfiguracion} variant="outline" className="border-slate-200">
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetear Cambios
            </Button>

            <Separator orientation="vertical" className="h-10" />

            <Button onClick={limpiarDatos} variant="destructive" className="bg-red-600 hover:bg-red-700 shadow-md">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Todos los Datos
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>💡 Nota:</strong> Los cambios en la configuración se guardan automáticamente en el navegador. La
              opción "Limpiar Todos los Datos" eliminará todos los turnos y reiniciará el contador a 1.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{configuracionTemp.servicios.length}</div>
              <p className="text-sm text-emerald-700 font-medium">Servicios Configurados</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{configuracionTemp.recepciones}</div>
              <p className="text-sm text-blue-700 font-medium">Recepciones Activas</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{configuracionTemp.tiempoEsperaLlamada}s</div>
              <p className="text-sm text-purple-700 font-medium">Tiempo de Espera</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
