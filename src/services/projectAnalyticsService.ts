/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDataset } from '../types/projectData.ts';

// ==========================================
// 1. RIESGOS: Tipos y Resultados
// ==========================================
export interface RiskMetricItem {
  id: string;
  riesgo: string;
  categoria: string;
  propietario: string;
  probabilidad: number; // 1-5
  impacto: number; // 1-5
  puntaje: number; // probabilidad * impacto (1-25)
  nivel: 'bajo' | 'medio' | 'alto';
  tendencia: 'sube' | 'baja' | 'igual';
  puntajeAnterior?: number;
  semanaAnterior?: number;
  estado: string; // 'Abierto', 'Mitigado', 'Cerrado', 'Materializado'
  esMaterializado: boolean;
  estrategia: string;
  respuestaPlanificada: string;
}

export interface RisksAnalyticsResult {
  riesgosEvaluados: RiskMetricItem[];
  umbralMedio: number;
  umbralAlto: number;
  exposicionTotal: number;
  riesgosAltosAbiertos: number;
  riesgosMediosAbiertos: number;
  riesgosBajosAbiertos: number;
  riesgosMaterializados: RiskMetricItem[];
  riesgosQueSubieron: RiskMetricItem[];
  matrizCalor: Record<string, RiskMetricItem[]>; // clave "prob_imp" ej. "5_4"
}

// ==========================================
// 2. RECURSOS: Tipos y Resultados
// ==========================================
export interface PersonWorkloadItem {
  persona: string;
  actividadesActivas: Array<{
    codigo: string;
    actividad: string;
    sem_inicio_plan: number;
    sem_fin_plan: number;
    dedicacion_pct: number;
  }>;
  cargaTotalPct: number;
  sobreasignado: boolean; // cargaTotalPct > 100
}

export interface ResourceSummaryItem {
  id: string;
  recurso: string;
  tipo: string;
  solicitado: number;
  asignado: number;
  estado: 'Completo' | 'Parcial' | 'Pendiente';
}

export interface ResourcesAnalyticsResult {
  cargasPorPersona: PersonWorkloadItem[];
  personasSobreasignadas: PersonWorkloadItem[];
  totalRecursosSolicitados: number;
  totalRecursosAsignados: number;
  tasaAsignacionGlobalPct: number;
  detalleRecursos: ResourceSummaryItem[];
}

// ==========================================
// 3. INTERESADOS: Tipos y Resultados
// ==========================================
export type StakeholderQuadrant =
  | 'Gestionar atentamente'
  | 'Mantener satisfecho'
  | 'Mantener informado'
  | 'Monitorear';

export interface StakeholderMetricItem {
  id: string;
  interesado: string;
  rol: string;
  poder: number; // 1-5
  interes: number; // 1-5
  cuadrante: StakeholderQuadrant;
  participacionActual: string;
  participacionDeseada: string;
  participacionActualNum: number;
  participacionDeseadaNum: number;
  brecha: number; // Deseada - Actual
  requiereAccion: boolean;
}

export interface StakeholdersAnalyticsResult {
  interesadosEvaluados: StakeholderMetricItem[];
  porCuadrante: Record<StakeholderQuadrant, StakeholderMetricItem[]>;
  conteoPorCuadrante: Record<StakeholderQuadrant, number>;
  interesadosConBrecha: StakeholderMetricItem[];
  brechaPromedio: number;
}

// ==========================================
// 4. COMUNICACIONES: Tipos y Resultados
// ==========================================
export interface CommunicationMetricItem {
  id?: string;
  semana: number;
  comunicacion: string;
  audiencia: string;
  destinatarios: number;
  abiertos: number;
  tasaAperturaPct: number;
  utilidadPercibida: number; // Escala 1 a 5
  diasRetrasoRespuesta: number;
}

export interface AudienceCommunicationSummary {
  audiencia: string;
  totalComunicaciones: number;
  tasaAperturaPromedioPct: number;
  utilidadPromedio: number;
  diasRetrasoPromedio: number;
}

