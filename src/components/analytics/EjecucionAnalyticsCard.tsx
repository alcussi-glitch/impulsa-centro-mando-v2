/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  GitPullRequest,
  CheckSquare,
  AlertTriangle,
  FileCheck,
  Clock,
  XCircle,
} from 'lucide-react';
import { ExecutionAnalyticsResult } from '../../services/projectAnalyticsService.ts';

interface EjecucionAnalyticsCardProps {
  analytics: ExecutionAnalyticsResult;
  cutoffWeek: number;
}

export const EjecucionAnalyticsCard: React.FC<EjecucionAnalyticsCardProps> = ({
  analytics,
  cutoffWeek,
}) => {
  const {
    incidentesAbiertosPorPrioridad,
    noConformidadesCalidadAbiertas,
    solicitudesCambioPorEstado,
  } = analytics;

  const tieneIncidentesCriticos = incidentesAbiertosPorPrioridad.critica > 0;

  return (
    <div className="space-y-5">
      {/* ALERTA DE INCIDENTES CRÍTICOS ABIERTOS */}
      {tieneIncidentesCriticos && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-xl shadow-xs flex items-start gap-3">
          <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-200 px-2 py-0.5 rounded">
                INCIDENTE CRÍTICO EN EJECUCIÓN
              </span>
              <span className="text-xs text-rose-700 font-semibold">
                Semana {cutoffWeek}
              </span>
            </div>
            <h3 className="text-sm font-bold text-rose-950 mt-1 font-['Montserrat']">
              {incidentesAbiertosPorPrioridad.critica} incidente(s) de prioridad crítica sin resolver
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Requieren atención inmediata de soporte y del director de proyecto para evitar interrupciones en la ruta crítica.
            </p>
          </div>
        </div>
      )}

      {/* KPIS DE EJECUCIÓN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Incidentes Abiertos */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Incidentes Abiertos</span>
            <AlertTriangle className={`w-4 h-4 ${incidentesAbiertosPorPrioridad.totalAbiertos > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${incidentesAbiertosPorPrioridad.totalAbiertos > 0 ? 'text-amber-600' : 'text-[#0A2540]'}`}>
              {incidentesAbiertosPorPrioridad.totalAbiertos}
            </span>
            <span className="text-xs text-[#718096]">sin resolver</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            {incidentesAbiertosPorPrioridad.critica} críticos · {incidentesAbiertosPorPrioridad.alta} altos
          </span>
        </div>

        {/* No conformidades de calidad abiertas */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">No Conformidades</span>
            <FileCheck className="w-4 h-4 text-[#00D4B2]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${noConformidadesCalidadAbiertas.totalAbiertas > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {noConformidadesCalidadAbiertas.totalAbiertas}
            </span>
            <span className="text-xs text-[#718096]">en calidad</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            {noConformidadesCalidadAbiertas.totalAprobadas} estándares aprobados
          </span>
        </div>

        {/* Solicitudes de cambio aprobadas */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Cambios Aprobados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {solicitudesCambioPorEstado.aprobadas}
            </span>
            <span className="text-xs text-[#718096]">/ {solicitudesCambioPorEstado.total}</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            Comité de Control de Cambios (CCB)
          </span>
        </div>

        {/* Solicitudes en revisión */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider">Cambios Pendientes</span>
            <GitPullRequest className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-sky-600">
              {solicitudesCambioPorEstado.enRevision}
            </span>
            <span className="text-xs text-[#718096]">en revisión</span>
          </div>
          <span className="text-[11px] text-[#718096] mt-1 block">
            {solicitudesCambioPorEstado.rechazadas} solicitudes rechazadas
          </span>
        </div>
      </div>

      {/* DETALLE: 3 PANELES COMPARATIVOS DE EJECUCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Panel 1: Incidentes por Prioridad */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Incidentes por Prioridad
              </h3>
              <span className="text-xs font-mono font-bold text-[#0A2540]">
                {incidentesAbiertosPorPrioridad.totalAbiertos} abiertos
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-xs font-bold text-rose-900">Crítica</span>
                </div>
                <span className="font-mono font-bold text-sm text-rose-700">
                  {incidentesAbiertosPorPrioridad.critica}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-900">Alta</span>
                </div>
                <span className="font-mono font-bold text-sm text-amber-700">
                  {incidentesAbiertosPorPrioridad.alta}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-xs font-bold text-sky-900">Media</span>
                </div>
                <span className="font-mono font-bold text-sm text-sky-700">
                  {incidentesAbiertosPorPrioridad.media}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Baja</span>
                </div>
                <span className="font-mono font-bold text-sm text-slate-600">
                  {incidentesAbiertosPorPrioridad.baja}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#718096] mt-4 block text-center">
            {incidentesAbiertosPorPrioridad.totalCerrados} resueltos históricamente
          </span>
        </div>

        {/* Panel 2: No conformidades de Calidad */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Aseguramiento de Calidad
              </h3>
              <span className="text-xs font-mono font-bold text-[#0A2540]">
                {noConformidadesCalidadAbiertas.totalAbiertas} no conformes
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] text-[#718096] uppercase font-bold block">
                  Criterios de Aceptación
                </span>
                <span className="text-xl font-bold font-mono text-[#0A2540] mt-1 block">
                  {noConformidadesCalidadAbiertas.totalAprobadas + noConformidadesCalidadAbiertas.totalAbiertas} inspecciones
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-900">Estándares Cumplidos</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">
                  {noConformidadesCalidadAbiertas.totalAprobadas}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-900">No Conformidades</span>
                </div>
                <span className="font-mono font-bold text-rose-700">
                  {noConformidadesCalidadAbiertas.totalAbiertas}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#718096] mt-4 block text-center">
            {noConformidadesCalidadAbiertas.totalAbiertas === 0 ? 'Calidad 100% conforme' : 'Requiere acción correctiva'}
          </span>
        </div>

        {/* Panel 3: Solicitudes de Cambio */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Control Integrado de Cambios
              </h3>
              <span className="text-xs font-mono font-bold text-[#0A2540]">
                {solicitudesCambioPorEstado.total} solicitudes
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-900">Aprobadas</span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {solicitudesCambioPorEstado.aprobadas}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-xs font-bold text-sky-900">En Revisión</span>
                </div>
                <span className="font-mono font-bold text-sm text-sky-700">
                  {solicitudesCambioPorEstado.enRevision}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Rechazadas</span>
                </div>
                <span className="font-mono font-bold text-sm text-slate-600">
                  {solicitudesCambioPorEstado.rechazadas}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-xs font-bold text-purple-900">Implementadas</span>
                </div>
                <span className="font-mono font-bold text-sm text-purple-700">
                  {solicitudesCambioPorEstado.implementadas}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#718096] mt-4 block text-center">
            Gobernanza CCB / Comité de Cambios
          </span>
        </div>
      </div>
    </div>
  );
};
