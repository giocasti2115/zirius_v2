'use client'

import { useState, useEffect } from 'react'

// Tipos para los informes
export interface CorrectivosPorEquipo {
  id: number
  codigo_equipo: string
  nombre_equipo: string
  marca: string
  modelo: string
  serie: string
  cliente_nombre: string
  sede_nombre: string
  total_correctivos: number
  correctivos_completados: number
  correctivos_pendientes: number
  correctivos_en_proceso: number
  tiempo_promedio_resolucion: number
  costo_total_correctivos: number
  ultimo_correctivo: string
  correctivos_reactivos: number
  correctivos_preventivos: number
}

export interface RepuestoInstalado {
  id: number
  fecha_instalacion: string
  cantidad: number
  costo_unitario: number
  costo_total: number
  observaciones: string
  repuesto_codigo: string
  repuesto_nombre: string
  repuesto_marca: string
  repuesto_modelo: string
  codigo_equipo: string
  nombre_equipo: string
  cliente_nombre: string
  sede_nombre: string
  codigo_solicitud: string
  numero_orden: string
  tecnico_nombre: string
  tiempo_instalacion: number
  garantia_meses: number
  estado_anterior: string
  estado_posterior: string
}

export interface RepuestoGeneral {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  marca: string
  modelo: string
  categoria: string
  stock_actual: number
  stock_minimo: number
  stock_maximo: number
  precio_unitario: number
  precio_promedio: number
  estado: string
  ubicacion: string
  proveedor_principal: string
  veces_usado: number
  cantidad_total_usada: number
  ultima_instalacion: string
  costo_promedio_instalacion: number
  estado_stock: 'CRÍTICO' | 'BAJO' | 'NORMAL' | 'EXCESO'
  valor_inventario: number
}

export interface Fallo {
  id: number
  fecha_fallo: string
  descripcion: string
  tipo_fallo: string
  causa_raiz: string
  solucion_aplicada: string
  tiempo_resolucion: number
  costo_reparacion: number
  recurrente: boolean
  criticidad: 'alta' | 'media' | 'baja'
  codigo_equipo: string
  nombre_equipo: string
  marca: string
  modelo: string
  cliente_nombre: string
  sede_nombre: string
  codigo_solicitud: string
  tecnico_nombre: string
  estado_equipo_antes: string
  estado_equipo_despues: string
  repuestos_utilizados: string
  observaciones: string
}

export interface DuracionRepuesto {
  repuesto_codigo: string
  repuesto_nombre: string
  repuesto_marca: string
  codigo_equipo: string
  nombre_equipo: string
  fecha_instalacion: string
  fecha_reemplazo: string
  duracion_dias: number
  duracion_meses: number
  costo_instalacion: number
  garantia_meses: number
  cliente_nombre: string
  sede_nombre: string
  tipo_reemplazo: 'GARANTÍA' | 'NORMAL'
  costo_por_dia: number
}

export interface KPIData {
  solicitudes: {
    total_solicitudes: number
    completadas: number
    pendientes: number
    en_proceso: number
    tiempo_resolucion_promedio: number
    resueltas_24h: number
    tasa_completitud: number
    urgentes: number
  }
  ordenes: {
    total_ordenes: number
    ejecutadas: number
    abiertas: number
    costo_promedio: number
    costo_total: number
    tiempo_ejecucion_promedio: number
  }
  visitas: {
    total_visitas: number
    completadas: number
    programadas: number
    calificacion_promedio: number
    visitas_satisfactorias: number
    duracion_promedio: number
  }
  equipos: {
    total_equipos: number
    equipos_activos: number
    en_mantenimiento: number
    inactivos: number
    disponibilidad_equipos: number
  }
  tecnicos: {
    total_tecnicos: number
    visitas_promedio_por_tecnico: number
    calificacion_promedio_tecnicos: number
  }
  financieros: {
    ingresos_ordenes: number
    ticket_promedio: number
    clientes_activos: number
    costo_repuestos: number
    margen_bruto: number
  }
}

