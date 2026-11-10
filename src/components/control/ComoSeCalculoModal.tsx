/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, HelpCircle, Table, CheckCircle2, ChevronRight, Calculator, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { EvmProjectResult, EvmCalculationDetails } from '../../services/evmService.ts';

interface ComoSeCalculoModalProps {
  isOpen: boolean;
  onClose: () => void;
  evmResult: EvmProjectResult;
  initialMetricKey?: string;
}

const AVAILABLE_METRICS = [
  { key: 'BAC', label: 'BAC (Presupuesto Conclusión)', category: 'Línea Base' },
  { key: 'PV', label: 'PV (Valor Planificado)', category: 'Línea Base' },
  { key: 'EV', label: 'EV (Valor Ganado)', category: 'Medición' },
  { key: 'AC', label: 'AC (Costo Real)', category: 'Medición' },
  { key: 'CV', label: 'CV (Variación Costo)', category: 'Variaciones' },
  { key: 'SV', label: 'SV (Variación Cronograma)', category: 'Variaciones' },
  { key: 'CPI', label: 'CPI (Índice Costo)', category: 'Índices' },
  { key: 'SPI', label: 'SPI (Índice Cronograma)', category: 'Índices' },
  { key: 'EAC_TIPICO', label: 'EAC Típico (BAC / CPI)', category: 'Pronósticos' },
  { key: 'EAC_OPTIMISTA', label: 'EAC Optimista', category: 'Pronósticos' },
  { key: 'EAC_PESIMISTA', label: 'EAC Pesimista (CPI×SPI)', category: 'Pronósticos' },
  { key: 'TCPI', label: 'TCPI (Índice Trabajo Pendiente)', category: 'Pronósticos' },
  { key: 'ES', label: 'ES (Cronograma Ganado)', category: 'Tiempo / ES' },
  { key: 'SPIT', label: 'SPI(t) (Índice Temporal)', category: 'Tiempo / ES' },
  { key: 'CONTINGENCIA', label: 'Contingencia y Presupuesto', category: 'Reservas' },
];