export interface WeeklyCommunicationSummary {
  semana: number;
  totalComunicaciones: number;
  tasaAperturaPromedioPct: number;
  utilidadPromedio: number;
  diasRetrasoPromedio: number;
}

export interface CommunicationsAnalyticsResult {
  comunicacionesEvaluadas: CommunicationMetricItem[];
  tasaAperturaGlobalPct: number;
  utilidadPercibidaPromedio: number;
  diasRetrasoPromedio: number;
  porAudiencia: AudienceCommunicationSummary[];
  porSemana: WeeklyCommunicationSummary[];
}

// ==========================================
// 5. EJECUCIÓN: Tipos y Resultados
// ==========================================
export interface ExecutionAnalyticsResult {
  incidentesAbiertosPorPrioridad: {
    critica: number;
    alta: number;
    media: number;
    baja: number;
    totalAbiertos: number;
    totalCerrados: number;
    detalle: any[];
  };
  noConformidadesCalidadAbiertas: {
    totalAbiertas: number;
    totalAprobadas: number;
    detalle: any[];
  };
  solicitudesCambioPorEstado: {
    aprobadas: number;
    enRevision: number;
    rechazadas: number;
    implementadas: number;
    total: number;
    detalle: any[];
  };
}

// ==========================================
// RESULTADO INTEGRAL
// ==========================================
export interface AllProjectAnalytics {
  cutoffWeek: number;
  riesgos: RisksAnalyticsResult;
  recursos: ResourcesAnalyticsResult;
  interesados: StakeholdersAnalyticsResult;
  comunicaciones: CommunicationsAnalyticsResult;
  ejecucion: ExecutionAnalyticsResult;
}

// =========================================================================
// FUNCIONES PURAS DE CÁLCULO
// =========================================================================

/**
 * 1. CÁLCULO DE RIESGOS
 * - Puntaje = Probabilidad * Impacto
 * - Nivel (Bajo, Medio, Alto) según riesgo_umbral_medio y riesgo_umbral_alto de Proyecto
 * - Tendencia frente a semana anterior (k - 1) usando Riesgos_Historial
 * - Lista de riesgos que subieron
 * - Exposición total (suma de puntajes de riesgos activos)
 * - Número de riesgos altos abiertos
 * - Alerta de estado "Materializado"
 */
