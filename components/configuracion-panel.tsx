"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus, Trash2, Volume2, VolumeX, Save, RotateCcw, Mic, MicOff, Play } from "lucide-react"
import type { Configuracion } from "@/app/page"

interface ConfiguracionPanelProps {
  configuracion: Configuracion
  onConfiguracionChange: (config: Configuracion) => void
}

export function ConfiguracionPanel({ configuracion, onConfiguracionChange }: ConfiguracionPanelProps) {
  const [nuevoServicio, setNuevoServicio] = useState("")
  const [configuracionTemp, setConfiguracionTemp] = useState(configuracion)
  const [vocesDisponibles, setVocesDisponibles] = useState<SpeechSynthesisVoice[]>([])

  // Cargar voces disponibles
  useEffect(() => {
    const cargarVoces = () => {
      const voices = speechSynthesis.getVoices()
      // Filtrar y priorizar voces en español
      const vocesEspanol = voices.filter(
        (voice) =>
          voice.lang.startsWith("es") ||
          voice.name.toLowerCase().includes("spanish") ||
          voice.name.toLowerCase().includes("español"),
      )

      // Si no hay voces en español, usar todas las disponibles
      const vocesFinales = vocesEspanol.length > 0 ? vocesEspanol : voices

      setVocesDisponibles(vocesFinales)

      // Si no hay voz seleccionada, seleccionar la primera voz en español disponible
      if (!configuracionTemp.vozSeleccionada && vocesFinales.length > 0) {
        setConfiguracionTemp((prev) => ({
          ...prev,
          vozSeleccionada: vocesFinales[0].name,
        }))
      }
    }

    // Cargar voces inmediatamente
    cargarVoces()

    // También cargar cuando cambien las voces (algunos navegadores las cargan de forma asíncrona)
    speechSynthesis.onvoiceschanged = cargarVoces

    return () => {
      speechSynthesis.onvoiceschanged = null
    }
  }, [])

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

  const probarVoz = () => {
    if ("speechSynthesis" in window) {
      // Cancelar cualquier síntesis anterior
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance("Turno 1")

      // Usar la voz seleccionada
      if (configuracionTemp.vozSeleccionada) {
        const selectedVoice = vocesDisponibles.find((voice) => voice.name === configuracionTemp.vozSeleccionada)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      utterance.lang = "es-ES"
      utterance.rate = configuracionTemp.velocidadVoz
      utterance.volume = configuracionTemp.volumenVoz
      utterance.pitch = 1.0

      setTimeout(() => {
        speechSynthesis.speak(utterance)
      }, 100)
    } else {
      alert("La síntesis de voz no está disponible en este navegador")
    }
  }

  const getVoiceDisplayName = (voice: SpeechSynthesisVoice) => {
    const country = voice.lang.includes("-") ? voice.lang.split("-")[1] : ""
    return `${voice.name} ${country ? `(${country})` : ""}`
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
                  <p className="text-xs text-slate-500">Reproducir pitido al llamar turnos</p>
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

      {/* Configuración Avanzada de Voz */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Configuración de Voz Avanzada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Activar/Desactivar Voz */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              {configuracionTemp.vozActivada ? (
                <Mic className="w-6 h-6 text-purple-600" />
              ) : (
                <MicOff className="w-6 h-6 text-slate-400" />
              )}
              <div>
                <Label htmlFor="voz" className="font-semibold text-slate-800 text-base">
                  Anuncio por Voz
                </Label>
                <p className="text-sm text-slate-600">Leer número de turno (se puede combinar con sonido)</p>
              </div>
            </div>
            <Switch
              id="voz"
              checked={configuracionTemp.vozActivada}
              onCheckedChange={(checked) =>
                setConfiguracionTemp({
                  ...configuracionTemp,
                  vozActivada: checked,
                })
              }
            />
          </div>

          {configuracionTemp.vozActivada && (
            <div className="space-y-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {/* Selección de Voz */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                  Seleccionar Voz ({vocesDisponibles.length} disponibles)
                </Label>
                <Select
                  value={configuracionTemp.vozSeleccionada}
                  onValueChange={(value) =>
                    setConfiguracionTemp({
                      ...configuracionTemp,
                      vozSeleccionada: value,
                    })
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Seleccione una voz" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {vocesDisponibles.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{getVoiceDisplayName(voice)}</span>
                          <span className="text-xs text-slate-500 ml-2">{voice.localService ? "Local" : "Online"}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">Se priorizan voces en español para mejor pronunciación</p>
              </div>

              {/* Control de Velocidad */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                  Velocidad de Voz: {configuracionTemp.velocidadVoz.toFixed(1)}x
                </Label>
                <Slider
                  value={[configuracionTemp.velocidadVoz]}
                  onValueChange={(value) =>
                    setConfiguracionTemp({
                      ...configuracionTemp,
                      velocidadVoz: value[0],
                    })
                  }
                  min={0.3}
                  max={1.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Muy Lenta (0.3x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Rápida (1.5x)</span>
                </div>
              </div>

              {/* Control de Volumen */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                  Volumen de Voz: {Math.round(configuracionTemp.volumenVoz * 100)}%
                </Label>
                <Slider
                  value={[configuracionTemp.volumenVoz]}
                  onValueChange={(value) =>
                    setConfiguracionTemp({
                      ...configuracionTemp,
                      volumenVoz: value[0],
                    })
                  }
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Bajo (10%)</span>
                  <span>Medio (50%)</span>
                  <span>Alto (100%)</span>
                </div>
              </div>

              {/* Botón de Prueba */}
              <div className="flex gap-3">
                <Button
                  onClick={probarVoz}
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                  disabled={!configuracionTemp.vozSeleccionada}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Probar Voz Seleccionada
                </Button>
              </div>

              {/* Información de la voz seleccionada */}
              {configuracionTemp.vozSeleccionada && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {(() => {
                    const selectedVoice = vocesDisponibles.find((v) => v.name === configuracionTemp.vozSeleccionada)
                    return selectedVoice ? (
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Voz Seleccionada:</p>
                        <p className="text-blue-700">
                          <strong>{selectedVoice.name}</strong> - {selectedVoice.lang}
                        </p>
                        <p className="text-blue-600 text-xs mt-1">
                          Tipo: {selectedVoice.localService ? "Voz del sistema (mejor calidad)" : "Voz en línea"}
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Información sobre combinación de sonido y voz */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✅ Consejo:</strong> Puedes activar tanto el sonido como la voz al mismo tiempo. El pitido sonará
              primero seguido del anuncio de voz para máxima efectividad.
            </p>
          </div>

          {!configuracionTemp.vozActivada && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>💡 Consejo:</strong> Active la función de voz para una experiencia más profesional. Las voces
                del sistema suelen tener mejor calidad que las voces en línea.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle>Acciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={guardarConfiguracion} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>

            <Button onClick={resetearConfiguracion} variant="outline" className="border-slate-200 bg-transparent">
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
              <strong>💡 Nota:</strong> Los cambios en la configuración se guardan automáticamente en el navegador. Las
              voces del sistema (marcadas como "Local") ofrecen mejor calidad que las voces en línea.
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{configuracionTemp.servicios.length}</div>
              <p className="text-sm text-emerald-700 font-medium">Servicios</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{configuracionTemp.recepciones}</div>
              <p className="text-sm text-blue-700 font-medium">Recepciones</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{configuracionTemp.tiempoEsperaLlamada}s</div>
              <p className="text-sm text-purple-700 font-medium">Tiempo Espera</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="text-2xl font-bold text-amber-600 mb-2">
                {configuracionTemp.sonidoActivado && configuracionTemp.vozActivada
                  ? "AMBOS"
                  : configuracionTemp.vozActivada
                    ? "VOZ"
                    : configuracionTemp.sonidoActivado
                      ? "SONIDO"
                      : "NINGUNO"}
              </div>
              <p className="text-sm text-amber-700 font-medium">Notificación</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{vocesDisponibles.length}</div>
              <p className="text-sm text-green-700 font-medium">Voces Disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
