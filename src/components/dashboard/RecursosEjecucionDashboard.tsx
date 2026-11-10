/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  AlertOctagon,
  AlertTriangle,
  CheckSquare,
  GitPullRequest,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { DashboardToolbar } from '../common/DashboardToolbar.tsx';
import { TrafficLightBadge, TrafficLightColor } from '../common/TrafficLightBadge.tsx';
import { EmptyState } from '../common/EmptyState.tsx';

interface DashboardProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const RecursosEjecucionDashboard: React.FC<DashboardProps> = ({
  cutoffWeek,
  onNavigateToData,
}) => {
  const { projectData, projectAnalytics, updateCutoffWeek } = useProjectData();
  const [selectedPersona, setSelectedPersona] = useState<string>('TODAS');

  const actividades = projectData?.actividades || [];
  const incidentes = projectData?.incidentes || [];
  const calidad = projectData?.calidad || [];
  const cambios = projectData?.cambios || [];
  const automatizaciones = projectData?.automatizaciones || [];

  const tieneDatos =
    actividades.length > 0 ||
    incidentes.length > 0 ||
    calidad.length > 0 ||
    cambios.length > 0 ||
    automatizaciones.length > 0;

  // Personas disponibles
  const personas = useMemo(() => {
    const set = new Set<string>();
    actividades.forEach((a) => {
      if (a.responsable) set.add(a.responsable);
    });
    return Array.from(set).sort();
  }, [actividades]);

  if (!tieneDatos || !projectData) {
    return (
      <div className="space-y-6">
        <DashboardToolbar
          title="Tablero de Recursos y Ejecución"
          subtitle="Carga de trabajo por persona, control de incidentes, calidad y automatizaciones."
          domainTag="PMBOK 8 · Dominio de Trabajo y Recursos"
          cutoffWeek={cutoffWeek}
          onCutoffChange={updateCutoffWeek}
        />
        <EmptyState
          sectionTitle="Gestión de Recursos y Supervisión de Ejecución"
          sectionSubtitle="Capacidad de personal, control de calidad, incidentes y flujos automatizados"
          pmbokDomain="Dominio de Trabajo y Recursos (PMBOK 8)"
          expectedContent={[
            'Carga porcentual por persona con línea de referencia al 100% de capacidad.',
            'Detección y alerta inmediata de colaboradores sobreasignados.',
            'Incidentes abiertos clasificados por nivel de severidad (Crítica, Alta, Media, Baja).',
            'No conformidades de calidad abiertas vs. criterios conformes.',
            'Solicitudes de cambio (CR) por estado y monitoreo de automatizaciones.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  const analyticsRecursos = projectAnalytics.recursos;
  const analyticsEjecucion = projectAnalytics.ejecucion;

  // Datos para gráfica de Carga por Persona con Línea de 100%
  const cargaPersonasData = analyticsRecursos.cargasPorPersona
    .filter((c) => selectedPersona === 'TODAS' || c.responsable === selectedPersona)
    .map((c) => ({
      name: c.responsable.length > 14 ? `${c.responsable.substring(0, 13)}…` : c.responsable,
      fullName: c.responsable,
      'Carga (%)': Number(c.cargaPct.toFixed(1)),
      sobreasignado: c.esSobreasignado,
      actividadesCount: c.actividadesActivas.length,
    }));

  // Datos para gráfica de Incidentes por Prioridad
  const incidentesPrioridadData = [
    {
      name: 'Crítica',
      cantidad: analyticsEjecucion.incidentesPorPrioridad.critica,
      color: '#DC2626',
    },
    {
      name: 'Alta',
      cantidad: analyticsEjecucion.incidentesPorPrioridad.alta,
      color: '#F59E0B',
    },
    {
      name: 'Media',
      cantidad: analyticsEjecucion.incidentesPorPrioridad.media,
      color: '#3B82F6',
    },
    {
      name: 'Baja',
      cantidad: analyticsEjecucion.incidentesPorPrioridad.baja,
      color: '#10B981',
    },
  ];

  // Datos para gráfica de Cambios por Estado
  const cambiosEstadoData = [
    {
      name: 'Aprobadas',
      cantidad: analyticsEjecucion.cambiosPorEstado.aprobadas,
      color: '#10B981',
    },
    {
      name: 'En Revisión',
      cantidad: analyticsEjecucion.cambiosPorEstado.enRevision,
      color: '#F59E0B',
    },
    {
      name: 'Rechazadas',
      cantidad: analyticsEjecucion.cambiosPorEstado.rechazadas,
      color: '#EF4444',
    },
    {
      name: 'Implementadas',
      cantidad: analyticsEjecucion.cambiosPorEstado.implementadas,
      color: '#0A2540',
    },
  ];

  // Métricas agregadas de automatizaciones
  const totalMinutosAutomatizados = automatizaciones.reduce(
    (acc, a) => acc + (Number(a.frecuencia_mes) || 0) * (Number(a.minutos_por_vez) || 0),
    0
  );
  const totalHorasAhorradasMes = (totalMinutosAutomatizados / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Barra superior con selector de semana y filtros */}
      <DashboardToolbar
        title="Tablero de Recursos y Ejecución"
        subtitle={`Supervisión de capacidad de equipo y control operativo para la semana ${cutoffWeek}.`}
        domainTag="PMBOK 8 · Dominio de Trabajo y Recursos"
        cutoffWeek={cutoffWeek}
        maxWeeks={projectData.proyecto?.duracion_semanas || 12}
        onCutoffChange={updateCutoffWeek}
        selectedCategory={selectedPersona}
        categories={personas}
        onCategoryChange={setSelectedPersona}
      />

      {/* Alerta de Sobreasignación de Personal */}
      {analyticsRecursos.personasSobreasignadas.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-sm font-bold text-amber-900 block">
              ALERTA DE CAPACIDAD: {analyticsRecursos.personasSobreasignadas.length} Colaborador(es) con Sobreasignación en S{cutoffWeek}
            </strong>
            <p className="text-xs text-amber-800 mt-0.5">
              Los siguientes miembros del equipo superan el 100% de dedicación acumulada en actividades activas en esta semana de corte:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {analyticsRecursos.personasSobreasignadas.map((p) => (
                <span
                  key={p.responsable}
                  className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-xs font-semibold text-amber-900 shadow-xs"
                >
                  <strong>{p.responsable}</strong>: {p.cargaPct.toFixed(0)}% ({p.actividadesActivas.length} actividades simultáneas)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Incidentes Críticos */}
      {analyticsEjecucion.incidentesCriticos > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-sm font-bold text-rose-900 block">
              ALERTA OPERATIVA: {analyticsEjecucion.incidentesCriticos} Incidente(s) Crítico(s) Abierto(s)
            </strong>
            <p className="text-xs text-rose-800 mt-0.5">
              Existen incidentes de severidad crítica no resueltos que impactan directamente el desarrollo o la infraestructura del proyecto.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas KPI con textos en lenguaje sencillo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sobreasignados */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Sobreasignados (&gt; 100%)
              </span>
              <TrafficLightBadge
                color={
                  analyticsRecursos.personasSobreasignadas.length === 0
                    ? 'green'
                    : 'yellow'
                }
                label={
                  analyticsRecursos.personasSobreasignadas.length === 0
                    ? 'Balanceado'
                    : `${analyticsRecursos.personasSobreasignadas.length} sobrecargados`
                }
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {analyticsRecursos.personasSobreasignadas.length}
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              de {analyticsRecursos.cargasPorPersona.length} colaboradores activos
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Personas cuya dedicación en actividades concurrentes de la semana excede el 100%.»
          </p>
        </div>

        {/* Incidentes Abiertos */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Incidentes Abiertos
              </span>
              <TrafficLightBadge
                color={
                  analyticsEjecucion.incidentesCriticos > 0
                    ? 'red'
                    : analyticsEjecucion.incidentesAbiertos > 0
                    ? 'yellow'
                    : 'green'
                }
                label={
                  analyticsEjecucion.incidentesCriticos > 0
                    ? `${analyticsEjecucion.incidentesCriticos} Críticos`
                    : `${analyticsEjecucion.incidentesAbiertos} Abiertos`
                }
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {analyticsEjecucion.incidentesAbiertos}
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Críticos: {analyticsEjecucion.incidentesPorPrioridad.critica} · Altos: {analyticsEjecucion.incidentesPorPrioridad.alta}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Incidencias operativas activas reportadas pendientes de solución.»
          </p>
        </div>

        {/* Calidad: No Conformidades */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Calidad: No Conformidades
              </span>
              <TrafficLightBadge
                color={
                  analyticsEjecucion.calidadNoConformidadesAbiertas === 0
                    ? 'green'
                    : 'red'
                }
                label={
                  analyticsEjecucion.calidadNoConformidadesAbiertas === 0
                    ? '100% Conforme'
                    : `${analyticsEjecucion.calidadNoConformidadesAbiertas} No Conformes`
                }
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-rose-700">
              {analyticsEjecucion.calidadNoConformidadesAbiertas}
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Criterios conformes: {analyticsEjecucion.calidadConformes}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Criterios de aceptación de entregables que no cumplen los estándares definidos.»
          </p>
        </div>

        {/* Automatizaciones */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Flujos Automatizados
              </span>
              <TrafficLightBadge color="green" label={`${automatizaciones.length} Activos`} size="sm" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-800">
              {totalHorasAhorradasMes} <span className="text-sm font-normal text-[#718096]">h/mes</span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              {automatizaciones.length} procesos automatizados en producción
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Ahorro estimado en horas-hombre mensuales por flujos robóticos en ejecución.»
          </p>
        </div>
      </div>

      {/* Gráfico Principal Recharts: Carga por Persona con Línea de Referencia del 100% */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00D4B2]" />
              <span>Carga de Trabajo por Persona en la Semana {cutoffWeek}</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Porcentaje de dedicación acumulada en actividades activas con línea límite del 100% de capacidad laboral.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="w-3 h-3 rounded bg-[#00D4B2]" /> En Capacidad (≤ 100%)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-rose-700">
              <span className="w-3 h-3 rounded bg-rose-500" /> Sobreasignado (&gt; 100%)
            </span>
          </div>
        </div>

        <div className="h-72 w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cargaPersonasData}
              margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 160]}
                ticks={[0, 50, 100, 150]}
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Dedicación acumulada']}
                labelFormatter={(name, payload) => payload?.[0]?.payload?.fullName || name}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  borderColor: '#E2E8F0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <ReferenceLine
                y={100}
                stroke="#DC2626"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'Capacidad Máxima 100%',
                  fill: '#DC2626',
                  fontSize: 11,
                  position: 'right',
                }}
              />
              <Bar dataKey="Carga (%)" radius={[4, 4, 0, 0]}>
                {cargaPersonasData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.sobreasignado ? '#DC2626' : '#00D4B2'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#718096] flex items-center justify-between">
          <span>
            Recursos Solicitados vs. Asignados: <strong className="text-[#0A2540] font-mono">{analyticsRecursos.recursosSolicitados} req / {analyticsRecursos.recursosAsignados} asig</strong>
          </span>
          <span>
            Cobertura de dotación: <strong className="text-emerald-700 font-mono">{analyticsRecursos.coberturaDotacionPct.toFixed(1)}%</strong>
          </span>
        </div>
      </div>

      {/* Gráficos Recharts en Paralelo: 1. Incidentes por Prioridad y 2. Cambios por Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidentes por Prioridad */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#E2E8F0] mb-2">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Incidentes Abiertos por Severidad</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Distribución de incidentes no resueltos por orden de impacto operativo.
            </p>
          </div>

          <div className="h-60 w-full min-h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentesPrioridadData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} incidentes`, 'Cantidad']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {incidentesPrioridadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cambios por Estado */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#E2E8F0] mb-2">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-[#00D4B2]" />
              <span>Solicitudes de Cambio (CR) por Estado</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Decisiones formales del Comité de Control de Cambios (CCB).
            </p>
          </div>

          <div className="h-60 w-full min-h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cambiosEstadoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} solicitudes`, 'Cantidad']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {cambiosEstadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Catálogo de Procesos Automatizados en Producción */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00D4B2]" />
              <span>Monitoreo de Flujos Automatizados en Producción</span>
            </h2>
            <p className="text-xs text-[#718096]">
              Catálogo de disparadores robóticos, ahorro de tiempo y nivel de riesgo por proceso.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0A2540] bg-white px-3 py-1 rounded border border-[#E2E8F0]">
            {automatizaciones.length} flujos configurados
          </span>
        </div>

        {automatizaciones.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#718096]">
            No hay procesos automatizados registrados en la base de datos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Proceso Automatizado</th>
                  <th scope="col" className="py-3 px-4">Categoría</th>
                  <th scope="col" className="py-3 px-3 text-center">Frecuencia / Mes</th>
                  <th scope="col" className="py-3 px-3 text-center">Minutos / Ejecución</th>
                  <th scope="col" className="py-3 px-3 text-center">Ahorro Mensual</th>
                  <th scope="col" className="py-3 px-4">Disparador (Trigger)</th>
                  <th scope="col" className="py-3 px-3 text-center">Riesgo Error (1-5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {automatizaciones.map((a, idx) => {
                  const freq = Number(a.frecuencia_mes) || 0;
                  const mins = Number(a.minutos_por_vez) || 0;
                  const ahorroHoras = ((freq * mins) / 60).toFixed(1);

                  return (
                    <tr key={a.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                        {a.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#0A2540]">
                        {a.proceso}
                      </td>
                      <td className="py-3 px-4 text-[#718096] whitespace-nowrap">
                        {a.categoria}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#0A2540]">
                        {freq} veces
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {mins} min
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800">
                        {ahorroHoras} h/mes
                      </td>
                      <td className="py-3 px-4 text-[#718096]">
                        {a.disparador}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            Number(a.riesgo_error_1a5) >= 4
                              ? 'bg-rose-50 text-rose-700 border border-rose-300'
                              : Number(a.riesgo_error_1a5) >= 3
                              ? 'bg-amber-50 text-amber-700 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          }`}
                        >
                          Nivel {a.riesgo_error_1a5 ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