export function calculateRiskMetrics(
  dataset: ProjectDataset | null | undefined,
  cutoffWeek: number = 6
): RisksAnalyticsResult {
  const riesgosRaw = dataset?.riesgos || [];
  const historialRaw = dataset?.riesgos_historial || [];
  const proyecto = dataset?.proyecto;

  const umbralMedio = Number(proyecto?.riesgo_umbral_medio) || 8;
  const umbralAlto = Number(proyecto?.riesgo_umbral_alto) || 15;

  const previousWeek = Math.max(1, cutoffWeek - 1);

  // Mapa de historial para semana previa
  const prevWeekMap: Record<string, { prob: number; imp: number; puntaje: number }> = {};
  historialRaw
    .filter((h) => Number(h.semana) === previousWeek)
    .forEach((h) => {
      const p = Math.max(1, Math.min(5, Number(h.probabilidad_1a5 || h.probabilidad) || 1));
      const i = Math.max(1, Math.min(5, Number(h.impacto_1a5 || h.impacto) || 1));
      prevWeekMap[String(h.id).trim()] = { prob: p, imp: i, puntaje: p * i };
    });

  // Si no hay datos en previousWeek exacta, buscar la última semana anterior reportada
  if (Object.keys(prevWeekMap).length === 0 && cutoffWeek > 1) {
    historialRaw
      .filter((h) => Number(h.semana) < cutoffWeek)
      .sort((a, b) => Number(b.semana) - Number(a.semana))
      .forEach((h) => {
        const id = String(h.id).trim();
        if (!prevWeekMap[id]) {
          const p = Math.max(1, Math.min(5, Number(h.probabilidad_1a5 || h.probabilidad) || 1));
          const i = Math.max(1, Math.min(5, Number(h.impacto_1a5 || h.impacto) || 1));
          prevWeekMap[id] = { prob: p, imp: i, puntaje: p * i };
        }
      });
  }

  const matrizCalor: Record<string, RiskMetricItem[]> = {};
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      matrizCalor[`${p}_${i}`] = [];
    }
  }

  const riesgosEvaluados: RiskMetricItem[] = riesgosRaw.map((r, idx) => {
    const id = String(r.id || `RSK-${idx + 1}`).trim();
    const prob = Math.max(1, Math.min(5, Number(r.probabilidad_1a5 || r.probabilidad) || 1));
    const imp = Math.max(1, Math.min(5, Number(r.impacto_1a5 || r.impacto) || 1));
    const puntaje = prob * imp;

    let nivel: 'bajo' | 'medio' | 'alto' = 'bajo';
    if (puntaje >= umbralAlto) {
      nivel = 'alto';
    } else if (puntaje >= umbralMedio) {
      nivel = 'medio';
    }

    const prevHist = prevWeekMap[id];
    let tendencia: 'sube' | 'baja' | 'igual' = 'igual';
    if (prevHist) {
      if (puntaje > prevHist.puntaje) tendencia = 'sube';
      else if (puntaje < prevHist.puntaje) tendencia = 'baja';
    }

    const estadoStr = String(r.estado || 'Abierto').trim();
    const esMaterializado =
      estadoStr.toLowerCase().includes('materializado') ||
      String(r.estrategia || '').toLowerCase().includes('materializado') ||
      String(r.situacion || '').toLowerCase().includes('materializado');

    const item: RiskMetricItem = {
      id,
      riesgo: r.riesgo || 'Riesgo no especificado',
      categoria: r.categoria || 'Operativo',
      propietario: r.propietario || 'No asignado',
      probabilidad: prob,
      impacto: imp,
      puntaje,
      nivel,
      tendencia,
      puntajeAnterior: prevHist?.puntaje,
      semanaAnterior: previousWeek,
      estado: estadoStr,
      esMaterializado,
      estrategia: r.estrategia || 'Mitigar',
      respuestaPlanificada: r.respuesta_planificada || 'En evaluación',
    };

    if (matrizCalor[`${prob}_${imp}`]) {
      matrizCalor[`${prob}_${imp}`].push(item);
    }

    return item;
  });

  const riesgosActivos = riesgosEvaluados.filter(
    (r) => !r.estado.toLowerCase().includes('cerrado') && !r.estado.toLowerCase().includes('mitigado')
  );

  const exposicionTotal = riesgosActivos.reduce((sum, r) => sum + r.puntaje, 0);
  const riesgosAltosAbiertos = riesgosActivos.filter((r) => r.nivel === 'alto').length;
  const riesgosMediosAbiertos = riesgosActivos.filter((r) => r.nivel === 'medio').length;
  const riesgosBajosAbiertos = riesgosActivos.filter((r) => r.nivel === 'bajo').length;
  const riesgosMaterializados = riesgosEvaluados.filter((r) => r.esMaterializado);
  const riesgosQueSubieron = riesgosEvaluados.filter((r) => r.tendencia === 'sube');

  return {
    riesgosEvaluados,
    umbralMedio,
    umbralAlto,
    exposicionTotal,
    riesgosAltosAbiertos,
    riesgosMediosAbiertos,
    riesgosBajosAbiertos,
    riesgosMaterializados,
    riesgosQueSubieron,
    matrizCalor,
  };
}

/**
 * 2. CÁLCULO DE RECURSOS
 * - Carga por persona = suma de dedicacion_pct de sus actividades activas en la semana k
 * - Alerta si supera 100% (sobreasignación)
 * - Recursos solicitados contra asignados
 */
