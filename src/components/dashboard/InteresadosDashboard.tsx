/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  MessageSquare,
  Send,
  Eye,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
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
  Cell,
} from 'recharts';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { DashboardToolbar } from '../common/DashboardToolbar.tsx';
import { TrafficLightBadge, TrafficLightColor } from '../common/TrafficLightBadge.tsx';
import { EmptyState } from '../common/EmptyState.tsx';

interface DashboardProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const InteresadosDashboard: React.FC<DashboardProps> = ({
  cutoffWeek,
  onNavigateToData,
}) => {
  const { projectData, projectAnalytics, updateCutoffWeek } = useProjectData();
  const [selectedAudiencia, setSelectedAudiencia] = useState<string>('TODAS');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);

  const interesados = projectData?.interesados || [];
  const plan = projectData?.plan_comunicaciones || [];
  const emitidas = projectData?.comunicaciones || [];

  const tieneDatos = interesados.length > 0 || plan.length > 0 || emitidas.length > 0;

  // Audiencias disponibles
  const audiencias = useMemo(() => {
    const set = new Set<string>();
    plan.forEach((p) => {
      if (p.audiencia) set.add(p.audiencia);
    });
    emitidas.forEach((e) => {
      if (e.audiencia) set.add(e.audiencia);
    });
    return Array.from(set).sort();
  }, [plan, emitidas]);

  if (!tieneDatos || !projectData) {
    return (
      <div className="space-y-6">
        <DashboardToolbar
          title="Tablero de Interesados y Comunicación"
          subtitle="Matriz de poder/interés, brechas de involucramiento y efectividad de comunicaciones."
          domainTag="PMBOK 8 · Dominio de Interesados y Comunicaciones"
          cutoffWeek={cutoffWeek}
          onCutoffChange={updateCutoffWeek}
        />
        <EmptyState
          sectionTitle="Gobernanza, Interesados y Comunicaciones"
          sectionSubtitle="Alineamiento estratégico de partes interesadas internas y externas"
          pmbokDomain="Dominio de Interesados y Comunicaciones (PMBOK 8)"
          expectedContent={[
            'Matriz de poder/interés con clasificación en los 4 cuadrantes estratégicos PMBOK.',
            'Brecha de participación: nivel actual vs nivel deseado (Inconsciente a Líder).',
            'Tasa de apertura de comunicaciones y utilidad percibida por audiencia.',
            'Días promedio de retraso en la emisión y respuesta de comunicaciones.',
            'Plan formal de difusión y registro de eventos emitidos.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  const analyticsInteresados = projectAnalytics.interesados;
  const analyticsComunicaciones = projectAnalytics.comunicaciones;

  // Datos para gráfica Recharts de Brecha de Participación
  const brechaChartData = analyticsInteresados.interesadosCalculados.map((item) => ({
    name: item.interesado.length > 15 ? `${item.interesado.substring(0, 14)}…` : item.interesado,
    fullName: item.interesado,
    'Nivel Actual': item.nivelActualNum,
    'Nivel Deseado': item.nivelDeseadoNum,
    'Brecha': Math.max(0, item.brecha),
  }));

  // Datos para gráfica de Comunicaciones por Audiencia
  const comAudienciaChartData = analyticsComunicaciones.porAudiencia.map((aud) => ({
    audiencia: aud.audiencia.length > 18 ? `${aud.audiencia.substring(0, 16)}…` : aud.audiencia,
    fullAudiencia: aud.audiencia,
    'Tasa Apertura (%)': Number(aud.tasaAperturaPct.toFixed(1)),
    'Utilidad (1-5)': Number(aud.utilidadPromedio.toFixed(1)),
    'Días Retraso': Number(aud.diasRetrasoPromedio.toFixed(1)),
  }));

  // Filtrado de cuadrante
  const cuadrantes = [
    {
      id: 'gestionar_atentamente',
      title: 'Gestionar Atentamente',
      criterio: 'Alto Poder (≥4) · Alto Interés (≥4)',
      estrategia: 'Involucrar activamente en decisiones clave y comités de gobernanza.',
      color: 'bg-rose-50 border-rose-300 text-rose-900',
      items: analyticsInteresados.gestionarAtentamente,
    },
    {
      id: 'mantener_satisfecho',
      title: 'Mantener Satisfecho',
      criterio: 'Alto Poder (≥4) · Bajo Interés (≤3)',
      estrategia: 'Consultar requerimientos clave sin sobrecargarlos con detalles operativos.',
      color: 'bg-amber-50 border-amber-300 text-amber-900',
      items: analyticsInteresados.mantenerSatisfecho,
    },
    {
      id: 'mantener_informado',
      title: 'Mantener Informado',
      criterio: 'Bajo Poder (≤3) · Alto Interés (≥4)',
      estrategia: 'Reportes periódicos transparentes y canales de feedback ágiles.',
      color: 'bg-blue-50 border-blue-300 text-blue-900',
      items: analyticsInteresados.mantenerInformado,
    },
    {
      id: 'monitorear',
      title: 'Monitorear',
      criterio: 'Bajo Poder (≤3) · Bajo Interés (≤3)',
      estrategia: 'Seguimiento pasivo mediante boletines generales con bajo esfuerzo.',
      color: 'bg-slate-50 border-slate-300 text-slate-800',
      items: analyticsInteresados.monitorear,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra superior con selector de semana y filtros */}
      <DashboardToolbar
        title="Tablero de Interesados y Comunicación"
        subtitle="Matriz de poder/interés en 4 cuadrantes, brecha de participación y analítica de efectividad comunicacional."
        domainTag="PMBOK 8 · Dominio de Interesados y Comunicaciones"
        cutoffWeek={cutoffWeek}
        maxWeeks={projectData.proyecto?.duracion_semanas || 12}
        onCutoffChange={updateCutoffWeek}
        selectedCategory={selectedAudiencia}
        categories={audiencias}
        onCategoryChange={setSelectedAudiencia}
      />

      {/* Tarjetas KPI con textos en lenguaje sencillo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasa de Apertura */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Tasa de Apertura Global
              </span>
              <TrafficLightBadge
                color={
                  analyticsComunicaciones.tasaAperturaGlobal >= 80
                    ? 'green'
                    : analyticsComunicaciones.tasaAperturaGlobal >= 60
                    ? 'yellow'
                    : 'red'
                }
                label={`${analyticsComunicaciones.tasaAperturaGlobal.toFixed(0)}%`}
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {analyticsComunicaciones.tasaAperturaGlobal.toFixed(1)}%
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              {analyticsComunicaciones.totalAbiertos} abiertos de {analyticsComunicaciones.totalDestinatarios} enviados
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Porcentaje de correos o reportes leídos por los destinatarios a la fecha.»
          </p>
        </div>

        {/* Utilidad Percibida */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Utilidad Percibida (1 a 5)
              </span>
              <TrafficLightBadge
                color={
                  analyticsComunicaciones.utilidadPercibidaPromedio >= 4.0
                    ? 'green'
                    : analyticsComunicaciones.utilidadPercibidaPromedio >= 3.0
                    ? 'yellow'
                    : 'red'
                }
                label={`${analyticsComunicaciones.utilidadPercibidaPromedio.toFixed(1)} / 5.0`}
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-800">
              {analyticsComunicaciones.utilidadPercibidaPromedio.toFixed(1)}
              <span className="text-sm font-normal text-[#718096]"> / 5.0</span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Evaluación promedio de la audiencia
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Calificación de relevancia y claridad de los reportes emitidos.»
          </p>
        </div>

        {/* Brecha Promedio de Participación */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Brecha Promedio Involucramiento
              </span>
              <TrafficLightBadge
                color={
                  analyticsInteresados.brechaPromedio <= 0.5
                    ? 'green'
                    : analyticsInteresados.brechaPromedio <= 1.5
                    ? 'yellow'
                    : 'red'
                }
                label={
                  analyticsInteresados.brechaPromedio <= 0.5
                    ? 'Alineado'
                    : `+${analyticsInteresados.brechaPromedio.toFixed(1)} niveles`
                }
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {analyticsInteresados.brechaPromedio.toFixed(1)}
              <span className="text-sm font-normal text-[#718096]"> niveles</span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              {analyticsInteresados.totalInteresados} partes interesadas evaluadas
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Diferencia entre el involucramiento deseado y el compromiso real actual.»
          </p>
        </div>

        {/* Días Promedio de Retraso */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Días de Retraso de Respuesta
              </span>
              <TrafficLightBadge
                color={
                  analyticsComunicaciones.diasRetrasoPromedio <= 2
                    ? 'green'
                    : analyticsComunicaciones.diasRetrasoPromedio <= 4
                    ? 'yellow'
                    : 'red'
                }
                label={`${analyticsComunicaciones.diasRetrasoPromedio.toFixed(1)} días`}
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {analyticsComunicaciones.diasRetrasoPromedio.toFixed(1)}
              <span className="text-sm font-normal text-[#718096]"> días</span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Demora en confirmaciones y retroalimentación
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Tiempo promedio que tarda la audiencia en responder a reportes formales.»
          </p>
        </div>
      </div>

      {/* Matriz Poder / Interés: 4 Cuadrantes Estratégicos PMBOK */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00D4B2]" />
              <span>Matriz de Poder vs. Interés (4 Cuadrantes PMBOK)</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Clasificación de actores estratégicos con umbral de alto poder e interés en ≥ 4.
            </p>
          </div>
          {selectedQuadrant && (
            <button
              type="button"
              onClick={() => setSelectedQuadrant(null)}
              className="text-xs text-[#00D4B2] font-semibold hover:underline"
            >
              Mostrar todos los cuadrantes
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuadrantes.map((quad) => {
            const isSelected = selectedQuadrant === quad.id;
            return (
              <div
                key={quad.id}
                onClick={() => setSelectedQuadrant(isSelected ? null : quad.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${quad.color} ${
                  isSelected ? 'ring-2 ring-[#0A2540] shadow-md' : 'hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-sm font-['Montserrat']">{quad.title}</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/80 border border-current">
                    {quad.items.length} interesados
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80 mb-2">
                  {quad.criterio}
                </span>
                <p className="text-xs opacity-90 mb-3 italic">
                  Estrategia: {quad.estrategia}
                </p>

                {/* Lista de actores en el cuadrante */}
                <div className="space-y-1.5 mt-2">
                  {quad.items.length === 0 ? (
                    <span className="text-xs opacity-60 italic">Sin interesados en este cuadrante</span>
                  ) : (
                    quad.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-2 rounded bg-white/90 border border-slate-200 text-xs text-[#0A2540] flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <strong className="block">{item.interesado}</strong>
                          <span className="text-[11px] text-[#718096]">{item.rol}</span>
                        </div>
                        <div className="text-right text-[11px] font-mono shrink-0">
                          <span className="font-bold">P:{item.poder_1a5} · I:{item.interes_1a5}</span>
                          <span className="block text-[10px] text-slate-500">
                            {item.participacion_actual}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráficos Recharts: 1. Brecha de Participación y 2. Comunicaciones por Audiencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Brecha de Participación */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#E2E8F0] mb-2">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00D4B2]" />
              <span>Brecha de Participación (Actual vs. Deseada)</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Escala de involucramiento: 1 Inconsciente, 2 Reticente, 3 Neutral, 4 Partidario, 5 Líder.
            </p>
          </div>

          <div className="h-64 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brechaChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`Nivel ${val}`, name]}
                  labelFormatter={(name, payload) => payload?.[0]?.payload?.fullName || name}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="Nivel Actual" fill="#94A3B8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Nivel Deseado" fill="#0A2540" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Brecha" fill="#E01038" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Comunicaciones por Audiencia */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#E2E8F0] mb-2">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00D4B2]" />
              <span>Indicadores de Comunicación por Audiencia</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Tasa de apertura (%), utilidad percibida (1-5) y días de retraso por grupo de interés.
            </p>
          </div>

          <div className="h-64 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comAudienciaChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="audiencia" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  labelFormatter={(name, payload) => payload?.[0]?.payload?.fullAudiencia || name}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="Tasa Apertura (%)" fill="#00D4B2" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Utilidad (1-5)" fill="#0A2540" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Días Retraso" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla Detallada de Interesados y Brecha */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Evaluación Detallada de Interesados y Brecha de Compromiso
            </h2>
            <p className="text-xs text-[#718096]">
              Registro individual de participación y acciones estratégicas de mitigación de brechas.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0A2540] bg-white px-3 py-1 rounded border border-[#E2E8F0]">
            {analyticsInteresados.interesadosCalculados.length} interesados registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4">ID</th>
                <th scope="col" className="py-3 px-4">Interesado / Organización</th>
                <th scope="col" className="py-3 px-4">Rol en el Proyecto</th>
                <th scope="col" className="py-3 px-3 text-center">Poder</th>
                <th scope="col" className="py-3 px-3 text-center">Interés</th>
                <th scope="col" className="py-3 px-4">Cuadrante PMBOK</th>
                <th scope="col" className="py-3 px-4 text-center">Actual</th>
                <th scope="col" className="py-3 px-4 text-center">Deseada</th>
                <th scope="col" className="py-3 px-4 text-center">Brecha</th>
                <th scope="col" className="py-3 px-4">Estrategia Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {analyticsInteresados.interesadosCalculados.map((item, idx) => {
                const brechaColor: TrafficLightColor =
                  item.brecha <= 0 ? 'green' : item.brecha === 1 ? 'yellow' : 'red';

                return (
                  <tr key={item.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#0A2540]">
                      {item.interesado}
                    </td>
                    <td className="py-3 px-4 text-[#718096]">
                      {item.rol}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#0A2540]">
                      {item.poder_1a5}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#0A2540]">
                      {item.interes_1a5}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.cuadranteTexto}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600">
                      {item.participacion_actual} ({item.nivelActualNum})
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-[#0A2540]">
                      {item.participacion_deseada} ({item.nivelDeseadoNum})
                    </td>
                    <td className="py-3 px-4 text-center">
                      <TrafficLightBadge
                        color={brechaColor}
                        label={item.brecha > 0 ? `+${item.brecha} niveles` : 'Alineado'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-xs text-[#718096] max-w-xs">
                      {item.estrategiaRecomendada}
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
