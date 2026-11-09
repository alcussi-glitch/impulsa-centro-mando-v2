/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import {
  ProjectDataset,
  ProyectoInfo,
  ValidationSummary,
  SheetValidationResult,
  ActividadItem,
  LineaBasePVItem,
  AvanceSemanalItem,
  RiesgoItem,
  RiesgosHistorialItem,
} from '../types/projectData.ts';

// Aliases de columnas admitidos
const COLUMN_ALIASES: Record<string, string> = {
  bac_mxn: 'bac',
  bac_pen: 'bac',
  bac_usd: 'bac',
  costo_real_semana_mxn: 'costo_real_semana',
  costo_real_semana_pen: 'costo_real_semana',
  costo_real_semana_usd: 'costo_real_semana',
  costo_real: 'costo_real_semana',
  monto_mxn: 'monto',
  monto_pen: 'monto',
  monto_usd: 'monto',
  autorizó: 'autorizo',
  autorizo: 'autorizo',
  'disparador / nota': 'disparador',
  'disparador/nota': 'disparador',
  disparador_nota: 'disparador',
  disparador_o_nota: 'disparador',
  codigo_actividad: 'codigo_actividad',
  codigoactividad: 'codigo_actividad',
  actividad_codigo: 'codigo_actividad',
  id_actividad: 'codigo_actividad',
};

// Hojas obligatorias y columnas requeridas
const REQUIRED_SHEET_COLUMNS: Record<string, string[]> = {
  Objetivos: ['id', 'objetivo', 'indicador', 'meta'],
  Supuestos: ['id', 'tipo', 'descripcion'],
  Interesados: ['id', 'interesado', 'rol', 'poder_1a5', 'interes_1a5'],
  Requisitos: ['id', 'tipo', 'descripcion', 'criterio_aceptacion'],
  Entregables: ['id', 'entregable', 'incluido'],
  EDT: ['codigo', 'nombre', 'nivel'],
  Actividades: ['codigo', 'actividad', 'cuenta_control', 'responsable', 'sem_inicio_plan', 'sem_fin_plan', 'BAC'],
  Hitos: ['id', 'hito', 'semana_plan'],
  LineaBase_PV: ['codigo', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'],
  Avance_Semanal: ['semana', 'codigo', 'pct_completado_acum', 'costo_real_semana'],
  Recursos: ['id', 'recurso', 'tipo'],
  RACI: ['codigo_actividad', 'persona_o_rol', 'raci'],
  Costos: ['id', 'cuenta_control', 'concepto', 'monto'],
  Riesgos: ['id', 'riesgo', 'categoria', 'estrategia', 'respuesta_planificada', 'propietario'],
  Riesgos_Historial: ['semana', 'id', 'probabilidad_1a5', 'impacto_1a5'],
  Respuestas_Riesgo: ['id_riesgo', 'accion_ejecutada', 'fecha', 'responsable'],
  Contingencia: ['fecha', 'semana', 'riesgo', 'concepto', 'monto'],
  Plan_Comunicaciones: ['audiencia', 'informacion_requerida', 'frecuencia', 'canal', 'responsable_emitir'],
  Comunicaciones: ['semana', 'comunicacion', 'audiencia'],
  Adquisiciones: ['id', 'bien_o_servicio', 'decision'],
  Calidad: ['id', 'entregable_id', 'estandar_o_criterio'],
  Incidentes: ['id', 'fecha', 'descripcion', 'responsable', 'estado'],
  Cambios: ['id', 'fecha', 'descripcion', 'solicitante', 'decision'],
  Lecciones: ['id', 'fecha', 'situacion', 'leccion'],
  Automatizaciones: ['id', 'proceso', 'categoria', 'frecuencia_mes', 'minutos_por_vez', 'riesgo_error_1a5', 'estructura_reglas_1a5'],
};

// Conversor de fechas de Excel a AAAA-MM-DD
export function formatExcelDate(value: any): string {
  if (!value) return '';
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'number') {
    // Serial date de Excel
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(value).trim();
  // Si ya es YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Si viene en formato DD/MM/YYYY o DD-MM-YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // DD/MM/YYYY
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return str;
}

// Conversor de números con formato a tipo numérico puro
export function parseFormattedNumber(value: any, isPercentage: boolean = false): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') {
    if (isPercentage && value > 1 && value <= 100) {
      return value / 100;
    }
    return value;
  }
  let str = String(value).trim();
  const hasPercent = str.includes('%');

  // Limpiar monedas, símbolos y espacios
  str = str.replace(/[$€£S/.,MXNPENUSD\s]/gi, (match) => {
    if (match === '.' || match === ',') return match;
    return '';
  });

  // Manejar separadores decimales y miles (formato latino vs anglosajón)
  if (str.includes(',') && str.includes('.')) {
    // Si la coma está después del punto: 1.000,50
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,000.50
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    // Solo tiene coma: si tiene 2 decimales suele ser decimal
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      str = str.replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  }

  // Quitar el porcentaje
  str = str.replace(/%/g, '');
  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  if (hasPercent || isPercentage) {
    return num > 1 ? num / 100 : num;
  }
  return num;
}

// Normaliza nombre de columnas aplicando alias y limpiando asteriscos de obligatoriedad
function normalizeColumnName(name: string): string {
  // Limpiar asteriscos de campos obligatorios (ej. "id *" o "id*")
  const stripped = String(name || '').replace(/\*/g, '').trim();
  const clean = stripped.toLowerCase();

  if (COLUMN_ALIASES[clean]) {
    return COLUMN_ALIASES[clean];
  }
  // Normalizar acentos y espacios
  const noAccents = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (COLUMN_ALIASES[noAccents]) {
    return COLUMN_ALIASES[noAccents];
  }
  // Casos especiales de S1 a S12
  const sMatch = clean.match(/^s(\d{1,2})$/i);
  if (sMatch) {
    return `S${sMatch[1]}`;
  }
  return clean;
}

// Encuentra hoja por nombre ignorando mayúsculas/minúsculas y espacios
function findSheetCaseInsensitive(workbook: XLSX.WorkBook, targetName: string): string | null {
  const normalizedTarget = targetName.toLowerCase().replace(/[\s_-]/g, '');
  for (const sheetName of workbook.SheetNames) {
    const normalizedSheet = sheetName.toLowerCase().replace(/[\s_-]/g, '');
    if (normalizedSheet === normalizedTarget) {
      return sheetName;
    }
  }
  return null;
}

