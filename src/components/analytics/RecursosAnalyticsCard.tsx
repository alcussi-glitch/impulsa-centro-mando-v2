/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Clock,
  Layers,
  Briefcase,
  AlertOctagon,
} from 'lucide-react';
import { ResourcesAnalyticsResult } from '../../services/projectAnalyticsService.ts';

interface RecursosAnalyticsCardProps {
  analytics: ResourcesAnalyticsResult;
  cutoffWeek: number;
}

export const RecursosAnalyticsCard: React.FC<RecursosAnalyticsCardProps> = ({ analytics, cutoffWeek }) => {
  const {
    cargasPorPersona,
    personasSobreasignadas,
    totalRecursosSolicitados,
    totalRecursosAsignados,
    tasaAsignacionGlobalPct,
    detalleRecursos,
  } = analytics;

  return (
    <div className="space-y-5">
      {/* 1. ALERTA DE SOBREASIGNACIÓN (> 100%) */}
      {personasSobreasignadas.length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl shadow-xs flex items-start gap-3">
          <div className="p-2 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                ALERTA DE SOBREASIGNACIÓN DE RECURSOS
              </span>
              <span className="text-xs text-amber-700 font-semibold">
                Semana {cutoffWeek}
              </span>
            </div>
            <h3 className="text-sm font-bold text-amber-950 mt-1 font-['Montserrat']">
              {personasSobreasignadas.length} persona(s) superan el 100% de dedicación en actividades activas
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Riesgo inminente de fatiga, cuello de botella operativo y retraso en entregables críticos.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {personasSobreasignadas.map((p) => (
                <div
                  key={p.persona}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 rounded-md text-xs shadow-2xs flex items-center gap-2"
                >
                  <span className="font-bold text-[#0A2540]">{p.persona}</span>
                  <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-mono font-bold">
                    {p.cargaTotalPct}% carga
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({p.actividadesActivas.length} actividades concurrentes)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. KPIS DE RECURSOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Personas en semana activa */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Personas Activas</span>
            <Users className="w-4 h-4 text-[#00D4B2]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0A2540]">
              {cargasPorPersona.length}
            </span>
            <span className="text-xs text-[#718096]">en S{cutoffWeek}</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Responsables con tareas activas
          </span>
        </div>

        {/* Personas sobreasignadas */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Sobreasignadas</span>
            <AlertTriangle className={`w-4 h-4 ${personasSobreasignadas.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${personasSobreasignadas.length > 0 ? 'text-amber-600' : 'text-[#0A2540]'}`}>
              {personasSobreasignadas.length}
            </span>
            <span className="text-xs text-[#718096]">&gt; 100% carga</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            {personasSobreasignadas.length > 0 ? 'Requiere nivelación' : 'Carga balanceada'}
          </span>
        </div>

        {/* Recursos solicitados vs asignados */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Solicitados vs Asig.</span>
            <Layers className="w-4 h-4 text-[#718096]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0A2540]">
              {totalRecursosAsignados}
            </span>
            <span className="text-xs text-[#718096]">/ {totalRecursosSolicitados}</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Recursos institucionales
          </span>
        </div>

        {/* Tasa de asignación global */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Tasa Asignación</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {tasaAsignacionGlobalPct}%
            </span>
            <span className="text-xs text-[#718096]">cubiertos</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            {tasaAsignacionGlobalPct >= 100 ? 'Dotación completa' : 'Déficit de dotación'}
          </span>
        </div>
      </div>

      {/* 3. TABLA DE CARGA DE TRABAJO POR PERSONA EN SEMANA ACTIVA */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Carga semanal de trabajo por persona (Semana {cutoffWeek})
            </h3>
            <p className="text-xs text-[#718096]">
              Suma de dedicación porcentual (% dedicacion) de actividades activas durante la semana de corte.
            </p>
          </div>
          <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
            {cargasPorPersona.length} personas evaluadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4">Responsable / Rol</th>
                <th scope="col" className="py-3 px-4">Actividades activas en S{cutoffWeek}</th>
                <th scope="col" className="py-3 px-4 text-center">N° Actividades</th>
                <th scope="col" className="py-3 px-4" style={{ width: '220px' }}>Carga Total (% dedicación)</th>
                <th scope="col" className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {cargasPorPersona.map((p) => {
                const isOver = p.sobreasignado;
                const barWidth = Math.min(100, p.cargaTotalPct);

                return (
                  <tr
                    key={p.persona}
                    className={`hover:bg-[#F7FAFC] transition-colors ${
                      isOver ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-[#0A2540] whitespace-nowrap">
                      {p.persona}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {p.actividadesActivas.map((act) => (
                          <span
                            key={act.codigo}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                            title={`${act.actividad} (Sem. ${act.sem_inicio_plan} a ${act.sem_fin_plan}): ${act.dedicacion_pct}%`}
                          >
                            <span className="font-mono font-bold text-[#0A2540]">{act.codigo}</span>
                            <span className="text-[10px] text-slate-500">({act.dedicacion_pct}%)</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {p.actividadesActivas.length}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver ? 'bg-rose-500' : p.cargaTotalPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono font-bold text-xs shrink-0 ${
                            isOver ? 'text-rose-600' : 'text-[#0A2540]'
                          }`}
                        >
                          {p.cargaTotalPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isOver ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-bold text-[10px] uppercase">
                          Sobreasignado
                        </span>
                      ) : p.cargaTotalPct >= 80 ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded font-medium text-[10px] uppercase">
                          Carga Alta
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium text-[10px] uppercase">
                          Balanceado
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

      {/* 4. TABLA DE RECURSOS SOLICITADOS VS ASIGNADOS */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Balance de recursos: Solicitados vs. Asignados
            </h3>
            <p className="text-xs text-[#718096]">
              Inventario de dotación técnica, personal y equipamiento frente a la demanda del proyecto.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {tasaAsignacionGlobalPct}% asignación global
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4">ID</th>
                <th scope="col" className="py-3 px-4">Recurso</th>
                <th scope="col" className="py-3 px-4">Tipo</th>
                <th scope="col" className="py-3 px-4 text-center">Solicitado</th>
                <th scope="col" className="py-3 px-4 text-center">Asignado</th>
                <th scope="col" className="py-3 px-4 text-center">Estado Dotación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {detalleRecursos.map((r) => (
                <tr key={r.id} className="hover:bg-[#F7FAFC] transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-[#0A2540]">{r.id}</td>
                  <td className="py-2.5 px-4 font-medium">{r.recurso}</td>
                  <td className="py-2.5 px-4 text-[#718096]">{r.tipo}</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#0A2540]">{r.solicitado}</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-700">{r.asignado}</td>
                  <td className="py-2.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.estado === 'Completo'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : r.estado === 'Parcial'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
