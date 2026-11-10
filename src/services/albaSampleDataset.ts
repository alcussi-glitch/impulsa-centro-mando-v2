/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDataset } from '../types/projectData.ts';

/**
 * Dataset oficial del caso de referencia ALBA (PMBOK 8 / PMI)
 * Calibrado con precisión matemática para la Semana de corte k = 6:
 * - BAC = 3,850,000
 * - PV(6) = 2,426,666
 * - EV(6) = 2,023,500
 * - AC(6) = 2,234,000
 * - CPI = 0.91
 * - SPI = 0.83
 * - EAC típico = 4,250,507
 * - TCPI = 1.13
 * - ES = 5.22
 */
export const ALBA_SAMPLE_DATASET: ProjectDataset = {
  proyecto: {
    nombre: 'Proyecto Residencial e Inmobiliario ALBA — PMI Case Study',
    moneda: 'PEN',
    presupuesto_autorizado: 4300000,
    BAC: 3850000,
    reserva_contingencia: 250000,
    duracion_semanas: 12,
    semana_corte: 6,
    patrocinador: 'Consorcio Inmobiliario ALBA & Inversiones Urbanas',
    director_proyecto: 'Ing. PMP Alberto Barrenechea',
    fecha_inicio: '2024-01-15',
    fecha_fin_planificada: '2024-04-07',
    umbral_alerta_cpi: 0.95,
    umbral_critico_cpi: 0.90,
    umbral_alerta_spi: 0.95,
    umbral_critico_spi: 0.90,
  },
  objetivos: [
    {
      id: 'OBJ-ALBA-01',
      objetivo: 'Construcción y entrega de la infraestructura residencial dentro del presupuesto y cronograma acordados.',
      indicador: 'Desempeño EVM',
      meta: 'CPI >= 0.95, SPI >= 0.95',
    },
  ],
  supuestos: [
    {
      id: 'SUP-ALBA-01',
      tipo: 'Climático y suministro',
      descripcion: 'Abastecimiento continuo de concreto premezclado y acero estructural sin demoras portuarias.',
    },
  ],
  interesados: [
    {
      id: 'INT-ALBA-01',
      interesado: 'Consorcio ALBA',
      rol: 'Sponsor / Patrocinador',
      poder_1a5: 5,
      interes_1a5: 5,
    },
  ],
  requisitos: [
    {
      id: 'REQ-ALBA-01',
      tipo: 'Técnico',
      descripcion: 'Cumplimiento de la norma técnica de edificación E.030 y E.060.',
      criterio_aceptacion: 'Aprobación de ensayos de probeta a 28 días.',
    },
  ],
  entregables: [
    {
      id: 'ENT-ALBA-01',
      entregable: 'Estructuras y Obras Civiles Principales',
      incluido: true,
    },
  ],
  edt: [
    { codigo: '1.0', nombre: 'Proyecto ALBA - Edificación Residencial', nivel: 1 },
    { codigo: '1.1', nombre: 'Obras preliminares y cimentaciones', nivel: 2 },
    { codigo: '1.2', nombre: 'Estructuras de concreto armado', nivel: 2 },
    { codigo: '1.3', nombre: 'Instalaciones electromecánicas e hidrosanitarias', nivel: 2 },
    { codigo: '1.4', nombre: 'Albañilería y acabados iniciales', nivel: 2 },
    { codigo: '1.5', nombre: 'Acabados finales y equipamiento', nivel: 2 },
  ],
  actividades: [
    {
      codigo: 'ACT-01',
      actividad: 'Obras preliminares, trazo y excavación masiva',
      cuenta_control: 'CC-01',
      responsable: 'Ing. M. Torres',
      sem_inicio_plan: 1,
      sem_fin_plan: 3,
      BAC: 600000,
    },
    {
      codigo: 'ACT-02',
      actividad: 'Cimentaciones profundas y zapatas aisladas',
      cuenta_control: 'CC-01',
      responsable: 'Ing. M. Torres',
      sem_inicio_plan: 2,
      sem_fin_plan: 4,
      BAC: 800000,
    },
    {
      codigo: 'ACT-03',
      actividad: 'Estructura de concreto: columnas y placas nivel 1-4',
      cuenta_control: 'CC-02',
      responsable: 'Ing. R. Vega',
      sem_inicio_plan: 3,
      sem_fin_plan: 6,
      BAC: 950000,
    },
    {
      codigo: 'ACT-04',
      actividad: 'Instalaciones sanitarias, eléctricas e hidrosanitarias',
      cuenta_control: 'CC-03',
      responsable: 'Ing. D. Alva',
      sem_inicio_plan: 4,
      sem_fin_plan: 8,
      BAC: 750000,
    },
    {
      codigo: 'ACT-05',
      actividad: 'Albañilería, tabiquería y acabados de fachada',
      cuenta_control: 'CC-04',
      responsable: 'Arq. S. Prado',
      sem_inicio_plan: 6,
      sem_fin_plan: 12,
      BAC: 750000,
    },
  ],
  hitos: [
    { id: 'HIT-01', hito: 'Fin de cimentaciones', semana_plan: 4 },
    { id: 'HIT-02', hito: 'Fin de estructuras de concreto', semana_plan: 6 },
    { id: 'HIT-03', hito: 'Entrega final del proyecto', semana_plan: 12 },
  ],
  lineaBase_pv: [
    {
      codigo: 'ACT-01',
      S1: 150000,
      S2: 250000,
      S3: 200000,
      S4: 0,
      S5: 0,
      S6: 0,
      S7: 0,
      S8: 0,
      S9: 0,
      S10: 0,
      S11: 0,
      S12: 0,
      total_pv: 600000,
    },
    {
      codigo: 'ACT-02',
      S1: 100000,
      S2: 80000,
      S3: 210000,
      S4: 410000,
      S5: 0,
      S6: 0,
      S7: 0,
      S8: 0,
      S9: 0,
      S10: 0,
      S11: 0,
      S12: 0,
      total_pv: 800000,
    },
    {
      codigo: 'ACT-03',
      S1: 0,
      S2: 0,
      S3: 0,
      S4: 50000,
      S5: 459787,
      S6: 440213,
      S7: 0,
      S8: 0,
      S9: 0,
      S10: 0,
      S11: 0,
      S12: 0,
      total_pv: 950000,
    },
    {
      codigo: 'ACT-04',
      S1: 0,
      S2: 0,
      S3: 0,
      S4: 0,
      S5: 0,
      S6: 76666,
      S7: 200000,
      S8: 200000,
      S9: 150000,
      S10: 123334,
      S11: 0,
      S12: 0,
      total_pv: 750000,
    },
    {
      codigo: 'ACT-05',
      S1: 0,
      S2: 0,
      S3: 0,
      S4: 0,
      S5: 0,
      S6: 0,
      S7: 100000,
      S8: 150000,
      S9: 150000,
      S10: 150000,
      S11: 100000,
      S12: 100000,
      total_pv: 750000,
    },
  ],
  avance_semanal: [
    // ACT-01: BAC 600,000 -> 100% completado (EV = 600,000)
    { semana: 1, codigo: 'ACT-01', pct_completado_acum: 25.0, costo_real_semana: 160000 },
    { semana: 2, codigo: 'ACT-01', pct_completado_acum: 70.0, costo_real_semana: 270000 },
    { semana: 3, codigo: 'ACT-01', pct_completado_acum: 100.0, costo_real_semana: 220000 },

    // ACT-02: BAC 800,000 -> 85% completado (EV = 680,000)
    { semana: 2, codigo: 'ACT-02', pct_completado_acum: 15.0, costo_real_semana: 110000 },
    { semana: 3, codigo: 'ACT-02', pct_completado_acum: 40.0, costo_real_semana: 230000 },
    { semana: 4, codigo: 'ACT-02', pct_completado_acum: 85.0, costo_real_semana: 430000 },

    // ACT-03: BAC 950,000 -> 50% completado (EV = 475,000)
    { semana: 4, codigo: 'ACT-03', pct_completado_acum: 10.0, costo_real_semana: 80000 },
    { semana: 5, codigo: 'ACT-03', pct_completado_acum: 35.0, costo_real_semana: 314000 },
    { semana: 6, codigo: 'ACT-03', pct_completado_acum: 50.0, costo_real_semana: 340000 },

    // ACT-04: BAC 750,000 -> 35.8% completado (EV = 268,500)
    { semana: 5, codigo: 'ACT-04', pct_completado_acum: 12.0, costo_real_semana: 50000 },
    { semana: 6, codigo: 'ACT-04', pct_completado_acum: 35.8, costo_real_semana: 30000 },

    // ACT-05: BAC 750,000 -> 0% completado (EV = 0)
    // Total EV(6) = 600,000 + 680,000 + 475,000 + 268,500 = 2,023,500
    // Total AC(6) = 160k + 270k + 220k + 110k + 230k + 430k + 80k + 314k + 340k + 50k + 30k = 2,234,000
  ],
  recursos: [
    { id: 'REC-01', recurso: 'Ing. Alberto Barrenechea', tipo: 'Personal' },
    { id: 'REC-02', recurso: 'Planta de concreto y grúa torre', tipo: 'Equipo' },
  ],
  raci: [
    { codigo_actividad: 'ACT-01', persona_o_rol: 'Alberto Barrenechea', raci: 'A' },
  ],
  costos: [
    { id: 'CST-01', cuenta_control: 'CC-01', concepto: 'Obras preliminares y cimentaciones', monto: 1400000 },
    { id: 'CST-02', cuenta_control: 'CC-02', concepto: 'Estructuras de concreto armado', monto: 950000 },
    { id: 'CST-03', cuenta_control: 'CC-03', concepto: 'Instalaciones electromecánicas', monto: 750000 },
    { id: 'CST-04', cuenta_control: 'CC-04', concepto: 'Acabados y arquitectura', monto: 750000 },
  ],
  riesgos: [
    {
      id: 'RSK-01',
      riesgo: 'Incremento del precio del acero corrugado de refuerzo',
      categoria: 'Económico / Mercado',
      probabilidad_1a5: 3,
      impacto_1a5: 4,
      estrategia: 'Mitigar',
      respuesta_planificada: 'Contratos de suministro con precio cerrado de 60 días.',
      propietario: 'Ing. M. Torres',
      severidad: 12,
    },
  ],
  riesgos_historial: [],
  respuestas_riesgo: [],
  contingencia: [
    {
      fecha: '2024-02-18',
      semana: 4,
      riesgo: 'RSK-01',
      concepto: 'Adquisición de lote de acero con sobretasa por variación cambiaria',
      monto: 35000,
    },
  ],
  plan_comunicaciones: [],
  comunicaciones: [],
  adquisiciones: [],
  calidad: [],
  incidentes: [],
  cambios: [],
  lecciones: [],
  automatizaciones: [],
  metadataCarga: {
    fechaCarga: new Date().toISOString(),
    nombreArchivo: 'Proyecto_ALBA_EVM_PMBOK8_Semana6.xlsx',
    tamanoBytes: 2540000,
    checksum: 'alba-pmi-s6',
    esDatosEjemplo: true,
  },
};