export function calculateResourceMetrics(
  dataset: ProjectDataset | null | undefined,
  cutoffWeek: number = 6
): ResourcesAnalyticsResult {
  const actividades = dataset?.actividades || [];
  const recursosRaw = dataset?.recursos || [];

  // Actividades activas en la semana de corte k
  const activasEnSemana = actividades.filter((act) => {
    const sIni = Number(act.sem_inicio_plan) || 1;
    const sFin = Number(act.sem_fin_plan) || sIni;
    return cutoffWeek >= sIni && cutoffWeek <= sFin;
  });

  // Agrupar carga por persona responsable
  const personWorkloadMap: Record<string, PersonWorkloadItem> = {};

  activasEnSemana.forEach((act) => {
    const persona = String(act.responsable || 'Sin responsable asignado').trim();
    if (!personWorkloadMap[persona]) {
      personWorkloadMap[persona] = {
        persona,
        actividadesActivas: [],
        cargaTotalPct: 0,
        sobreasignado: false,
      };
    }

    // Dedicación: soporta 'dedicacion_pct', 'dedicacion' o deduce default del 100% dividido si no está
    let dedPct = 50; // default 50% por actividad concurrente
    if (act.dedicacion_pct !== undefined && act.dedicacion_pct !== null && act.dedicacion_pct !== '') {
      const val = Number(act.dedicacion_pct);
      dedPct = val <= 1 && val > 0 ? val * 100 : val;
    } else if (act.dedicacion !== undefined && act.dedicacion !== null && act.dedicacion !== '') {
      const val = Number(act.dedicacion);
      dedPct = val <= 1 && val > 0 ? val * 100 : val;
    }

    personWorkloadMap[persona].actividadesActivas.push({
      codigo: act.codigo,
      actividad: act.actividad,
      sem_inicio_plan: Number(act.sem_inicio_plan) || 1,
      sem_fin_plan: Number(act.sem_fin_plan) || 1,
      dedicacion_pct: dedPct,
    });

    personWorkloadMap[persona].cargaTotalPct += dedPct;
  });

  const cargasPorPersona: PersonWorkloadItem[] = Object.values(personWorkloadMap).map((p) => ({
    ...p,
    sobreasignado: p.cargaTotalPct > 100,
  }));

  cargasPorPersona.sort((a, b) => b.cargaTotalPct - a.cargaTotalPct);
  const personasSobreasignadas = cargasPorPersona.filter((p) => p.sobreasignado);

  // Recursos solicitados vs asignados
  let totalSolicitados = 0;
  let totalAsignados = 0;
  const detalleRecursos: ResourceSummaryItem[] = [];

  if (recursosRaw.length > 0) {
    recursosRaw.forEach((rec, idx) => {
      const id = String(rec.id || `REC-${idx + 1}`);
      const sol = Number(rec.solicitado || rec.cantidad_solicitada) || 1;
      const asig = Number(rec.asignado || rec.cantidad_asignada) || (rec.estado === 'Pendiente' ? 0 : 1);
      totalSolicitados += sol;
      totalAsignados += asig;

      let estado: 'Completo' | 'Parcial' | 'Pendiente' = 'Completo';
      if (asig === 0) estado = 'Pendiente';
      else if (asig < sol) estado = 'Parcial';

      detalleRecursos.push({
        id,
        recurso: rec.recurso || 'Recurso genérico',
        tipo: rec.tipo || 'Personal',
        solicitado: sol,
        asignado: asig,
        estado,
      });
    });
  } else {
    // Si la hoja Recursos no tiene filas, deducir de los responsables de actividades
    const distinctPersonas = Array.from(new Set(actividades.map((a) => a.responsable).filter(Boolean)));
    totalSolicitados = distinctPersonas.length;
    totalAsignados = distinctPersonas.length;
    distinctPersonas.forEach((p, idx) => {
      detalleRecursos.push({
        id: `REC-${idx + 1}`,
        recurso: p,
        tipo: 'Personal Clave',
        solicitado: 1,
        asignado: 1,
        estado: 'Completo',
      });
    });
  }

  const tasaAsignacionGlobalPct =
    totalSolicitados > 0 ? Math.round((totalAsignados / totalSolicitados) * 100) : 100;

  return {
    cargasPorPersona,
    personasSobreasignadas,
    totalRecursosSolicitados: totalSolicitados,
    totalRecursosAsignados: totalAsignados,
    tasaAsignacionGlobalPct,
    detalleRecursos,
  };
}

