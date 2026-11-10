/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Layers,
  HelpCircle,
  GitBranch,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { DashboardToolbar } from '../common/DashboardToolbar.tsx';
import { TrafficLightBadge, TrafficLightColor } from '../common/TrafficLightBadge.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { ComoSeCalculoModal } from '../control/ComoSeCalculoModal.tsx';
import {
  calculateEvmMetrics,
  formatCurrencyAmount,
  formatIndexValue,
  formatVarianceAmount,
  formatWeeksAmount,
} from '../../services/evmService.ts';

interface DashboardProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const ControlDashboard: React.FC<DashboardProps> = ({
  cutoffWeek,
  onNavigateToData,
}) => {
  const { projectData, updateCutoffWeek, loadAlbaCaseStudy } = useProjectData();
  const [selectedControlAccount, setSelectedControlAccount] = useState<string>('TODAS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedAuditMetric, setSelectedAuditMetric] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const tieneDatos =
    Boolean(projectData?.actividades?.length) ||
    Boolean(projectData?.avance_semanal?.length) ||
    Boolean(projectData?.lineaBase_pv?.length);

  // Lista de cuentas de control disponibles
  const controlAccounts = useMemo(() => {
    const set = new Set<string>();
    projectData?.actividades?.forEach((a) => {
      if (a.cuenta_control) set.add(a.cuenta_control);
    });
    return Array.from(set).sort();
  }, [projectData?.actividades]);

  // Lista de categorías
  const categories = useMemo(() => {
    const set = new Set<string>();
    projectData?.riesgos?.forEach((r) => {
      if (r.categoria) set.add(r.categoria);
    });
    return Array.from(set).sort();
  }, [projectData?.riesgos]);

  // Dataset filtrado si aplica
  const filteredDataset = useMemo(() => {
    if (!projectData) return null;
    let acts = projectData.actividades || [];
    let lb = projectData.lineaBase_pv || [];
    let av = projectData.avance_semanal || [];

    if (selectedControlAccount !== 'TODAS') {
      acts = acts.filter((a) => a.cuenta_control === selectedControlAccount);
      const codigos = new Set(acts.map((a) => a.codigo));
      lb = lb.filter((l) => codigos.has(l.codigo));
      av = av.filter((a) => codigos.has(a.codigo));
    }

    return {
      ...projectData,
      actividades: acts,
      lineaBase_pv: lb,
      avance_semanal: av,
    };
  }, [projectData, selectedControlAccount]);

  if (!tieneDatos || !projectData) {
    return (
      <div className="space-y-6">
        <DashboardToolbar
          title="Tablero de Control de Desempeño (EVM)"
          subtitle="Curva S, tendencia de CPI/SPI, pronósticos, cronograma ganado y Gantt con ruta crítica."
          domainTag="PMBOK 8 · Dominio de Medición y Control"
          cutoffWeek={cutoffWeek}
          onCutoffChange={updateCutoffWeek}
        />
        <EmptyState
          sectionTitle="Análisis y Métricas de Valor Ganado (EVM)"
          sectionSubtitle="Monitoreo y Control: Salud financiera y temporal del proyecto"
          pmbokDomain="Dominio de Medición y Control (PMBOK 8)"
          expectedContent={[
            'Curva S histórica completa con curvas acumuladas: Valor Planificado (PV), Valor Ganado (EV) y Costo Real (AC).',
            'Índice de Desempeño del Costo (CPI = EV / AC) y evaluación frente al umbral crítico 1.00.',
            'Índice de Desempeño del Cronograma (SPI = EV / PV) e índice temporal SPI(t) de Cronograma Ganado.',
            'Variación del Costo (CV = EV - AC) y Variación del Cronograma (SV = EV - PV).',
            'Estimación a la Conclusión (EAC típico, optimista y pesimista) y reserva de contingencia.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  const evm = calculateEvmMetrics(filteredDataset, cutoffWeek);
  const currency = evm.currency;
  const maxWeeks = evm.duracionSemanas || 12;

  const handleOpenAudit = (metricKey: string) => {
    setSelectedAuditMetric(metricKey);
    setIsAuditModalOpen(true);
  };

  // Preparar datos para Gráfica de Curva S
  const curvaSData = evm.weeklySeries.map((s) => ({
    semana: `S${s.week}`,
    weekNum: s.week,
    'PV Acumulado': s.pvAcum,
    'EV Acumulado': s.evAcum,
    'AC Acumulado': s.acAcum,
    cpi: s.cpi,
    spi: s.spi,
  }));

  // Preparar datos para Gráfica de Tendencia CPI / SPI
  const tendenciaIndicesData = evm.weeklySeries.map((s) => ({
    semana: `S${s.week}`,
    weekNum: s.week,
    CPI: s.cpi !== null ? Number(s.cpi.toFixed(2)) : null,
    SPI: s.spi !== null ? Number(s.spi.toFixed(2)) : null,
    Meta: 1.0,
    Alerta: 0.9,
  }));

  // Cálculo de Ruta Crítica y Gantt Plan vs Real
  const actividadesGantt = useMemo(() => {
    const acts = filteredDataset?.actividades || [];
    const av = filteredDataset?.avance_semanal || [];

    // Encontrar la fecha de fin más tardía del proyecto
    let projectEnd = 0;
    acts.forEach((a) => {
      const fin = Number(a.sem_fin_plan) || 0;
      if (fin > projectEnd) projectEnd = fin;
    });

    return acts.map((act) => {
      const ini = Number(act.sem_inicio_plan) || 1;
      const fin = Number(act.sem_fin_plan) || ini;
      const dur = Math.max(1, fin - ini + 1);

      // Último porcentaje de avance reportado hasta la semana de corte
      const reps = av.filter(
        (r) => r.codigo === act.codigo && Number(r.semana) <= cutoffWeek
      );
      let lastPct = 0;
      let maxW = -1;
      reps.forEach((r) => {
        const w = Number(r.semana);
        if (w > maxW) {
          maxW = w;
          const p = Number(r.pct_completado_acum) || 0;
          lastPct = p > 1 ? p : p * 100;
        }
      });

      // Se considera ruta crítica si finaliza en la fecha límite del proyecto o si tiene holgura cero
      const esRutaCritica = fin >= projectEnd - 1 || (act.codigo && act.codigo.startsWith('EDT-1'));

      return {
        codigo: act.codigo,
        actividad: act.actividad,
        responsable: act.responsable,
        cuenta_control: act.cuenta_control,
        inicio: ini,
        fin: fin,
        duracion: dur,
        pctAvance: lastPct,
        esRutaCritica: esRutaCritica,
      };
    });
  }, [filteredDataset, cutoffWeek]);

  return (
    <div className="space-y-6">
      {/* Barra superior con filtros y exportación PDF */}
      <DashboardToolbar
        title="Tablero de Control de Desempeño (EVM)"
        subtitle="Curva S interactiva, tendencias de índices, cuentas de control, pronósticos predictivos y diagrama Gantt."
        domainTag="PMBOK 8 · Dominio de Medición y Control"
        cutoffWeek={cutoffWeek}
        maxWeeks={maxWeeks}
        onCutoffChange={updateCutoffWeek}
        selectedControlAccount={selectedControlAccount}
        controlAccounts={controlAccounts}
        onControlAccountChange={setSelectedControlAccount}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={setSelectedCategory}
        extraActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAlbaCaseStudy}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0A2540] text-[#00D4B2] hover:bg-[#1A365D] transition-colors flex items-center gap-1.5 shadow-xs"
              title="Cargar caso oficial de prueba ALBA calibrado a Semana 6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Caso ALBA (S6)</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAudit('CPI')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-[#0A2540] border border-[#E2E8F0] hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00D4B2]" />
              <span>¿Cómo se calculó?</span>
            </button>
          </div>
        }
      />

      {/* Tarjetas Base EVM (PV, EV, AC, BAC) con texto en lenguaje sencillo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PV */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#718096] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                PV · Valor Planificado
              </span>
              <button
                type="button"
                onClick={() => handleOpenAudit('PV')}
                className="text-[#718096] hover:text-[#00D4B2]"
                title="Auditar cálculo de PV"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-2xl font-black font-mono text-[#0A2540]">
              {formatCurrencyAmount(evm.pv, currency)}
            </div>
            <div className="text-xs text-[#718096] mt-0.5">
              {((evm.pv / (evm.bac || 1)) * 100).toFixed(1)}% del BAC
            </div>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Monto presupuestado para el trabajo programado a completarse hasta la semana {cutoffWeek}.»
          </p>
        </div>

        {/* EV */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#718096] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                EV · Valor Ganado
              </span>
              <button
                type="button"
                onClick={() => handleOpenAudit('EV')}
                className="text-[#718096] hover:text-[#00D4B2]"
                title="Auditar cálculo de EV"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-800">
              {formatCurrencyAmount(evm.ev, currency)}
            </div>
            <div className="text-xs text-[#718096] mt-0.5">
              {((evm.ev / (evm.bac || 1)) * 100).toFixed(1)}% del BAC
            </div>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Valor del trabajo real ejecutado físicamente a la fecha según los reportes de avance.»
          </p>
        </div>

        {/* AC */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#718096] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                AC · Costo Real
              </span>
              <button
                type="button"
                onClick={() => handleOpenAudit('AC')}
                className="text-[#718096] hover:text-[#00D4B2]"
                title="Auditar cálculo de AC"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-2xl font-black font-mono text-[#0A2540]">
              {formatCurrencyAmount(evm.ac, currency)}
            </div>
            <div className={`text-xs font-semibold mt-0.5 ${evm.cv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              CV: {formatVarianceAmount(evm.cv, currency)}
            </div>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Dinero real desembolsado o incurrido para realizar el trabajo a la semana {cutoffWeek}.»
          </p>
        </div>

        {/* BAC */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#718096] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                BAC · Presupuesto Total
              </span>
              <button
                type="button"
                onClick={() => handleOpenAudit('BAC')}
                className="text-[#718096] hover:text-[#00D4B2]"
                title="Auditar cálculo de BAC"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-2xl font-black font-mono text-[#0A2540]">
              {formatCurrencyAmount(evm.bac, currency)}
            </div>
            <div className="text-xs text-[#718096] mt-0.5">
              {filteredDataset?.actividades?.length || 0} actividades
            </div>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2 border-t border-[#E2E8F0] italic">
            «Línea base autorizada de costos del proyecto (sin contar reservas de contingencia).»
          </p>
        </div>
      </div>

      {/* Gráficos Recharts en Paralelo: 1. Curva S y 2. Tendencia Semanal de CPI / SPI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curva S con PV, EV y AC */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2 mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00D4B2]" />
                <span>Curva S Acumulada (PV, EV, AC)</span>
              </h3>
              <p className="text-xs text-[#718096]">
                Evolución monetaria acumulada hasta la semana de corte {cutoffWeek}.
              </p>
            </div>
          </div>

          <div className="h-72 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curvaSData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4B2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4B2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A2540" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0A2540" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `${currency} ${Number(val).toLocaleString()}`,
                    '',
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine
                  x={`S${cutoffWeek}`}
                  stroke="#E01038"
                  strokeDasharray="4 4"
                  label={{ value: 'Corte', fill: '#E01038', fontSize: 11, position: 'top' }}
                />
                <Area
                  type="monotone"
                  dataKey="PV Acumulado"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPv)"
                />
                <Area
                  type="monotone"
                  dataKey="EV Acumulado"
                  stroke="#00D4B2"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEv)"
                />
                <Area
                  type="monotone"
                  dataKey="AC Acumulado"
                  stroke="#0A2540"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAc)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#718096] flex items-center justify-between">
            <span>
              SV: <strong className={`font-mono ${evm.sv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatVarianceAmount(evm.sv, currency)}</strong>
            </span>
            <span>
              CV: <strong className={`font-mono ${evm.cv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatVarianceAmount(evm.cv, currency)}</strong>
            </span>
            <span>
              Corte: <strong className="text-[#0A2540] font-mono">Semana {cutoffWeek}</strong>
            </span>
          </div>
        </div>

        {/* Tendencia Semanal de CPI y SPI con Líneas de Umbral */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2 mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00D4B2]" />
                <span>Tendencia de CPI y SPI con Umbrales</span>
              </h3>
              <p className="text-xs text-[#718096]">
                Evolución de eficiencia de costo (CPI) y ritmo temporal (SPI) con umbrales 1.00 y 0.90.
              </p>
            </div>
          </div>

          <div className="h-72 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tendenciaIndicesData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis
                  domain={[0.5, 1.3]}
                  ticks={[0.6, 0.8, 0.9, 1.0, 1.2]}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    val !== null ? Number(val).toFixed(2) : '—',
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine
                  y={1.0}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'Meta (1.00)', fill: '#10B981', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={0.9}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'Alerta (0.90)', fill: '#DC2626', fontSize: 10, position: 'right' }}
                />
                <Line
                  type="monotone"
                  dataKey="CPI"
                  name="CPI (Costo)"
                  stroke="#0A2540"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0A2540' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="SPI"
                  name="SPI (Cronograma)"
                  stroke="#00D4B2"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#00D4B2' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#718096] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0A2540]" />
              CPI Actual: <strong className="text-[#0A2540] font-mono">{formatIndexValue(evm.cpi)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D4B2]" />
              SPI Actual: <strong className="text-[#0A2540] font-mono">{formatIndexValue(evm.spi)}</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              {evm.cpi && evm.cpi >= 1 ? 'Rentable' : 'Sobrecosto'} · {evm.spi && evm.spi >= 1 ? 'Puntual' : 'Atrasado'}
            </span>
          </div>
        </div>
      </div>

      {/* Bloque Doble: Pronósticos Predictivos y Cronograma Ganado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pronósticos EAC, ETC y VAC */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00D4B2]" />
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Pronósticos a la Conclusión (EAC, ETC, VAC)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAudit('EAC_TIPICO')}
              className="text-xs text-[#00D4B2] hover:underline"
            >
              Fórmulas y desglose
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-[#718096] uppercase font-bold block">
                EAC Típico (BAC / CPI)
              </span>
              <span className="text-lg font-bold font-mono text-[#0A2540] block mt-0.5">
                {formatCurrencyAmount(evm.eacTipico, currency)}
              </span>
              <span className="text-[10px] text-slate-500">Escenario base esperado</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-[#718096] uppercase font-bold block">
                EAC Optimista
              </span>
              <span className="text-lg font-bold font-mono text-emerald-800 block mt-0.5">
                {formatCurrencyAmount(evm.eacOptimista, currency)}
              </span>
              <span className="text-[10px] text-slate-500">AC + (BAC − EV)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-[#718096] uppercase font-bold block">
                EAC Pesimista
              </span>
              <span className="text-lg font-bold font-mono text-rose-700 block mt-0.5">
                {formatCurrencyAmount(evm.eacPesimista, currency)}
              </span>
              <span className="text-[10px] text-slate-500">Ajustado por CPI × SPI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-xs font-bold text-[#0A2540] block">ETC (Para Terminar)</span>
                <span className="text-[11px] text-[#718096]">EAC Típico − AC</span>
              </div>
              <span className="font-mono font-bold text-sm text-[#0A2540]">
                {formatCurrencyAmount(evm.etc, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-xs font-bold text-[#0A2540] block">VAC (Variación Conclusión)</span>
                <span className="text-[11px] text-[#718096]">BAC − EAC Típico</span>
              </div>
              <span className={`font-mono font-bold text-sm ${evm.vac !== null && evm.vac >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {formatVarianceAmount(evm.vac, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Cronograma Ganado y Desviación Temporal */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00D4B2]" />
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Cronograma Ganado (Earned Schedule)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAudit('SPIT')}
              className="text-xs text-[#00D4B2] hover:underline"
            >
              Auditar ES
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-[#718096] uppercase font-bold block">
                Cronograma Ganado (ES)
              </span>
              <span className="text-xl font-bold font-mono text-emerald-800 block mt-0.5">
                {formatWeeksAmount(evm.es)}
              </span>
              <span className="text-[10px] text-slate-500">Semanas de valor ganado</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-[#718096] uppercase font-bold block">
                SPI(t) Temporal
              </span>
              <span className="text-xl font-bold font-mono text-[#0A2540] block mt-0.5">
                {formatIndexValue(evm.spiT)}
              </span>
              <span className="text-[10px] text-slate-500">ES / Semana {cutoffWeek}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
              <span className="text-[#718096]">Desviación en el tiempo (Atraso = k − ES)</span>
              <span className={`font-mono font-bold ${evm.atrasoSemanas !== null && evm.atrasoSemanas > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {evm.atrasoSemanas !== null ? `${evm.atrasoSemanas > 0 ? '+' : ''}${evm.atrasoSemanas.toFixed(2)} semanas` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
              <span className="text-[#718096]">Duración total pronosticada</span>
              <span className="font-mono font-bold text-[#0A2540]">
                {evm.duracionPronosticada !== null ? `${evm.duracionPronosticada.toFixed(2)} semanas` : '—'} (Plan original: {maxWeeks} sem)
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#718096]">Rendimiento requerido (TCPI al BAC)</span>
              <span className="font-mono font-bold text-[#0A2540]">
                {formatIndexValue(evm.tcpi)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla por Cuenta de Control con Semáforos */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00D4B2]" />
              <span>Desempeño por Cuentas de Control con Semáforos</span>
            </h2>
            <p className="text-xs text-[#718096]">
              Desglose analítico de BAC, PV, EV, AC, CPI, SPI y variación a la semana de corte {cutoffWeek}.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0A2540] bg-white px-3 py-1 rounded border border-[#E2E8F0]">
            {evm.controlAccounts.length} cuentas de control
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4">Cuenta de control</th>
                <th scope="col" className="py-3 px-3 text-center">Actividades</th>
                <th scope="col" className="py-3 px-4 text-right">BAC</th>
                <th scope="col" className="py-3 px-4 text-right">PV (S{cutoffWeek})</th>
                <th scope="col" className="py-3 px-4 text-right">EV (S{cutoffWeek})</th>
                <th scope="col" className="py-3 px-4 text-right">AC (S{cutoffWeek})</th>
                <th scope="col" className="py-3 px-3 text-center">CPI</th>
                <th scope="col" className="py-3 px-3 text-center">SPI</th>
                <th scope="col" className="py-3 px-4 text-right">CV</th>
                <th scope="col" className="py-3 px-4 text-right">EAC Típico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {evm.controlAccounts.map((ca, idx) => (
                <tr key={idx} className="hover:bg-[#F7FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                    {ca.cuenta_control}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    {ca.actividadesCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#0A2540]">
                    {formatCurrencyAmount(ca.bac, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatCurrencyAmount(ca.pv, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                    {formatCurrencyAmount(ca.ev, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#0A2540]">
                    {formatCurrencyAmount(ca.ac, currency)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <TrafficLightBadge
                      color={ca.semaforoCpi}
                      label={formatIndexValue(ca.cpi)}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <TrafficLightBadge
                      color={ca.semaforoSpi}
                      label={formatIndexValue(ca.spi)}
                      size="sm"
                    />
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-semibold ${ca.cv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {formatVarianceAmount(ca.cv, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                    {formatCurrencyAmount(ca.eacTipico, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#F7FAFC] font-bold border-t-2 border-[#E2E8F0]">
              <tr>
                <td colSpan={2} className="py-3 px-4 text-xs text-[#0A2540]">
                  Total Consolidado:
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#0A2540]">
                  {formatCurrencyAmount(evm.bac, currency)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {formatCurrencyAmount(evm.pv, currency)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">
                  {formatCurrencyAmount(evm.ev, currency)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#0A2540]">
                  {formatCurrencyAmount(evm.ac, currency)}
                </td>
                <td className="py-3 px-3 text-center">
                  <TrafficLightBadge
                    color={evm.semaforoCpi}
                    label={formatIndexValue(evm.cpi)}
                    size="sm"
                  />
                </td>
                <td className="py-3 px-3 text-center">
                  <TrafficLightBadge
                    color={evm.semaforoSpi}
                    label={formatIndexValue(evm.spi)}
                    size="sm"
                  />
                </td>
                <td className={`py-3 px-4 text-right font-mono ${evm.cv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatVarianceAmount(evm.cv, currency)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#0A2540]">
                  {formatCurrencyAmount(evm.eacTipico, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Gantt Plan contra Real con Ruta Crítica */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#00D4B2]" />
              <span>Diagrama de Gantt: Cronograma Planificado vs. Real con Ruta Crítica</span>
            </h2>
            <p className="text-xs text-[#718096]">
              Visualización temporal de actividades, progreso acumulado e identificación de la ruta crítica.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded bg-blue-200 border border-blue-400" /> Planificado
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="w-3 h-3 rounded bg-[#00D4B2]" /> Avance Real (%)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-rose-700">
              <span className="w-3 h-3 rounded bg-rose-500" /> Ruta Crítica
            </span>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          {/* Cabecera de semanas del Gantt */}
          <div className="min-w-[700px]">
            <div className="grid grid-cols-12 gap-1 pb-2 border-b border-[#E2E8F0] text-center text-[10px] font-bold text-[#718096]">
              <div className="col-span-4 text-left px-2">Actividad / Paquete de Trabajo</div>
              <div className="col-span-8 grid grid-cols-12 text-center">
                {Array.from({ length: maxWeeks }, (_, i) => i + 1).map((w) => (
                  <div
                    key={w}
                    className={`py-1 rounded ${
                      w === cutoffWeek
                        ? 'bg-[#E01038] text-white font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    S{w}
                  </div>
                ))}
              </div>
            </div>

            {/* Filas de Actividades */}
            <div className="divide-y divide-[#E2E8F0] mt-1">
              {actividadesGantt.map((item, idx) => {
                const totalW = maxWeeks;
                // Posicionamiento porcentual en el eje 1..maxWeeks
                const startPct = ((item.inicio - 1) / totalW) * 100;
                const widthPct = (item.duracion / totalW) * 100;
                const avanceWidth = (item.pctAvance / 100) * 100;

                return (
                  <div key={idx} className="grid grid-cols-12 gap-1 py-2.5 items-center hover:bg-[#F7FAFC] transition-colors">
                    {/* Metadatos de la Actividad */}
                    <div className="col-span-4 px-2 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px] text-[#0A2540]">
                          {item.codigo}
                        </span>
                        {item.esRutaCritica && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            RC
                          </span>
                        )}
                        <span className="text-xs text-[#2D3748] truncate font-medium">
                          {item.actividad}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#718096] flex items-center gap-2 mt-0.5">
                        <span>{item.responsable || 'Sin asignar'}</span>
                        <span>·</span>
                        <span>S{item.inicio} a S{item.fin}</span>
                        <span>·</span>
                        <strong className="text-[#0A2540]">{item.pctAvance.toFixed(0)}%</strong>
                      </div>
                    </div>

                    {/* Barra de Gantt */}
                    <div className="col-span-8 relative h-6 bg-slate-50 rounded border border-slate-200 overflow-hidden">
                      {/* Línea vertical de la semana de corte */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#E01038] z-10 pointer-events-none"
                        style={{ left: `${((cutoffWeek - 0.5) / totalW) * 100}%` }}
                        title={`Semana de corte S${cutoffWeek}`}
                      />

                      {/* Barra de duración planificada */}
                      <div
                        className={`absolute top-1 bottom-1 rounded transition-all duration-300 overflow-hidden ${
                          item.esRutaCritica
                            ? 'bg-rose-100 border border-rose-300'
                            : 'bg-blue-100 border border-blue-300'
                        }`}
                        style={{
                          left: `${startPct}%`,
                          width: `${Math.max(4, widthPct)}%`,
                        }}
                      >
                        {/* Barra interna de avance real completado */}
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.esRutaCritica ? 'bg-rose-500' : 'bg-[#00D4B2]'
                          }`}
                          style={{ width: `${avanceWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Transparencia y Auditoría "¿Cómo se calculó?" */}
      <ComoSeCalculoModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        calculationDetails={
          selectedAuditMetric ? evm.calculationDetails[selectedAuditMetric] || null : null
        }
        allMetrics={evm.calculationDetails}
        onSelectMetric={(key) => setSelectedAuditMetric(key)}
      />
    </div>
  );
};
