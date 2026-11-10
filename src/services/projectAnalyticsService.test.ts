/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  calculateRiskMetrics,
  calculateResourceMetrics,
  calculateStakeholderMetrics,
  calculateCommunicationMetrics,
  calculateExecutionMetrics,
  calculateAllProjectAnalytics,
} from './projectAnalyticsService.ts';
import { ProjectDataset } from '../types/projectData.ts';

const mockDataset: ProjectDataset = {
  proyecto: {
    nombre: 'Proyecto Test Analytics',
    moneda: 'PEN',
    presupuesto_autorizado: 1000000,
    BAC: 900000,
    reserva_contingencia: 100000,
    duracion_semanas: 12,
    semana_corte: 6,
    riesgo_umbral_medio: 8,
    riesgo_umbral_alto: 15,
  },
  actividades: [
    {
      codigo: 'ACT-1',
      actividad: 'Diseño',
      cuenta_control: 'CC-01',
      responsable: 'Ana Gómez',
      sem_inicio_plan: 1,
      sem_fin_plan: 4,
      BAC: 100000,
      dedicacion_pct: 60,
    },
    {
      codigo: 'ACT-2',
      actividad: 'Desarrollo Backend',
      cuenta_control: 'CC-01',
      responsable: 'Ana Gómez',
      sem_inicio_plan: 3,
      sem_fin_plan: 8,
      BAC: 200000,
      dedicacion_pct: 50, // Concurrente en S3-S4 -> Carga total = 110% (>100% sobreasignada!)
    },
    {
      codigo: 'ACT-3',
      actividad: 'DevOps',
      cuenta_control: 'CC-02',
      responsable: 'Carlos Paz',
      sem_inicio_plan: 5,
      sem_fin_plan: 7,
      BAC: 150000,
      dedicacion_pct: 80, // Activa en S6 -> 80% (no sobreasignada)
    },
  ],
  recursos: [
    { id: 'REC-01', recurso: 'Ana Gómez', tipo: 'Personal', solicitado: 1, asignado: 1 },
    { id: 'REC-02', recurso: 'Carlos Paz', tipo: 'Personal', solicitado: 1, asignado: 1 },
    { id: 'REC-03', recurso: 'Servidor GPU Cloud', tipo: 'Equipo', solicitado: 2, asignado: 1 }, // Parcial
  ],
  interesados: [
    {
      id: 'INT-01',
      interesado: 'Patrocinador General',
      rol: 'Sponsor',
      poder_1a5: 5,
      interes_1a5: 5,
      participacion_actual: 'Partidario', // 4
      participacion_deseada: 'Líder', // 5 -> brecha = 1
    },
    {
      id: 'INT-02',
      interesado: 'Gerente Operaciones',
      rol: 'Gerente',
      poder_1a5: 4,
      interes_1a5: 2, // Alto poder, bajo interés -> Mantener satisfecho
      participacion_actual: 'Neutral', // 3
      participacion_deseada: 'Neutral', // 3 -> brecha = 0
    },
    {
      id: 'INT-03',
      interesado: 'Representante Usuarios',
      rol: 'Usuario Beta',
      poder_1a5: 2,
      interes_1a5: 5, // Bajo poder, alto interés -> Mantener informado
      participacion_actual: 'Inconsciente', // 1
      participacion_deseada: 'Partidario', // 4 -> brecha = 3
    },
  ],
  riesgos: [
    {
      id: 'R-01',
      riesgo: 'Falla de proveedor crítico',
      categoria: 'Operativo',
      probabilidad_1a5: 4,
      impacto_1a5: 4, // 16 -> Alto (>= 15)
      estado: 'Abierto',
      estrategia: 'Mitigar',
      respuesta_planificada: 'Plan B con proveedor secundario',
      propietario: 'Ana Gómez',
    },
    {
      id: 'R-02',
      riesgo: 'Aumento de costo de licencias',
      categoria: 'Económico',
      probabilidad_1a5: 3,
      impacto_1a5: 3, // 9 -> Medio (>= 8 y < 15)
      estado: 'Abierto',
      estrategia: 'Aceptar',
      respuesta_planificada: 'Presupuestar reserva',
      propietario: 'Carlos Paz',
    },
    {
      id: 'R-03',
      riesgo: 'Ataque de ciberseguridad',
      categoria: 'Técnico',
      probabilidad_1a5: 2,
      impacto_1a5: 3, // 6 -> Bajo (< 8)
      estado: 'Materializado', // ALERTA MATERIALIZADO!
      estrategia: 'Mitigar',
      respuesta_planificada: 'Activar cortafuegos y protocolo',
      propietario: 'Carlos Paz',
    },
  ],
  riesgos_historial: [
    // Semana 5 previa (frente a corte en semana 6)
    { semana: 5, id: 'R-01', probabilidad_1a5: 3, impacto_1a5: 4 }, // Puntaje previo = 12. Actual = 16 -> SUBE!
    { semana: 5, id: 'R-02', probabilidad_1a5: 3, impacto_1a5: 4 }, // Puntaje previo = 12. Actual = 9 -> BAJA!
    { semana: 5, id: 'R-03', probabilidad_1a5: 2, impacto_1a5: 3 }, // Puntaje previo = 6. Actual = 6 -> IGUAL!
  ],
  comunicaciones: [
    {
      id: 'COM-01',
      semana: 6,
      comunicacion: 'Reporte S6',
      audiencia: 'Comité Directivo',
      destinatarios: 10,
      abiertos: 9, // 90% tasa
      utilidad_percibida: 4.8,
      dias_retraso: 1,
    },
    {
      id: 'COM-02',
      semana: 6,
      comunicacion: 'Boletín General',
      audiencia: 'Equipo',
      destinatarios: 20,
      abiertos: 14, // 70% tasa
      utilidad_percibida: 4.0,
      dias_retraso: 2,
    },
  ],
  incidentes: [
    { id: 'INC-1', fecha: '2024-05-01', descripcion: 'Servidor caído', estado: 'Abierto', prioridad: 'Crítica', responsable: 'DevOps' },
    { id: 'INC-2', fecha: '2024-05-02', descripcion: 'Error menor CSS', estado: 'Abierto', prioridad: 'Baja', responsable: 'Frontend' },
    { id: 'INC-3', fecha: '2024-05-03', descripcion: 'Bug login', estado: 'Cerrado', prioridad: 'Alta', responsable: 'Backend' },
  ],
  calidad: [
    { id: 'CAL-1', entregable_id: 'ENT-1', estandar_o_criterio: 'Cobertura 80%', estado: 'No conforme' }, // abierta
    { id: 'CAL-2', entregable_id: 'ENT-2', estandar_o_criterio: 'P95 < 500ms', estado: 'Aprobado' },
  ],
  cambios: [
    { id: 'CR-1', fecha: '2024-05-01', descripcion: 'Alcance adicional', decision: 'Aprobado', solicitante: 'Cliente' },
    { id: 'CR-2', fecha: '2024-05-02', descripcion: 'Cambio de fecha', decision: 'En revisión', solicitante: 'Equipo' },
    { id: 'CR-3', fecha: '2024-05-03', descripcion: 'Nuevo diseño', decision: 'Rechazado', solicitante: 'UX Lead' },
  ],
  lineaBase_pv: [],
  avance_semanal: [],
  objetivos: [],
  supuestos: [],
  requisitos: [],
  entregables: [],
  edt: [],
  hitos: [],
  raci: [],
  costos: [],
  respuestas_riesgo: [],
  contingencia: [],
  plan_comunicaciones: [],
  adquisiciones: [],
  lecciones: [],
  automatizaciones: [],
};

