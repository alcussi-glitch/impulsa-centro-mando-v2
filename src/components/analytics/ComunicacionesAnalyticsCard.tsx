/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  MessageSquare,
  MailCheck,
  Star,
  Clock,
  Users,
  Calendar,
  Send,
  BarChart2,
} from 'lucide-react';
import { CommunicationsAnalyticsResult } from '../../services/projectAnalyticsService.ts';

interface ComunicacionesAnalyticsCardProps {
  analytics: CommunicationsAnalyticsResult;
  cutoffWeek: number;
}

export const ComunicacionesAnalyticsCard: React.FC<ComunicacionesAnalyticsCardProps> = ({
  analytics,
  cutoffWeek,
}) => {
  const {
    comunicacionesEvaluadas,
    tasaAperturaGlobalPct,
    utilidadPercibidaPromedio,
    diasRetrasoPromedio,
    porAudiencia,
    porSemana,
  } = analytics;

  const totalComms = comunicacionesEvaluadas.length;

  return (
    <div className="space-y-5">
      {/* 1. KPIS DE COMUNICACIONES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tasa de apertura global (abiertos / destinatarios) */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Tasa de Apertura</span>
            <MailCheck className="w-4 h-4 text-[#00D4B2]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0A2540]">
              {tasaAperturaGlobalPct}%
            </span>
            <span className="text-xs text-[#718096]">abiertos</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Fórmula: abiertos / destinatarios
          </span>
        </div>

        {/* Utilidad percibida promedio */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Utilidad Percibida</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {utilidadPercibidaPromedio}
            </span>
            <span className="text-xs text-[#718096]">/ 5.0</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Encuesta de satisfacción de receptores
          </span>
        </div>

        {/* Días promedio de retraso en la respuesta */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Días de Retraso</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-sky-600">
              {diasRetrasoPromedio}
            </span>
            <span className="text-xs text-[#718096]">días promedio</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Tiempo de retroalimentación
          </span>
        </div>

        {/* Total comunicaciones emitidas */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Comunicaciones</span>
            <Send className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0A2540]">
              {totalComms}
            </span>
            <span className="text-xs text-[#718096]">emitidas</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            A la semana de corte {cutoffWeek}
          </span>
        </div>
      </div>

      {/* 2. DESGLOSE POR AUDIENCIA Y POR SEMANA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Desglose por Audiencia */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC]">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Rendimiento de comunicación por audiencia
            </h3>
            <p className="text-xs text-[#718096]">
              Apertura, utilidad y tiempos de respuesta segmentados por tipo de receptor.
            </p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-2.5 px-3">Audiencia</th>
                  <th scope="col" className="py-2.5 px-3 text-center">N° Envíos</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Tasa Apertura</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Utilidad</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Retraso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {porAudiencia.map((aud) => (
                  <tr key={aud.audiencia} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#0A2540]">
                      {aud.audiencia}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {aud.totalComunicaciones}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-700">
                        {aud.tasaAperturaPromedioPct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-700 font-bold">
                      ★ {aud.utilidadPromedio}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {aud.diasRetrasoPromedio} d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desglose por Semana */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC]">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Evolución semanal de comunicaciones (S1 a Sk)
            </h3>
            <p className="text-xs text-[#718096]">
              Monitoreo longitudinal de receptividad e involucramiento por semana de proyecto.
            </p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-2.5 px-3 text-center">Semana</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Envíos</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Tasa Apertura</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Utilidad Promedio</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Días Retraso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {porSemana.map((w) => (
                  <tr key={w.semana} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0A2540]">
                      Semana {w.semana}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {w.totalComunicaciones}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-700">
                        {w.tasaAperturaPromedioPct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-700 font-bold">
                      ★ {w.utilidadPromedio}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {w.diasRetrasoPromedio} d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. TABLA DETALLADA DE COMUNICACIONES */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Registro analítico de comunicaciones emitidas
            </h3>
            <p className="text-xs text-[#718096]">
              Cálculo individual de tasa de apertura (abiertos / destinatarios), utilidad y respuesta.
            </p>
          </div>
          <span className="text-xs text-[#718096]">
            Corte evaluativo: Semana {cutoffWeek}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4 text-center">Semana</th>
                <th scope="col" className="py-3 px-4">Comunicación / Asunto</th>
                <th scope="col" className="py-3 px-4">Audiencia Destinataria</th>
                <th scope="col" className="py-3 px-3 text-center">Destinatarios</th>
                <th scope="col" className="py-3 px-3 text-center">Abiertos</th>
                <th scope="col" className="py-3 px-3 text-center">Tasa Apertura</th>
                <th scope="col" className="py-3 px-3 text-center">Utilidad</th>
                <th scope="col" className="py-3 px-3 text-center">Retraso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {comunicacionesEvaluadas.map((c, idx) => (
                <tr key={c.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#0A2540]">
                    S{c.semana}
                  </td>
                  <td className="py-2.5 px-4 font-medium">
                    {c.comunicacion}
                  </td>
                  <td className="py-2.5 px-4 text-[#718096]">
                    {c.audiencia}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {c.destinatarios}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-emerald-700">
                    {c.abiertos}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c.tasaAperturaPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                    ★ {c.utilidadPercibida}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                    {c.diasRetrasoRespuesta} d
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