export const ComoSeCalculoModal: React.FC<ComoSeCalculoModalProps> = ({
  isOpen,
  onClose,
  evmResult,
  initialMetricKey = 'CPI',
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialMetricKey);

  // Sincronizar selección inicial cuando se abre el modal
  React.useEffect(() => {
    if (initialMetricKey) {
      setSelectedKey(initialMetricKey);
    }
  }, [initialMetricKey]);

  if (!isOpen) return null;

  const details: EvmCalculationDetails = evmResult.getCalculationDetails(selectedKey);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in-50 duration-200">
        {/* Cabecera del modal */}
        <div className="bg-[#0A2540] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00D4B2]/20 text-[#00D4B2] rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4B2]">
                  Transparencia PMBOK 8 · Auditoría Matemática
                </span>
                <span className="text-white/40">·</span>
                <span className="text-xs text-white/70">Semana de corte {evmResult.cutoffWeek}</span>
              </div>
              <h2 className="text-lg font-bold font-['Montserrat']">¿Cómo se calculó?</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra selectora de indicadores */}
        <div className="bg-[#F7FAFC] border-b border-[#E2E8F0] px-6 py-2.5 overflow-x-auto flex gap-1.5 scrollbar-thin">
          {AVAILABLE_METRICS.map((item) => {
            const isSelected = item.key === selectedKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedKey(item.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0A2540] text-[#00D4B2] shadow-xs'
                    : 'bg-white text-[#4A5568] hover:bg-slate-100 border border-[#E2E8F0]'
                }`}
              >
                <span>{item.key}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido principal scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#2D3748]">
          {/* Título del indicador seleccionado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                {details.acronym} · {details.sourceSheet}
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] font-['Montserrat'] mt-0.5">
                {details.metricName}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5568] mt-1 max-w-2xl">
                {details.formulaDescription}
              </p>
            </div>
            <div className="text-right shrink-0 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-[#718096] uppercase font-bold tracking-wider block">
                Valor obtenido
              </span>
              <span className="text-2xl font-black font-mono text-[#0A2540]">
                {details.formattedResult}
              </span>
            </div>
          </div>

          {/* Bloque de fórmula y sustitución */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] flex items-center gap-1.5 mb-2">
                <Calculator className="w-4 h-4 text-[#00D4B2]" />
                <span>Fórmula estándar PMBOK 8</span>
              </h4>
              <div className="p-3 bg-[#0A2540] rounded-lg text-emerald-300 font-mono text-sm sm:text-base font-bold shadow-inner">
                {details.formula}
              </div>
              <p className="text-[11px] text-[#718096] mt-2">
                Ecuación canónica según el estándar PMI Practice Standard for Earned Value Management (3rd/PMBOK 8).
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] flex items-center gap-1.5 mb-2">
                <ChevronRight className="w-4 h-4 text-[#00D4B2]" />
                <span>Valores sustituidos (Semana {evmResult.cutoffWeek})</span>
              </h4>
              <div className="p-3 bg-slate-100 rounded-lg text-[#0A2540] font-mono text-xs sm:text-sm font-semibold break-words">
                {details.substitutedValues}
              </div>
              <p className="text-[11px] text-[#718096] mt-2">
                Sustitución de los datos reales consolidados a la fecha de corte.
              </p>
            </div>
          </div>

          {/* Pasos de ejecución */}
          {details.steps && details.steps.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pasos secuenciales del cálculo</span>
              </h4>
              <div className="space-y-2">
                {details.steps.map((st, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2.5 text-xs text-[#2D3748]">
                    <span className="font-bold text-[#0A2540] bg-slate-100 px-2 py-0.5 rounded text-[11px] shrink-0 font-mono">
                      Paso {sIdx + 1}
                    </span>
                    <span className="pt-0.5">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interpretación gerencial */}
          {details.interpretation && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>Interpretación para la Dirección del Proyecto</span>
              </h4>
              <p className="text-xs sm:text-sm text-emerald-950 font-medium">
                {details.interpretation}
              </p>
            </div>
          )}

          {/* Tabla de filas de origen */}
          {details.sourceRows && details.sourceRows.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#0A2540]" />
                  <h4 className="text-xs font-bold text-[#0A2540] font-['Montserrat'] uppercase tracking-wider">
                    Filas de origen y trazabilidad ({details.sourceRows.length} registros)
                  </h4>
                </div>
                <span className="text-[11px] text-[#718096]">
                  Hojas fuente: <strong className="text-[#0A2540]">{details.sourceSheet}</strong>
                </span>
              </div>

              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0A2540] text-white font-semibold sticky top-0">
                    <tr>
                      <th scope="col" className="py-2.5 px-3">Hoja origen</th>
                      <th scope="col" className="py-2.5 px-3">Código / Ref</th>
                      <th scope="col" className="py-2.5 px-3">Concepto / Actividad</th>
                      <th scope="col" className="py-2.5 px-3 text-center">Sem / %</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Monto base</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Contribución</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                    {details.sourceRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#F7FAFC] transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-500 whitespace-nowrap">
                          {row.sheet}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                          {row.codigo || '—'}
                        </td>
                        <td className="py-2 px-3 font-medium max-w-xs truncate">
                          {row.actividad || row.concepto || '—'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">
                          {row.semana ? `S${row.semana}` : ''}
                          {row.porcentaje !== undefined ? ` · ${row.porcentaje.toFixed(1)}%` : ''}
                          {!row.semana && row.porcentaje === undefined ? '—' : ''}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {typeof row.valorOriginal === 'number'
                            ? row.valorOriginal.toLocaleString()
                            : String(row.valorOriginal)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#0A2540]">
                          {evmResult.currency} {Math.round(row.contribucion).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F7FAFC] font-bold border-t-2 border-[#E2E8F0]">
                    <tr>
                      <td colSpan={5} className="py-2.5 px-3 text-right text-xs text-[#0A2540]">
                        Total consolidado:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs text-[#0A2540]">
                        {details.formattedResult}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="bg-[#F7FAFC] border-t border-[#E2E8F0] px-6 py-3.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-[#718096]">
            Cálculo auditado en tiempo real según el motor analítico EVM de IMPULSA.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0A2540] text-white hover:bg-[#1A365D] transition-colors shadow-xs"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