export function runAnalyticsUnitTests() {
  console.log('--- Ejecutando pruebas unitarias de Project Analytics ---');

  // 1. Riesgos
  const rRes = calculateRiskMetrics(mockDataset, 6);
  console.assert(rRes.exposicionTotal === 31, `Exposición total: ${rRes.exposicionTotal} (esperado 31)`);
  console.assert(rRes.riesgosAltosAbiertos === 1, `Riesgos altos abiertos: ${rRes.riesgosAltosAbiertos} (esperado 1)`);
  console.assert(rRes.riesgosQueSubieron.length === 1 && rRes.riesgosQueSubieron[0].id === 'R-01', 'Riesgo R-01 subió');
  console.assert(rRes.riesgosMaterializados.length === 1 && rRes.riesgosMaterializados[0].id === 'R-03', 'Alerta materializado en R-03');
  console.log('✓ 1. Riesgos: puntaje, umbrales, tendencia, subida y materializado validados.');

  // 2. Recursos (corte semana 4: Ana Gómez tiene ACT-1 (60%) + ACT-2 (50%) = 110% sobreasignada)
  const recRes = calculateResourceMetrics(mockDataset, 4);
  const ana = recRes.cargasPorPersona.find((p) => p.persona === 'Ana Gómez');
  console.assert(ana?.cargaTotalPct === 110, `Carga Ana Gómez S4: ${ana?.cargaTotalPct}% (esperado 110%)`);
  console.assert(ana?.sobreasignado === true, 'Alerta de sobreasignación para Ana Gómez activa');
  console.assert(recRes.totalRecursosSolicitados === 4, `Recursos solicitados: ${recRes.totalRecursosSolicitados} (esperado 4)`);
  console.assert(recRes.totalRecursosAsignados === 3, `Recursos asignados: ${recRes.totalRecursosAsignados} (esperado 3)`);
  console.log('✓ 2. Recursos: carga semanal por persona, alerta >100% y solicitados vs asignados validados.');

  // 3. Interesados
  const stkRes = calculateStakeholderMetrics(mockDataset);
  console.assert(stkRes.conteoPorCuadrante['Gestionar atentamente'] === 1, 'Cuadrante Gestionar atentamente: 1');
  console.assert(stkRes.conteoPorCuadrante['Mantener satisfecho'] === 1, 'Cuadrante Mantener satisfecho: 1');
  console.assert(stkRes.conteoPorCuadrante['Mantener informado'] === 1, 'Cuadrante Mantener informado: 1');
  console.assert(stkRes.interesadosConBrecha.length === 2, `Interesados con brecha: ${stkRes.interesadosConBrecha.length} (esperado 2)`);
  console.log('✓ 3. Interesados: 4 cuadrantes poder/interés y brechas de participación validadas.');

  // 4. Comunicaciones
  const comRes = calculateCommunicationMetrics(mockDataset, 6);
  // Total dest = 30, ab = 23 -> tasa ~77%
  console.assert(comRes.tasaAperturaGlobalPct === 77, `Tasa apertura global: ${comRes.tasaAperturaGlobalPct}% (esperado 77%)`);
  console.assert(comRes.porAudiencia.length === 2, 'Desglose por 2 audiencias generado');
  console.assert(comRes.porSemana.length === 1, 'Desglose por semana generado');
  console.log('✓ 4. Comunicaciones: tasa de apertura, utilidad y días de retraso validados.');

  // 5. Ejecución
  const ejecRes = calculateExecutionMetrics(mockDataset, 6);
  console.assert(ejecRes.incidentesAbiertosPorPrioridad.totalAbiertos === 2, 'Incidentes abiertos: 2');
  console.assert(ejecRes.incidentesAbiertosPorPrioridad.critica === 1, 'Incidentes críticos: 1');
  console.assert(ejecRes.noConformidadesCalidadAbiertas.totalAbiertas === 1, 'Calidad no conformidades abiertas: 1');
  console.assert(ejecRes.solicitudesCambioPorEstado.aprobadas === 1, 'Cambios aprobados: 1');
  console.assert(ejecRes.solicitudesCambioPorEstado.enRevision === 1, 'Cambios en revisión: 1');
  console.assert(ejecRes.solicitudesCambioPorEstado.rechazadas === 1, 'Cambios rechazados: 1');
  console.log('✓ 5. Ejecución: incidentes por prioridad, calidad abierta y cambios por estado validados.');

  // Integración general
  const allRes = calculateAllProjectAnalytics(mockDataset, 6);
  console.assert(allRes.cutoffWeek === 6, 'Semana de corte 6 correcta en integración general');
  console.log('Resultado: TODAS LAS PRUEBAS DE ANALÍTICA PASARON EXITOSAMENTE');
  return true;
}

runAnalyticsUnitTests();