// Convierte hoja a array de objetos normalizados
function sheetToNormalizedRows(sheet: XLSX.WorkSheet): { rows: any[]; rawHeaders: string[] } {
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  if (!json || json.length === 0) {
    return { rows: [], rawHeaders: [] };
  }

  const rawHeaders = Object.keys(json[0] || {});
  const headerMap: Record<string, string> = {};
  rawHeaders.forEach((h) => {
    headerMap[h] = normalizeColumnName(h);
  });

  const normalizedRows = json.map((row) => {
    const newRow: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      const normKey = headerMap[key] || key;
      newRow[normKey] = row[key];
    }
    return newRow;
  });

  return { rows: normalizedRows, rawHeaders };
}

// Parsea la hoja Proyecto en formato Campo | Valor
function parseProyectoSheet(sheet: XLSX.WorkSheet): ProyectoInfo | null {
  const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!data || data.length === 0) return null;

  const info: Partial<ProyectoInfo> = {};
  for (const row of data) {
    if (!row || row.length < 2) continue;
    const campo = String(row[0]).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const valor = row[1];

    if (campo.includes('nombre')) info.nombre = String(valor).trim();
    else if (campo.includes('moneda')) info.moneda = String(valor).trim();
    else if (campo.includes('presupuesto_autorizado') || campo.includes('presupuesto autorizado')) {
      info.presupuesto_autorizado = parseFormattedNumber(valor);
    } else if (campo.includes('bac')) {
      info.BAC = parseFormattedNumber(valor);
    } else if (campo.includes('reserva_contingencia') || campo.includes('contingencia')) {
      info.reserva_contingencia = parseFormattedNumber(valor);
    } else if (campo.includes('duracion') || campo.includes('duracion_semanas')) {
      info.duracion_semanas = Math.round(parseFormattedNumber(valor)) || 12;
    } else if (campo.includes('semana_corte') || campo.includes('corte')) {
      info.semana_corte = Math.round(parseFormattedNumber(valor)) || 6;
    } else if (campo.includes('patrocinador')) {
      info.patrocinador = String(valor).trim();
    } else if (campo.includes('director') || campo.includes('gerente')) {
      info.director_proyecto = String(valor).trim();
    } else if (campo.includes('fecha_inicio')) {
      info.fecha_inicio = formatExcelDate(valor);
    } else if (campo.includes('fecha_fin')) {
      info.fecha_fin_planificada = formatExcelDate(valor);
    } else if (campo.includes('umbral_alerta_cpi')) {
      info.umbral_alerta_cpi = parseFormattedNumber(valor);
    } else if (campo.includes('umbral_critico_cpi')) {
      info.umbral_critico_cpi = parseFormattedNumber(valor);
    } else if (campo.includes('umbral_alerta_spi')) {
      info.umbral_alerta_spi = parseFormattedNumber(valor);
    } else if (campo.includes('umbral_critico_spi')) {
      info.umbral_critico_spi = parseFormattedNumber(valor);
    }
  }

  // Valores predeterminados en caso de omitirse
  return {
    nombre: info.nombre || 'IMPULSA — Sistema de información con IA',
    moneda: info.moneda || 'PEN',
    presupuesto_autorizado: info.presupuesto_autorizado || 850000,
    BAC: info.BAC || 770000,
    reserva_contingencia: info.reserva_contingencia || 80000,
    duracion_semanas: info.duracion_semanas || 12,
    semana_corte: info.semana_corte || 6,
    patrocinador: info.patrocinador || 'MTPE / Alianza Tech Perú',
    director_proyecto: info.director_proyecto || 'Ing. Carlos Mendoza (PMP®)',
    fecha_inicio: info.fecha_inicio || '2024-04-08',
    fecha_fin_planificada: info.fecha_fin_planificada || '2024-06-30',
    umbral_alerta_cpi: info.umbral_alerta_cpi || 0.95,
    umbral_critico_cpi: info.umbral_critico_cpi || 0.9,
    umbral_alerta_spi: info.umbral_alerta_spi || 0.95,
    umbral_critico_spi: info.umbral_critico_spi || 0.9,
  };
}

