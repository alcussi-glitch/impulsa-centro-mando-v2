/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Star,
} from 'lucide-react';
import {
  StakeholdersAnalyticsResult,
  StakeholderQuadrant,
} from '../../services/projectAnalyticsService.ts';

interface InteresadosAnalyticsCardProps {
  analytics: StakeholdersAnalyticsResult;
}

export const InteresadosAnalyticsCard: React.FC<InteresadosAnalyticsCardProps> = ({ analytics }) => {
  const {
    interesadosEvaluados,
    porCuadrante,
    conteoPorCuadrante,
    interesadosConBrecha,
    brechaPromedio,
  } = analytics;

  const cuadrantesConfig: Array<{
    id: StakeholderQuadrant;
    title: string;
    subtitle: string;
    badgeColor: string;
    bgClass: string;
    borderClass: string;
  }> = [
    {
      id: 'Gestionar atentamente',
      title: 'Gestionar atentamente',
      subtitle: 'Alto Poder (≥4) · Alto Interés (≥4)',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      bgClass: 'bg-rose-50/40',
      borderClass: 'border-rose-200',
    },
    {
      id: 'Mantener satisfecho',
      title: 'Mantener satisfecho',
      subtitle: 'Alto Poder (≥4) · Bajo Interés (<4)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      bgClass: 'bg-amber-50/40',
      borderClass: 'border-amber-200',
    },
    {
      id: 'Mantener informado',
      title: 'Mantener informado',
      subtitle: 'Bajo Poder (<4) · Alto Interés (≥4)',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      bgClass: 'bg-sky-50/40',
      borderClass: 'border-sky-200',
    },
    {
      id: 'Monitorear',
      title: 'Monitorear',
      subtitle: 'Bajo Poder (<4) · Bajo Interés (<4)',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      bgClass: 'bg-slate-50/40',
      borderClass: 'border-slate-200',
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. KPIS DE INTERESADOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Interesados */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Mapeados</span>
            <Users className="w-4 h-4 text-[#00D4B2]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0A2540]">
              {interesadosEvaluados.length}
            </span>
            <span className="text-xs text-[#718096]">actores clave</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Matriz de interesados PMBOK
          </span>
        </div>

        {/* Prioridad Máxima (Gestionar Atentamente) */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Gestionar Atentamente</span>
            <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-600">
              {conteoPorCuadrante['Gestionar atentamente']}
            </span>
            <span className="text-xs text-rose-700 font-medium">prioritarios</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Poder ≥ 4 e Interés ≥ 4
          </span>
        </div>

        {/* Interesados con brecha */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Con Brecha</span>
            <AlertTriangle className={`w-4 h-4 ${interesadosConBrecha.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${interesadosConBrecha.length > 0 ? 'text-amber-600' : 'text-[#0A2540]'}`}>
              {interesadosConBrecha.length}
            </span>
            <span className="text-xs text-[#718096]">de {interesadosEvaluados.length}</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Participación deseada &gt; actual
          </span>
        </div>

        {/* Brecha promedio */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Brecha Promedio</span>
            <Compass className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-sky-600">
              {brechaPromedio}
            </span>
            <span className="text-xs text-[#718096]">niveles</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Escala de compromiso PMBOK (1-5)
          </span>
        </div>
      </div>

      {/* 2. MATRIZ DE CUADRANTES PODER / INTERÉS (4 CUADRANTES) */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
            Matriz Poder vs. Interés (Cuadrantes PMBOK 8)
          </h3>
          <p className="text-xs text-[#718096]">
            Clasificación estratégica para calibrar los canales, periodicidad y tono de comunicación con cada interesado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {cuadrantesConfig.map((q) => {
            const list = porCuadrante[q.id] || [];

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border ${q.borderClass} ${q.bgClass} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${q.badgeColor}`}>
                      {q.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0A2540]">
                      {list.length} {list.length === 1 ? 'interesado' : 'interesados'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#718096] block mb-3 font-mono">
                    {q.subtitle}
                  </span>

                  {list.length > 0 ? (
                    <div className="space-y-2">
                      {list.map((stk) => (
                        <div
                          key={stk.id}
                          className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[11px] text-[#0A2540]">
                                {stk.id}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 truncate block">
                                {stk.interesado}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#718096] block truncate">
                              {stk.rol}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono font-bold text-slate-600 block">
                              P:{stk.poder} · I:{stk.interes}
                            </span>
                            {stk.brecha > 0 ? (
                              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-bold inline-block mt-0.5">
                                Brecha +{stk.brecha}
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 font-medium inline-block mt-0.5">
                                Alineado
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      Sin interesados en este cuadrante
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TABLA DE EVALUACIÓN Y BRECHA DE PARTICIPACIÓN */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Evaluación de brecha de participación (Actual vs. Deseada)
            </h3>
            <p className="text-xs text-[#718096]">
              Niveles PMBOK: Inconsciente (1) → Renuente (2) → Neutral (3) → Partidario (4) → Líder (5).
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
            {interesadosConBrecha.length} con brecha de involucramiento
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4">ID</th>
                <th scope="col" className="py-3 px-4">Interesado</th>
                <th scope="col" className="py-3 px-4">Rol / Entidad</th>
                <th scope="col" className="py-3 px-3 text-center">Poder</th>
                <th scope="col" className="py-3 px-3 text-center">Interés</th>
                <th scope="col" className="py-3 px-3">Cuadrante Asignado</th>
                <th scope="col" className="py-3 px-3">Participación Actual</th>
                <th scope="col" className="py-3 px-3">Participación Deseada</th>
                <th scope="col" className="py-3 px-3 text-center">Brecha</th>
                <th scope="col" className="py-3 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {interesadosEvaluados.map((stk) => {
                const hasGap = stk.brecha > 0;

                return (
                  <tr
                    key={stk.id}
                    className={`hover:bg-[#F7FAFC] transition-colors ${
                      hasGap ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {stk.id}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {stk.interesado}
                    </td>
                    <td className="py-3 px-4 text-[#718096]">
                      {stk.rol}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {stk.poder}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {stk.interes}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-700">
                        {stk.cuadrante}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        {stk.participacionActual}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
                        {stk.participacionDeseada}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {hasGap ? (
                        <span className="text-amber-700 font-bold">+{stk.brecha}</span>
                      ) : (
                        <span className="text-emerald-600">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {hasGap ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded font-bold text-[10px] uppercase">
                          Cerrar brecha
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px]">
                          Alineado
                        </span>
                      )}
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
