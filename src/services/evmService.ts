/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDataset, ActividadItem, LineaBasePVItem, AvanceSemanalItem, ContingenciaItem } from '../types/projectData.ts';

export type EvmIndicatorTrafficLight = 'green' | 'yellow' | 'red';

export interface EvmTimeSeriesPoint {
  week: number;
  pv: number;
  ev: number;
  ac: number;
  cpi: number | null;
  spi: number | null;
  es: number | null;
  spiT: number | null;
  pvAcum: number;
  evAcum: number;
  acAcum: number;
}

export interface EvmControlAccountResult {
  cuenta_control: string;
  actividadesCount: number;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  cv: number;
  sv: number;
  cpi: number | null;
  spi: number | null;
  eacTipico: number | null;
  etc: number | null;
  vac: number | null;
  tcpi: number | null;
  semaforoCpi: EvmIndicatorTrafficLight;
  semaforoSpi: EvmIndicatorTrafficLight;
}

export interface SourceRowDetail {
  sheet: string;
  codigo?: string;
  actividad?: string;
  cuenta_control?: string;
  semana?: number;
  concepto?: string;
  valorOriginal: number | string;
  porcentaje?: number;
  contribucion: number;
}

export interface EvmCalculationDetails {
  metricKey: string;
  metricName: string;
  acronym: string;
  formula: string;
  formulaDescription: string;
  substitutedValues: string;
  numericResult: number | null;
  formattedResult: string;
  interpretation: string;
  sourceSheet: string;
  sourceRows: SourceRowDetail[];
  steps: string[];
}

export interface EvmProjectResult {
  cutoffWeek: number;
  currency: string;

  // Parámetros base del proyecto
  presupuestoAutorizado: number;
  bac: number;
  reservaContingencia: number;
  duracionSemanas: number;

  // Métricas principales a la semana k
  pv: number;
  ev: number;
  ac: number;

  // Variaciones
  cv: number;
  sv: number;

  // Índices de desempeño
  cpi: number | null;
  spi: number | null;

  // Pronósticos
  eacOptimista: number | null;
  eacTipico: number | null;
  eacPesimista: number | null;
  etc: number | null;
  vac: number | null;
  tcpi: number | null;

  // Cronograma ganado (Earned Schedule)
  cCount: number;
  es: number | null;
  spiT: number | null;
  atrasoSemanas: number | null;
  duracionPronosticada: number | null;

  // Contingencia y Presupuesto
  contingenciaGastada: number;
  contingenciaDisponible: number;
  presupuestoConContingencia: number;
  deltaPresupuestoAutorizado: number | null; // Presupuesto Autorizado - EAC típico
  deltaContingenciaDisponible: number | null; // (BAC + Contingencia disponible) - EAC típico
  esEacCubiertoPorPresupuesto: boolean;
  esEacCubiertoPorContingencia: boolean;

  // Semáforos
  umbralVerde: number;
  umbralAmarillo: number;
  semaforoCpi: EvmIndicatorTrafficLight;
  semaforoSpi: EvmIndicatorTrafficLight;
  semaforoTcpi: EvmIndicatorTrafficLight;
  semaforoSpiT: EvmIndicatorTrafficLight;

  // Desgloses
  controlAccounts: EvmControlAccountResult[];
  weeklySeries: EvmTimeSeriesPoint[];

  // Auditoría "¿Cómo se calculó?"
  getCalculationDetails: (metricKey: string) => EvmCalculationDetails;
}

/**
 * Normaliza un porcentaje reportado: si viene en escala 0 a 1 (ej. 0.35) lo normaliza a decimal 0.35.
 * Si viene en escala 0 a 100 (ej. 35) lo divide entre 100 obteniendo 0.35.
 */
export function normalizePctFactor(val: unknown): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val || 0).replace('%', '').trim());
  if (isNaN(num) || num <= 0) return 0;
  if (num > 1) {
    return num / 100;
  }
  return num;
}

/**
 * Parsea el número de semana de forma segura soportando números o strings tipo "1", "S1", "Semana 1".
 */