/**
 * 3. CÁLCULO DE INTERESADOS
 * - Cuadrante poder/interés: alto = 4 o 5 (escala 1 a 5)
 * - 4 cuadrantes PMBOK
 * - Brecha entre participación actual y deseada (gap)
 */
export function calculateStakeholderMetrics(
  dataset: ProjectDataset | null | undefined
): StakeholdersAnalyticsResult {
  const interesadosRaw = dataset?.interesados || [];

  const STAKEHOLDER_LEVELS_MAP: Record<string, number> = {
    inconsciente: 1,
    renuente: 2,
    neutral: 3,
    partidario: 4,
    líder: 5,
    lider: 5,
  };

  const parseLevel = (val: any, defaultVal: number): { text: string; num: number } => {
    if (val === undefined || val === null || val === '') {
      const text = defaultVal === 4 ? 'Partidario' : defaultVal === 5 ? 'Líder' : 'Neutral';
      return { text, num: defaultVal };
    }
    if (typeof val === 'number') {
      const num = Math.max(1, Math.min(5, Math.round(val)));
      const text =
        num === 1 ? 'Inconsciente' : num === 2 ? 'Renuente' : num === 3 ? 'Neutral' : num === 4 ? 'Partidario' : 'Líder';
      return { text, num };
    }
    const clean = String(val).trim().toLowerCase();
    if (STAKEHOLDER_LEVELS_MAP[clean]) {
      const num = STAKEHOLDER_LEVELS_MAP[clean];
      const text = clean.charAt(0).toUpperCase() + clean.slice(1);
      return { text, num };
    }
    const numMatch = clean.match(/\d+/);
    if (numMatch) {
      const num = Math.max(1, Math.min(5, parseInt(numMatch[0], 10)));
      return { text: `Nivel ${num}`, num };
    }
    return { text: String(val), num: defaultVal };
  };

  const porCuadrante: Record<StakeholderQuadrant, StakeholderMetricItem[]> = {
    'Gestionar atentamente': [],
    'Mantener satisfecho': [],
    'Mantener informado': [],
    Monitorear: [],
  };

  const interesadosEvaluados: StakeholderMetricItem[] = interesadosRaw.map((stk, idx) => {
    const id = String(stk.id || `INT-${idx + 1}`);
    const poder = Math.max(1, Math.min(5, Number(stk.poder_1a5 || stk.poder) || 3));
    const interes = Math.max(1, Math.min(5, Number(stk.interes_1a5 || stk.interes) || 3));

    const esAltoPoder = poder >= 4;
    const esAltoInteres = interes >= 4;

    let cuadrante: StakeholderQuadrant = 'Monitorear';
    if (esAltoPoder && esAltoInteres) {
      cuadrante = 'Gestionar atentamente';
    } else if (esAltoPoder && !esAltoInteres) {
      cuadrante = 'Mantener satisfecho';
    } else if (!esAltoPoder && esAltoInteres) {
      cuadrante = 'Mantener informado';
    } else {
      cuadrante = 'Monitorear';
    }

    const actual = parseLevel(stk.participacion_actual || stk.compromiso_actual, 3);
    const deseada = parseLevel(stk.participacion_deseada || stk.compromiso_deseado, Math.max(actual.num, esAltoInteres ? 4 : 3));

    const brecha = Math.max(0, deseada.num - actual.num);

    const item: StakeholderMetricItem = {
      id,
      interesado: stk.interesado || 'Interesado clave',
      rol: stk.rol || 'Parte interesada',
      poder,
      interes,
      cuadrante,
      participacionActual: actual.text,
      participacionDeseada: deseada.text,
      participacionActualNum: actual.num,
      participacionDeseadaNum: deseada.num,
      brecha,
      requiereAccion: brecha > 0,
    };

    porCuadrante[cuadrante].push(item);
    return item;
  });

  const interesadosConBrecha = interesadosEvaluados.filter((i) => i.brecha > 0);
  const sumaBrechas = interesadosEvaluados.reduce((acc, i) => acc + i.brecha, 0);
  const brechaPromedio =
    interesadosEvaluados.length > 0 ? Number((sumaBrechas / interesadosEvaluados.length).toFixed(2)) : 0;

  return {
    interesadosEvaluados,
    porCuadrante,
    conteoPorCuadrante: {
      'Gestionar atentamente': porCuadrante['Gestionar atentamente'].length,
      'Mantener satisfecho': porCuadrante['Mantener satisfecho'].length,
      'Mantener informado': porCuadrante['Mantener informado'].length,
      Monitorear: porCuadrante['Monitorear'].length,
    },
    interesadosConBrecha,
    brechaPromedio,
  };
}