// Función principal de parseo y validación de libro Excel
export function parseAndValidateWorkbook(
  arrayBuffer: ArrayBuffer,
  fileName: string = 'datos_proyecto.xlsx'
): ValidationSummary {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const results: SheetValidationResult[] = [];
  const parsedData: Record<string, any> = {};

  // Ignorar LEEME y Diccionario explícitamente (Requisito 1)
  const ignoredSheets = ['leeme', 'diccionario', 'readme'];

  // 1. Validar hoja Proyecto (formato campo | valor)
  const proyectoSheetName = findSheetCaseInsensitive(workbook, 'Proyecto');
  let missingProyecto = false;

  if (proyectoSheetName) {
    const proyectoSheet = workbook.Sheets[proyectoSheetName];
    const proyectoInfo = parseProyectoSheet(proyectoSheet);
    if (proyectoInfo) {
      parsedData.proyecto = proyectoInfo;
      results.push({
        sheetName: 'Proyecto',
        rowsCount: 1,
        status: 'ok',
        message: `Parámetros cargados: Presupuesto ${proyectoInfo.moneda} ${proyectoInfo.presupuesto_autorizado.toLocaleString()}, BAC ${proyectoInfo.moneda} ${proyectoInfo.BAC.toLocaleString()}, ${proyectoInfo.duracion_semanas} semanas.`,
      });
    } else {
      missingProyecto = true;
      results.push({
        sheetName: 'Proyecto',
        rowsCount: 0,
        status: 'warning',
        message: 'Hoja Proyecto presente pero sin pares válidos campo │ valor. Se requerirá confirmación manual.',
      });
    }
  } else {
    missingProyecto = true;
    results.push({
      sheetName: 'Proyecto',
      rowsCount: 0,
      status: 'warning',
      message: 'No se encontró la hoja «Proyecto». Puedes completar los parámetros clave en el formulario.',
    });
  }

  // 2. Procesar cada una de las demás hojas obligatorias
  for (const [sheetKey, requiredCols] of Object.entries(REQUIRED_SHEET_COLUMNS)) {
    const actualSheetName = findSheetCaseInsensitive(workbook, sheetKey);
    const keyLower = sheetKey.toLowerCase();

    if (!actualSheetName) {
      results.push({
        sheetName: sheetKey,
        rowsCount: 0,
        status: 'error',
        message: `Hoja requerida «${sheetKey}» no encontrada en el libro.`,
      });
      continue;
    }

    const sheet = workbook.Sheets[actualSheetName];
    const { rows, rawHeaders } = sheetToNormalizedRows(sheet);

    if (rows.length === 0) {
      results.push({
        sheetName: sheetKey,
        rowsCount: 0,
        status: 'warning',
        message: `La hoja «${sheetKey}» está vacía (0 filas de datos).`,
      });
      parsedData[keyLower] = [];
      continue;
    }

    // Verificar columnas obligatorias
    const presentKeys = Object.keys(rows[0] || {}).map((k) => k.toLowerCase());
    const missingCols: string[] = [];

    for (const reqCol of requiredCols) {
      const normReq = reqCol.toLowerCase();
      // Si es S1..S12 de LineaBase_PV
      if (normReq.startsWith('s') && !isNaN(Number(normReq.substring(1)))) {
        const foundS = presentKeys.some((pk) => pk === normReq);
        if (!foundS) missingCols.push(reqCol);
      } else {
        const found = presentKeys.some((pk) => pk === normReq);
        if (!found) missingCols.push(reqCol);
      }
    }

    if (missingCols.length > 0) {
      results.push({
        sheetName: sheetKey,
        rowsCount: rows.length,
        status: 'error',
        message: `Faltan columnas obligatorias: ${missingCols.join(', ')}.`,
      });
      parsedData[keyLower] = rows;
      continue;
    }

    // Limpieza y tipado de datos específicos
    const cleanedRows = rows.map((r, idx) => {
      const cleaned = { ...r };

      // Conversión de fechas comunes
      if (cleaned.fecha) cleaned.fecha = formatExcelDate(cleaned.fecha);
      if (cleaned.fecha_inicio) cleaned.fecha_inicio = formatExcelDate(cleaned.fecha_inicio);
      if (cleaned.fecha_fin) cleaned.fecha_fin = formatExcelDate(cleaned.fecha_fin);

      // Conversión de números
      if (cleaned.bac !== undefined) cleaned.BAC = parseFormattedNumber(cleaned.bac || cleaned.BAC);
      if (cleaned.monto !== undefined) cleaned.monto = parseFormattedNumber(cleaned.monto);
      if (cleaned.costo_real_semana !== undefined) {
        cleaned.costo_real_semana = parseFormattedNumber(cleaned.costo_real_semana);
      }
      if (cleaned.pct_completado_acum !== undefined) {
        cleaned.pct_completado_acum = parseFormattedNumber(cleaned.pct_completado_acum, true);
      }
      if (cleaned.semana !== undefined) cleaned.semana = Math.round(parseFormattedNumber(cleaned.semana));
      if (cleaned.semana_plan !== undefined) cleaned.semana_plan = Math.round(parseFormattedNumber(cleaned.semana_plan));
      if (cleaned.sem_inicio_plan !== undefined) {
        cleaned.sem_inicio_plan = Math.round(parseFormattedNumber(cleaned.sem_inicio_plan));
      }
      if (cleaned.sem_fin_plan !== undefined) {
        cleaned.sem_fin_plan = Math.round(parseFormattedNumber(cleaned.sem_fin_plan));
      }
      if (cleaned.poder_1a5 !== undefined) cleaned.poder_1a5 = Number(cleaned.poder_1a5);
      if (cleaned.interes_1a5 !== undefined) cleaned.interes_1a5 = Number(cleaned.interes_1a5);
      if (cleaned.probabilidad_1a5 !== undefined) cleaned.probabilidad_1a5 = Number(cleaned.probabilidad_1a5);
      if (cleaned.impacto_1a5 !== undefined) cleaned.impacto_1a5 = Number(cleaned.impacto_1a5);

      // S1 a S12
      for (let s = 1; s <= 12; s++) {
        const sKey = `s${s}`;
        const upperS = `S${s}`;
        if (cleaned[sKey] !== undefined || cleaned[upperS] !== undefined) {
          cleaned[upperS] = parseFormattedNumber(cleaned[sKey] !== undefined ? cleaned[sKey] : cleaned[upperS]);
        }
      }

      return cleaned;
    });

    parsedData[keyLower] = cleanedRows;
    results.push({
      sheetName: sheetKey,
      rowsCount: cleanedRows.length,
      status: 'ok',
      message: `${cleanedRows.length} fila(s) leída(s) correctamente con columnas verificadas.`,
    });
  }

  // Guardar Catalogo_Plantillas si existe (Requisito 1)
  const plantillasSheet = findSheetCaseInsensitive(workbook, 'Catalogo_Plantillas');
  if (plantillasSheet) {
    const { rows } = sheetToNormalizedRows(workbook.Sheets[plantillasSheet]);
    parsedData.catalogo_plantillas = rows;
    results.push({
      sheetName: 'Catalogo_Plantillas',
      rowsCount: rows.length,
      status: 'ok',
      message: `Configuración de plantillas guardada (${rows.length} registros).`,
    });
  }

  // 3. Requisito 3: Si Riesgos no trae probabilidad_1a5 e impacto_1a5, tomarlos de la semana más reciente de Riesgos_Historial
  const riesgos: RiesgoItem[] = parsedData.riesgos || [];
  const historial: RiesgosHistorialItem[] = parsedData.riesgos_historial || [];

  if (riesgos.length > 0 && historial.length > 0) {
    let patchedCount = 0;
    riesgos.forEach((r) => {
      const needsProb = !r.probabilidad_1a5 || isNaN(r.probabilidad_1a5) || r.probabilidad_1a5 === 0;
      const needsImp = !r.impacto_1a5 || isNaN(r.impacto_1a5) || r.impacto_1a5 === 0;

      if (needsProb || needsImp) {
        // Buscar en el historial para este riesgo la semana más reciente
        const entries = historial
          .filter((h) => String(h.id).trim().toLowerCase() === String(r.id).trim().toLowerCase())
          .sort((a, b) => (Number(b.semana) || 0) - (Number(a.semana) || 0));

        if (entries.length > 0) {
          const latest = entries[0];
          if (needsProb) r.probabilidad_1a5 = Number(latest.probabilidad_1a5) || 3;
          if (needsImp) r.impacto_1a5 = Number(latest.impacto_1a5) || 3;
          patchedCount++;
        }
      }
      // Calcular severidad
      r.severidad = (Number(r.probabilidad_1a5) || 1) * (Number(r.impacto_1a5) || 1);
    });

    if (patchedCount > 0) {
      const rResult = results.find((res) => res.sheetName === 'Riesgos');
      if (rResult) {
        rResult.message += ` (${patchedCount} valores de probabilidad/impacto tomados del historial reciente).`;
      }
    }
  }

  // 4. Integridad Referencial y Reglas de Negocio (Requisito 5)
  const actividades: ActividadItem[] = parsedData.actividades || [];
  const validActivityCodes = new Set(actividades.map((a) => String(a.codigo).trim().toUpperCase()));
  const activityBacMap = new Map<string, number>();
  actividades.forEach((a) => {
    activityBacMap.set(String(a.codigo).trim().toUpperCase(), Number(a.BAC) || 0);
  });

  // 4.1 Códigos de LineaBase_PV existen en Actividades y suma de S1..S12 iguala BAC (tolerancia 1)
  const lineaBase: LineaBasePVItem[] = parsedData.lineabase_pv || [];
  const lbResult = results.find((r) => r.sheetName === 'LineaBase_PV');

  if (lineaBase.length > 0 && lbResult && lbResult.status !== 'error') {
    const lbIssues: string[] = [];

    lineaBase.forEach((row, idx) => {
      const code = String(row.codigo || '').trim().toUpperCase();
      const rowNum = idx + 2; // encabezado + 1-indexed

      if (!code) {
        lbIssues.push(`Fila ${rowNum}: El código de actividad está vacío.`);
        return;
      }

      if (!validActivityCodes.has(code)) {
        lbIssues.push(`Fila ${rowNum}: El código «${code}» no existe en Actividades.`);
        return;
      }

      // Sumar S1 a S12
      let sumPV = 0;
      for (let s = 1; s <= 12; s++) {
        sumPV += Number(row[`S${s}`]) || 0;
      }
      row.total_pv = sumPV;

      const actBAC = activityBacMap.get(code) || 0;
      const diff = Math.abs(sumPV - actBAC);

      if (diff > 1.0) {
        lbIssues.push(
          `Fila ${rowNum} (${code}): La suma de S1..S12 (${sumPV.toLocaleString()}) no iguala el BAC de la actividad (${actBAC.toLocaleString()}) con tolerancia de 1.`
        );
      }
    });

    if (lbIssues.length > 0) {
      lbResult.status = 'error';
      lbResult.message = `En LineaBase_PV: ${lbIssues[0]} ${lbIssues.length > 1 ? `(+${lbIssues.length - 1} observaciones más)` : ''}`;
      lbResult.details = lbIssues;
    }
  }

  // 4.2 Códigos de Avance_Semanal existen en Actividades y el % acumulado no disminuye entre semanas
  const avanceSemanal: AvanceSemanalItem[] = parsedData.avance_semanal || [];
  const asResult = results.find((r) => r.sheetName === 'Avance_Semanal');

  if (avanceSemanal.length > 0 && asResult && asResult.status !== 'error') {
    const asIssues: string[] = [];
    const actWeeklyProgress = new Map<string, Array<{ semana: number; pct: number; rowNum: number }>>();

    avanceSemanal.forEach((row, idx) => {
      const code = String(row.codigo || '').trim().toUpperCase();
      const rowNum = idx + 2;

      if (!code) {
        asIssues.push(`Fila ${rowNum}: Código de actividad vacío.`);
        return;
      }

      if (!validActivityCodes.has(code)) {
        asIssues.push(`Fila ${rowNum}: El código «${code}» no existe en Actividades.`);
        return;
      }

      const sem = Number(row.semana) || 0;
      const pct = Number(row.pct_completado_acum) || 0;

      if (!actWeeklyProgress.has(code)) {
        actWeeklyProgress.set(code, []);
      }
      actWeeklyProgress.get(code)!.push({ semana: sem, pct, rowNum });
    });

    // Validar que no disminuya el avance
    actWeeklyProgress.forEach((history, code) => {
      history.sort((a, b) => a.semana - b.semana);
      for (let i = 1; i < history.length; i++) {
        if (history[i].pct < history[i - 1].pct - 0.0001) {
          asIssues.push(
            `Actividad «${code}»: El avance acumulado disminuyó de ${(history[i - 1].pct * 100).toFixed(0)}% (Semana ${history[i - 1].semana}) a ${(history[i].pct * 100).toFixed(0)}% (Semana ${history[i].semana}, fila ${history[i].rowNum}).`
          );
        }
      }
    });

    if (asIssues.length > 0) {
      asResult.status = 'error';
      asResult.message = `En Avance_Semanal: ${asIssues[0]} ${asIssues.length > 1 ? `(+${asIssues.length - 1} más)` : ''}`;
      asResult.details = asIssues;
    }
  }

  // 4.3 Probabilidad e impacto entre 1 y 5
  const riesgosResult = results.find((r) => r.sheetName === 'Riesgos');
  if (riesgos.length > 0 && riesgosResult && riesgosResult.status !== 'error') {
    const rIssues: string[] = [];
    riesgos.forEach((r, idx) => {
      const p = Number(r.probabilidad_1a5);
      const i = Number(r.impacto_1a5);
      const rowNum = idx + 2;

      if (isNaN(p) || p < 1 || p > 5) {
        rIssues.push(`Fila ${rowNum} (${r.id}): Probabilidad (${r.probabilidad_1a5}) fuera de rango 1 a 5.`);
      }
      if (isNaN(i) || i < 1 || i > 5) {
        rIssues.push(`Fila ${rowNum} (${r.id}): Impacto (${r.impacto_1a5}) fuera de rango 1 a 5.`);
      }
    });

    if (rIssues.length > 0) {
      riesgosResult.status = 'warning';
      riesgosResult.message = `En Riesgos: ${rIssues[0]}`;
      riesgosResult.details = rIssues;
    }
  }

  const hasErrors = results.some((r) => r.status === 'error');
  const hasWarnings = results.some((r) => r.status === 'warning');
  const totalRowsRead = results.reduce((acc, r) => acc + r.rowsCount, 0);

  return {
    isValid: !hasErrors,
    hasErrors,
    hasWarnings,
    totalSheetsFound: results.filter((r) => r.rowsCount > 0).length,
    totalRowsRead,
    results,
    parsedDataset: parsedData as Partial<ProjectDataset>,
    missingProyectoSheet: missingProyecto,
  };
}