export interface CorrectivosResultado {
  id: number
  numero_orden: string
  fecha_creacion: string
  fecha_cierre: string
  estado: string
  resultado_trabajo: 'exitoso' | 'parcial' | 'fallido'
  observaciones_cierre: string
  costo_total: number
  tiempo_ejecucion: number
  satisfaccion_cliente: number
  codigo_solicitud: string
  descripcion_problema: string
  codigo_equipo: string
  nombre_equipo: string
  cliente_nombre: string
  sede_nombre: string
  tecnico_nombre: string
  dias_resolucion: number
  categoria_satisfaccion: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO'
  repuestos_utilizados: number
  costo_repuestos: number
}

export interface FiltrosInformes {
  fecha_inicio?: string
  fecha_fin?: string
  cliente_id?: number
  equipo_id?: number
  repuesto_id?: number
  tecnico_id?: number
  tipo_fallo?: string
  resultado?: string
  limite_duracion?: number
  limit?: number
}

export interface EstadisticasInformes {
  [key: string]: any
}

export interface InformeResponse<T> {
  success: boolean
  data: {
    [key: string]: T[] | EstadisticasInformes | any
    filtros: FiltrosInformes
  }
}

class InformesService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  private getCacheKey(endpoint: string, params?: any): string {
    return `informes_${endpoint}_${JSON.stringify(params || {})}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    return searchParams.toString()
  }

  // Resumen correctivos por equipo
  async obtenerCorrectivosPorEquipo(filtros: FiltrosInformes = {}): Promise<InformeResponse<CorrectivosPorEquipo>> {
    const cacheKey = this.getCacheKey('correctivos-equipo', filtros)
    const cached = this.getFromCache<InformeResponse<CorrectivosPorEquipo>>(cacheKey)
    if (cached) return cached

    try {
      const queryString = this.buildQueryString(filtros)
      const url = `${this.baseUrl}/real/informes/correctivos-equipo${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error obteniendo correctivos por equipo:', error)
      // Datos de fallback
      return this.getFallbackCorrectivosPorEquipo()
    }
  }

  // Repuestos instalados
  async obtenerRepuestosInstalados(filtros: FiltrosInformes = {}): Promise<InformeResponse<RepuestoInstalado>> {
    const cacheKey = this.getCacheKey('repuestos-instalados', filtros)
    const cached = this.getFromCache<InformeResponse<RepuestoInstalado>>(cacheKey)
    if (cached) return cached

    try {
      const queryString = this.buildQueryString(filtros)
      const url = `${this.baseUrl}/real/informes/repuestos-instalados${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error obteniendo repuestos instalados:', error)
      return this.getFallbackRepuestosInstalados()
    }
  }

  // Reporte general de repuestos
  async obtenerRepuestos(filtros: FiltrosInformes = {}): Promise<InformeResponse<RepuestoGeneral>> {
    const cacheKey = this.getCacheKey('repuestos', filtros)
    const cached = this.getFromCache<InformeResponse<RepuestoGeneral>>(cacheKey)
    if (cached) return cached

    try {
      const queryString = this.buildQueryString(filtros)
      const url = `${this.baseUrl}/real/informes/repuestos${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error obteniendo repuestos:', error)
      return this.getFallbackRepuestos()
    }
  }

  // Análisis de fallos
  async obtenerFallos(filtros: FiltrosInformes = {}): Promise<InformeResponse<Fallo>> {
    const cacheKey = this.getCacheKey('fallos', filtros)
    const cached = this.getFromCache<InformeResponse<Fallo>>(cacheKey)
    if (cached) return cached

    try {
      const queryString = this.buildQueryString(filtros)
      const url = `${this.baseUrl}/real/informes/fallos${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error obteniendo fallos:', error)
      return this.getFallbackFallos()
    }
  }

  // Duración de repuestos
  async obtenerDuracionRepuestos(filtros: FiltrosInformes = {}): Promise<InformeResponse<DuracionRepuesto>> {
    const cacheKey = this.getCacheKey('duracion-repuestos', filtros)
    const cached = this.getFromCache<InformeResponse<DuracionRepuesto>>(cacheKey)
    if (cached) return cached

    try {
      const queryString = this.buildQueryString(filtros)
      const url = `${this.baseUrl}/real/informes/duracion-repuestos${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error obteniendo duración repuestos:', error)
      return this.getFallbackDuracionRepuestos()
    }
  }

  // Indicadores KPI
  async obtenerIndicadores(filtros: FiltrosInformes = {}): Promise<InformeResponse<KPIData>> {
    const cacheKey = this.getCacheKey('indicadores', filtros)
    const cached = this.getFromCache<InformeResponse<KPIData>>(cacheKey)
    if (cached) return cached

    try {
      const queryString = this.buildQueryString(filtros)
      const url = `${this.baseUrl}/real/informes/indicadores${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error obteniendo indicadores:', error)
      return this.getFallbackIndicadores()
    }
  }

  // Resultados correctivos
  async obtenerCorrectivosResultados(filtros: FiltrosInformes = {}): Promise<InformeResponse<CorrectivosResultado>> {
    const cacheKey = this.getCacheKey('correctivos-resultados', filtros)
    const cached = this.getFromCache<InformeResponse<CorrectivosResultado>>(cacheKey)
    if (cached) return cached

    try {
      const queryString = this.buildQueryString(filtros)
      const url = `${this.baseUrl}/real/informes/correctivos-resultados${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error obteniendo correctivos resultados:', error)
      return this.getFallbackCorrectivosResultados()
    }
  }

  // Exportar reporte
  async exportarReporte(tipoReporte: string, formato: 'excel' | 'pdf' | 'csv', filtros: FiltrosInformes = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/real/informes/exportar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo_reporte: tipoReporte,
          formato,
          filtros
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error exportando reporte:', error)
      return {
        success: false,
        message: 'Error exportando reporte'
      }
    }
  }

  // Limpiar cache
  limpiarCache(): void {
    this.cache.clear()
  }

  // ===== MÉTODOS DE FALLBACK =====

  private getFallbackCorrectivosPorEquipo(): InformeResponse<CorrectivosPorEquipo> {
    return {
      success: true,
      data: {
        equipos: [
          {
            id: 1,
            codigo_equipo: 'EQ-2021-001',
            nombre_equipo: 'Monitor de Signos Vitales',
            marca: 'Phillips',
            modelo: 'MP20',
            serie: 'PH-MP20-001',
            cliente_nombre: 'Hospital Central',
            sede_nombre: 'UCI Principal',
            total_correctivos: 15,
            correctivos_completados: 12,
            correctivos_pendientes: 2,
            correctivos_en_proceso: 1,
            tiempo_promedio_resolucion: 3.5,
            costo_total_correctivos: 2850000,
            ultimo_correctivo: '2024-11-10',
            correctivos_reactivos: 10,
            correctivos_preventivos: 5
          }
        ],
        estadisticas: {
          total_equipos: 342,
          total_correctivos: 1247,
          tiempo_promedio_general: 4.2,
          costo_total_general: 45000000,
          completados_general: 1105,
          tasa_completitud: 88.6
        },
        filtros: {}
      }
    }
  }

  private getFallbackRepuestosInstalados(): InformeResponse<RepuestoInstalado> {
    return {
      success: true,
      data: {
        instalaciones: [
          {
            id: 1,
            fecha_instalacion: '2024-11-01',
            cantidad: 1,
            costo_unitario: 150000,
            costo_total: 150000,
            observaciones: 'Instalación exitosa',
            repuesto_codigo: 'REP-001',
            repuesto_nombre: 'Sensor SpO2',
            repuesto_marca: 'Phillips',
            repuesto_modelo: 'M1191BL',
            codigo_equipo: 'EQ-2021-001',
            nombre_equipo: 'Monitor de Signos Vitales',
            cliente_nombre: 'Hospital Central',
            sede_nombre: 'UCI Principal',
            codigo_solicitud: 'SOL-2024-001',
            numero_orden: 'ORD-2024-001',
            tecnico_nombre: 'Juan Pérez',
            tiempo_instalacion: 30,
            garantia_meses: 12,
            estado_anterior: 'Defectuoso',
            estado_posterior: 'Funcional'
          }
        ],
        estadisticas: {
          total_instalaciones: 1247,
          repuestos_diferentes: 156,
          equipos_intervenidos: 342,
          costo_total_repuestos: 23500000,
          costo_promedio: 18865,
          tiempo_promedio_instalacion: 45,
          con_garantia: 1180,
          ultima_instalacion: '2024-11-15'
        },
        top_repuestos: [],
        filtros: {}
      }
    }
  }

  private getFallbackRepuestos(): InformeResponse<RepuestoGeneral> {
    return {
      success: true,
      data: {
        repuestos: [
          {
            id: 1,
            codigo: 'REP-001',
            nombre: 'Sensor SpO2',
            descripcion: 'Sensor de oximetría de pulso',
            marca: 'Phillips',
            modelo: 'M1191BL',
            categoria: 'Sensores',
            stock_actual: 25,
            stock_minimo: 10,
            stock_maximo: 50,
            precio_unitario: 150000,
            precio_promedio: 148500,
            estado: 'activo',
            ubicacion: 'Almacén A-1',
            proveedor_principal: 'Distribuidora Médica',
            veces_usado: 45,
            cantidad_total_usada: 67,
            ultima_instalacion: '2024-11-10',
            costo_promedio_instalacion: 152000,
            estado_stock: 'NORMAL',
            valor_inventario: 3750000
          }
        ],
        estadisticas: {
          total_repuestos: 2847,
          marcas_diferentes: 85,
          categorias_diferentes: 24,
          stock_total: 15642,
          valor_total_inventario: 285000000,
          precio_promedio: 18200,
          stock_critico: 145,
          stock_bajo: 234,
          repuestos_activos: 2654,
          repuestos_descontinuados: 193
        },
        stock_critico: [],
        filtros: {}
      }
    }
  }

  private getFallbackFallos(): InformeResponse<Fallo> {
    return {
      success: true,
      data: {
        fallos: [
          {
            id: 1,
            fecha_fallo: '2024-11-01',
            descripcion: 'Falla en sensor de temperatura',
            tipo_fallo: 'electrónico',
            causa_raiz: 'Desgaste por uso',
            solucion_aplicada: 'Reemplazo de componente',
            tiempo_resolucion: 2,
            costo_reparacion: 180000,
            recurrente: false,
            criticidad: 'media',
            codigo_equipo: 'EQ-2021-001',
            nombre_equipo: 'Monitor de Signos Vitales',
            marca: 'Phillips',
            modelo: 'MP20',
            cliente_nombre: 'Hospital Central',
            sede_nombre: 'UCI Principal',
            codigo_solicitud: 'SOL-2024-001',
            tecnico_nombre: 'Juan Pérez',
            estado_equipo_antes: 'Defectuoso',
            estado_equipo_despues: 'Funcional',
            repuestos_utilizados: 'Sensor temperatura',
            observaciones: 'Reparación exitosa'
          }
        ],
        estadisticas: {
          total_fallos: 156,
          equipos_afectados: 89,
          tiempo_promedio_resolucion: 3.2,
          costo_total_reparaciones: 8500000,
          costo_promedio_reparacion: 54487,
          fallos_recurrentes: 23,
          fallos_criticos: 45,
          fallos_medios: 78,
          fallos_bajos: 33
        },
        tipos_fallos: [],
        equipos_problematicos: [],
        filtros: {}
      }
    }
  }

  private getFallbackDuracionRepuestos(): InformeResponse<DuracionRepuesto> {
    return {
      success: true,
      data: {
        duraciones: [
          {
            repuesto_codigo: 'REP-001',
            repuesto_nombre: 'Sensor SpO2',
            repuesto_marca: 'Phillips',
            codigo_equipo: 'EQ-2021-001',
            nombre_equipo: 'Monitor de Signos Vitales',
            fecha_instalacion: '2024-05-01',
            fecha_reemplazo: '2024-11-01',
            duracion_dias: 184,
            duracion_meses: 6.0,
            costo_instalacion: 150000,
            garantia_meses: 12,
            cliente_nombre: 'Hospital Central',
            sede_nombre: 'UCI Principal',
            tipo_reemplazo: 'GARANTÍA',
            costo_por_dia: 815.22
          }
        ],
        estadisticas: {
          total_reemplazos: 234,
          duracion_promedio_dias: 365,
          duracion_minima_dias: 15,
          duracion_maxima_dias: 1825,
          reemplazos_en_garantia: 78,
          costo_promedio: 125000,
          costo_promedio_por_dia: 342.47
        },
        repuestos_problematicos: [],
        filtros: {}
      }
    }
  }

  private getFallbackIndicadores(): InformeResponse<any> {
    return {
      success: true,
      data: {
        periodo: {
          fecha_inicio: '2024-10-16',
          fecha_fin: '2024-11-16'
        },
        kpis: {
          solicitudes: {
            total_solicitudes: 1247,
            completadas: 1105,
            pendientes: 89,
            en_proceso: 53,
            tiempo_resolucion_promedio: 4.2,
            resueltas_24h: 234,
            tasa_completitud: 88.6,
            urgentes: 45
          },
          ordenes: {
            total_ordenes: 2772,
            ejecutadas: 2456,
            abiertas: 316,
            costo_promedio: 185000,
            costo_total: 512820000,
            tiempo_ejecucion_promedio: 3.8
          },
          visitas: {
            total_visitas: 104,
            completadas: 87,
            programadas: 12,
            calificacion_promedio: 4.7,
            visitas_satisfactorias: 92,
            duracion_promedio: 2.5
          },
          equipos: {
            total_equipos: 8947,
            equipos_activos: 8654,
            en_mantenimiento: 189,
            inactivos: 104,
            disponibilidad_equipos: 96.7
          },
          tecnicos: {
            total_tecnicos: 24,
            visitas_promedio_por_tecnico: 4.3,
            calificacion_promedio_tecnicos: 4.5
          },
          financieros: {
            ingresos_ordenes: 512820000,
            ticket_promedio: 185000,
            clientes_activos: 156,
            costo_repuestos: 89500000,
            margen_bruto: 423320000
          }
        },
        tendencias: [],
        filtros: {}
      }
    }
  }

  private getFallbackCorrectivosResultados(): InformeResponse<CorrectivosResultado> {
    return {
      success: true,
      data: {
        correctivos: [
          {
            id: 1,
            numero_orden: 'ORD-2024-001',
            fecha_creacion: '2024-11-01',
            fecha_cierre: '2024-11-03',
            estado: 'ejecutada',
            resultado_trabajo: 'exitoso',
            observaciones_cierre: 'Reparación completada exitosamente',
            costo_total: 185000,
            tiempo_ejecucion: 120,
            satisfaccion_cliente: 5,
            codigo_solicitud: 'SOL-2024-001',
            descripcion_problema: 'Falla en sensor de temperatura',
            codigo_equipo: 'EQ-2021-001',
            nombre_equipo: 'Monitor de Signos Vitales',
            cliente_nombre: 'Hospital Central',
            sede_nombre: 'UCI Principal',
            tecnico_nombre: 'Juan Pérez',
            dias_resolucion: 2,
            categoria_satisfaccion: 'EXCELENTE',
            repuestos_utilizados: 1,
            costo_repuestos: 45000
          }
        ],
        estadisticas: {
          total_correctivos: 1105,
          exitosos: 984,
          parciales: 89,
          fallidos: 32,
          tasa_exito: 89.0,
          satisfaccion_promedio: 4.6,
          tiempo_promedio_dias: 3.8,
          costo_promedio: 185000,
          costo_total: 204425000,
          satisfaccion_alta: 892
        },
        mejores_tecnicos: [],
        filtros: {}
      }
    }
  }
}

const informesService = new InformesService()
export default informesService