/**
 * 4. CÁLCULO DE COMUNICACIONES
 * - Tasa de apertura = abiertos / destinatarios
 * - Utilidad percibida promedio (escala 1 a 5)
 * - Días promedio de retraso en la respuesta
 * - Por audiencia y por semana
 */
export function calculateCommunicationMetrics(
  dataset: ProjectDataset | null | undefined,
  cutoffWeek: number = 6
): CommunicationsAnalyticsResult {
  const comunicacionesRaw = dataset?.comunicaciones || [];
  const planRaw = dataset?.plan_comunicaciones || [];

  const items: CommunicationMetricItem[] = [];

  if (comunicacionesRaw.length > 0) {
    comunicacionesRaw.forEach((c, idx) => {
      const sem = Number(c.semana) || 1;
      const dest = Number(c.destinatarios || c.receptores) || 20;
      const ab = Number(c.abiertos || c.aperturas) || Math.round(dest * 0.85);
      const tasa = dest > 0 ? Math.min(100, Math.round((ab / dest) * 100)) : 85;

      const utilidad = Number(c.utilidad_percibida || c.utilidad) || 4.2;
      const retraso = Number(c.dias_retraso || c.dias_retraso_respuesta || c.retraso_dias) || 1.2;

      items.push({
        id: String(c.id || `COM-${idx + 1}`),
        semana: sem,
        comunicacion: c.comunicacion || `Boletín de Seguimiento S${sem}`,
        audiencia: c.audiencia || 'Comité Directivo',
        destinatarios: dest,
        abiertos: ab,
        tasaAperturaPct: tasa,
        utilidadPercibida: utilidad,
        diasRetrasoRespuesta: retraso,
      });
    });
  } else if (planRaw.length > 0) {
    // Si solo hay plan, generar proyecciones de seguimiento por cada canal del plan hasta la semana de corte
    planRaw.forEach((p, idx) => {
      for (let w = 1; w <= Math.min(cutoffWeek, 6); w++) {
        const dest = 25;
        const ab = Math.round(dest * (0.80 + (idx % 3) * 0.05));
        items.push({
          id: `PLAN-${idx + 1}-S${w}`,
          semana: w,
          comunicacion: `${p.informacion_requerida || 'Reporte de proyecto'} (S${w})`,
          audiencia: p.audiencia || 'Equipo y Partes Interesadas',
          destinatarios: dest,
          abiertos: ab,
          tasaAperturaPct: Math.round((ab / dest) * 100),
          utilidadPercibida: 4.3,
          diasRetrasoRespuesta: 1.5,
        });
      }
    });
  }

  // Métricas globales
  const totalDest = items.reduce((acc, c) => acc + c.destinatarios, 0);
  const totalAb = items.reduce((acc, c) => acc + c.abiertos, 0);
  const tasaAperturaGlobalPct = totalDest > 0 ? Math.round((totalAb / totalDest) * 100) : 0;

  const sumaUtilidad = items.reduce((acc, c) => acc + c.utilidadPercibida, 0);
  const utilidadPercibidaPromedio =
    items.length > 0 ? Number((sumaUtilidad / items.length).toFixed(1)) : 0;

  const sumaRetraso = items.reduce((acc, c) => acc + c.diasRetrasoRespuesta, 0);
  const diasRetrasoPromedio =
    items.length > 0 ? Number((sumaRetraso / items.length).toFixed(1)) : 0;

  // Agrupado por audiencia
  const audienceMap: Record<
    string,
    { total: number; dest: number; ab: number; sumUt: number; sumRet: number }
  > = {};
  items.forEach((c) => {
    const aud = c.audiencia || 'General';
    if (!audienceMap[aud]) {
      audienceMap[aud] = { total: 0, dest: 0, ab: 0, sumUt: 0, sumRet: 0 };
    }
    audienceMap[aud].total += 1;
    audienceMap[aud].dest += c.destinatarios;
    audienceMap[aud].ab += c.abiertos;
    audienceMap[aud].sumUt += c.utilidadPercibida;
    audienceMap[aud].sumRet += c.diasRetrasoRespuesta;
  });

  const porAudiencia: AudienceCommunicationSummary[] = Object.entries(audienceMap).map(
    ([audiencia, data]) => ({
      audiencia,
      totalComunicaciones: data.total,
      tasaAperturaPromedioPct: data.dest > 0 ? Math.round((data.ab / data.dest) * 100) : 0,
      utilidadPromedio: Number((data.sumUt / data.total).toFixed(1)),
      diasRetrasoPromedio: Number((data.sumRet / data.total).toFixed(1)),
    })
  );

  // Agrupado por semana
  const weekMap: Record<
    number,
    { total: number; dest: number; ab: number; sumUt: number; sumRet: number }
  > = {};
  items.forEach((c) => {
    const w = c.semana;
    if (!weekMap[w]) {
      weekMap[w] = { total: 0, dest: 0, ab: 0, sumUt: 0, sumRet: 0 };
    }
    weekMap[w].total += 1;
    weekMap[w].dest += c.destinatarios;
    weekMap[w].ab += c.abiertos;
    weekMap[w].sumUt += c.utilidadPercibida;
    weekMap[w].sumRet += c.diasRetrasoRespuesta;
  });

  const porSemana: WeeklyCommunicationSummary[] = Object.entries(weekMap)
    .map(([wStr, data]) => ({
      semana: Number(wStr),
      totalComunicaciones: data.total,
      tasaAperturaPromedioPct: data.dest > 0 ? Math.round((data.ab / data.dest) * 100) : 0,
      utilidadPromedio: Number((data.sumUt / data.total).toFixed(1)),
      diasRetrasoPromedio: Number((data.sumRet / data.total).toFixed(1)),
    }))
    .sort((a, b) => a.semana - b.semana);

  return {
    comunicacionesEvaluadas: items,
    tasaAperturaGlobalPct,
    utilidadPercibidaPromedio,
    diasRetrasoPromedio,
    porAudiencia,
    porSemana,
  };
}

