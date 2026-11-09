/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProyectoInfo {
  nombre: string;
  moneda: string;
  presupuesto_autorizado: number;
  BAC: number;
  reserva_contingencia: number;
  duracion_semanas: number;
  semana_corte: number;
  patrocinador?: string;
  director_proyecto?: string;
  fecha_inicio?: string;
  fecha_fin_planificada?: string;
  umbral_alerta_cpi?: number;
  umbral_critico_cpi?: number;
  umbral_alerta_spi?: number;
  umbral_critico_spi?: number;
  [key: string]: any;
}

export interface ObjetivoItem {
  id: string;
  objetivo: string;
  indicador: string;
  meta: string;
  [key: string]: any;
}

export interface SupuestoItem {
  id: string;
  tipo: string;
  descripcion: string;
  [key: string]: any;
}

export interface InteresadoItem {
  id: string;
  interesado: string;
  rol: string;
  poder_1a5: number;
  interes_1a5: number;
  estrategia?: string;
  [key: string]: any;
}

export interface RequisitoItem {
  id: string;
  tipo: string;
  descripcion: string;
  criterio_aceptacion: string;
  [key: string]: any;
}

export interface EntregableItem {
  id: string;
  entregable: string;
  incluido: string | boolean;
  [key: string]: any;
}

export interface EDTItem {
  codigo: string;
  nombre: string;
  nivel: number;
  [key: string]: any;
}

export interface ActividadItem {
  codigo: string;
  actividad: string;
  cuenta_control: string;
  responsable: string;
  sem_inicio_plan: number;
  sem_fin_plan: number;
  BAC: number;
  [key: string]: any;
}

export interface HitoItem {
  id: string;
  hito: string;
  semana_plan: number;
  [key: string]: any;
}

export interface LineaBasePVItem {
  codigo: string;
  S1: number;
  S2: number;
  S3: number;
  S4: number;
  S5: number;
  S6: number;
  S7: number;
  S8: number;
  S9: number;
  S10: number;
  S11: number;
  S12: number;
  total_pv?: number;
  [key: string]: any;
}

export interface AvanceSemanalItem {
  semana: number;
  codigo: string;
  pct_completado_acum: number;
  costo_real_semana: number;
  [key: string]: any;
}

export interface RecursoItem {
  id: string;
  recurso: string;
  tipo: string;
  [key: string]: any;
}

export interface RACIItem {
  codigo_actividad: string;
  persona_o_rol: string;
  raci: string;
  [key: string]: any;
}

export interface CostoItem {
  id: string;
  cuenta_control: string;
  concepto: string;
  monto: number;
  [key: string]: any;
}

export interface RiesgoItem {
  id: string;
  riesgo: string;
  categoria: string;
  probabilidad_1a5: number;
  impacto_1a5: number;
  estrategia: string;
  respuesta_planificada: string;
  propietario: string;
  severidad?: number;
  [key: string]: any;
}

export interface RiesgosHistorialItem {
  semana: number;
  id: string;
  probabilidad_1a5: number;
  impacto_1a5: number;
  [key: string]: any;
}

export interface RespuestaRiesgoItem {
  id_riesgo: string;
  accion_ejecutada: string;
  fecha: string;
  responsable: string;
  [key: string]: any;
}

export interface ContingenciaItem {
  fecha: string;
  semana: number;
  riesgo: string;
  concepto: string;
  monto: number;
  [key: string]: any;
}

export interface PlanComunicacionesItem {
  audiencia: string;
  informacion_requerida: string;
  frecuencia: string;
  canal: string;
  responsable_emitir: string;
  [key: string]: any;
}

export interface ComunicacionesItem {
  semana: number;
  comunicacion: string;
  audiencia: string;
  [key: string]: any;
}

export interface AdquisicionesItem {
  id: string;
  bien_o_servicio: string;
  decision: string;
  [key: string]: any;
}

export interface CalidadItem {
  id: string;
  entregable_id: string;
  estandar_o_criterio: string;
  [key: string]: any;
}

export interface IncidentesItem {
  id: string;
  fecha: string;
  descripcion: string;
  responsable: string;
  estado: string;
  [key: string]: any;
}

export interface CambiosItem {
  id: string;
  fecha: string;
  descripcion: string;
  solicitante: string;
  decision: string;
  [key: string]: any;
}

export interface LeccionesItem {
  id: string;
  fecha: string;
  situacion: string;
  leccion: string;
  [key: string]: any;
}

export interface AutomatizacionesItem {
  id: string;
  proceso: string;
  categoria: string;
  frecuencia_mes: number;
  minutos_por_vez: number;
  riesgo_error_1a5: number;
  estructura_reglas_1a5: number;
  disparador?: string;
  [key: string]: any;
}

export interface ProjectDataset {
  proyecto: ProyectoInfo;
  objetivos: ObjetivoItem[];
  supuestos: SupuestoItem[];
  interesados: InteresadoItem[];
  requisitos: RequisitoItem[];
  entregables: EntregableItem[];
  edt: EDTItem[];
  actividades: ActividadItem[];
  hitos: HitoItem[];
  lineaBase_pv: LineaBasePVItem[];
  avance_semanal: AvanceSemanalItem[];
  recursos: RecursoItem[];
  raci: RACIItem[];
  costos: CostoItem[];
  riesgos: RiesgoItem[];
  riesgos_historial: RiesgosHistorialItem[];
  respuestas_riesgo: RespuestaRiesgoItem[];
  contingencia: ContingenciaItem[];
  plan_comunicaciones: PlanComunicacionesItem[];
  comunicaciones: ComunicacionesItem[];
  adquisiciones: AdquisicionesItem[];
  calidad: CalidadItem[];
  incidentes: IncidentesItem[];
  cambios: CambiosItem[];
  lecciones: LeccionesItem[];
  automatizaciones: AutomatizacionesItem[];
  catalogo_plantillas?: any[];
  metadataCarga?: {
    fechaCarga: string;
    nombreArchivo: string;
    tamanoBytes: number;
    checksum?: string;
    esDatosEjemplo?: boolean;
  };
}

export interface SheetValidationResult {
  sheetName: string;
  rowsCount: number;
  status: 'ok' | 'warning' | 'error';
  message: string;
  details?: string[];
}

export interface ValidationSummary {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  totalSheetsFound: number;
  totalRowsRead: number;
  results: SheetValidationResult[];
  parsedDataset: Partial<ProjectDataset> | null;
  missingProyectoSheet: boolean;
}

export interface HistoryEntry {
  id: string;
  fecha: string;
  usuario: string;
  tipo: 'carga_excel' | 'edicion_hoja' | 'registro_avance' | 'restauracion';
  hoja: string;
  filasTotales: number;
  descripcion: string;
  snapshotJson: string;
}

export interface UserProjectSummary {
  id: string;
  nombre: string;
  updatedAt?: string;
  semana_corte?: number;
  moneda?: string;
  presupuesto_autorizado?: number;
  BAC?: number;
  isShared?: boolean;
  ownerEmail?: string;
  ownerId?: string;
}


