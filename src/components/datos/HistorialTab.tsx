/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  User,
  Layers,
  ArrowRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { HistoryEntry } from '../../types/projectData.ts';

export const HistorialTab: React.FC = () => {
  const { historyList, restoreHistoryVersion, isSavingToFirestore, user } = useProjectData();

  const [selectedEntryToRestore, setSelectedEntryToRestore] = useState<HistoryEntry | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmRestore = async () => {
    if (!selectedEntryToRestore) return;
    setIsRestoring(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await restoreHistoryVersion(selectedEntryToRestore);
      setSuccessMsg(
        `¡Versión restaurada con éxito! El tablero ejecutivo ahora refleja los datos del ${new Date(
          selectedEntryToRestore.fecha
        ).toLocaleString('es-PE')}.`
      );
      setSelectedEntryToRestore(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Error al restaurar versión: ${err?.message || 'Error desconocido'}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const getBadgeStyle = (tipo: HistoryEntry['tipo']) => {
    switch (tipo) {
      case 'carga_excel':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'edicion_hoja':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'registro_avance':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'restauracion':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTipoLabel = (tipo: HistoryEntry['tipo']) => {
    switch (tipo) {
      case 'carga_excel':
        return 'Carga Excel .xlsx';
      case 'edicion_hoja':
        return 'Edición en tabla';
      case 'registro_avance':
        return 'Avance semanal';
      case 'restauracion':
        return 'Restauración';
      default:
        return tipo;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D4B2]/15 border border-[#00D4B2]/40 flex items-center justify-center text-[#0A2540]">
              <History className="w-5 h-5 text-[#0A2540]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0A2540] font-['Montserrat']">
                Historial de cargas, ediciones y puntos de restauración
              </h2>
              <p className="text-xs text-[#718096]">
                Trazabilidad total: cada modificación queda registrada en Firestore y puede restaurarse con un solo clic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-[#0A2540] rounded-full border border-slate-200">
              {historyList.length} {historyList.length === 1 ? 'registro' : 'registros'} en bitácora
            </span>
          </div>
        </div>

        {/* Mensajes de éxito / error */}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-500 hover:text-emerald-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Lista cronológica */}
        <div className="mt-6 space-y-3">
          {historyList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-[#0A2540] mb-1">Sin historial de modificaciones registrado</p>
              <p className="text-[#718096]">
                Carga un archivo Excel o realiza una edición en las tablas para generar el primer punto de control.
              </p>
            </div>
          ) : (
            historyList.map((entry, idx) => {
              const formattedDate = new Date(entry.fecha).toLocaleString('es-PE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              const isFirst = idx === 0;

              return (
                <div
                  key={entry.id || idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isFirst
                      ? 'bg-gradient-to-r from-emerald-50/40 via-white to-white border-emerald-300 shadow-2xs'
                      : 'bg-[#F7FAFC]/60 hover:bg-[#F7FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(
                          entry.tipo
                        )}`}
                      >
                        {getTipoLabel(entry.tipo)}
                      </span>

                      {isFirst && (
                        <span className="px-2 py-0.2 text-[9px] font-bold bg-emerald-600 text-white rounded">
                          VERSIÓN ACTUAL
                        </span>
                      )}

                      <span className="text-xs font-bold text-[#0A2540]">
                        {entry.hoja || 'Carga completa'}
                      </span>
                    </div>

                    <p className="text-xs text-[#2D3748] font-medium leading-relaxed">
                      {entry.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.usuario || 'Gestor'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.filasTotales?.toLocaleString() || 0} filas en proyecto</span>
                      </span>
                    </div>
                  </div>

                  {/* Botón de restauración */}
                  <div className="shrink-0 flex items-center gap-2">
                    {entry.snapshotJson ? (
                      <button
                        type="button"
                        onClick={() => setSelectedEntryToRestore(entry)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border shadow-2xs ${
                          isFirst
                            ? 'text-slate-400 bg-slate-100 border-slate-200 cursor-default'
                            : 'text-[#0A2540] bg-white border-[#E2E8F0] hover:bg-slate-50 hover:border-[#00D4B2]'
                        }`}
                        title={
                          isFirst
                            ? 'Esta ya es la versión activa en el tablero'
                            : 'Restaurar el proyecto exactamente a esta versión'
                        }
                        disabled={isFirst}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#00D4B2]" />
                        <span>{isFirst ? 'Versión activa' : 'Restaurar versión'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sin respaldo completo</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de confirmación de restauración */}
      {selectedEntryToRestore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 text-[#2D3748] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 mb-4 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-center text-[#0A2540] font-['Montserrat'] mb-2">
              ¿Restaurar proyecto a versión anterior?
            </h4>

            <p className="text-xs text-slate-600 text-center leading-relaxed mb-3">
              Estás a punto de restaurar todos los tableros al estado registrado el{' '}
              <strong className="text-[#0A2540]">
                {new Date(selectedEntryToRestore.fecha).toLocaleString('es-PE')}
              </strong>
              .
            </p>

            <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0] text-xs text-slate-600 mb-5 space-y-1">
              <p>
                <strong>Hoja / Origen:</strong> {selectedEntryToRestore.hoja}
              </p>
              <p>
                <strong>Detalle:</strong> {selectedEntryToRestore.descripcion}
              </p>
              <p>
                <strong>Registrado por:</strong> {selectedEntryToRestore.usuario}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedEntryToRestore(null)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isRestoring || isSavingToFirestore}
                onClick={handleConfirmRestore}
                className="px-5 py-2 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2"
              >
                {isRestoring ? (
                  <RefreshCw className="w-3.5 h-3.5 text-[#00D4B2] animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 text-[#00D4B2]" />
                )}
                <span>{isRestoring ? 'Restaurando...' : 'Confirmar restauración'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
