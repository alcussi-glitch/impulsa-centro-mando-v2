/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  CheckCircle2,
  Info,
  Filter,
} from 'lucide-react';
import { RisksAnalyticsResult, RiskMetricItem } from '../../services/projectAnalyticsService.ts';

interface RiesgosAnalyticsCardProps {
  analytics: RisksAnalyticsResult;
  cutoffWeek: number;
}

export const RiesgosAnalyticsCard: React.FC<RiesgosAnalyticsCardProps> = ({ analytics, cutoffWeek }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const {
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
  } = analytics;

  const previousWeek = Math.max(1, cutoffWeek - 1);

  // Filtrado por celda seleccionada en la matriz 5x5
  const displayedRisks = selectedCell
    ? matrizCalor[selectedCell] || []
    : riesgosEvaluados;

  return (
    <div className="space-y-5">
      {/* 1. ALERTA DESTACADA: Riesgos Materializados */}
      {riesgosMaterializados.length > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-xl shadow-xs flex items-start gap-3">
          <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-200 px-2 py-0.5 rounded">
                ALERTA DE INCERTIDUMBRE CRÍTICA
              </span>
              <span className="text-xs text-rose-600 font-semibold">
                {riesgosMaterializados.length} evento(s) materializado(s)
              </span>
            </div>
            <h3 className="text-sm font-bold text-rose-950 mt-1 font-['Montserrat']">
              Riesgo(s) clasificado(s) como «Materializado» en el proyecto
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Se requiere activar inmediatamente los planes de contingencia y verificar la disponibilidad de reservas.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {riesgosMaterializados.map((rm) => (
                <div
                  key={rm.id}
                  className="px-2.5 py-1.5 bg-white border border-rose-300 rounded-md text-xs shadow-2xs flex items-center gap-2"
                >
                  <span className="font-mono font-bold text-rose-700">{rm.id}</span>
                  <span className="text-slate-700 font-medium">{rm.riesgo}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (Resp: {rm.propietario})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. KPIS EJECUTIVOS DE RIESGO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Exposición Total */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Exposición Total</span>
            <ShieldAlert className="w-4 h-4 text-[#00D4B2]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0A2540]">
              {exposicionTotal}
            </span>
            <span className="text-xs text-[#718096]">pts acumulados</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Suma de P × I de riesgos activos
          </span>
        </div>

        {/* Riesgos Altos Abiertos */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Riesgos Altos</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-600">
              {riesgosAltosAbiertos}
            </span>
            <span className="text-xs text-rose-700 font-medium">críticos</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Puntaje ≥ {umbralAlto} (Umbral Alto)
          </span>
        </div>

        {/* Riesgos Medios y Bajos */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Medios / Bajos</span>
            <Filter className="w-4 h-4 text-[#718096]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-600">
              {riesgosMediosAbiertos}
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xl font-bold font-mono text-emerald-600">
              {riesgosBajosAbiertos}
            </span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Umbral Medio ({umbralMedio}) a Alto ({umbralAlto})
          </span>
        </div>

        {/* Riesgos que subieron frente a semana anterior */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Tendencia Sube</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-600">
              {riesgosQueSubieron.length}
            </span>
            <span className="text-xs text-[#718096]">vs. Sem. {previousWeek}</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            {riesgosQueSubieron.length > 0 ? 'Requieren revisión urgente' : 'Sin incrementos'}
          </span>
        </div>
      </div>

      {/* 3. LISTA DE RIESGOS QUE SUBIERON FRENTE A SEMANA ANTERIOR */}
      {riesgosQueSubieron.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-['Montserrat']">
                Riesgos que subieron frente a la semana anterior (Semana {previousWeek})
              </h4>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
              {riesgosQueSubieron.length} riesgo(s)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {riesgosQueSubieron.map((rq) => (
              <div
                key={rq.id}
                className="p-3 bg-white border border-amber-200 rounded-lg shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#0A2540]">{rq.id}</span>
                    <span className="text-xs font-medium text-slate-800 line-clamp-1">{rq.riesgo}</span>
                  </div>
                  <span className="text-[11px] text-[#718096]">
                    Propietario: {rq.propietario} · {rq.categoria}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right ml-3">
                  <span className="text-xs font-mono text-slate-400">
                    {rq.puntajeAnterior}
                  </span>
                  <span className="text-xs font-bold text-rose-600">→</span>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                    {rq.puntaje} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MATRIZ DE CALOR 5×5 INTERACTIVA */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Matriz de Calor 5×5 (Probabilidad × Impacto)
            </h3>
            <p className="text-xs text-[#718096]">
              Haz clic en cualquier cuadrante para filtrar los riesgos ubicados en esa coordenada.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs" />
              <span className="text-[#718096]">Bajo (&lt;{umbralMedio})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-xs" />
              <span className="text-[#718096]">Medio ({umbralMedio}-{umbralAlto - 1})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-600 rounded-xs" />
              <span className="text-[#718096]">Alto (≥{umbralAlto})</span>
            </div>
            {selectedCell && (
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="text-xs text-[#00D4B2] font-semibold hover:underline ml-2"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>

        {/* Grid 5x5 */}
        <div className="mt-4 flex flex-col items-center">
          <div className="w-full max-w-xl">
            <div className="text-[11px] font-bold text-center text-[#718096] mb-1 uppercase tracking-wider">
              ← Impacto (1 a 5) →
            </div>
            <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
              {/* Encabezado col impacto */}
              <div className="font-bold text-[#718096] py-1">P \ I</div>
              {[1, 2, 3, 4, 5].map((imp) => (
                <div key={imp} className="font-bold text-[#718096] py-1 bg-slate-50 rounded">
                  I-{imp}
                </div>
              ))}

              {/* Filas: Probabilidad de 5 a 1 */}
              {[5, 4, 3, 2, 1].map((prob) => (
                <React.Fragment key={prob}>
                  <div className="font-bold text-[#718096] flex items-center justify-center bg-slate-50 rounded">
                    P-{prob}
                  </div>
                  {[1, 2, 3, 4, 5].map((imp) => {
                    const score = prob * imp;
                    const cellKey = `${prob}_${imp}`;
                    const count = matrizCalor[cellKey]?.length || 0;
                    const isSelected = selectedCell === cellKey;

                    let bgClass = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200';
                    if (score >= umbralAlto) {
                      bgClass = 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300 font-bold';
                    } else if (score >= umbralMedio) {
                      bgClass = 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 font-semibold';
                    }

                    return (
                      <button
                        key={cellKey}
                        type="button"
                        onClick={() => setSelectedCell(isSelected ? null : cellKey)}
                        className={`h-11 rounded-lg border transition-all flex flex-col items-center justify-center cursor-pointer ${bgClass} ${
                          isSelected ? 'ring-2 ring-[#0A2540] shadow-sm' : ''
                        }`}
                        title={`P: ${prob}, I: ${imp} = Score ${score}. Riesgos: ${count}`}
                      >
                        <span className="text-[10px] opacity-70">
                          {score}
                        </span>
                        {count > 0 ? (
                          <span className="text-xs font-bold px-1.5 py-0.2 rounded-full bg-white/80 shadow-2xs">
                            {count}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-40">—</span>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. TABLA CALCULADA EN TIEMPO REAL */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Evaluación cuantitativa y tendencias de riesgos
            </h3>
            <p className="text-xs text-[#718096]">
              {selectedCell
                ? `Mostrando ${displayedRisks.length} riesgo(s) filtrados en celda P×I (${selectedCell})`
                : `${displayedRisks.length} riesgo(s) calculados en tiempo real con umbrales institucionalizados.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#718096]">
              Corte Semana {cutoffWeek}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-3">ID</th>
                <th scope="col" className="py-3 px-3">Riesgo</th>
                <th scope="col" className="py-3 px-3">Categoría</th>
                <th scope="col" className="py-3 px-2 text-center">P</th>
                <th scope="col" className="py-3 px-2 text-center">I</th>
                <th scope="col" className="py-3 px-2 text-center">Puntaje</th>
                <th scope="col" className="py-3 px-2 text-center">Nivel</th>
                <th scope="col" className="py-3 px-2 text-center">Tendencia</th>
                <th scope="col" className="py-3 px-3">Estado</th>
                <th scope="col" className="py-3 px-3">Estrategia</th>
                <th scope="col" className="py-3 px-3">Propietario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {displayedRisks.map((r) => {
                let nivelBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (r.nivel === 'alto') {
                  nivelBadge = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                } else if (r.nivel === 'medio') {
                  nivelBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                }

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-[#F7FAFC] transition-colors ${
                      r.esMaterializado ? 'bg-rose-50/70' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-2.5 px-3 font-medium max-w-xs truncate" title={r.riesgo}>
                      {r.riesgo}
                      {r.esMaterializado && (
                        <span className="ml-1.5 px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-bold rounded uppercase">
                          Materializado
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#718096] whitespace-nowrap">
                      {r.categoria}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {r.probabilidad}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {r.impacto}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-[#0A2540]">
                      {r.puntaje}
                    </td>
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${nivelBadge}`}>
                        {r.nivel}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {r.tendencia === 'sube' ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]" title={`Subió de ${r.puntajeAnterior} a ${r.puntaje}`}>
                          <TrendingUp className="w-3.5 h-3.5" /> Sube
                        </span>
                      ) : r.tendencia === 'baja' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]" title={`Bajó de ${r.puntajeAnterior} a ${r.puntaje}`}>
                          <TrendingDown className="w-3.5 h-3.5" /> Baja
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]" title="Sin variación">
                          <Minus className="w-3.5 h-3.5" /> Igual
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs text-slate-700 font-medium">
                        {r.estado}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#718096] whitespace-nowrap">
                      {r.estrategia}
                    </td>
                    <td className="py-2.5 px-3 text-[#718096] whitespace-nowrap">
                      {r.propietario}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