export function parseEntryWeek(semana: unknown): number {
  if (typeof semana === 'number') {
    return isNaN(semana) ? 0 : Math.round(semana);
  }
  if (typeof semana === 'string') {
    const match = semana.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
  return 0;
}

/**
 * Extrae el costo real semanal con tolerancia a nombres alternativos y formatos numéricos/monetarios.
 */
export function extractEntryActualCost(entry: any): number {
  if (!entry) return 0;
  const raw =
    entry.costo_real_semana !== undefined
      ? entry.costo_real_semana
      : entry.costo_real !== undefined
      ? entry.costo_real
      : entry.costo_real_semana_pen !== undefined
      ? entry.costo_real_semana_pen
      : entry.costo_real_semana_mxn !== undefined
      ? entry.costo_real_semana_mxn
      : entry.costo_real_semana_usd !== undefined
      ? entry.costo_real_semana_usd
      : entry.monto !== undefined
      ? entry.monto
      : entry.costo || 0;

  if (typeof raw === 'number') {
    return isNaN(raw) ? 0 : raw;
  }
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/[$€£S/.,MXNPENUSD\s]/gi, (match) => {
      if (match === '.' || match === ',') return match;
      return '';
    }).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Determina el semáforo para un índice (CPI, SPI, SPI(t))
 * Verde si >= umbral_verde; Amarillo si >= umbral_amarillo; Rojo si < umbral_amarillo
 */
export function calculateTrafficLight(
  indexVal: number | null,
  umbralVerde: number = 0.95,
  umbralAmarillo: number = 0.90,
  isTcpi: boolean = false
): EvmIndicatorTrafficLight {
  if (indexVal === null || isNaN(indexVal)) return 'yellow';

  // Para TCPI, menor o igual a 1.0 es favorable (verde), > 1.10 es crítico (rojo)
  if (isTcpi) {
    if (indexVal <= 1.0) return 'green';
    if (indexVal <= 1.10) return 'yellow';
    return 'red';
  }

  if (indexVal >= umbralVerde) return 'green';
  if (indexVal >= umbralAmarillo) return 'yellow';
  return 'red';
}

/**
 * Función pura principal: Calcula todas las métricas de EVM y Cronograma Ganado
 * para el dataset y la semana de corte k provistos.
 */
export function calculateEvmMetrics(
  dataset: ProjectDataset | null | undefined,
  cutoffWeek: number = 6
): EvmProjectResult {
  const k = Math.max(1, Math.floor(Number(cutoffWeek) || 1));

  const proyecto = dataset?.proyecto;
  const currency = proyecto?.moneda || 'PEN';
  const duracionSemanas = Math.max(1, Number(proyecto?.duracion_semanas) || 12);
  const presupuestoAutorizado = Number(proyecto?.presupuesto_autorizado) || 0;
  const reservaContingencia = Number(proyecto?.reserva_contingencia) || 0;

  const umbralVerde = Number(proyecto?.umbral_alerta_cpi) || 0.95;
  const umbralAmarillo = Number(proyecto?.umbral_critico_cpi) || 0.90;

  const actividades: ActividadItem[] = dataset?.actividades || [];
  const lineaBasePV: LineaBasePVItem[] =
    (dataset?.lineaBase_pv && dataset.lineaBase_pv.length > 0)
      ? dataset.lineaBase_pv
      : ((dataset as any)?.lineabase_pv || (dataset as any)?.LineaBase_PV || []);
  const avanceSemanal: AvanceSemanalItem[] = dataset?.avance_semanal || [];
  const contingencia: ContingenciaItem[] = dataset?.contingencia || [];

  // 1. BAC = suma del BAC de Actividades (sin reservas). Si no hay actividades, fallback a proyecto.BAC
  const calculatedBacFromActivities = actividades.reduce((sum, act) => sum + (Number(act.BAC) || 0), 0);
  const bac = calculatedBacFromActivities > 0 ? calculatedBacFromActivities : (Number(proyecto?.BAC) || 0);

  // 2. PV(k) = suma de LineaBase_PV de S1 a Sk
  const pvDetailsRows: SourceRowDetail[] = [];
  let pv = 0;

  lineaBasePV.forEach((row) => {
    let rowSum = 0;
    for (let w = 1; w <= k; w++) {
      const colKey = `S${w}`;
      const colKeyLower = `s${w}`;
      const rawVal = row[colKey] !== undefined ? row[colKey] : (row as any)[colKeyLower];
      const cellVal = Number(rawVal) || 0;
      rowSum += cellVal;
    }
    pv += rowSum;
    const actMatch = actividades.find((a) => a.codigo === row.codigo);
    pvDetailsRows.push({
      sheet: 'LineaBase_PV',
      codigo: row.codigo,
      actividad: actMatch?.actividad || `Actividad ${row.codigo}`,
      cuenta_control: actMatch?.cuenta_control || 'N/A',
      concepto: `PV acumulado S1 a S${k}`,
      valorOriginal: rowSum,
      contribucion: rowSum,
    });
  });

  // 3. EV(k) = suma de BAC de la actividad × (% completado acumulado del último reporte con semana ≤ k) / 100
  const evDetailsRows: SourceRowDetail[] = [];
  let ev = 0;

  actividades.forEach((act) => {
    const actBac = Number(act.BAC) || 0;
    // Filtrar reportes para esta actividad con semana <= k
    const relevantReports = avanceSemanal.filter(
      (rep) => rep.codigo === act.codigo && Number(rep.semana) <= k
    );

    // Obtener el último reporte (máxima semana <= k)
    let latestReport: AvanceSemanalItem | undefined;
    let maxWeek = -1;
    relevantReports.forEach((rep) => {
      const w = Number(rep.semana);
      if (w > maxWeek) {
        maxWeek = w;
        latestReport = rep;
      }
    });

    const pctFactor = latestReport ? normalizePctFactor(latestReport.pct_completado_acum) : 0;
    const actEv = actBac * pctFactor;
    ev += actEv;

    evDetailsRows.push({
      sheet: 'Avance_Semanal + Actividades',
      codigo: act.codigo,
      actividad: act.actividad,
      cuenta_control: act.cuenta_control,
      semana: latestReport ? Number(latestReport.semana) : undefined,
      valorOriginal: latestReport?.pct_completado_acum ?? 0,
      porcentaje: pctFactor * 100,
      concepto: `BAC: ${actBac.toLocaleString()} × ${(pctFactor * 100).toFixed(1)}%`,
      contribucion: actEv,
    });
  });

  // 4. AC(k) = suma de costo_real_semana con semana ≤ k
  const acDetailsRows: SourceRowDetail[] = [];
  let ac = 0;

  avanceSemanal
    .filter((entry) => {
      const w = parseEntryWeek(entry.semana);
      return w > 0 && w <= k;
    })
    .forEach((entry) => {
      const cost = extractEntryActualCost(entry);
      ac += cost;
      const actMatch = actividades.find((a) => a.codigo === entry.codigo);
      const w = parseEntryWeek(entry.semana);
      acDetailsRows.push({
        sheet: 'Avance_Semanal',
        codigo: entry.codigo,
        actividad: actMatch?.actividad,
        cuenta_control: actMatch?.cuenta_control,
        semana: w,
        concepto: `Costo real S${w}`,
        valorOriginal: cost,
        contribucion: cost,
      });
    });

  // 5. CV = EV − AC; SV = EV − PV; CPI = EV / AC; SPI = EV / PV
  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = ac > 0 ? ev / ac : null;
  const spi = pv > 0 ? ev / pv : null;

  // 6. Pronósticos
  // EAC optimista = AC + (BAC − EV)
  const eacOptimista = ac + (bac - ev);

  // EAC típico = BAC / CPI
  const eacTipico = cpi !== null && cpi > 0 ? bac / cpi : null;

  // EAC pesimista = AC + (BAC − EV) / (CPI × SPI)
  let eacPesimista: number | null = null;
  if (cpi !== null && spi !== null && cpi > 0 && spi > 0) {
    eacPesimista = ac + (bac - ev) / (cpi * spi);
  }

  // ETC = EAC típico − AC
  const etc = eacTipico !== null ? eacTipico - ac : null;

  // VAC = BAC − EAC típico
  const vac = eacTipico !== null ? bac - eacTipico : null;

  // TCPI = (BAC − EV) / (BAC − AC)
  const tcpiDenom = bac - ac;
  const tcpi = tcpiDenom !== 0 ? (bac - ev) / tcpiDenom : null;

  // 7. Cronograma Ganado (Earned Schedule):
  // PV acumulado por semana de 0 a duracionSemanas
  // PVacum[0] = 0; PVacum[w] = suma de PV de S1 a Sw
  const maxWeeksTable = Math.max(duracionSemanas, 12);
  const pvAcumByWeek: number[] = [0];

  for (let w = 1; w <= maxWeeksTable; w++) {
    let weekTotal = 0;
    lineaBasePV.forEach((row) => {
      for (let sw = 1; sw <= w; sw++) {
        const raw = row[`S${sw}`] !== undefined ? row[`S${sw}`] : (row as any)[`s${sw}`];
        weekTotal += Number(raw) || 0;
      }
    });
    pvAcumByWeek[w] = weekTotal;
  }

  // C = número de semanas cuyo PV acumulado <= EV
  let cCount = 0;
  for (let w = 1; w <= maxWeeksTable; w++) {
    if (pvAcumByWeek[w] <= ev) {
      cCount = w;
    } else {
      break;
    }
  }

  // ES = C + (EV − PVacum[C]) / (PVacum[C+1] − PVacum[C])
  let es: number | null = null;
  if (cCount >= maxWeeksTable) {
    es = maxWeeksTable;
  } else {
    const pvC = pvAcumByWeek[cCount] ?? 0;
    const pvNext = pvAcumByWeek[cCount + 1] ?? pvC;
    const denominator = pvNext - pvC;
    if (denominator > 0) {
      es = cCount + (ev - pvC) / denominator;
    } else {
      es = cCount;
    }
  }

  // SPI(t) = ES / k
  const spiT = es !== null && k > 0 ? es / k : null;

  // atraso = k − ES (positivo = retraso; negativo = adelanto)
  const atrasoSemanas = es !== null ? k - es : null;

  // duración pronosticada = duracion_semanas / SPI(t)
  const duracionPronosticada = spiT !== null && spiT > 0 ? duracionSemanas / spiT : null;

  // 8. Contingencia disponible = reserva_contingencia − suma de Contingencia con semana ≤ k
  const contingenciaDetailsRows: SourceRowDetail[] = [];
  let contingenciaGastada = 0;

  contingencia
    .filter((c) => Number(c.semana) <= k)
    .forEach((c) => {
      const monto = Number(c.monto) || 0;
      contingenciaGastada += monto;
      contingenciaDetailsRows.push({
        sheet: 'Contingencia',
        semana: Number(c.semana),
        concepto: `${c.riesgo ? `[${c.riesgo}] ` : ''}${c.concepto || 'Gasto de contingencia'}`,
        valorOriginal: monto,
        contribucion: monto,
      });
    });

  const contingenciaDisponible = reservaContingencia - contingenciaGastada;
  const presupuestoConContingencia = bac + contingenciaDisponible;

  // Comparación de EAC típico con presupuesto autorizado y contingencia disponible
  const deltaPresupuestoAutorizado = eacTipico !== null ? presupuestoAutorizado - eacTipico : null;
  const deltaContingenciaDisponible = eacTipico !== null ? presupuestoConContingencia - eacTipico : null;
  const esEacCubiertoPorPresupuesto = deltaPresupuestoAutorizado !== null ? deltaPresupuestoAutorizado >= 0 : false;
  const esEacCubiertoPorContingencia = deltaContingenciaDisponible !== null ? deltaContingenciaDisponible >= 0 : false;

  // Semáforos
  const semaforoCpi = calculateTrafficLight(cpi, umbralVerde, umbralAmarillo);
  const semaforoSpi = calculateTrafficLight(spi, umbralVerde, umbralAmarillo);
  const semaforoTcpi = calculateTrafficLight(tcpi, 1.0, 1.10, true);
  const semaforoSpiT = calculateTrafficLight(spiT, umbralVerde, umbralAmarillo);

  // 9. Cálculos por Cuenta de Control (CC)
  const ccMap = new Map<string, ActividadItem[]>();
  actividades.forEach((act) => {
    const cc = act.cuenta_control || 'Sin cuenta';
    if (!ccMap.has(cc)) {
      ccMap.set(cc, []);
    }
    ccMap.get(cc)!.push(act);
  });

  const controlAccounts: EvmControlAccountResult[] = [];
  ccMap.forEach((acts, cc) => {
    const ccCodes = new Set(acts.map((a) => a.codigo));
    const ccBac = acts.reduce((acc, a) => acc + (Number(a.BAC) || 0), 0);

    // PV de la CC
    let ccPv = 0;
    lineaBasePV
      .filter((row) => ccCodes.has(row.codigo))
      .forEach((row) => {
        for (let w = 1; w <= k; w++) {
          const raw = row[`S${w}`] !== undefined ? row[`S${w}`] : (row as any)[`s${w}`];
          ccPv += Number(raw) || 0;
        }
      });

    // EV de la CC
    let ccEv = 0;
    acts.forEach((a) => {
      const aBac = Number(a.BAC) || 0;
      const relevant = avanceSemanal.filter(
        (rep) => rep.codigo === a.codigo && Number(rep.semana) <= k
      );
      let latest: AvanceSemanalItem | undefined;
      let mw = -1;
      relevant.forEach((r) => {
        const w = Number(r.semana);
        if (w > mw) {
          mw = w;
          latest = r;
        }
      });
      const factor = latest ? normalizePctFactor(latest.pct_completado_acum) : 0;
      ccEv += aBac * factor;
    });

    // AC de la CC
    let ccAc = 0;
    avanceSemanal
      .filter((r) => ccCodes.has(r.codigo) && parseEntryWeek(r.semana) <= k && parseEntryWeek(r.semana) > 0)
      .forEach((r) => {
        ccAc += extractEntryActualCost(r);
      });

    const ccCv = ccEv - ccAc;
    const ccSv = ccEv - ccPv;
    const ccCpi = ccAc > 0 ? ccEv / ccAc : null;
    const ccSpi = ccPv > 0 ? ccEv / ccPv : null;
    const ccEacTipico = ccCpi !== null && ccCpi > 0 ? ccBac / ccCpi : null;
    const ccEtc = ccEacTipico !== null ? ccEacTipico - ccAc : null;
    const ccVac = ccEacTipico !== null ? ccBac - ccEacTipico : null;
    const ccTcpiDenom = ccBac - ccAc;
    const ccTcpi = ccTcpiDenom !== 0 ? (ccBac - ccEv) / ccTcpiDenom : null;

    controlAccounts.push({
      cuenta_control: cc,
      actividadesCount: acts.length,
      bac: ccBac,
      pv: ccPv,
      ev: ccEv,
      ac: ccAc,
      cv: ccCv,
      sv: ccSv,
      cpi: ccCpi,
      spi: ccSpi,
      eacTipico: ccEacTipico,
      etc: ccEtc,
      vac: ccVac,
      tcpi: ccTcpi,
      semaforoCpi: calculateTrafficLight(ccCpi, umbralVerde, umbralAmarillo),
      semaforoSpi: calculateTrafficLight(ccSpi, umbralVerde, umbralAmarillo),
    });
  });

  // Ordenar cuentas de control por código
  controlAccounts.sort((a, b) => a.cuenta_control.localeCompare(b.cuenta_control));

  // 10. Serie semanal de la semana 1 a k (Curva S y tendencias de CPI/SPI)
  const weeklySeries: EvmTimeSeriesPoint[] = [];
  for (let w = 1; w <= k; w++) {
    // PV acumulado hasta semana w
    let wPvAcum = 0;
    lineaBasePV.forEach((row) => {
      for (let sw = 1; sw <= w; sw++) {
        const raw = row[`S${sw}`] !== undefined ? row[`S${sw}`] : (row as any)[`s${sw}`];
        wPvAcum += Number(raw) || 0;
      }
    });

    // EV acumulado hasta semana w
    let wEvAcum = 0;
    actividades.forEach((act) => {
      const actBac = Number(act.BAC) || 0;
      const rel = avanceSemanal.filter((r) => r.codigo === act.codigo && Number(r.semana) <= w);
      let lat: AvanceSemanalItem | undefined;
      let mw = -1;
      rel.forEach((r) => {
        const sw = Number(r.semana);
        if (sw > mw) {
          mw = sw;
          lat = r;
        }
      });
      const factor = lat ? normalizePctFactor(lat.pct_completado_acum) : 0;
      wEvAcum += actBac * factor;
    });

    // AC acumulado hasta semana w
    let wAcAcum = 0;
    avanceSemanal
      .filter((r) => {
        const sw = parseEntryWeek(r.semana);
        return sw > 0 && sw <= w;
      })
      .forEach((r) => {
        wAcAcum += extractEntryActualCost(r);
      });

    // PV del periodo semana w
    let wPvPeriod = 0;
    lineaBasePV.forEach((row) => {
      const raw = row[`S${w}`] !== undefined ? row[`S${w}`] : (row as any)[`s${w}`];
      wPvPeriod += Number(raw) || 0;
    });

    // AC del periodo semana w
    let wAcPeriod = 0;
    avanceSemanal
      .filter((r) => parseEntryWeek(r.semana) === w)
      .forEach((r) => {
        wAcPeriod += extractEntryActualCost(r);
      });

    const wCpi = wAcAcum > 0 ? wEvAcum / wAcAcum : null;
    const wSpi = wPvAcum > 0 ? wEvAcum / wPvAcum : null;

    // Cronograma ganado a la semana w
    let wC = 0;
    for (let sw = 1; sw <= maxWeeksTable; sw++) {
      if (pvAcumByWeek[sw] <= wEvAcum) {
        wC = sw;
      } else {
        break;
      }
    }
    let wEs: number | null = null;
    if (wC >= maxWeeksTable) {
      wEs = maxWeeksTable;
    } else {
      const pC = pvAcumByWeek[wC] ?? 0;
      const pNext = pvAcumByWeek[wC + 1] ?? pC;
      const den = pNext - pC;
      wEs = den > 0 ? wC + (wEvAcum - pC) / den : wC;
    }
    const wSpiT = wEs !== null && w > 0 ? wEs / w : null;

    weeklySeries.push({
      week: w,
      pv: wPvPeriod,
      ev: wEvAcum, // se suele graficar EV acumulado
      ac: wAcPeriod,
      cpi: wCpi,
      spi: wSpi,
      es: wEs,
      spiT: wSpiT,
      pvAcum: wPvAcum,
      evAcum: wEvAcum,
      acAcum: wAcAcum,
    });
  }

  // 11. Auditoría matemática detallada: "¿Cómo se calculó?"
  const getCalculationDetails = (metricKey: string): EvmCalculationDetails => {
    switch (metricKey) {
      case 'BAC':
        return {
          metricKey: 'BAC',
          metricName: 'Presupuesto hasta la Conclusión',
          acronym: 'BAC',
          formula: 'BAC = \\sum BAC_{\\text{Actividades}}',
          formulaDescription: 'Suma de los presupuestos asignados a cada actividad planificada en la Línea Base de Costos (sin incluir reservas de contingencia ni de gestión).',
          substitutedValues: `BAC = ${actividades.map((a) => `${Number(a.BAC).toLocaleString()}`).slice(0, 5).join(' + ')}${actividades.length > 5 ? ` + ... (${actividades.length} actividades)` : ''} = ${Math.round(bac).toLocaleString()} ${currency}`,
          numericResult: bac,
          formattedResult: `${currency} ${Math.round(bac).toLocaleString()}`,
          interpretation: `El costo base estimado para completar el 100% del alcance convenido del proyecto es de ${currency} ${Math.round(bac).toLocaleString()}.`,
          sourceSheet: 'Actividades',
          sourceRows: actividades.map((a) => ({
            sheet: 'Actividades',
            codigo: a.codigo,
            actividad: a.actividad,
            cuenta_control: a.cuenta_control,
            concepto: 'BAC actividad',
            valorOriginal: Number(a.BAC) || 0,
            contribucion: Number(a.BAC) || 0,
          })),
          steps: [
            `Identificar las ${actividades.length} actividades del cronograma aprobadas en el Plan de Dirección.`,
            `Extraer el valor BAC individual asignado a cada paquete de trabajo.`,
            `Sumar las partidas individuales: Total BAC = ${Math.round(bac).toLocaleString()} ${currency}.`,
          ],
        };

      case 'PV':
        return {
          metricKey: 'PV',
          metricName: 'Valor Planificado acumulado',
          acronym: 'PV(k)',
          formula: `PV(k) = \\sum_{w=1}^{k} \\text{LineaBase\\_PV}_w`,
          formulaDescription: `Valor monetario del trabajo que estaba programado completarse desde la Semana 1 hasta la Semana de corte ${k} de acuerdo con el cronograma y la Línea Base.`,
          substitutedValues: `PV(${k}) = Suma de columnas S1 a S${k} de la hoja LineaBase_PV = ${Math.round(pv).toLocaleString()} ${currency}`,
          numericResult: pv,
          formattedResult: `${currency} ${Math.round(pv).toLocaleString()}`,
          interpretation: `A la semana ${k}, el plan de dirección requería haber ejecutado un valor de trabajo de ${currency} ${Math.round(pv).toLocaleString()} (${((pv / (bac || 1)) * 100).toFixed(1)}% del BAC total).`,
          sourceSheet: 'LineaBase_PV',
          sourceRows: pvDetailsRows,
          steps: [
            `Recorrer cada fila de la matriz de valor planificado semanal (LineaBase_PV).`,
            `Sumar las columnas desde S1 hasta S${k} para cada actividad.`,
            `Consolidar el total del proyecto: PV acumulado a S${k} = ${Math.round(pv).toLocaleString()} ${currency}.`,
          ],
        };

      case 'EV':
        return {
          metricKey: 'EV',
          metricName: 'Valor Ganado acumulado',
          acronym: 'EV(k)',
          formula: `EV(k) = \\sum \\left[ BAC_{\\text{act}} \\times \\frac{\\%_{\\text{completado acumulado}}(\\le k)}{100} \\right]`,
          formulaDescription: `Valor presupuestado del trabajo físicamente completado hasta la semana ${k}. Se evalúa tomando el último reporte de avance registrado de cada actividad con semana \\le ${k}.`,
          substitutedValues: `EV(${k}) = Suma de [ BAC_i × %_completado_i ] = ${Math.round(ev).toLocaleString()} ${currency}`,
          numericResult: ev,
          formattedResult: `${currency} ${Math.round(ev).toLocaleString()}`,
          interpretation: `El avance físico entregado a la fecha equivale a ${currency} ${Math.round(ev).toLocaleString()} de trabajo presupuestado (${((ev / (bac || 1)) * 100).toFixed(1)}% del BAC total).`,
          sourceSheet: 'Avance_Semanal + Actividades',
          sourceRows: evDetailsRows,
          steps: [
            `Para cada una de las ${actividades.length} actividades, buscar en Avance_Semanal el reporte más reciente con semana <= ${k}.`,
            `Multiplicar el BAC presupuestado de la actividad por el porcentaje de avance físico acumulado reportado.`,
            `Sumar el valor ganado de todas las actividades: Total EV(S${k}) = ${Math.round(ev).toLocaleString()} ${currency}.`,
          ],
        };

      case 'AC':
        return {
          metricKey: 'AC',
          metricName: 'Costo Real acumulado',
          acronym: 'AC(k)',
          formula: `AC(k) = \\sum_{w \\le k} \\text{costo\\_real\\_semana}_w`,
          formulaDescription: `Costo total incurrido y facturado en la ejecución del trabajo realizado para el proyecto desde el inicio hasta la semana de corte ${k}.`,
          substitutedValues: `AC(${k}) = Suma de costo_real_semana para semanas 1 a ${k} = ${Math.round(ac).toLocaleString()} ${currency}`,
          numericResult: ac,
          formattedResult: `${currency} ${Math.round(ac).toLocaleString()}`,
          interpretation: `Se han gastado ${currency} ${Math.round(ac).toLocaleString()} efectivamente en la ejecución del proyecto a la fecha de corte.`,
          sourceSheet: 'Avance_Semanal',
          sourceRows: acDetailsRows,
          steps: [
            `Filtrar todos los registros de la hoja Avance_Semanal con semana <= ${k}.`,
            `Sumar la columna costo_real_semana de cada registro aplicable.`,
            `Total costo real incurrido: AC(S${k}) = ${Math.round(ac).toLocaleString()} ${currency}.`,
          ],
        };

      case 'CV':
        return {
          metricKey: 'CV',
          metricName: 'Variación del Costo',
          acronym: 'CV',
          formula: 'CV = EV - AC',
          formulaDescription: 'Monto del déficit o superávit presupuestario a un momento dado. Un valor positivo indica que el costo real es inferior al valor ganado (bajo presupuesto).',
          substitutedValues: `CV = ${Math.round(ev).toLocaleString()} - ${Math.round(ac).toLocaleString()} = ${Math.round(cv).toLocaleString()} ${currency}`,
          numericResult: cv,
          formattedResult: `${cv >= 0 ? '+' : ''}${currency} ${Math.round(cv).toLocaleString()}`,
          interpretation: cv >= 0
            ? `Superávit de costos: El proyecto está ahorrando ${currency} ${Math.round(cv).toLocaleString()} frente al presupuesto planificado para el trabajo realizado.`
            : `Sobrecosto detectado: El proyecto ha gastado ${currency} ${Math.round(Math.abs(cv)).toLocaleString()} más que el valor presupuestado del trabajo realizado a la fecha.`,
          sourceSheet: 'Calculado de EV y AC',
          sourceRows: [
            { sheet: 'Cálculo EV', concepto: 'Valor Ganado (EV)', valorOriginal: ev, contribucion: ev },
            { sheet: 'Cálculo AC', concepto: 'Costo Real (AC)', valorOriginal: ac, contribucion: -ac },
          ],
          steps: [
            `Tomar Valor Ganado EV = ${Math.round(ev).toLocaleString()} ${currency}`,
            `Tomar Costo Real AC = ${Math.round(ac).toLocaleString()} ${currency}`,
            `Restar EV - AC = ${Math.round(cv).toLocaleString()} ${currency}`,
          ],
        };

      case 'SV':
        return {
          metricKey: 'SV',
          metricName: 'Variación del Cronograma',
          acronym: 'SV',
          formula: 'SV = EV - PV',
          formulaDescription: 'Monto en que el proyecto se encuentra adelantado o retrasado en valor ganado con respecto al cronograma planificado.',
          substitutedValues: `SV = ${Math.round(ev).toLocaleString()} - ${Math.round(pv).toLocaleString()} = ${Math.round(sv).toLocaleString()} ${currency}`,
          numericResult: sv,
          formattedResult: `${sv >= 0 ? '+' : ''}${currency} ${Math.round(sv).toLocaleString()}`,
          interpretation: sv >= 0
            ? `Adelanto temporal: Se ha completado más trabajo del originalmente programado a la semana ${k} (+${currency} ${Math.round(sv).toLocaleString()}).`
            : `Atraso en cronograma: Se ha avanzado ${currency} ${Math.round(Math.abs(sv)).toLocaleString()} menos de lo que el cronograma exigía a la semana ${k}.`,
          sourceSheet: 'Calculado de EV y PV',
          sourceRows: [
            { sheet: 'Cálculo EV', concepto: 'Valor Ganado (EV)', valorOriginal: ev, contribucion: ev },
            { sheet: 'Cálculo PV', concepto: 'Valor Planificado (PV)', valorOriginal: pv, contribucion: -pv },
          ],
          steps: [
            `Tomar Valor Ganado EV = ${Math.round(ev).toLocaleString()} ${currency}`,
            `Tomar Valor Planificado PV = ${Math.round(pv).toLocaleString()} ${currency}`,
            `Restar EV - PV = ${Math.round(sv).toLocaleString()} ${currency}`,
          ],
        };

      case 'CPI':
        return {
          metricKey: 'CPI',
          metricName: 'Índice de Desempeño del Costo',
          acronym: 'CPI',
          formula: 'CPI = \\frac{EV}{AC}',
          formulaDescription: 'Medida de la eficiencia del costo del trabajo presupuestado completado en comparación con el costo real incurrido. Un valor >= 1.0 indica rendimiento eficiente.',
          substitutedValues: cpi !== null ? `CPI = ${Math.round(ev).toLocaleString()} / ${Math.round(ac).toLocaleString()} = ${cpi.toFixed(2)}` : 'AC = 0 (Indefinido)',
          numericResult: cpi,
          formattedResult: cpi !== null ? cpi.toFixed(2) : '—',
          interpretation: cpi !== null
            ? (cpi >= 1.0
                ? `Eficiente: Por cada 1.00 ${currency} invertido, el proyecto produce ${(cpi).toFixed(2)} ${currency} de valor ganado.`
                : `Iniciativa con sobrecosto: Por cada 1.00 ${currency} gastado, el proyecto solo genera ${(cpi).toFixed(2)} ${currency} de valor (pérdida de eficiencia del ${((1 - cpi) * 100).toFixed(1)}%).`)
            : 'No es posible calcular CPI porque no se registran costos reales.',
          sourceSheet: 'Calculado de EV y AC',
          sourceRows: [
            { sheet: 'Numerador', concepto: 'Valor Ganado (EV)', valorOriginal: ev, contribucion: ev },
            { sheet: 'Denominador', concepto: 'Costo Real (AC)', valorOriginal: ac, contribucion: ac },
          ],
          steps: [
            `Dividir Valor Ganado (EV = ${Math.round(ev).toLocaleString()}) entre Costo Real (AC = ${Math.round(ac).toLocaleString()}).`,
            cpi !== null ? `Resultado CPI = ${cpi.toFixed(4)}... redondeado a ${cpi.toFixed(2)}` : 'Indefinido (división por cero).',
          ],
        };

      case 'SPI':
        return {
          metricKey: 'SPI',
          metricName: 'Índice de Desempeño del Cronograma',
          acronym: 'SPI',
          formula: 'SPI = \\frac{EV}{PV}',
          formulaDescription: 'Medida de la eficiencia del cronograma expresada como la razón entre el trabajo ganado y el planificado. SPI < 1.0 indica retraso.',
          substitutedValues: spi !== null ? `SPI = ${Math.round(ev).toLocaleString()} / ${Math.round(pv).toLocaleString()} = ${spi.toFixed(2)}` : 'PV = 0 (Indefinido)',
          numericResult: spi,
          formattedResult: spi !== null ? spi.toFixed(2) : '—',
          interpretation: spi !== null
            ? (spi >= 1.0
                ? `Buen ritmo: El avance progresa al ${(spi * 100).toFixed(1)}% del ritmo planificado (adelanto o en tiempo).`
                : `Retraso: El avance físico progresa solo al ${(spi * 100).toFixed(1)}% de la velocidad prevista en la Línea Base.`)
            : 'No es posible calcular SPI porque no hay trabajo planificado a la fecha.',
          sourceSheet: 'Calculado de EV y PV',
          sourceRows: [
            { sheet: 'Numerador', concepto: 'Valor Ganado (EV)', valorOriginal: ev, contribucion: ev },
            { sheet: 'Denominador', concepto: 'Valor Planificado (PV)', valorOriginal: pv, contribucion: pv },
          ],
          steps: [
            `Dividir Valor Ganado (EV = ${Math.round(ev).toLocaleString()}) entre Valor Planificado (PV = ${Math.round(pv).toLocaleString()}).`,
            spi !== null ? `Resultado SPI = ${spi.toFixed(4)}... redondeado a ${spi.toFixed(2)}` : 'Indefinido (división por cero).',
          ],
        };

      case 'EAC_TIPICO':
        return {
          metricKey: 'EAC_TIPICO',
          metricName: 'Estimación a la Conclusión (EAC Típico)',
          acronym: 'EAC típico',
          formula: 'EAC_{\\text{típico}} = \\frac{BAC}{CPI}',
          formulaDescription: 'Costo total pronosticado del proyecto asumiendo que las variaciones actuales de costo continuarán al mismo ritmo de eficiencia observado hasta el cierre.',
          substitutedValues: eacTipico !== null && cpi !== null ? `EAC = ${Math.round(bac).toLocaleString()} / ${cpi.toFixed(4)} = ${Math.round(eacTipico).toLocaleString()} ${currency}` : 'CPI no disponible',
          numericResult: eacTipico,
          formattedResult: eacTipico !== null ? `${currency} ${Math.round(eacTipico).toLocaleString()}` : '—',
          interpretation: eacTipico !== null
            ? `Se proyecta que el proyecto finalizará costando ${currency} ${Math.round(eacTipico).toLocaleString()} (${eacTipico > bac ? `desviación desfavorable de +${currency} ${Math.round(eacTipico - bac).toLocaleString()}` : 'dentro del BAC inicial'}).`
            : 'No es posible proyectar el EAC típico sin registro de costo real.',
          sourceSheet: 'BAC + CPI',
          sourceRows: [
            { sheet: 'Actividades', concepto: 'Presupuesto total BAC', valorOriginal: bac, contribucion: bac },
            { sheet: 'Rendimiento', concepto: 'Índice de Costo CPI', valorOriginal: cpi ?? '—', contribucion: cpi ?? 0 },
          ],
          steps: [
            `Tomar Presupuesto hasta la Conclusión BAC = ${Math.round(bac).toLocaleString()} ${currency}`,
            `Tomar Índice de Costo observado CPI = ${cpi !== null ? cpi.toFixed(4) : 'N/A'}`,
            eacTipico !== null ? `Calcular BAC / CPI = ${Math.round(eacTipico).toLocaleString()} ${currency}` : 'No calculable.',
          ],
        };

      case 'EAC_OPTIMISTA':
        return {
          metricKey: 'EAC_OPTIMISTA',
          metricName: 'Estimación a la Conclusión (EAC Optimista)',
          acronym: 'EAC optimista',
          formula: 'EAC_{\\text{optimista}} = AC + (BAC - EV)',
          formulaDescription: 'Pronóstico que asume que el trabajo restante se ejecutará exactamente de acuerdo con las tarifas presupuestadas originalmente, sin variaciones adicionales.',
          substitutedValues: eacOptimista !== null ? `EAC = ${Math.round(ac).toLocaleString()} + (${Math.round(bac).toLocaleString()} - ${Math.round(ev).toLocaleString()}) = ${Math.round(eacOptimista).toLocaleString()} ${currency}` : '—',
          numericResult: eacOptimista,
          formattedResult: eacOptimista !== null ? `${currency} ${Math.round(eacOptimista).toLocaleString()}` : '—',
          interpretation: `Bajo el escenario favorable donde todo el trabajo pendiente no sufra desviaciones, el costo final será ${currency} ${eacOptimista !== null ? Math.round(eacOptimista).toLocaleString() : '—'}.`,
          sourceSheet: 'AC + BAC + EV',
          sourceRows: [
            { sheet: 'Avance_Semanal', concepto: 'Costo Real Incurrido AC', valorOriginal: ac, contribucion: ac },
            { sheet: 'Actividades', concepto: 'Trabajo Remanente (BAC - EV)', valorOriginal: bac - ev, contribucion: bac - ev },
          ],
          steps: [
            `Calcular trabajo pendiente a costo presupuestado: BAC - EV = ${Math.round(bac - ev).toLocaleString()} ${currency}`,
            `Sumar costos reales ya desembolsados: AC = ${Math.round(ac).toLocaleString()} ${currency}`,
            `Total EAC Optimista = ${eacOptimista !== null ? Math.round(eacOptimista).toLocaleString() : '—'} ${currency}`,
          ],
        };

      case 'EAC_PESIMISTA':
        return {
          metricKey: 'EAC_PESIMISTA',
          metricName: 'Estimación a la Conclusión (EAC Pesimista / Factores combinados)',
          acronym: 'EAC pesimista',
          formula: 'EAC_{\\text{pesimista}} = AC + \\frac{BAC - EV}{CPI \\times SPI}',
          formulaDescription: 'Pronóstico que considera el impacto combinado de los desempeños de costo (CPI) y cronograma (SPI) sobre el costo del trabajo pendiente.',
          substitutedValues: eacPesimista !== null && cpi !== null && spi !== null ? `EAC = ${Math.round(ac).toLocaleString()} + (${Math.round(bac - ev).toLocaleString()} / (${cpi.toFixed(2)} × ${spi.toFixed(2)})) = ${Math.round(eacPesimista).toLocaleString()} ${currency}` : '—',
          numericResult: eacPesimista,
          formattedResult: eacPesimista !== null ? `${currency} ${Math.round(eacPesimista).toLocaleString()}` : '—',
          interpretation: `Bajo el escenario crítico donde tanto el retraso en el tiempo como la ineficiencia de costos sigan castigando la entrega, el costo final ascendería a ${currency} ${eacPesimista !== null ? Math.round(eacPesimista).toLocaleString() : '—'}.`,
          sourceSheet: 'AC + BAC + EV + CPI + SPI',
          sourceRows: [
            { sheet: 'Avance_Semanal', concepto: 'Costo Real AC', valorOriginal: ac, contribucion: ac },
            { sheet: 'Pendiente', concepto: 'Trabajo restante (BAC - EV)', valorOriginal: bac - ev, contribucion: bac - ev },
            { sheet: 'Índices', concepto: 'Factor combinado CPI × SPI', valorOriginal: cpi && spi ? (cpi * spi).toFixed(4) : '—', contribucion: 0 },
          ],
          steps: [
            `Calcular factor combinado: CPI × SPI = ${cpi && spi ? (cpi * spi).toFixed(4) : 'N/A'}`,
            `Ajustar trabajo restante: (BAC - EV) / (CPI × SPI) = ${cpi && spi && cpi * spi > 0 ? Math.round((bac - ev) / (cpi * spi)).toLocaleString() : 'N/A'} ${currency}`,
            `Sumar costos reales AC = ${Math.round(ac).toLocaleString()} ${currency}`,
          ],
        };

      case 'TCPI':
        return {
          metricKey: 'TCPI',
          metricName: 'Índice de Desempeño del Trabajo por Completar',
          acronym: 'TCPI (BAC)',
          formula: 'TCPI = \\frac{BAC - EV}{BAC - AC}',
          formulaDescription: 'Rendimiento de costo que debe lograrse en el trabajo restante para finalizar exactamente dentro del presupuesto BAC inicial.',
          substitutedValues: tcpi !== null ? `TCPI = (${Math.round(bac).toLocaleString()} - ${Math.round(ev).toLocaleString()}) / (${Math.round(bac).toLocaleString()} - ${Math.round(ac).toLocaleString()}) = ${Math.round(bac - ev).toLocaleString()} / ${Math.round(bac - ac).toLocaleString()} = ${tcpi.toFixed(2)}` : 'BAC = AC (Indefinido)',
          numericResult: tcpi,
          formattedResult: tcpi !== null ? tcpi.toFixed(2) : '—',
          interpretation: tcpi !== null
            ? (tcpi <= 1.0
                ? `Alcanzable con holgura: Se requiere un rendimiento de ${tcpi.toFixed(2)} (menor o igual a 1.0) en el trabajo restante para terminar dentro del BAC.`
                : `Exigencia crítica: El equipo debe rendir al ${tcpi.toFixed(2)} de eficiencia en lo que resta del proyecto (un ${((tcpi - 1) * 100).toFixed(1)}% más eficiente que el plan base) para no rebasar el presupuesto original.`)
            : 'El presupuesto BAC ha sido completamente gastado.',
          sourceSheet: 'BAC + EV + AC',
          sourceRows: [
            { sheet: 'Numerador', concepto: 'Trabajo pendiente (BAC - EV)', valorOriginal: bac - ev, contribucion: bac - ev },
            { sheet: 'Denominador', concepto: 'Fondos restantes (BAC - AC)', valorOriginal: bac - ac, contribucion: bac - ac },
          ],
          steps: [
            `Calcular trabajo que falta completar: BAC - EV = ${Math.round(bac - ev).toLocaleString()} ${currency}`,
            `Calcular fondos presupuestarios restantes: BAC - AC = ${Math.round(bac - ac).toLocaleString()} ${currency}`,
            tcpi !== null ? `Dividir (BAC - EV) / (BAC - AC) = ${tcpi.toFixed(4)}... redondeado a ${tcpi.toFixed(2)}` : 'Indefinido.',
          ],
        };

      case 'ES':
        return {
          metricKey: 'ES',
          metricName: 'Cronograma Ganado (Earned Schedule)',
          acronym: 'ES',
          formula: 'ES = C + \\frac{EV - PV_{\\text{acum}}[C]}{PV_{\\text{acum}}[C+1] - PV_{\\text{acum}}[C]}',
          formulaDescription: 'Tiempo real en que debió haberse ejecutado el valor ganado actual, expresado en unidades temporales (semanas). C es el número de semanas completas donde PVacum <= EV.',
          substitutedValues: es !== null ? `ES = ${cCount} + (${Math.round(ev).toLocaleString()} - ${Math.round(pvAcumByWeek[cCount] || 0).toLocaleString()}) / (${Math.round(pvAcumByWeek[cCount + 1] || 0).toLocaleString()} - ${Math.round(pvAcumByWeek[cCount] || 0).toLocaleString()}) = ${es.toFixed(2)} semanas` : '—',
          numericResult: es,
          formattedResult: es !== null ? `${es.toFixed(2)} sem` : '—',
          interpretation: es !== null
            ? `El valor ganado acumulado a la semana ${k} debió haberse alcanzado exactamente a la semana ${es.toFixed(2)} según el plan original.`
            : 'No es posible interpolar el cronograma ganado.',
          sourceSheet: 'LineaBase_PV (acumulada) + EV',
          sourceRows: [
            { sheet: 'Línea base', concepto: `Semanas completas acumuladas (C)`, valorOriginal: cCount, contribucion: cCount },
            { sheet: 'PV acumulado', concepto: `PV acumulado en semana C (${cCount})`, valorOriginal: pvAcumByWeek[cCount] || 0, contribucion: pvAcumByWeek[cCount] || 0 },
            { sheet: 'PV acumulado', concepto: `PV acumulado en semana C+1 (${cCount + 1})`, valorOriginal: pvAcumByWeek[cCount + 1] || 0, contribucion: pvAcumByWeek[cCount + 1] || 0 },
            { sheet: 'EV acumulado', concepto: `Valor Ganado evaluado EV(S${k})`, valorOriginal: ev, contribucion: ev },
          ],
          steps: [
            `Determinar C = número de semanas consecutivas cuyo PV acumulado es <= EV (${Math.round(ev).toLocaleString()}): C = ${cCount} semanas.`,
            `Obtener PVacum[${cCount}] = ${Math.round(pvAcumByWeek[cCount] || 0).toLocaleString()} y PVacum[${cCount + 1}] = ${Math.round(pvAcumByWeek[cCount + 1] || 0).toLocaleString()}.`,
            es !== null ? `Interpolar: ${cCount} + (${Math.round(ev).toLocaleString()} - ${Math.round(pvAcumByWeek[cCount] || 0).toLocaleString()}) / ${Math.round((pvAcumByWeek[cCount + 1] || 0) - (pvAcumByWeek[cCount] || 0)).toLocaleString()} = ${es.toFixed(2)} semanas.` : 'Indefinido.',
          ],
        };

      case 'SPIT':
        return {
          metricKey: 'SPIT',
          metricName: 'Índice de Desempeño del Cronograma en el Tiempo',
          acronym: 'SPI(t)',
          formula: `SPI(t) = \\frac{ES}{k}`,
          formulaDescription: 'Índice del cronograma ganado basado en tiempo (evita la anomalía del SPI monetario clásico que siempre converge a 1.0 al final del proyecto).',
          substitutedValues: spiT !== null && es !== null ? `SPI(t) = ${es.toFixed(2)} / ${k} = ${spiT.toFixed(2)}` : '—',
          numericResult: spiT,
          formattedResult: spiT !== null ? spiT.toFixed(2) : '—',
          interpretation: spiT !== null
            ? (spiT >= 1.0
                ? `Eficiencia de tiempo adecuada: El cronograma progresa al ${(spiT * 100).toFixed(1)}% del tiempo planificado.`
                : `Retraso temporal: El proyecto se está desplazando a solo el ${(spiT * 100).toFixed(1)}% de la velocidad temporal prevista (retraso acumulado de ${atrasoSemanas !== null ? atrasoSemanas.toFixed(2) : '—'} semanas).`)
            : 'No es posible calcular SPI(t).',
          sourceSheet: 'ES + Semana de corte',
          sourceRows: [
            { sheet: 'Cronograma Ganado', concepto: 'Cronograma Ganado (ES)', valorOriginal: es ?? '—', contribucion: es ?? 0 },
            { sheet: 'Tiempo Transcurrido', concepto: `Semana de corte evaluada (k)`, valorOriginal: k, contribucion: k },
          ],
          steps: [
            `Dividir Cronograma Ganado (ES = ${es !== null ? es.toFixed(2) : 'N/A'}) entre la semana de corte (k = ${k}).`,
            spiT !== null ? `Resultado SPI(t) = ${spiT.toFixed(4)}... redondeado a ${spiT.toFixed(2)}` : 'Indefinido.',
          ],
        };

      case 'CONTINGENCIA':
        return {
          metricKey: 'CONTINGENCIA',
          metricName: 'Contingencia Disponible y Salud Presupuestaria',
          acronym: 'Contingencia',
          formula: `\\text{Contingencia disponible} = \\text{reserva\\_contingencia} - \\sum_{w \\le k} \\text{monto\\_gastado}`,
          formulaDescription: 'Reserva monetaria remanente para mitigar riesgos conocidos. Se compara con la desviación proyectada EAC típico para verificar si el proyecto se mantiene financiable.',
          substitutedValues: `Contingencia disponible = ${reservaContingencia.toLocaleString()} - ${contingenciaGastada.toLocaleString()} = ${contingenciaDisponible.toLocaleString()} ${currency}`,
          numericResult: contingenciaDisponible,
          formattedResult: `${currency} ${contingenciaDisponible.toLocaleString()}`,
          interpretation: contingenciaDisponible >= 0
            ? `Quedan ${currency} ${contingenciaDisponible.toLocaleString()} de reserva disponible (${((contingenciaDisponible / (reservaContingencia || 1)) * 100).toFixed(1)}% de la reserva aprobada).`
            : `Alerta: Se ha excedido la reserva de contingencia aprobada en ${currency} ${Math.abs(contingenciaDisponible).toLocaleString()}.`,
          sourceSheet: 'Contingencia + Proyecto',
          sourceRows: contingenciaDetailsRows,
          steps: [
            `Reserva de contingencia aprobada en el proyecto: ${reservaContingencia.toLocaleString()} ${currency}`,
            `Suma de desembolsos de contingencia reportados hasta la semana ${k}: ${contingenciaGastada.toLocaleString()} ${currency}`,
            `Remanente disponible: ${contingenciaDisponible.toLocaleString()} ${currency}`,
            eacTipico !== null
              ? `EAC Típico (${Math.round(eacTipico).toLocaleString()} ${currency}) vs Presupuesto con contingencia (${Math.round(presupuestoConContingencia).toLocaleString()} ${currency}): ${deltaContingenciaDisponible !== null && deltaContingenciaDisponible >= 0 ? 'Cubierto con holgura' : 'Requiere escalamiento o ajuste de alcance'}.`
              : '',
          ],
        };

      default:
        return {
          metricKey,
          metricName: metricKey,
          acronym: metricKey,
          formula: '—',
          formulaDescription: 'Detalle no registrado',
          substitutedValues: '—',
          numericResult: null,
          formattedResult: '—',
          interpretation: '',
          sourceSheet: '',
          sourceRows: [],
          steps: [],
        };
    }
  };

  return {
    cutoffWeek: k,
    currency,
    presupuestoAutorizado,
    bac,
    reservaContingencia,
    duracionSemanas,
    pv,
    ev,
    ac,
    cv,
    sv,
    cpi,
    spi,
    eacOptimista,
    eacTipico,
    eacPesimista,
    etc,
    vac,
    tcpi,
    cCount,
    es,
    spiT,
    atrasoSemanas,
    duracionPronosticada,
    contingenciaGastada,
    contingenciaDisponible,
    presupuestoConContingencia,
    deltaPresupuestoAutorizado,
    deltaContingenciaDisponible,
    esEacCubiertoPorPresupuesto,
    esEacCubiertoPorContingencia,
    umbralVerde,
    umbralAmarillo,
    semaforoCpi,
    semaforoSpi,
    semaforoTcpi,
    semaforoSpiT,
    controlAccounts,
    weeklySeries,
    getCalculationDetails,
  };
}

/**
 * Formateador de moneda: enteros con separador de miles y moneda
 */
export function formatCurrencyAmount(amount: number | null | undefined, currency: string = 'PEN'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const rounded = Math.round(amount);
  return `${currency} ${rounded.toLocaleString('es-PE')}`;
}

/**
 * Formateador de índices: 2 decimales o '—' si es nulo / infinito
 */
export function formatIndexValue(index: number | null | undefined): string {
  if (index === null || index === undefined || isNaN(index) || !isFinite(index)) return '—';
  return index.toFixed(2);
}

/**
 * Formateador de variaciones con signo (+/-)
 */
export function formatVarianceAmount(variance: number | null | undefined, currency: string = 'PEN'): string {
  if (variance === null || variance === undefined || isNaN(variance)) return '—';
  const rounded = Math.round(variance);
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${currency} ${rounded.toLocaleString('es-PE')}`;
}

/**
 * Formateador de semanas con 2 decimales
 */
export function formatWeeksAmount(weeks: number | null | undefined): string {
  if (weeks === null || weeks === undefined || isNaN(weeks) || !isFinite(weeks)) return '—';
  return `${weeks.toFixed(2)} sem`;
}