// Definición estructurada de hojas, dominios y columnas del PMBOK
export interface SheetColumnMeta {
  name: string;
  required: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date';
}

export interface SheetDefinitionMeta {
  name: string;
  domain: string;
  description: string;
  columns: SheetColumnMeta[];
}

export const SHEETS_META: SheetDefinitionMeta[] = [
    {
      name: 'Proyecto',
      domain: 'Gobernanza y Dirección',
      description: 'Configuración general, moneda, presupuestos (BAC y Contingencia), fechas e índices de umbral EVM.',
      columns: [
        { name: 'campo', required: true },
        { name: 'valor', required: true },
      ],
    },
    {
      name: 'Objetivos',
      domain: 'Fase de Inicio',
      description: 'Metas SMART específicas, medibles y auditables del proyecto.',
      columns: [
        { name: 'id', required: true },
        { name: 'objetivo', required: true },
        { name: 'indicador', required: true },
        { name: 'meta', required: true },
      ],
    },
    {
      name: 'Supuestos',
      domain: 'Alcance y Contexto',
      description: 'Supuestos y restricciones operativas, técnicas y organizacionales.',
      columns: [
        { name: 'id', required: true },
        { name: 'tipo', required: true },
        { name: 'descripcion', required: true },
      ],
    },
    {
      name: 'Interesados',
      domain: 'Gestión de Stakeholders',
      description: 'Matriz de partes interesadas con nivel de poder e interés (escala 1 a 5).',
      columns: [
        { name: 'id', required: true },
        { name: 'interesado', required: true },
        { name: 'rol', required: true },
        { name: 'poder_1a5', required: true },
        { name: 'interes_1a5', required: true },
      ],
    },
    {
      name: 'Requisitos',
      domain: 'Gestión del Alcance',
      description: 'Catálogo de requerimientos técnicos y funcionales con criterios de aceptación.',
      columns: [
        { name: 'id', required: true },
        { name: 'tipo', required: true },
        { name: 'descripcion', required: true },
        { name: 'criterio_aceptacion', required: true },
      ],
    },
    {
      name: 'Entregables',
      domain: 'Gestión del Alcance',
      description: 'Inventario de productos y entregables pactados dentro del alcance.',
      columns: [
        { name: 'id', required: true },
        { name: 'entregable', required: true },
        { name: 'incluido', required: true },
      ],
    },
    {
      name: 'EDT',
      domain: 'Fase de Planificación',
      description: 'Estructura de Desglose del Trabajo (WBS) jerarquizada por niveles de control.',
      columns: [
        { name: 'codigo', required: true },
        { name: 'nombre', required: true },
        { name: 'nivel', required: true },
      ],
    },
    {
      name: 'Actividades',
      domain: 'Fase de Planificación',
      description: 'Diccionario de actividades del cronograma, cuentas de control, fechas y presupuesto BAC.',
      columns: [
        { name: 'codigo', required: true },
        { name: 'actividad', required: true },
        { name: 'cuenta_control', required: true },
        { name: 'responsable', required: true },
        { name: 'sem_inicio_plan', required: true },
        { name: 'sem_fin_plan', required: true },
        { name: 'BAC', required: true },
      ],
    },
    {
      name: 'Hitos',
      domain: 'Cronograma y Ruta Crítica',
      description: 'Puntos de control temporal clave y compromisos contractuales de la ruta crítica.',
      columns: [
        { name: 'id', required: true },
        { name: 'hito', required: true },
        { name: 'semana_plan', required: true },
      ],
    },
    {
      name: 'LineaBase_PV',
      domain: 'Gestión de Costos y EVM',
      description: 'Valor Planificado semanal (S1 a S12). La suma de cada fila debe igualar el BAC de la actividad.',
      columns: [
        { name: 'codigo', required: true },
        { name: 'S1', required: true },
        { name: 'S2', required: true },
        { name: 'S3', required: true },
        { name: 'S4', required: true },
        { name: 'S5', required: true },
        { name: 'S6', required: true },
        { name: 'S7', required: true },
        { name: 'S8', required: true },
        { name: 'S9', required: true },
        { name: 'S10', required: true },
        { name: 'S11', required: true },
        { name: 'S12', required: true },
      ],
    },
    {
      name: 'Avance_Semanal',
      domain: 'Monitoreo y Control EVM',
      description: 'Seguimiento real: % completado acumulado y costo real de la semana (AC). El % no debe disminuir.',
      columns: [
        { name: 'semana', required: true },
        { name: 'codigo', required: true },
        { name: 'pct_completado_acum', required: true },
        { name: 'costo_real_semana', required: true },
      ],
    },
    {
      name: 'Recursos',
      domain: 'Gestión de Recursos',
      description: 'Catálogo de recursos humanos, técnicos y materiales asignados al proyecto.',
      columns: [
        { name: 'id', required: true },
        { name: 'recurso', required: true },
        { name: 'tipo', required: true },
      ],
    },
    {
      name: 'RACI',
      domain: 'Gobernanza y Roles',
      description: 'Matriz de asignación de responsabilidades por actividad (R, A, C, I).',
      columns: [
        { name: 'codigo_actividad', required: true },
        { name: 'persona_o_rol', required: true },
        { name: 'raci', required: true },
      ],
    },
    {
      name: 'Costos',
      domain: 'Gestión Presupuestaria',
      description: 'Desglose presupuestario por cuenta de control y conceptos de gasto autorizados.',
      columns: [
        { name: 'id', required: true },
        { name: 'cuenta_control', required: true },
        { name: 'concepto', required: true },
        { name: 'monto', required: true },
      ],
    },
    {
      name: 'Riesgos',
      domain: 'Gestión de Incertidumbre',
      description: 'Inventario de riesgos, probabilidad e impacto (1 a 5), estrategia y plan de contingencia.',
      columns: [
        { name: 'id', required: true },
        { name: 'riesgo', required: true },
        { name: 'categoria', required: true },
        { name: 'probabilidad_1a5', required: true },
        { name: 'impacto_1a5', required: true },
        { name: 'estrategia', required: true },
        { name: 'respuesta_planificada', required: true },
        { name: 'propietario', required: true },
      ],
    },
    {
      name: 'Riesgos_Historial',
      domain: 'Gestión de Incertidumbre',
      description: 'Evolución semanal de la severidad (probabilidad e impacto) de cada riesgo.',
      columns: [
        { name: 'semana', required: true },
        { name: 'id', required: true },
        { name: 'probabilidad_1a5', required: true },
        { name: 'impacto_1a5', required: true },
      ],
    },
    {
      name: 'Respuestas_Riesgo',
      domain: 'Gestión de Incertidumbre',
      description: 'Registro de acciones de mitigación ejecutadas, fechas y responsables.',
      columns: [
        { name: 'id_riesgo', required: true },
        { name: 'accion_ejecutada', required: true },
        { name: 'fecha', required: true },
        { name: 'responsable', required: true },
      ],
    },
    {
      name: 'Contingencia',
      domain: 'Gestión Financiera',
      description: 'Bitácora de movimientos y consumos de la reserva de contingencia.',
      columns: [
        { name: 'fecha', required: true },
        { name: 'semana', required: true },
        { name: 'riesgo', required: true },
        { name: 'concepto', required: true },
        { name: 'monto', required: true },
      ],
    },
    {
      name: 'Plan_Comunicaciones',
      domain: 'Gestión de Comunicaciones',
      description: 'Estrategia formal: audiencias, requerimientos, frecuencia, canales y emisores.',
      columns: [
        { name: 'audiencia', required: true },
        { name: 'informacion_requerida', required: true },
        { name: 'frecuencia', required: true },
        { name: 'canal', required: true },
        { name: 'responsable_emitir', required: true },
      ],
    },
    {
      name: 'Comunicaciones',
      domain: 'Gestión de Comunicaciones',
      description: 'Bitácora de reportes emitidos, minutas de comités y notas de avance.',
      columns: [
        { name: 'semana', required: true },
        { name: 'comunicacion', required: true },
        { name: 'audiencia', required: true },
      ],
    },
    {
      name: 'Adquisiciones',
      domain: 'Gestión de Compras',
      description: 'Registro de contrataciones, bienes y servicios con decisión de compra.',
      columns: [
        { name: 'id', required: true },
        { name: 'bien_o_servicio', required: true },
        { name: 'decision', required: true },
      ],
    },
    {
      name: 'Calidad',
      domain: 'Gestión de Calidad',
      description: 'Estándares de calidad y criterios de verificación técnica por entregable.',
      columns: [
        { name: 'id', required: true },
        { name: 'entregable_id', required: true },
        { name: 'estandar_o_criterio', required: true },
      ],
    },
    {
      name: 'Incidentes',
      domain: 'Monitoreo Operativo',
      description: 'Registro de problemas e incidencias no previstas y estado de resolución.',
      columns: [
        { name: 'id', required: true },
        { name: 'fecha', required: true },
        { name: 'descripcion', required: true },
        { name: 'responsable', required: true },
        { name: 'estado', required: true },
      ],
    },
    {
      name: 'Cambios',
      domain: 'Control Integrado de Cambios',
      description: 'Registro de solicitudes de cambio (Change Requests), impacto y decisión del comité.',
      columns: [
        { name: 'id', required: true },
        { name: 'fecha', required: true },
        { name: 'descripcion', required: true },
        { name: 'solicitante', required: true },
        { name: 'decision', required: true },
      ],
    },
    {
      name: 'Lecciones',
      domain: 'Gestión del Conocimiento',
      description: 'Repositorio de situaciones, aciertos y lecciones aprendidas del proyecto.',
      columns: [
        { name: 'id', required: true },
        { name: 'fecha', required: true },
        { name: 'situacion', required: true },
        { name: 'leccion', required: true },
      ],
    },
    {
      name: 'Automatizaciones',
      domain: 'Operaciones e IA',
      description: 'Catálogo de flujos automatizados, frecuencia mensual, ahorro en minutos y nivel de riesgo.',
      columns: [
        { name: 'id', required: true },
        { name: 'proceso', required: true },
        { name: 'categoria', required: true },
        { name: 'frecuencia_mes', required: true },
        { name: 'minutos_por_vez', required: true },
        { name: 'riesgo_error_1a5', required: true },
        { name: 'estructura_reglas_1a5', required: true },
      ],
    },
    {
      name: 'Catalogo_Plantillas',
      domain: 'Activos de Procesos (PMBOK)',
      description: 'Configuración para la biblioteca y generador de los 28 artefactos documentales.',
      columns: [
        { name: 'codigo', required: false },
        { name: 'fase', required: false },
        { name: 'nombre_documento', required: false },
        { name: 'formato', required: false },
        { name: 'obligatorio', required: false },
      ],
    },
  ];

