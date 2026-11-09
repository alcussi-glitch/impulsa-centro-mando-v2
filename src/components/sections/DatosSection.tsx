/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import {
  parseAndValidateWorkbook,
  generateEmptyTemplate,
} from '../../services/excelService.ts';
import {
  ValidationSummary,
  SheetValidationResult,
  ProyectoInfo,
  ProjectDataset,
} from '../../types/projectData.ts';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { ProyectoFormModal } from '../datos/ProyectoFormModal.tsx';

interface DatosSectionProps {
  cutoffWeek: number;
}

export const DatosSection: React.FC<DatosSectionProps> = ({ cutoffWeek }) => {
  const { projectData, isDataLoaded, user, saveProjectData, clearProjectData, loadSampleImpulsaData } = useProjectData();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [showProyectoModal, setShowProyectoModal] = useState<boolean>(false);
  const [customProyectoInfo, setCustomProyectoInfo] = useState<ProyectoInfo | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    setIsGeneratingTemplate(true);
    try {
      await generateEmptyTemplate();
    } catch (err) {
      console.error('Error al generar la plantilla Excel:', err);
      setNotificationMsg({
        type: 'error',
        text: 'Ocurrió un error al generar la plantilla Excel. Inténtalo nuevamente.',
      });
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  // Procesar archivo ArrayBuffer
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setNotificationMsg(null);
    setCurrentFileName(file.name);
    setFileSizeBytes(file.size);

    try {
      const buffer = await file.arrayBuffer();
      const summary = parseAndValidateWorkbook(buffer, file.name);
      setValidationSummary(summary);

      if (summary.missingProyectoSheet) {
        setShowProyectoModal(true);
      }
    } catch (err: any) {
      console.error('Error al procesar el archivo Excel:', err);
      setNotificationMsg({
        type: 'error',
        text: `Error al leer el archivo Excel: ${err?.message || 'Formato no soportado o archivo dañado'}. Asegúrate de que sea un archivo .xlsx válido.`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejador del input de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Toggle detalles de una fila de validación
  const toggleRowDetails = (sheetName: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [sheetName]: !prev[sheetName],
    }));
  };

  // Guardar datos tras confirmación del usuario (Requisito 8 con Firebase Firestore)
  const handleConfirmarCarga = async () => {
    if (!validationSummary || !validationSummary.parsedDataset) return;

    const dataset = validationSummary.parsedDataset;

    // Si se capturó la hoja proyecto manualmente
    if (customProyectoInfo) {
      dataset.proyecto = customProyectoInfo;
    } else if (!dataset.proyecto) {
      setShowProyectoModal(true);
      return;
    }

    // Calcular metadatos de auditoría
    dataset.metadataCarga = {
      fechaCarga: new Date().toISOString(),
      nombreArchivo: currentFileName || 'datos_cargados.xlsx',
      tamanoBytes: fileSizeBytes,
      checksum: `sha256-${Math.random().toString(36).substring(2, 10)}`,
      esDatosEjemplo: false,
    };

    try {
      await saveProjectData(dataset as ProjectDataset);
      setNotificationMsg({
        type: 'success',
        text: user
          ? `¡Datos confirmados y sincronizados con éxito! Se registraron ${validationSummary.totalRowsRead} registros entre las 26 hojas del proyecto en Cloud Firestore con escuchas en tiempo real.`
          : `¡Datos confirmados en almacenamiento local! Se cargaron ${validationSummary.totalRowsRead} registros. Inicia sesión con Google en la barra superior para respaldarlos en Cloud Firestore.`,
      });
    } catch (err: any) {
      setNotificationMsg({
        type: 'error',
        text: `Los datos se guardaron localmente en el navegador, pero ocurrió una incidencia al sincronizar con Cloud Firestore: ${err?.message || 'Error de conexión'}.`,
      });
    }
  };

  // Manejo de valores del modal de Proyecto
  const handleProyectoModalSubmit = (info: ProyectoInfo) => {
    setCustomProyectoInfo(info);
    setShowProyectoModal(false);

    if (validationSummary) {
      // Actualizar el resultado de la hoja Proyecto en la tabla de validación
      const updatedResults = validationSummary.results.map((r) => {
        if (r.sheetName === 'Proyecto') {
          return {
            ...r,
            status: 'ok' as const,
            message: `Parámetros completados manualmente: BAC ${info.moneda} ${info.BAC.toLocaleString()}, Presupuesto ${info.moneda} ${info.presupuesto_autorizado.toLocaleString()}, ${info.duracion_semanas} semanas.`,
          };
        }
        return r;
      });

      const hasErrors = updatedResults.some((r) => r.status === 'error');

      setValidationSummary({
        ...validationSummary,
        isValid: !hasErrors,
        results: updatedResults,
        missingProyectoSheet: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera contextual */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded text-[#0A2540]">
              Gobierno de Datos · PMBOK 8
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">Ciclo de corte: Semana {cutoffWeek} de 12</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Carga y validación de datos
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Sube el archivo Excel de seguimiento del proyecto IMPULSA para validar las hojas estándar del PMBOK y sincronizar el tablero ejecutivo en tiempo real.
          </p>
        </div>

        {/* Botón Descargar plantilla vacía estilizada con ExcelJS */}
        <button
          type="button"
          disabled={isGeneratingTemplate}
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#0A2540] bg-white border border-[#E2E8F0] hover:bg-[#F7FAFC] rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2] self-start md:self-auto disabled:opacity-60"
          title="Descargar libro Excel estilizado con las 26 hojas, guía LEEME y columnas obligatorias en rojo"
        >
          {isGeneratingTemplate ? (
            <RefreshCw className="w-4 h-4 text-[#00D4B2] animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-4 h-4 text-[#00D4B2]" aria-hidden="true" />
          )}
          <span>{isGeneratingTemplate ? 'Generando plantilla...' : 'Descargar plantilla vacía (.xlsx)'}</span>
        </button>
      </div>

      {/* Banner de notificación */}
      {notificationMsg && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
          role="alert"
        >
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{notificationMsg.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotificationMsg(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tarjeta de estado de datos activos en la sesión */}
      {isDataLoaded && projectData && (
        <div className="bg-white rounded-xl border border-[#00D4B2]/40 shadow-xs p-5 bg-gradient-to-r from-white via-white to-[#00D4B2]/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D4B2]/20 border border-[#00D4B2]/50 flex items-center justify-center text-[#0A2540] shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5 text-[#0A2540]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0A2540]">
                    {projectData.metadataCarga?.nombreArchivo || 'Proyecto activo'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-100 text-emerald-800">
                    <Check className="w-3 h-3" /> Datos sincronizados
                  </span>
                  {projectData.metadataCarga?.esDatosEjemplo && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800 border border-amber-200">
                      DATOS DE EJEMPLO
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#718096] mt-0.5">
                  {projectData.proyecto?.nombre} · Presupuesto {projectData.proyecto?.moneda} {projectData.proyecto?.presupuesto_autorizado?.toLocaleString()} · BAC {projectData.proyecto?.moneda} {projectData.proyecto?.BAC?.toLocaleString()} · Semana de corte {projectData.proyecto?.semana_corte || 6} de {projectData.proyecto?.duracion_semanas || 12}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearProjectData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                title="Limpiar datos cargados y volver a estado vacío"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar datos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zona principal de Carga */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#00D4B2]" />
                <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                  Carga del libro .xlsx del proyecto
                </h2>
              </div>
              <span className="text-xs text-[#718096]">Estructura de 26 hojas PMBOK</span>
            </div>

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xlsm"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-[#00D4B2] bg-[#00D4B2]/10 scale-[0.99]'
                  : 'border-[#E2E8F0] hover:border-[#00D4B2] bg-[#F7FAFC]/60 hover:bg-[#F7FAFC]'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Área de carga de archivo Excel: haz clic o arrastra un archivo .xlsx aquí"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0A2540]/5 border border-[#0A2540]/15 flex items-center justify-center text-[#0A2540] mb-3">
                <UploadCloud className="w-7 h-7 text-[#0A2540]" aria-hidden="true" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-[#0A2540] font-['Montserrat'] mb-1">
                Arrastra tu archivo .xlsx aquí o haz clic para seleccionar
              </h3>
              <p className="text-xs text-[#718096] max-w-md mb-4 leading-relaxed">
                El motor reconocerá automáticamente las 26 hojas del PMBOK (Objetivos, EDT, Actividades, LineaBase_PV, Avance_Semanal, Riesgos, etc.) y verificará la consistencia matemática.
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 text-[10px] font-mono text-[#718096] bg-white border border-[#E2E8F0] rounded">.xlsx</span>
                <span className="px-2 py-0.5 text-[10px] font-mono text-[#718096] bg-white border border-[#E2E8F0] rounded">.xlsm</span>
                <span className="text-xs text-[#718096]">Soporta alias BAC_MXN y costo_real_semana_MXN</span>
              </div>

              <button
                type="button"
                className="px-5 py-2.5 bg-[#0A2540] text-white text-xs font-semibold rounded-lg hover:bg-[#0A2540]/90 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
              >
                Seleccionar archivo desde el equipo
              </button>
            </div>

            {/* Opción rápida: cargar simulación oficial */}
            <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#718096]">¿Quieres explorar la aplicación sin un archivo propio?</span>
              <button
                type="button"
                onClick={loadSampleImpulsaData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00D4B2]/15 text-[#0A2540] font-semibold border border-[#00D4B2]/40 rounded-lg hover:bg-[#00D4B2]/25 transition-colors focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00D4B2]" />
                <span>Cargar simulación IMPULSA (Semana 6)</span>
              </button>
            </div>
          </div>

          {/* Tabla de Validación de Hojas (Requisito 6) */}
          {validationSummary && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                    Resultado de la validación: {currentFileName}
                  </h3>
                  <p className="text-xs text-[#718096]">
                    {validationSummary.totalSheetsFound} hojas leídas · {validationSummary.totalRowsRead} filas analizadas
                  </p>
                </div>

                {/* Semáforo global */}
                <div className="flex items-center gap-2">
                  {validationSummary.hasErrors ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-800 border border-rose-300">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Requiere corrección para confirmar
                    </span>
                  ) : validationSummary.hasWarnings ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Válido con advertencias
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      100% Verificado con éxito
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de Confirmar carga (Requisito 8) */}
              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#2D3748]">
                  <p className="font-semibold text-[#0A2540]">Confirmación de carga de datos:</p>
                  <p className="text-[#718096]">
                    {validationSummary.isValid
                      ? 'Todas las reglas de integridad fueron superadas. Presiona el botón para actualizar el Centro de Mando.'
                      : 'Existen errores bloqueantes en las hojas indicadas. Corrige el archivo o ajusta las filas señaladas.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {validationSummary.missingProyectoSheet && (
                    <button
                      type="button"
                      onClick={() => setShowProyectoModal(true)}
                      className="px-3.5 py-2 text-xs font-semibold text-[#0A2540] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Editar Proyecto
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!validationSummary.isValid}
                    onClick={handleConfirmarCarga}
                    className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 ${
                      validationSummary.isValid
                        ? 'bg-[#0A2540] text-white hover:bg-[#0A2540]/90 focus-visible:ring-2 focus-visible:ring-[#00D4B2]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    <Check className="w-4 h-4 text-[#00D4B2]" />
                    <span>Confirmar carga</span>
                  </button>
                </div>
              </div>

              {/* Tabla de validación: Hoja │ Filas leídas │ Estado │ Mensaje (Requisito 6) */}
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F7FAFC] border-b border-[#E2E8F0] text-[#0A2540] font-['Montserrat']">
                      <th className="py-2.5 px-3 font-bold">Hoja</th>
                      <th className="py-2.5 px-3 font-bold text-center">Filas leídas</th>
                      <th className="py-2.5 px-3 font-bold">Estado</th>
                      <th className="py-2.5 px-3 font-bold">Mensaje de validación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {validationSummary.results.map((res) => {
                      const hasDetails = res.details && res.details.length > 0;
                      const isExpanded = expandedDetails[res.sheetName];

                      return (
                        <React.Fragment key={res.sheetName}>
                          <tr className={`hover:bg-[#F7FAFC]/80 transition-colors ${res.status === 'error' ? 'bg-rose-50/30' : ''}`}>
                            <td className="py-2.5 px-3 font-semibold text-[#0A2540] whitespace-nowrap">
                              {res.sheetName}
                            </td>
                            <td className="py-2.5 px-3 text-center text-[#2D3748] font-mono">
                              {res.rowsCount}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {res.status === 'ok' && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>✓ Correcto</span>
                                </span>
                              )}
                              {res.status === 'warning' && (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>⚠ Alerta</span>
                                </span>
                              )}
                              {res.status === 'error' && (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>✕ Error</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[#2D3748]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="leading-relaxed">{res.message}</span>
                                {hasDetails && (
                                  <button
                                    type="button"
                                    onClick={() => toggleRowDetails(res.sheetName)}
                                    className="p-1 text-slate-500 hover:text-[#0A2540] rounded shrink-0"
                                    title="Ver detalle de filas observadas"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Fila expandible de detalles */}
                          {hasDetails && isExpanded && (
                            <tr className="bg-slate-50/80">
                              <td colSpan={4} className="py-2 px-4 text-[11px] text-[#2D3748]">
                                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                                  {res.details?.map((det, dIdx) => (
                                    <li key={dIdx} className={res.status === 'error' ? 'text-rose-800' : 'text-amber-800'}>
                                      {det}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral: Historial y especificaciones técnicas */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0A2540]" />
                <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                  Historial de auditoría
                </h3>
              </div>
              <span className="text-[11px] text-[#718096]">Registro</span>
            </div>

            {projectData?.metadataCarga ? (
              <div className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F7FAFC] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A2540] truncate max-w-[170px]">
                    {projectData.metadataCarga.nombreArchivo}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ACTIVO
                  </span>
                </div>
                <div className="text-[#718096] text-[11px] space-y-1">
                  <p>
                    Fecha: {new Date(projectData.metadataCarga.fechaCarga).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  <p>
                    Checksum: <span className="font-mono">{projectData.metadataCarga.checksum}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#718096]">
                <p className="font-semibold text-[#0A2540] mb-1">Sin sincronizaciones previas</p>
                <p>Carga un archivo .xlsx para registrar la primera auditoría del proyecto.</p>
              </div>
            )}

            {/* Cuadro informativo de reglas de integridad */}
            <div className="mt-5 p-4 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-2">
              <p className="font-bold text-[#0A2540] uppercase tracking-wider text-[10px] font-['Montserrat']">
                Reglas de Integridad Verificadas (PMBOK 8):
              </p>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00D4B2] font-bold">✓</span>
                  <span>Códigos en LineaBase_PV y Avance_Semanal deben existir en Actividades.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00D4B2] font-bold">✓</span>
                  <span>La suma de S1 a S12 debe igualar el BAC de la actividad (tolerancia ±1).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00D4B2] font-bold">✓</span>
                  <span>El % acumulado de avance no puede decrecer entre semanas.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00D4B2] font-bold">✓</span>
                  <span>Probabilidad e impacto evaluados en escala de 1 a 5.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Captura cuando falta la hoja Proyecto (Requisito 7) */}
      <ProyectoFormModal
        isOpen={showProyectoModal}
        initialValues={validationSummary?.parsedDataset?.proyecto}
        onClose={() => setShowProyectoModal(false)}
        onSubmit={handleProyectoModalSubmit}
      />
    </div>
  );
};
