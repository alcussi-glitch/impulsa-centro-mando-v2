/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Download, RefreshCw, BarChart2, DollarSign, TableProperties, Filter } from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { EvmEnginePendingCard } from '../common/EvmEnginePendingCard.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

type TabType = 'avance' | 'costos';

export const ControlSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  const { projectData } = useProjectData();
  const [activeTab, setActiveTab] = useState<TabType>('avance');
  const [filterOnlyCutoffWeek, setFilterOnlyCutoffWeek] = useState<boolean>(false);

  const avance = projectData?.avance_semanal || [];
  const costos = projectData?.costos || [];

  const tieneDatos = avance.length > 0 || costos.length > 0;

  if (!tieneDatos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
                PMBOK 8 · Dominio de Medición y Control
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-[#718096]">Gestión del Valor Ganado (EVM)</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
              Control de desempeño (EVM)
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
              Cálculo matemático de Valor Ganado, variaciones de costo y cronograma (CV, SV), índices CPI/SPI y pronósticos predictivos.
            </p>
          </div>
        </div>

        <EmptyState
          sectionTitle="Análisis y Métricas de Valor Ganado (EVM)"
          sectionSubtitle="Monitoreo y Control: Salud financiera y temporal del proyecto"
          pmbokDomain="Dominio de Medición y Control (PMBOK 8)"
          expectedContent={[
            'Curva S histórica completa con curvas acumuladas: Valor Planificado (PV), Valor Ganado (EV) y Costo Real (AC).',
            'Índice de Desempeño del Costo (CPI = EV / AC) y evaluación frente al umbral crítico 1.00.',
            'Índice de Desempeño del Cronograma (SPI = EV / PV) y detección de atraso o adelanto.',
            'Variación del Costo (CV = EV - AC) y Variación del Cronograma (SV = EV - PV).',
            'Estimación a la Conclusión (EAC) proyectada según el rendimiento observado.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  // Filtrado opcional por semana de corte
  const displayedAvance = filterOnlyCutoffWeek
    ? avance.filter((item) => Number(item.semana) === Number(cutoffWeek))
    : avance;

  const totalCostoRealRegistrado = avance.reduce((acc, curr) => acc + (Number(curr.costo_real_semana) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
              PMBOK 8 · Dominio de Medición y Control
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">Semana de corte evaluada: Semana {cutoffWeek}</span>
            {projectData?.metadataCarga?.esDatosEjemplo && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded">
                DATOS DE EJEMPLO
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Control de desempeño (EVM)
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Registros de avance semanal y costos reales cargados en Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#718096]">
            {avance.length} registros de avance reportados
          </span>
        </div>
      </div>

      {/* Indicadores en espera de EVM */}
      <EvmEnginePendingCard
        title="Curva S y Métricas Analíticas de Valor Ganado (EVM)"
        description="Los cálculos matemáticos, fórmulas y semáforos ejecutivos se activarán con el motor analítico EVM."
        pendingIndicators={[
          'Curva S acumulada (PV, EV y AC) proyectada hasta la semana de corte ' + cutoffWeek,
          'Índice de Desempeño del Costo (CPI = EV / AC) y del Cronograma (SPI = EV / PV)',
          'Variación de Costo (CV = EV - AC) y Variación de Cronograma (SV = EV - PV)',
          'Estimación a la Conclusión (EAC), Variación a la Conclusión (VAC) e índice TCPI',
          'Semáforos de tolerancia definidos por la PMO (Umbral alerta 0.95 / crítico 0.90)',
        ]}
      />

      {/* Pestañas de subcolecciones */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('avance')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'avance'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Avance semanal ({avance.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('costos')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'costos'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cuentas de control de costos ({costos.length})</span>
          </button>
        </div>

        {activeTab === 'avance' && (
          <label className="flex items-center gap-2 text-xs text-[#2D3748] cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
            <input
              type="checkbox"
              checked={filterOnlyCutoffWeek}
              onChange={(e) => setFilterOnlyCutoffWeek(e.target.checked)}
              className="rounded border-[#E2E8F0] text-[#00D4B2] focus:ring-[#00D4B2]"
            />
            <span>Filtrar solo Semana de corte ({cutoffWeek})</span>
          </label>
        )}
      </div>

      {/* Tabla Avance Semanal */}
      {activeTab === 'avance' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F7FAFC]">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Tabla de datos crudos · Hoja «Avance_Semanal»
              </h2>
              <p className="text-xs text-[#718096]">
                Reporte de porcentaje de completitud física acumulada y costo real incurrido por semana.
              </p>
            </div>
            <div className="text-xs text-[#0A2540] font-semibold bg-white px-3 py-1.5 rounded border border-[#E2E8F0]">
              Total costo real cargado: {projectData?.proyecto?.moneda || 'PEN'} {totalCostoRealRegistrado.toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">Semana</th>
                  <th scope="col" className="py-3 px-4">Código actividad</th>
                  <th scope="col" className="py-3 px-4 text-center">% Completado acumulado</th>
                  <th scope="col" className="py-3 px-4 text-right">Costo real de la semana</th>
                  <th scope="col" className="py-3 px-4 text-center">Estado de corte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {displayedAvance.map((item, idx) => {
                  const isCurrentCutoff = Number(item.semana) === Number(cutoffWeek);
                  const pctFormatted = typeof item.pct_completado_acum === 'number'
                    ? `${(item.pct_completado_acum <= 1 ? item.pct_completado_acum * 100 : item.pct_completado_acum).toFixed(1)}%`
                    : (item.pct_completado_acum || 'Sin datos');

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[#F7FAFC] transition-colors ${
                        isCurrentCutoff ? 'bg-[#00D4B2]/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#0A2540]">
                        Semana {item.semana ?? 'Sin datos'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540]">
                        {item.codigo || 'Sin datos'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {pctFormatted}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                        {typeof item.costo_real_semana === 'number'
                          ? `${projectData?.proyecto?.moneda || 'PEN'} ${item.costo_real_semana.toLocaleString()}`
                          : (item.costo_real_semana || 'Sin datos')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCurrentCutoff ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00D4B2] text-[#0A2540]">
                            Corte activo (S{cutoffWeek})
                          </span>
                        ) : Number(item.semana) < Number(cutoffWeek) ? (
                          <span className="text-[11px] text-slate-500">Histórico</span>
                        ) : (
                          <span className="text-[11px] text-blue-600">Proyección posterior</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Costos */}
      {activeTab === 'costos' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Costos»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {costos.length} cuentas registradas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Cuenta de control</th>
                  <th scope="col" className="py-3 px-4">Concepto presupuestario</th>
                  <th scope="col" className="py-3 px-4 text-right">Monto asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {costos.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{c.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {c.cuenta_control || 'Sin datos'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{c.concepto || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                      {typeof c.monto === 'number'
                        ? `${projectData?.proyecto?.moneda || 'PEN'} ${c.monto.toLocaleString()}`
                        : (c.monto || 'Sin datos')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