// 9. Requisito: Botón «Descargar plantilla vacía» generado con ExcelJS y estilos institucionales
export async function generateEmptyTemplate(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'IMPULSA - Continental Florida University';
  wb.lastModifiedBy = 'Centro de Mando IMPULSA';
  wb.created = new Date();

  const NAVY = 'FF0A2540';
  const RED_ALERT = 'FFE01038';
  const BORDER_COLOR = 'FFE2E8F0';
  const ICE_GRAY = 'FFF7FAFC';
  const INK_TEXT = 'FF2D3748';

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
  };

  // =========================================================================
  // 1. HOJA LEEME (Requisitos 3, 4 y 5)
  // =========================================================================
  const wsLeeme = wb.addWorksheet('LEEME');
  wsLeeme.properties.tabColor = { argb: NAVY };

  // Congelar encabezado de la tabla descriptiva en fila 12
  wsLeeme.views = [{ state: 'frozen', ySplit: 12 }];

  // Aplicar fondo gris hielo #F7FAFC a la zona de encabezado
  for (let r = 1; r <= 11; r++) {
    const row = wsLeeme.getRow(r);
    for (let c = 1; c <= 4; c++) {
      const cell = row.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: ICE_GRAY },
      };
    }
  }

  // Título "IMPULSA" en Arial Bold grande, color azul marino #0A2540 (Requisito 5)
  const cellTitle = wsLeeme.getCell('A2');
  cellTitle.value = 'IMPULSA';
  cellTitle.font = { name: 'Arial', size: 24, bold: true, color: { argb: NAVY } };

  const cellSubtitle = wsLeeme.getCell('A3');
  cellSubtitle.value = 'Centro de Mando · Plantilla de Datos';
  cellSubtitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: INK_TEXT } };

  const cellInst = wsLeeme.getCell('A4');
  cellInst.value = 'Continental Florida University · Professional Certificate en IA para la Gestión de Proyectos';
  cellInst.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF718096' } };

  // Instrucciones breves
  wsLeeme.getCell('A6').value = 'GUÍA RÁPIDA DE USO DE LA PLANTILLA:';
  wsLeeme.getCell('A6').font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY } };

  wsLeeme.getCell('A7').value = '1. No modifiques los nombres de las pestañas ni alteres el orden de las columnas.';
  wsLeeme.getCell('A7').font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };

  wsLeeme.getCell('A8').value = {
    richText: [
      { text: '2. Las columnas marcadas con asterisco (', font: { name: 'Arial', size: 9, color: { argb: INK_TEXT } } },
      { text: '*', font: { name: 'Arial', size: 10, bold: true, color: { argb: RED_ALERT } } },
      { text: ') en rojo #E01038 son OBLIGATORIAS para calcular valor ganado (EVM), cronograma y matriz de riesgos.', font: { name: 'Arial', size: 9, color: { argb: INK_TEXT } } },
    ],
  };

  wsLeeme.getCell('A9').value = '3. Formato de fechas: AAAA-MM-DD (ejemplo: 2024-04-08). Formato de importes: valores numéricos sin símbolos monetarios.';
  wsLeeme.getCell('A9').font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };

  wsLeeme.getCell('A10').value = '4. En la hoja LineaBase_PV, la suma de las semanas S1 a S12 de cada actividad debe ser igual a su BAC en la hoja Actividades.';
  wsLeeme.getCell('A10').font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };

  // Encabezados de la tabla guía en fila 12
  const leemeHeaders = ['Hoja', 'Dominio PMBOK 8', 'Propósito y descripción', 'Columnas obligatorias (*)'];
  const headerRowLeeme = wsLeeme.getRow(12);
  headerRowLeeme.height = 28;

  leemeHeaders.forEach((h, idx) => {
    const cell = headerRowLeeme.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  // Filas con la explicación de cada hoja
  SHEETS_META.forEach((meta, mIdx) => {
    const rowNum = 13 + mIdx;
    const row = wsLeeme.getRow(rowNum);
    row.height = 22;

    const reqColsStr = meta.columns
      .filter((c) => c.required)
      .map((c) => `${c.name}*`)
      .join(', ');

    const c1 = row.getCell(1);
    c1.value = meta.name;
    c1.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY } };
    c1.border = thinBorder;
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ICE_GRAY } };

    const c2 = row.getCell(2);
    c2.value = meta.domain;
    c2.font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };
    c2.border = thinBorder;
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ICE_GRAY } };

    const c3 = row.getCell(3);
    c3.value = meta.description;
    c3.font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };
    c3.border = thinBorder;
    c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ICE_GRAY } };

    const c4 = row.getCell(4);
    c4.value = reqColsStr || 'Todas opcionales';
    c4.font = { name: 'Arial', size: 9, color: { argb: reqColsStr ? RED_ALERT : INK_TEXT } };
    c4.border = thinBorder;
    c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ICE_GRAY } };
  });

  // Ancho de columnas en LEEME
  wsLeeme.getColumn(1).width = 22;
  wsLeeme.getColumn(2).width = 28;
  wsLeeme.getColumn(3).width = 65;
  wsLeeme.getColumn(4).width = 45;

  // =========================================================================
  // 2. HOJA PROYECTO (campo | valor)
  // =========================================================================
  const wsProyecto = wb.addWorksheet('Proyecto');
  wsProyecto.properties.tabColor = { argb: NAVY };
  wsProyecto.views = [{ state: 'frozen', ySplit: 1 }];

  const headerRowProyecto = wsProyecto.getRow(1);
  headerRowProyecto.height = 28;

  ['campo', 'valor'].forEach((colName, cIdx) => {
    const cell = headerRowProyecto.getCell(cIdx + 1);
    cell.value = {
      richText: [
        { text: colName, font: { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 } },
        { text: ' *', font: { name: 'Arial', bold: true, color: { argb: RED_ALERT }, size: 10 } },
      ],
    };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  wsProyecto.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 2 } };

  const proyectoValoresBase = [
    ['nombre', 'IMPULSA — Sistema de información con IA para la búsqueda de empleo en el Perú'],
    ['moneda', 'PEN'],
    ['presupuesto_autorizado', 850000],
    ['BAC', 770000],
    ['reserva_contingencia', 80000],
    ['duracion_semanas', 12],
    ['semana_corte', 6],
    ['patrocinador', 'MTPE / Alianza Tech Perú'],
    ['director_proyecto', 'Ing. Carlos Mendoza (PMP®)'],
    ['fecha_inicio', '2024-04-08'],
    ['fecha_fin_planificada', '2024-06-30'],
    ['umbral_alerta_cpi', 0.95],
    ['umbral_critico_cpi', 0.9],
    ['umbral_alerta_spi', 0.95],
    ['umbral_critico_spi', 0.9],
  ];

  proyectoValoresBase.forEach((pair, idx) => {
    const row = wsProyecto.getRow(idx + 2);
    row.height = 20;

    const cellK = row.getCell(1);
    cellK.value = pair[0];
    cellK.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY } };
    cellK.border = thinBorder;

    const cellV = row.getCell(2);
    cellV.value = pair[1];
    cellV.font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };
    cellV.border = thinBorder;
  });

  wsProyecto.getColumn(1).width = 28;
  wsProyecto.getColumn(2).width = 75;

  // =========================================================================
  // 3. RESTO DE HOJAS CON FORMATO EXCELJS COMPLETO (Requisito 2)
  // =========================================================================
  const otherSheets = SHEETS_META.filter((m) => m.name !== 'Proyecto');

  for (const sheetMeta of otherSheets) {
    const ws = wb.addWorksheet(sheetMeta.name);
    // 4. Color de pestaña azul marino #0A2540
    ws.properties.tabColor = { argb: NAVY };

    // 2. Congela primera fila (encabezados)
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    const headerRow = ws.getRow(1);
    // 2. Altura de fila un poco mayor (28 pt)
    headerRow.height = 28;

    sheetMeta.columns.forEach((col, cIdx) => {
      const colNum = cIdx + 1;
      const cell = headerRow.getCell(colNum);

      // Marca con asterisco (*) en rojo #E01038 si es obligatoria
      if (col.required) {
        cell.value = {
          richText: [
            { text: col.name, font: { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 } },
            { text: ' *', font: { name: 'Arial', bold: true, color: { argb: RED_ALERT }, size: 10 } },
          ],
        };
      } else {
        cell.value = col.name;
        cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      }

      // Fondo azul marino #0A2540, centrado y bordes finos #E2E8F0
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: NAVY },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;

      // Ancho automático según contenido del encabezado (mínimo 14 caracteres)
      const labelLength = col.name.length + (col.required ? 2 : 0);
      ws.getColumn(colNum).width = Math.max(14, labelLength + 6);
    });

    // 2. Filtro automático (autofilter) en la fila de encabezados
    if (sheetMeta.columns.length > 0) {
      ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheetMeta.columns.length },
      };
    }
  }

  // Generar buffer en navegador y disparar descarga nativa
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Plantilla_Proyecto_IMPULSA.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Exportar libro Excel completo con datos actuales y formato institucional (Requisito 3)
export async function exportProjectToExcel(dataset: ProjectDataset, customName?: string): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'IMPULSA · Centro de Mando';
  wb.lastModifiedBy = 'IMPULSA';
  wb.created = new Date();
  wb.modified = new Date();

  const NAVY = '0A2540';
  const LIGHT_ICE = 'F7FAFC';
  const BORDER_COLOR = 'E2E8F0';
  const INK_TEXT = '2D3748';
  const RED_ALERT = 'E01038';

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
  };

  // 1. Hoja LEEME
  const wsLeeme = wb.addWorksheet('LEEME', {
    views: [{ showGridLines: true }],
  });
  wsLeeme.properties.tabColor = { argb: NAVY };

  for (let r = 1; r <= 35; r++) {
    const row = wsLeeme.getRow(r);
    for (let c = 1; c <= 5; c++) {
      row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_ICE } };
    }
  }

  const titleRow = wsLeeme.getRow(2);
  titleRow.height = 36;
  const titleCell = titleRow.getCell(2);
  titleCell.value = 'IMPULSA';
  titleCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: NAVY } };

  const subTitleRow = wsLeeme.getRow(3);
  const subTitleCell = subTitleRow.getCell(2);
  subTitleCell.value = 'Centro de Mando · Libro Completo de Datos Exportado';
  subTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: INK_TEXT } };

  const dateRow = wsLeeme.getRow(4);
  dateRow.getCell(2).value = `Fecha de exportación: ${new Date().toLocaleString()} · Proyecto: ${dataset.proyecto?.nombre || 'IMPULSA'}`;
  dateRow.getCell(2).font = { name: 'Arial', size: 9, italic: true, color: { argb: '718096' } };

  // 2. Hoja Proyecto
  const wsProyecto = wb.addWorksheet('Proyecto');
  wsProyecto.properties.tabColor = { argb: NAVY };
  wsProyecto.views = [{ state: 'frozen', ySplit: 1 }];

  const hRowP = wsProyecto.getRow(1);
  hRowP.height = 28;
  ['campo', 'valor'].forEach((h, idx) => {
    const cell = hRowP.getCell(idx + 1);
    cell.value = {
      richText: [
        { text: h, font: { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 } },
        { text: ' *', font: { name: 'Arial', bold: true, color: { argb: RED_ALERT }, size: 10 } },
      ],
    };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });
  wsProyecto.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 2 } };

  const pData = dataset.proyecto || ({} as any);
  const pRows: [string, any][] = [
    ['nombre', pData.nombre || ''],
    ['moneda', pData.moneda || 'PEN'],
    ['presupuesto_autorizado', pData.presupuesto_autorizado ?? 0],
    ['BAC', pData.BAC ?? 0],
    ['reserva_contingencia', pData.reserva_contingencia ?? 0],
    ['duracion_semanas', pData.duracion_semanas ?? 12],
    ['semana_corte', pData.semana_corte ?? 6],
    ['patrocinador', pData.patrocinador || ''],
    ['director_proyecto', pData.director_proyecto || ''],
    ['fecha_inicio', pData.fecha_inicio || ''],
    ['fecha_fin_planificada', pData.fecha_fin_planificada || ''],
    ['umbral_alerta_cpi', pData.umbral_alerta_cpi ?? 0.95],
    ['umbral_critico_cpi', pData.umbral_critico_cpi ?? 0.9],
    ['umbral_alerta_spi', pData.umbral_alerta_spi ?? 0.95],
    ['umbral_critico_spi', pData.umbral_critico_spi ?? 0.9],
  ];

  pRows.forEach((pair, idx) => {
    const row = wsProyecto.getRow(idx + 2);
    row.height = 20;
    const c1 = row.getCell(1);
    c1.value = pair[0];
    c1.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY } };
    c1.border = thinBorder;

    const c2 = row.getCell(2);
    c2.value = pair[1];
    c2.font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };
    c2.border = thinBorder;
  });
  wsProyecto.getColumn(1).width = 28;
  wsProyecto.getColumn(2).width = 75;

  // Mapa de hojas
  const datasetMapping: Record<string, any[]> = {
    Objetivos: dataset.objetivos || [],
    Supuestos: dataset.supuestos || [],
    Interesados: dataset.interesados || [],
    Requisitos: dataset.requisitos || [],
    Entregables: dataset.entregables || [],
    EDT: dataset.edt || [],
    Actividades: dataset.actividades || [],
    Hitos: dataset.hitos || [],
    LineaBase_PV: dataset.lineaBase_pv || [],
    Avance_Semanal: dataset.avance_semanal || [],
    Recursos: dataset.recursos || [],
    RACI: dataset.raci || [],
    Costos: dataset.costos || [],
    Riesgos: dataset.riesgos || [],
    Riesgos_Historial: dataset.riesgos_historial || [],
    Respuestas_Riesgo: dataset.respuestas_riesgo || [],
    Contingencia: dataset.contingencia || [],
    Plan_Comunicaciones: dataset.plan_comunicaciones || [],
    Comunicaciones: dataset.comunicaciones || [],
    Adquisiciones: dataset.adquisiciones || [],
    Calidad: dataset.calidad || [],
    Incidentes: dataset.incidentes || [],
    Cambios: dataset.cambios || [],
    Lecciones: dataset.lecciones || [],
    Automatizaciones: dataset.automatizaciones || [],
  };

  const otherSheets = SHEETS_META.filter((m) => m.name !== 'Proyecto');

  for (const sheetMeta of otherSheets) {
    const ws = wb.addWorksheet(sheetMeta.name);
    ws.properties.tabColor = { argb: NAVY };
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    const headerRow = ws.getRow(1);
    headerRow.height = 28;

    sheetMeta.columns.forEach((col, cIdx) => {
      const colNum = cIdx + 1;
      const cell = headerRow.getCell(colNum);
      if (col.required) {
        cell.value = {
          richText: [
            { text: col.name, font: { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 } },
            { text: ' *', font: { name: 'Arial', bold: true, color: { argb: RED_ALERT }, size: 10 } },
          ],
        };
      } else {
        cell.value = col.name;
        cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
      ws.getColumn(colNum).width = Math.max(14, col.name.length + 6);
    });

    if (sheetMeta.columns.length > 0) {
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheetMeta.columns.length } };
    }

    // Agregar filas de datos
    const items = datasetMapping[sheetMeta.name] || [];
    items.forEach((item, rIdx) => {
      const row = ws.getRow(rIdx + 2);
      row.height = 20;

      sheetMeta.columns.forEach((col, cIdx) => {
        const cell = row.getCell(cIdx + 1);
        const rawVal = item[col.name];
        cell.value = rawVal !== undefined && rawVal !== null ? rawVal : '';
        cell.font = { name: 'Arial', size: 9, color: { argb: INK_TEXT } };
        cell.border = thinBorder;
        if (typeof rawVal === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (customName || dataset.proyecto?.nombre || 'Proyecto_IMPULSA').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${safeName}_Datos.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
