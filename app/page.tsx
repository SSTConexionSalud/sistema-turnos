"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Plus,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Monitor,
  Volume2,
  Settings,
  RotateCcw,
  Zap,
} from "lucide-react"
import { PantallaClientes } from "@/components/pantalla-clientes"
import { EstadisticasPanel } from "@/components/estadisticas-panel"
import { ConfiguracionPanel } from "@/components/configuracion-panel"

export interface Turno {
  id: string
  numero: number
  servicio: string
  prioridad: "normal" | "preferencial" | "urgente"
  horaCreacion: Date
  horaLlamada?: Date
  horaAtencion?: Date
  estado: "esperando" | "llamado" | "atendido" | "no_presentado"
  recepcion?: number
}

export interface Configuracion {
  servicios: string[]
  recepciones: number
  sonidoActivado: boolean
  vozActivada: boolean
  vozSeleccionada: string
  velocidadVoz: number
  volumenVoz: number
  tiempoEsperaLlamada: number
}

export default function SistemaTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [siguienteNumero, setSiguienteNumero] = useState(1)
  const [servicio, setServicio] = useState("")
  const [prioridad, setPrioridad] = useState<"normal" | "preferencial" | "urgente">("normal")
  const [recepcionActual, setRecepcionActual] = useState(1)
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null)
  const [mostrarPantalla, setMostrarPantalla] = useState(false)

  const [configuracion, setConfiguracion] = useState<Configuracion>({
    servicios: ["Laboratorio"],
    recepciones: 21,
    sonidoActivado: true,
    vozActivada: false,
    vozSeleccionada: "",
    velocidadVoz: 0.7,
    volumenVoz: 0.9,
    tiempoEsperaLlamada: 300,
  })

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const turnosGuardados = localStorage.getItem("turnos-laboratorio")
    const numeroGuardado = localStorage.getItem("siguienteNumero-laboratorio")
    const configGuardada = localStorage.getItem("configuracion-laboratorio")

    if (turnosGuardados) {
      const turnosParseados = JSON.parse(turnosGuardados).map((t: any) => ({
        ...t,
        horaCreacion: new Date(t.horaCreacion),
        horaLlamada: t.horaLlamada ? new Date(t.horaLlamada) : undefined,
        horaAtencion: t.horaAtencion ? new Date(t.horaAtencion) : undefined,
      }))
      setTurnos(turnosParseados)
    }

    if (numeroGuardado) {
      setSiguienteNumero(Number.parseInt(numeroGuardado))
    }

    if (configGuardada) {
      const configParseada = JSON.parse(configGuardada)
      // Agregar nuevas propiedades si no existen en la configuración guardada
      setConfiguracion({
        ...configParseada,
        vozActivada: configParseada.vozActivada ?? false,
        vozSeleccionada: configParseada.vozSeleccionada ?? "",
        velocidadVoz: configParseada.velocidadVoz ?? 0.7,
        volumenVoz: configParseada.volumenVoz ?? 0.9,
      })
    }
  }, [])

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem("turnos-laboratorio", JSON.stringify(turnos))
  }, [turnos])

  useEffect(() => {
    localStorage.setItem("siguienteNumero-laboratorio", siguienteNumero.toString())
  }, [siguienteNumero])

  useEffect(() => {
    localStorage.setItem("configuracion-laboratorio", JSON.stringify(configuracion))
  }, [configuracion])

  const reproducirSonido = () => {
    if (configuracion.sonidoActivado) {
      const audio = new Audio("/notification.mp3")
      audio.play().catch(() => {
        // Si no hay archivo de audio, usar beep del sistema
        const context = new AudioContext()
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(context.destination)

        oscillator.frequency.value = 800
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, context.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)

        oscillator.start(context.currentTime)
        oscillator.stop(context.currentTime + 0.5)
      })
    }
  }

  const leerTurno = (numeroTurno: number) => {
    if (configuracion.vozActivada && "speechSynthesis" in window) {
      // Cancelar cualquier síntesis anterior
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(`Turno ${numeroTurno}`)

      // Configurar la voz seleccionada si está disponible
      if (configuracion.vozSeleccionada) {
        const voices = speechSynthesis.getVoices()
        const selectedVoice = voices.find((voice) => voice.name === configuracion.vozSeleccionada)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      utterance.lang = "es-ES"
      utterance.rate = configuracion.velocidadVoz
      utterance.volume = configuracion.volumenVoz
      utterance.pitch = 1.0

      // Pequeña pausa antes de hablar para mejor claridad
      setTimeout(() => {
        speechSynthesis.speak(utterance)
      }, 100)
    }
  }

  const agregarTurno = () => {
    if (!servicio) return

    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      numero: siguienteNumero,
      servicio,
      prioridad,
      horaCreacion: new Date(),
      estado: "esperando",
    }

    setTurnos((prev) => {
      const nuevaLista = [...prev, nuevoTurno]
      // Ordenar por prioridad y luego por número
      return nuevaLista.sort((a, b) => {
        const prioridadOrder = { urgente: 0, preferencial: 1, normal: 2 }
        if (prioridadOrder[a.prioridad] !== prioridadOrder[b.prioridad]) {
          return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad]
        }
        return a.numero - b.numero
      })
    })

    setSiguienteNumero((prev) => prev + 1)
    setServicio("")
    setPrioridad("normal")
  }

  const agregarTurnoRapido = () => {
    if (configuracion.servicios.length === 0) return

    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      numero: siguienteNumero,
      servicio: configuracion.servicios[0], // Usar el primer servicio por defecto
      prioridad: "normal",
      horaCreacion: new Date(),
      estado: "esperando",
    }

    setTurnos((prev) => [...prev, nuevoTurno])
    setSiguienteNumero((prev) => prev + 1)
  }

  const reiniciarSistema = () => {
    if (
      confirm(
        "¿Está seguro de que desea reiniciar el sistema? Todos los turnos se eliminarán y el contador volverá a 1.",
      )
    ) {
      setTurnos([])
      setSiguienteNumero(1)
      setTurnoActual(null)
      localStorage.removeItem("turnos-laboratorio")
      localStorage.setItem("siguienteNumero-laboratorio", "1")
    }
  }

  const llamarSiguienteTurno = () => {
    const turnoEspera = turnos.find((t) => t.estado === "esperando")
    if (!turnoEspera) return

    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoEspera.id ? { ...t, estado: "llamado", horaLlamada: new Date(), recepcion: recepcionActual } : t,
      ),
    )

    setTurnoActual(turnoEspera)

    // Reproducir sonido y/o leer turno según configuración
    if (configuracion.sonidoActivado) {
      reproducirSonido()
    }
    if (configuracion.vozActivada) {
      leerTurno(turnoEspera.numero)
    }

    // Auto-marcar como no presentado después del tiempo configurado
    setTimeout(() => {
      setTurnos((prev) =>
        prev.map((t) => (t.id === turnoEspera.id && t.estado === "llamado" ? { ...t, estado: "no_presentado" } : t)),
      )
    }, configuracion.tiempoEsperaLlamada * 1000)
  }

  const marcarAtendido = (turnoId: string) => {
    setTurnos((prev) =>
      prev.map((t) => (t.id === turnoId ? { ...t, estado: "atendido", horaAtencion: new Date() } : t)),
    )
    if (turnoActual?.id === turnoId) {
      setTurnoActual(null)
    }
  }

  const marcarNoPresentado = (turnoId: string) => {
    setTurnos((prev) => prev.map((t) => (t.id === turnoId ? { ...t, estado: "no_presentado" } : t)))
    if (turnoActual?.id === turnoId) {
      setTurnoActual(null)
    }
  }

  const regresarTurno = (turnoId: string) => {
    setTurnos((prev) => prev.map((t) => (t.id === turnoId ? { ...t, estado: "llamado", horaAtencion: undefined } : t)))

    // Si no hay turno actual, establecer este como el turno actual
    const turno = turnos.find((t) => t.id === turnoId)
    if (!turnoActual && turno) {
      setTurnoActual(turno)
    }
  }

  const turnosEsperando = turnos.filter((t) => t.estado === "esperando")
  const turnosLlamados = turnos.filter((t) => t.estado === "llamado")
  const turnosAtendidos = turnos.filter((t) => t.estado === "atendido")
  const turnosNoPresentados = turnos.filter((t) => t.estado === "no_presentado")

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

  const getPrioridadText = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "Urgente"
      case "preferencial":
        return "Preferencial"
      default:
        return "Normal"
    }
  }

  if (mostrarPantalla) {
    return (
      <PantallaClientes
        turnoActual={turnoActual}
        turnosEsperando={turnosEsperando}
        turnos={turnos}
        configuracion={configuracion}
        onVolver={() => setMostrarPantalla(false)}
        onMarcarAtendido={marcarAtendido}
        onMarcarNoPresentado={marcarNoPresentado}
        onLlamarSiguiente={llamarSiguienteTurno}
        onRegresarTurno={regresarTurno}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                🧪 Sistema de Turnos - Conexión salud
              </h1>
              <p className="text-slate-600 text-lg">Gestión de turnos para laboratorio clínico</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={reiniciarSistema}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar Sistema
              </Button>
              <Button
                onClick={() => setMostrarPantalla(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Pantalla de Turnos
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Próximo Turno</p>
                  <p className="text-2xl font-bold">#{siguienteNumero}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">En Espera</p>
                  <p className="text-2xl font-bold">{turnosEsperando.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Atendidos Hoy</p>
                  <p className="text-2xl font-bold">{turnosAtendidos.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Recepciones</p>
                  <p className="text-2xl font-bold">{configuracion.recepciones}</p>
                </div>
                <Settings className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="turnos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger
              value="turnos"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              Gestión de Turnos
            </TabsTrigger>
            <TabsTrigger
              value="atencion"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Phone className="w-4 h-4" />
              Atención
            </TabsTrigger>
            <TabsTrigger
              value="estadisticas"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger
              value="configuracion"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Panel de Gestión de Turnos */}
          <TabsContent value="turnos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generador de turnos */}
              <Card className="lg:col-span-1 shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Generar Turno
                  </CardTitle>
                  <CardDescription className="text-emerald-100">Crear nuevo turno para el laboratorio</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Botón de turno rápido */}
                  <div className="text-center">
                    <Button
                      onClick={agregarTurnoRapido}
                      size="lg"
                      className="w-full h-16 text-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
                    >
                      <Zap className="w-6 h-6 mr-3" />
                      Generar Turno #{siguienteNumero}
                    </Button>
                    <p className="text-sm text-slate-500 mt-2">Genera automáticamente el siguiente turno</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">o personalizar</span>
                    </div>
                  </div>

                  {/* Formulario personalizado */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Servicio</label>
                      <Select value={servicio} onValueChange={setServicio}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue placeholder="Seleccione un servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {configuracion.servicios.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Prioridad</label>
                      <Select value={prioridad} onValueChange={(value: any) => setPrioridad(value)}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">🟢 Normal</SelectItem>
                          <SelectItem value="preferencial">🟡 Preferencial</SelectItem>
                          <SelectItem value="urgente">🔴 Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={agregarTurno}
                      className="w-full bg-slate-600 hover:bg-slate-700"
                      disabled={!servicio}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Turno Personalizado
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de turnos esperando */}
              <Card className="lg:col-span-2 shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Turnos en Espera ({turnosEsperando.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-96">
                    {turnosEsperando.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">No hay turnos en espera</p>
                        <p className="text-slate-400 text-sm">Genere el primer turno para comenzar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {turnosEsperando.map((turno, index) => (
                          <div
                            key={turno.id}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                              index === 0
                                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-md"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`text-3xl font-bold ${index === 0 ? "text-emerald-600" : "text-slate-600"}`}
                              >
                                Turno {turno.numero}
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{turno.servicio}</div>
                                <div className="text-sm text-slate-500">{turno.horaCreacion.toLocaleTimeString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getPrioridadColor(turno.prioridad)} text-white shadow-sm`}>
                                {getPrioridadText(turno.prioridad)}
                              </Badge>
                              {index === 0 && (
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse">
                                  Siguiente
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Panel de Atención */}
          <TabsContent value="atencion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Control de llamadas */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Control de Recepción
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Recepción</label>
                    <Select
                      value={recepcionActual.toString()}
                      onValueChange={(value) => setRecepcionActual(Number.parseInt(value))}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: configuracion.recepciones }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Recepción {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={llamarSiguienteTurno}
                    className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
                    disabled={turnosEsperando.length === 0}
                  >
                    <Volume2 className="w-5 h-5 mr-3" />
                    Llamar Siguiente Turno
                  </Button>

                  {turnoActual && (
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-3 text-lg">🔔 Turno Actual</h3>
                      <div className="text-4xl font-bold text-blue-600 mb-3">Turno {turnoActual.numero}</div>
                      <div className="text-blue-700 font-medium mb-2">{turnoActual.servicio}</div>
                      <div className="text-lg text-blue-600 mb-4">📍 Recepción {turnoActual.recepcion}</div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => marcarAtendido(turnoActual.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Atendido
                        </Button>
                        <Button
                          onClick={() => marcarNoPresentado(turnoActual.id)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          No se presentó
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Turnos llamados */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle>Turnos Llamados ({turnosLlamados.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-96">
                    {turnosLlamados.length === 0 ? (
                      <div className="text-center py-12">
                        <Phone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">No hay turnos llamados</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {turnosLlamados.map((turno) => (
                          <div
                            key={turno.id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200"
                          >
                            <div>
                              <div className="font-medium text-slate-800">Turno {turno.numero}</div>
                              <div className="text-sm text-slate-600">{turno.servicio}</div>
                              <div className="text-xs text-slate-500">
                                Recepción {turno.recepcion} • {turno.horaLlamada?.toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => marcarAtendido(turno.id)}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => marcarNoPresentado(turno.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Panel de Estadísticas */}
          <TabsContent value="estadisticas">
            <EstadisticasPanel
              turnos={turnos}
              turnosAtendidos={turnosAtendidos}
              turnosNoPresentados={turnosNoPresentados}
            />
          </TabsContent>

          {/* Panel de Configuración */}
          <TabsContent value="configuracion">
            <ConfiguracionPanel configuracion={configuracion} onConfiguracionChange={setConfiguracion} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
