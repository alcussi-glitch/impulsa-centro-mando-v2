/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Filter,
  User,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { DashboardToolbar } from '../common/DashboardToolbar.tsx';
import { TrafficLightBadge, TrafficLightColor } from '../common/TrafficLightBadge.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { calculateEvmMetrics, formatCurrencyAmount } from '../../services/evmService.ts';

interface DashboardProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const RiesgosDashboard: React.FC<DashboardProps> = ({
  cutoffWeek,
  onNavigateToData,
}) => {
  const { projectData, projectAnalytics, updateCutoffWeek } = useProjectData();
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);

  const riesgosRaw = projectData?.riesgos || [];
  const tieneDatos = riesgosRaw.length > 0;

  // Lista de categorías de riesgos disponibles
  const categories = useMemo(() => {
    const set = new Set<string>();
    riesgosRaw.forEach((r) => {
      if (r.categoria) set.add(r.categoria);
    });
    return Array.from(set).sort();
  }, [riesgosRaw]);

  // Filtrado por categoría
  const riesgosFiltrados = useMemo(() => {
    if (selectedCategory === 'TODAS') return projectAnalytics.riesgos.riesgosCalculados;
    return projectAnalytics.riesgos.riesgosCalculados.filter(
      (r) => r.categoria === selectedCategory
    );
  }, [projectAnalytics.riesgos.riesgosCalculados, selectedCategory]);

  if (!tieneDatos || !projectData) {
    return (
      <div className="space-y-6">
        <DashboardToolbar
          title="Tablero de Gestión de Riesgos"
          subtitle="Matriz de calor 5×5, top 5 de amenazas, evolución temporal y control de contingencia."
          domainTag="PMBOK 8 · Dominio de Incertidumbre y Riesgos"
          cutoffWeek={cutoffWeek}
          onCutoffChange={updateCutoffWeek}
        />
        <EmptyState
          sectionTitle="Matriz Cuantitativa y Gestión de Riesgos"
          sectionSubtitle="Identificación, priorización algorítmica y planes de contingencia"
          pmbokDomain="Dominio de Incertidumbre y Riesgos (PMBOK 8)"
          expectedContent={[
            'Matriz de calor 5×5 interactiva con graduación cromática según umbrales de la PMO.',
            'Puntaje de exposición = Probabilidad (1-5) × Impacto (1-5) con semáforos Bajo/Medio/Alto.',
            'Tendencia histórica de criticidad (sube, baja o igual) frente a la semana anterior.',
            'Monitoreo de reserva de contingencia consumida vs. disponible.',
            'Detección inmediata de amenazas en estado «Materializado».',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  const evm = calculateEvmMetrics(projectData, cutoffWeek);
  const currency = evm.currency;
  const umbralMedio = projectAnalytics.riesgos.umbralMedio;
  const umbralAlto = projectAnalytics.riesgos.umbralAlto;

  // Matriz 5x5: agrupar los riesgos por (probabilidad, impacto)
  const matrixCells: Record<string, typeof riesgosFiltrados> = {};
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      matrixCells[`${p}-${i}`] = [];
    }
  }

  riesgosFiltrados.forEach((r) => {
    const p = Math.min(5, Math.max(1, r.probabilidad_1a5));
    const i = Math.min(5, Math.max(1, r.impacto_1a5));
    const key = `${p}-${i}`;
    if (matrixCells[key]) {
      matrixCells[key].push(r);
    }
  });

  // Riesgos a mostrar en la tabla de detalle (si se seleccionó una celda, solo los de esa celda; sino todos)
  const displayedRiesgos = selectedCell
    ? matrixCells[`${selectedCell.p}-${selectedCell.i}`] || []
    : riesgosFiltrados;

  // Top 5 riesgos ordenados por puntaje descendente
  const top5Riesgos = [...riesgosFiltrados]
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 5);

  // Evolución histórica de riesgos según `Riesgos_Historial`
  const historial = projectData.riesgos_historial || [];
  const semanasHistorial = Array.from(
    new Set(historial.map((h) => Number(h.semana)).filter((s) => s > 0 && s <= cutoffWeek))
  ).sort((a, b) => a - b);

  const evolucionPuntajeData = semanasHistorial.map((sem) => {
    const itemsSem = historial.filter((h) => Number(h.semana) === sem);
    const sumaPuntaje = itemsSem.reduce(
      (acc, curr) => acc + (Number(curr.probabilidad_1a5) || 1) * (Number(curr.impacto_1a5) || 1),
      0
    );
    return {
      semana: `S${sem}`,
      'Puntaje Acumulado': sumaPuntaje,
      'Amenazas Registradas': itemsSem.length,
    };
  });

  // Si no hay suficiente historial, añadir la semana activa para que la gráfica no esté vacía
  if (evolucionPuntajeData.length === 0) {
    evolucionPuntajeData.push({
      semana: `S${cutoffWeek}`,
      'Puntaje Acumulado': projectAnalytics.riesgos.exposicionTotal,
      'Amenazas Registradas': riesgosFiltrados.length,
    });
  }

  // Datos para gráfico de contingencia
  const contingenciaData = [
    {
      name: 'Disponible',
      monto: evm.contingenciaDisponible,
      color: '#10B981',
    },
    {
      name: 'Consumida',
      monto: evm.contingenciaGastada,
      color: '#DC2626',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra superior con selector y filtro de categoría */}
      <DashboardToolbar
        title="Tablero de Gestión de Riesgos"
        subtitle="Matriz de calor 5×5 interactiva, top 5 amenazas, evolución del riesgo y balance de contingencia."
        domainTag="PMBOK 8 · Dominio de Incertidumbre y Riesgos"
        cutoffWeek={cutoffWeek}
        maxWeeks={evm.duracionSemanas || 12}
        onCutoffChange={updateCutoffWeek}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={setSelectedCategory}
      />

      {/* Alerta de Riesgos Materializados */}
      {projectAnalytics.riesgos.riesgosMaterializados.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-sm font-bold text-rose-900 block">
              ALERTA CRÍTICA: {projectAnalytics.riesgos.riesgosMaterializados.length} Riesgo(s) Materializado(s) en Ejecución
            </strong>
            <p className="text-xs text-rose-800 mt-0.5">
              Las siguientes amenazas han cambiado a estado «Materializado». Se debe ejecutar de inmediato el plan de respuesta de contingencia aprobado.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {projectAnalytics.riesgos.riesgosMaterializados.map((m) => (
                <span
                  key={m.id}
                  className="px-2.5 py-1 rounded-md bg-white border border-rose-200 text-xs font-semibold text-rose-900 shadow-xs"
                >
                  <strong>{m.id}</strong>: {m.riesgo} (Resp: {m.propietario})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas KPI de Riesgos con texto en lenguaje sencillo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exposición Total */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Exposición Total
              </span>
              <TrafficLightBadge
                color={
                  projectAnalytics.riesgos.exposicionTotal < 40
                    ? 'green'
                    : projectAnalytics.riesgos.exposicionTotal < 80
                    ? 'yellow'
                    : 'red'
                }
                label={
                  projectAnalytics.riesgos.exposicionTotal < 40
                    ? 'Controlado'
                    : projectAnalytics.riesgos.exposicionTotal < 80
                    ? 'Moderado'
                    : 'Severo'
                }
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {projectAnalytics.riesgos.exposicionTotal}{' '}
              <span className="text-sm font-normal text-[#718096]">pts</span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              {riesgosFiltrados.length} amenazas activas
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Suma de los puntajes de probabilidad × impacto de todos los riesgos vigentes.»
          </p>
        </div>

        {/* Riesgos Altos Abiertos */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Riesgos Altos (≥ {umbralAlto})
              </span>
              <TrafficLightBadge
                color={
                  projectAnalytics.riesgos.riesgosAltosAbiertos === 0
                    ? 'green'
                    : projectAnalytics.riesgos.riesgosAltosAbiertos <= 2
                    ? 'yellow'
                    : 'red'
                }
                label={
                  projectAnalytics.riesgos.riesgosAltosAbiertos === 0
                    ? '0 Críticos'
                    : `${projectAnalytics.riesgos.riesgosAltosAbiertos} Críticos`
                }
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-rose-700">
              {projectAnalytics.riesgos.riesgosAltosAbiertos}
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Umbral alto: puntaje ≥ {umbralAlto}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Amenazas con severidad alta abiertas que amenazan directamente costo, plazo o calidad.»
          </p>
        </div>

        {/* Tendencia: Riesgos que Subieron */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Riesgos que Subieron (↑)
              </span>
              <TrafficLightBadge
                color={
                  projectAnalytics.riesgos.riesgosQueSubieron.length === 0
                    ? 'green'
                    : 'yellow'
                }
                label={
                  projectAnalytics.riesgos.riesgosQueSubieron.length === 0
                    ? 'Estable'
                    : `${projectAnalytics.riesgos.riesgosQueSubieron.length} Empeoraron`
                }
                size="sm"
              />
            </div>
            <div className="text-3xl font-black font-mono text-amber-700">
              {projectAnalytics.riesgos.riesgosQueSubieron.length}
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Comparado frente a la semana {cutoffWeek - 1}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Riesgos cuyo puntaje aumentó frente a la semana anterior según Riesgos_Historial.»
          </p>
        </div>

        {/* Contingencia Disponible */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Contingencia Remanente
              </span>
              <TrafficLightBadge
                color={evm.contingenciaDisponible > 0 ? 'green' : 'red'}
                label={evm.contingenciaDisponible > 0 ? 'Disponible' : 'Agotada'}
                size="sm"
              />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-800">
              {formatCurrencyAmount(evm.contingenciaDisponible, currency)}
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Total reserva: {formatCurrencyAmount(evm.reservaContingencia, currency)}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Fondo de reserva disponible para financiar respuestas a riesgos materializados.»
          </p>
        </div>
      </div>

      {/* Bloque Central: Matriz de Calor 5x5 Interactiva + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matriz 5x5 */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#00D4B2]" />
                <span>Matriz de Calor 5 × 5 Interactiva</span>
              </h3>
              <p className="text-xs text-[#718096]">
                Haz clic en cualquier celda para listar abajo exclusivamente los riesgos correspondientes.
              </p>
            </div>
            {selectedCell && (
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="text-xs text-[#00D4B2] font-semibold hover:underline"
              >
                Limpiar filtro de celda (Ver todos)
              </button>
            )}
          </div>

          {/* Grilla 5x5 */}
          <div className="relative">
            <div className="flex">
              {/* Eje Y: Probabilidad */}
              <div className="w-20 flex flex-col justify-between py-2 text-right pr-2 text-xs font-semibold text-[#718096]">
                <span className="text-[10px] uppercase font-bold text-[#0A2540] mb-1">
                  Probabilidad
                </span>
                <span className="py-2.5">5 Muy Alta</span>
                <span className="py-2.5">4 Alta</span>
                <span className="py-2.5">3 Media</span>
                <span className="py-2.5">2 Baja</span>
                <span className="py-2.5">1 Muy Baja</span>
              </div>

              {/* Celdas de la Matriz (5 filas: p=5 bajando a p=1) */}
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((pVal) => (
                  <div key={pVal} className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((iVal) => {
                      const score = pVal * iVal;
                      const cellKey = `${pVal}-${iVal}`;
                      const itemsInCell = matrixCells[cellKey] || [];
                      const count = itemsInCell.length;
                      const isSelected =
                        selectedCell?.p === pVal && selectedCell?.i === iVal;

                      // Color según umbrales de la PMO
                      let bgClass = 'bg-emerald-50 text-emerald-900 border-emerald-200';
                      if (score >= umbralAlto) {
                        bgClass = 'bg-rose-100 text-rose-950 border-rose-300';
                      } else if (score >= umbralMedio) {
                        bgClass = 'bg-amber-100 text-amber-950 border-amber-300';
                      }

                      return (
                        <button
                          key={iVal}
                          type="button"
                          onClick={() => {
                            if (isSelected) setSelectedCell(null);
                            else setSelectedCell({ p: pVal, i: iVal });
                          }}
                          className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${bgClass} ${
                            isSelected
                              ? 'ring-2 ring-[#0A2540] scale-[1.03] shadow-md z-10'
                              : 'hover:brightness-95'
                          }`}
                          title={`Probabilidad ${pVal} × Impacto ${iVal} = Puntaje ${score} (${count} riesgos)`}
                        >
                          <span className="text-[10px] font-bold opacity-75">{score} pts</span>
                          <span className="text-xs font-extrabold font-mono">
                            {count > 0 ? `${count} riesgo${count > 1 ? 's' : ''}` : '—'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Eje X: Impacto */}
            <div className="ml-20 grid grid-cols-5 gap-1.5 pt-2 text-center text-[10px] font-semibold text-[#718096]">
              <span>1 Muy Bajo</span>
              <span>2 Bajo</span>
              <span>3 Medio</span>
              <span>4 Alto</span>
              <span>5 Muy Alto</span>
            </div>
            <div className="text-center text-[11px] font-bold text-[#0A2540] uppercase tracking-wider mt-1">
              Impacto
            </div>
          </div>
        </div>

        {/* Top 5 Riesgos */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Top 5 Amenazas Más Críticas</span>
              </h3>
              <span className="text-xs text-[#718096]">Por puntaje P × I</span>
            </div>

            <div className="space-y-2.5">
              {top5Riesgos.map((r, idx) => (
                <div
                  key={r.id || idx}
                  className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F7FAFC] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#0A2540]">
                        {r.id}
                      </span>
                      <TrafficLightBadge
                        color={
                          r.nivel === 'alto' ? 'red' : r.nivel === 'medio' ? 'yellow' : 'green'
                        }
                        label={`${r.puntaje} pts`}
                        size="sm"
                      />
                    </div>
                    {/* Tendencia */}
                    <span
                      className={`text-[10px] font-bold flex items-center gap-0.5 ${
                        r.tendencia === 'sube'
                          ? 'text-rose-700'
                          : r.tendencia === 'baja'
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {r.tendencia === 'sube' && <ArrowUpRight className="w-3 h-3" />}
                      {r.tendencia === 'baja' && <ArrowDownRight className="w-3 h-3" />}
                      {r.tendencia === 'igual' && <ArrowRight className="w-3 h-3" />}
                      <span>{r.tendenciaTexto}</span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#0A2540] mt-1 line-clamp-1">
                    {r.riesgo}
                  </p>
                  <div className="text-[11px] text-[#718096] flex items-center justify-between mt-1">
                    <span>Resp: {r.propietario || 'Sin asignar'}</span>
                    <span className="text-slate-500">Plan: {r.estrategia}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Recharts en Paralelo: 1. Evolución del Puntaje y 2. Contingencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolución del Puntaje de Riesgos */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#E2E8F0] mb-2">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00D4B2]" />
              <span>Evolución Temporal de la Severidad de Riesgos</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Tendencia de la exposición total de puntaje acumulado registrada por semana.
            </p>
          </div>

          <div className="h-64 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucionPuntajeData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="Puntaje Acumulado"
                  stroke="#E01038"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#E01038' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Contingencia Consumida vs. Disponible */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#E2E8F0] mb-2">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#00D4B2]" />
              <span>Contingencia Consumida vs. Remanente</span>
            </h3>
            <p className="text-xs text-[#718096]">
              Comparativa de absorción de reservas de contingencia a la semana {cutoffWeek}.
            </p>
          </div>

          <div className="h-64 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contingenciaData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, 'Monto']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                  {contingenciaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#718096] flex items-center justify-between">
            <span>
              Total Reserva: <strong className="text-[#0A2540] font-mono">{formatCurrencyAmount(evm.reservaContingencia, currency)}</strong>
            </span>
            <span>
              Consumo: <strong className="text-rose-600 font-mono">{((evm.contingenciaGastada / (evm.reservaContingencia || 1)) * 100).toFixed(1)}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tabla Detallada de Riesgos (Reactiva a la celda seleccionada en la matriz 5x5) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              {selectedCell
                ? `Riesgos filtrados por celda (Probabilidad ${selectedCell.p} × Impacto ${selectedCell.i})`
                : 'Inventario Completo de Riesgos del Proyecto'}
            </h2>
            <p className="text-xs text-[#718096]">
              {selectedCell
                ? `Mostrando ${displayedRiesgos.length} riesgo(s) en la coordenada seleccionada.`
                : 'Puntaje calculado, nivel de severidad y tendencia frente a la semana anterior.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0A2540] bg-white px-3 py-1 rounded border border-[#E2E8F0]">
            {displayedRiesgos.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4">ID</th>
                <th scope="col" className="py-3 px-4">Riesgo / Amenaza</th>
                <th scope="col" className="py-3 px-3 text-center">Prob (1-5)</th>
                <th scope="col" className="py-3 px-3 text-center">Imp (1-5)</th>
                <th scope="col" className="py-3 px-3 text-center">Puntaje</th>
                <th scope="col" className="py-3 px-3 text-center">Severidad</th>
                <th scope="col" className="py-3 px-3 text-center">Tendencia</th>
                <th scope="col" className="py-3 px-4">Estrategia & Respuesta</th>
                <th scope="col" className="py-3 px-4">Propietario</th>
                <th scope="col" className="py-3 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {displayedRiesgos.map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#0A2540] max-w-xs">
                    {r.riesgo}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    {r.probabilidad_1a5}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    {r.impacto_1a5}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-[#0A2540]">
                    {r.puntaje}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <TrafficLightBadge
                      color={
                        r.nivel === 'alto' ? 'red' : r.nivel === 'medio' ? 'yellow' : 'green'
                      }
                      label={r.nivel}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        r.tendencia === 'sube'
                          ? 'text-rose-700 font-bold'
                          : r.tendencia === 'baja'
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {r.tendencia === 'sube' && '↑ Sube'}
                      {r.tendencia === 'baja' && '↓ Baja'}
                      {r.tendencia === 'igual' && '= Igual'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#718096] max-w-sm">
                    <span className="font-semibold text-[#0A2540] block">{r.estrategia}</span>
                    <span className="text-[11px] truncate block">{r.respuesta_planificada}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[#718096]">
                    {r.propietario}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.esMaterializado
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : r.estado.toLowerCase().includes('abier')
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
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