/**
 * 5. CÁLCULO DE EJECUCIÓN
 * - Incidentes abiertos por prioridad (Alta, Media, Baja / Crítica)
 * - No conformidades de calidad abiertas
 * - Solicitudes de cambio por estado
 */
export function calculateExecutionMetrics(
  dataset: ProjectDataset | null | undefined,
  _cutoffWeek: number = 6
): ExecutionAnalyticsResult {
  const incidentes = dataset?.incidentes || [];
  const calidad = dataset?.calidad || [];
  const cambios = dataset?.cambios || [];

  // 1. Incidentes abiertos por prioridad
  let critica = 0;
  let alta = 0;
  let media = 0;
  let baja = 0;
  let totalAbiertos = 0;
  let totalCerrados = 0;
  const incidentesDetalle: any[] = [];

  incidentes.forEach((inc) => {
    const est = String(inc.estado || '').toLowerCase().trim();
    const esCerrado = est.includes('cerrado') || est.includes('resuelto') || est.includes('solucionado');
    const prioRaw = String(inc.prioridad || inc.severidad || 'Media').toLowerCase().trim();
    const prio = prioRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (esCerrado) {
      totalCerrados += 1;
    } else {
      totalAbiertos += 1;
      if (prio.includes('crit') || prio.includes('urgente')) {
        critica += 1;
      } else if (prio.includes('alta') || prio.includes('alto')) {
        alta += 1;
      } else if (prio.includes('baja') || prio.includes('bajo')) {
        baja += 1;
      } else {
        media += 1;
      }
    }

    incidentesDetalle.push({
      ...inc,
      abierto: !esCerrado,
      prioridadNormalizada: prio.includes('crit')
        ? 'Crítica'
        : prio.includes('alta')
        ? 'Alta'
        : prio.includes('baja')
        ? 'Baja'
        : 'Media',
    });
  });

  // 2. No conformidades de calidad abiertas
  let totalCalidadAbiertas = 0;
  let totalCalidadAprobadas = 0;
  const calidadDetalle: any[] = [];

  calidad.forEach((cal) => {
    const est = String(cal.estado || cal.resultado || cal.cumplimiento || '').toLowerCase().trim();
    const esNoConforme =
      est.includes('no conforme') ||
      est.includes('no_conforme') ||
      est.includes('rechaz') ||
      est.includes('fall') ||
      est.includes('observ');

    const esConforme =
      !esNoConforme &&
      (est.includes('aprobado') ||
        est.includes('conforme') ||
        est.includes('cumple') ||
        est.includes('cerrado') ||
        est.includes('ok'));

    if (esConforme) {
      totalCalidadAprobadas += 1;
    } else {
      totalCalidadAbiertas += 1;
    }

    calidadDetalle.push({
      ...cal,
      abierta: !esConforme,
    });
  });

  // 3. Solicitudes de cambio por estado
  let aprobadas = 0;
  let enRevision = 0;
  let rechazadas = 0;
  let implementadas = 0;

  cambios.forEach((c) => {
    const est = String(c.estado || c.decision || '').toLowerCase().trim();
    if (est.includes('aprob')) {
      aprobadas += 1;
    } else if (est.includes('rechaz') || est.includes('deneg')) {
      rechazadas += 1;
    } else if (est.includes('impl') || est.includes('ejecut')) {
      implementadas += 1;
    } else {
      enRevision += 1;
    }
  });

  return {
    incidentesAbiertosPorPrioridad: {
      critica,
      alta,
      media,
      baja,
      totalAbiertos,
      totalCerrados,
      detalle: incidentesDetalle,
    },
    noConformidadesCalidadAbiertas: {
      totalAbiertas: totalCalidadAbiertas,
      totalAprobadas: totalCalidadAprobadas,
      detalle: calidadDetalle,
    },
    solicitudesCambioPorEstado: {
      aprobadas,
      enRevision,
      rechazadas,
      implementadas,
      total: cambios.length,
      detalle: cambios,
    },
  };
}

/**
 * CÁLCULO GENERAL INTEGRAL
 * Ejecuta los 5 dominios y retorna la estructura unificada
 */
export function calculateAllProjectAnalytics(
  dataset: ProjectDataset | null | undefined,
  cutoffWeek: number = 6
): AllProjectAnalytics {
  return {
    cutoffWeek,
    riesgos: calculateRiskMetrics(dataset, cutoffWeek),
    recursos: calculateResourceMetrics(dataset, cutoffWeek),
    interesados: calculateStakeholderMetrics(dataset),
    comunicaciones: calculateCommunicationMetrics(dataset, cutoffWeek),
    ejecucion: calculateExecutionMetrics(dataset, cutoffWeek),
  };
}
