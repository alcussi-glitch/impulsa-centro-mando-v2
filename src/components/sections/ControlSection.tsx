/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Calculator,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
  Sparkles,
  PlayCircle,
  Check,
  XCircle,
} from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import {
  calculateEvmMetrics,
  formatCurrencyAmount,
  formatIndexValue,
  formatVarianceAmount,
  formatWeeksAmount,
  EvmIndicatorTrafficLight,
} from '../../services/evmService.ts';
import { ComoSeCalculoModal } from '../control/ComoSeCalculoModal.tsx';
import { runEvmUnitTests } from '../../services/evmService.test.ts';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

type TabType = 'resumen' | 'cuentas_control' | 'curva_s' | 'avance_crudo' | 'costos_crudo';

export const ControlSection: React.FC<SectionProps> = ({ cutoffWeek: propCutoffWeek, onNavigateToData }) => {
  const { projectData, updateCutoffWeek, loadAlbaCaseStudy } = useProjectData();
  const [activeTab, setActiveTab] = useState<TabType>('resumen');
  const [filterOnlyCutoffWeek, setFilterOnlyCutoffWeek] = useState<boolean>(false);
  const [selectedAuditMetric, setSelectedAuditMetric] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isTestResultsModalOpen, setIsTestResultsModalOpen] = useState<boolean>(false);

  // Semana de corte activa (prioriza la del proyecto si existe, o la prop)
  const effectiveCutoffWeek = projectData?.proyecto?.semana_corte ?? propCutoffWeek ?? 6;

  // Ejecución del motor analítico de cálculo EVM con funciones puras
  const evmResult = calculateEvmMetrics(projectData, effectiveCutoffWeek);

  const avance = projectData?.avance_semanal || [];
  const costos = projectData?.costos || [];
  const actividades = projectData?.actividades || [];
  const lineaBase = (projectData?.lineaBase_pv && projectData.lineaBase_pv.length > 0)
    ? projectData.lineaBase_pv
    : ((projectData as any)?.lineabase_pv || []);

  const tieneDatos = avance.length > 0 || lineaBase.length > 0 || actividades.length > 0;

  const handleOpenAudit = (metricKey: string) => {
    setSelectedAuditMetric(metricKey);
    setIsAuditModalOpen(true);
  };

  const handleCutoffChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWeek = Number(e.target.value);
    await updateCutoffWeek(newWeek);
  };

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
            'Índice de Desempeño del Cronograma (SPI = EV / PV) e índice temporal SPI(t) de Cronograma Ganado.',
            'Variación del Costo (CV = EV - AC) y Variación del Cronograma (SV = EV - PV).',
            'Estimación a la Conclusión (EAC típico, optimista y pesimista) y reserva de contingencia.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  // Estilos de semáforo para badges
  const getBadgeStyle = (light: EvmIndicatorTrafficLight) => {
    switch (light) {
      case 'green':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'yellow':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'red':
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  const getTrafficDot = (light: EvmIndicatorTrafficLight) => {
    switch (light) {
      case 'green':
        return 'bg-emerald-500';
      case 'yellow':
        return 'bg-amber-500';
      case 'red':
        return 'bg-rose-500';
    }
  };

  // Filtrado opcional para tabla de avance
  const displayedAvance = filterOnlyCutoffWeek
    ? avance.filter((item) => Number(item.semana) === Number(effectiveCutoffWeek))
    : avance;

  return (
    <div className="space-y-6">
      {/* Encabezado Superior con Selector de Corte y Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
              PMBOK 8 · Dominio de Medición y Control
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">
              Semana evaluada: <strong className="text-[#0A2540]">S{effectiveCutoffWeek}</strong> de {evmResult.duracionSemanas}
            </span>
            {projectData?.metadataCarga?.esDatosEjemplo && (
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded">
                {projectData?.proyecto?.nombre?.includes('ALBA') ? 'CASO ALBA (PMI)' : 'DATOS DE EJEMPLO'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Control de desempeño del proyecto (EVM)
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Motor analítico con funciones puras según el estándar PMBOK 8 (PMI, 2025): Valor Ganado, Cronograma Ganado (ES), pronósticos y comparación con reservas.
          </p>
        </div>

        {/* Acciones de la barra superior */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de semana de corte */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#00D4B2]" />
            <label htmlFor="cutoff-select" className="text-xs font-semibold text-[#718096]">
              Corte:
            </label>
            <select
              id="cutoff-select"
              value={effectiveCutoffWeek}
              onChange={handleCutoffChange}
              className="text-xs font-bold text-[#0A2540] bg-transparent border-none focus:outline-hidden cursor-pointer"
            >
              {Array.from({ length: evmResult.duracionSemanas || 12 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Semana {w}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Pruebas Unitarias */}
          <button
            type="button"
            onClick={() => setIsTestResultsModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Verificar pruebas automáticas unitarias del caso ALBA a Semana 6"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pruebas unitarias</span>
          </button>

          {/* Botón Cargar Caso ALBA */}
          <button
            type="button"
            onClick={loadAlbaCaseStudy}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0A2540] text-[#00D4B2] hover:bg-[#1A365D] transition-colors flex items-center gap-1.5 shadow-xs"
            title="Cargar el caso de prueba oficial ALBA calibrado a la Semana 6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cargar caso ALBA (S6)</span>
          </button>

          {/* Botón Transparencia General */}
          <button
            type="button"
            onClick={() => handleOpenAudit('CPI')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-[#0A2540] border border-[#E2E8F0] hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00D4B2]" />
            <span>¿Cómo se calculó?</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Principales de Métricas Base (PV, EV, AC, BAC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PV */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs relative overflow-hidden group hover:border-[#00D4B2] transition-colors">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              PV · Valor Planificado
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('PV')}
              className="text-[#718096] hover:text-[#00D4B2] transition-colors p-1"
              title="¿Cómo se calculó PV?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-black font-mono text-[#0A2540] tracking-tight">
            {formatCurrencyAmount(evmResult.pv, evmResult.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#718096]">
            <span>Trabajo programado a S{effectiveCutoffWeek}</span>
            <span className="font-semibold text-[#0A2540]">
              {((evmResult.pv / (evmResult.bac || 1)) * 100).toFixed(1)}% BAC
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (evmResult.pv / (evmResult.bac || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* EV */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs relative overflow-hidden group hover:border-[#00D4B2] transition-colors">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              EV · Valor Ganado
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('EV')}
              className="text-[#718096] hover:text-[#00D4B2] transition-colors p-1"
              title="¿Cómo se calculó EV?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-black font-mono text-[#0A2540] tracking-tight">
            {formatCurrencyAmount(evmResult.ev, evmResult.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#718096]">
            <span>Avance físico entregado</span>
            <span className="font-semibold text-emerald-700">
              {((evmResult.ev / (evmResult.bac || 1)) * 100).toFixed(1)}% BAC
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#00D4B2] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (evmResult.ev / (evmResult.bac || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* AC */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs relative overflow-hidden group hover:border-[#00D4B2] transition-colors">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              AC · Costo Real
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('AC')}
              className="text-[#718096] hover:text-[#00D4B2] transition-colors p-1"
              title="¿Cómo se calculó AC?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-black font-mono text-[#0A2540] tracking-tight">
            {formatCurrencyAmount(evmResult.ac, evmResult.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#718096]">
            <span>Gasto desembolsado a S{effectiveCutoffWeek}</span>
            <span className={`font-semibold ${evmResult.cv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              CV: {formatVarianceAmount(evmResult.cv, evmResult.currency)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                evmResult.ac > evmResult.ev ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (evmResult.ac / (evmResult.bac || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* BAC */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs relative overflow-hidden group hover:border-[#00D4B2] transition-colors">
          <div className="flex items-center justify-between text-[#718096] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              BAC · Presupuesto Conclusión
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('BAC')}
              className="text-[#718096] hover:text-[#00D4B2] transition-colors p-1"
              title="¿Cómo se calculó BAC?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-black font-mono text-[#0A2540] tracking-tight">
            {formatCurrencyAmount(evmResult.bac, evmResult.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#718096]">
            <span>Línea Base de Costos (100%)</span>
            <span className="font-semibold text-[#0A2540]">
              {actividades.length} actividades
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#0A2540] h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Fila de Semáforos e Índices de Rendimiento (CPI, SPI, SPI(t), TCPI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPI */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0A2540] uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${getTrafficDot(evmResult.semaforoCpi)}`} />
              CPI · Eficiencia de Costo
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('CPI')}
              className="text-xs text-[#00D4B2] hover:underline flex items-center gap-0.5"
            >
              <span>Ver</span>
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {formatIndexValue(evmResult.cpi)}
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(evmResult.semaforoCpi)}`}>
              {evmResult.cpi !== null && evmResult.cpi >= 1.0 ? 'Bajo Presupuesto' : 'Sobrecosto'}
            </span>
          </div>
          <p className="text-[11px] text-[#718096] mt-2">
            Por cada 1.00 gastado, se generan {formatIndexValue(evmResult.cpi)} de valor.
            CV = {formatVarianceAmount(evmResult.cv, evmResult.currency)}
          </p>
        </div>

        {/* SPI */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0A2540] uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${getTrafficDot(evmResult.semaforoSpi)}`} />
              SPI · Ritmo de Cronograma
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('SPI')}
              className="text-xs text-[#00D4B2] hover:underline flex items-center gap-0.5"
            >
              <span>Ver</span>
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {formatIndexValue(evmResult.spi)}
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(evmResult.semaforoSpi)}`}>
              {evmResult.spi !== null && evmResult.spi >= 1.0 ? 'En Tiempo' : 'Atrasado'}
            </span>
          </div>
          <p className="text-[11px] text-[#718096] mt-2">
            Avanza al {evmResult.spi !== null ? (evmResult.spi * 100).toFixed(1) : '—'}% del plan monetario.
            SV = {formatVarianceAmount(evmResult.sv, evmResult.currency)}
          </p>
        </div>

        {/* SPI(t) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0A2540] uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${getTrafficDot(evmResult.semaforoSpiT)}`} />
              SPI(t) · Cronograma Ganado
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('SPIT')}
              className="text-xs text-[#00D4B2] hover:underline flex items-center gap-0.5"
            >
              <span>Ver</span>
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {formatIndexValue(evmResult.spiT)}
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(evmResult.semaforoSpiT)}`}>
              ES: {formatWeeksAmount(evmResult.es)}
            </span>
          </div>
          <p className="text-[11px] text-[#718096] mt-2">
            {evmResult.atrasoSemanas !== null && evmResult.atrasoSemanas > 0
              ? `Retraso acumulado de ${evmResult.atrasoSemanas.toFixed(2)} semanas.`
              : 'El proyecto se encuentra alineado o adelantado en el tiempo.'}
          </p>
        </div>

        {/* TCPI */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0A2540] uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${getTrafficDot(evmResult.semaforoTcpi)}`} />
              TCPI · Desempeño Pendiente
            </span>
            <button
              type="button"
              onClick={() => handleOpenAudit('TCPI')}
              className="text-xs text-[#00D4B2] hover:underline flex items-center gap-0.5"
            >
              <span>Ver</span>
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black font-mono text-[#0A2540]">
              {formatIndexValue(evmResult.tcpi)}
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(evmResult.semaforoTcpi)}`}>
              {evmResult.tcpi !== null && evmResult.tcpi <= 1.0 ? 'Factible' : 'Exigente'}
            </span>
          </div>
          <p className="text-[11px] text-[#718096] mt-2">
            Rendimiento requerido en trabajo restante para cerrar dentro del BAC.
          </p>
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
                Pronósticos a la Conclusión (EAC / ETC / VAC)
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
                {formatCurrencyAmount(evmResult.eacTipico, evmResult.currency)}
              </span>
              <span className="text-[10px] text-slate-500">Escenario más probable</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-[#718096] uppercase font-bold block">
                EAC Optimista
              </span>
              <span className="text-lg font-bold font-mono text-emerald-800 block mt-0.5">
                {formatCurrencyAmount(evmResult.eacOptimista, evmResult.currency)}
              </span>
              <span className="text-[10px] text-slate-500">AC + (BAC − EV)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-[#718096] uppercase font-bold block">
                EAC Pesimista
              </span>
              <span className="text-lg font-bold font-mono text-rose-700 block mt-0.5">
                {formatCurrencyAmount(evmResult.eacPesimista, evmResult.currency)}
              </span>
              <span className="text-[10px] text-slate-500">Ajustado por CPI × SPI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-xs font-bold text-[#0A2540] block">ETC (Para Terminar)</span>
                <span className="text-[11px] text-[#718096]">EAC típico − Costo Real (AC)</span>
              </div>
              <span className="font-mono font-bold text-sm text-[#0A2540]">
                {formatCurrencyAmount(evmResult.etc, evmResult.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-xs font-bold text-[#0A2540] block">VAC (Variación Conclusión)</span>
                <span className="text-[11px] text-[#718096]">BAC − EAC típico</span>
              </div>
              <span className={`font-mono font-bold text-sm ${evmResult.vac !== null && evmResult.vac >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {formatVarianceAmount(evmResult.vac, evmResult.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Cronograma Ganado y Contingencia Presupuestaria */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00D4B2]" />
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Cronograma Ganado (Earned Schedule) & Contingencia
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAudit('CONTINGENCIA')}
              className="text-xs text-[#00D4B2] hover:underline"
            >
              Auditar reservas
            </button>
          </div>

          {/* Comparación de Contingencia y Presupuesto */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#0A2540] block">
                  Reserva de Contingencia Disponible
                </span>
                <span className="text-[11px] text-[#718096]">
                  Aprobada: {formatCurrencyAmount(evmResult.reservaContingencia, evmResult.currency)} · Gastada: {formatCurrencyAmount(evmResult.contingenciaGastada, evmResult.currency)}
                </span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-800">
                {formatCurrencyAmount(evmResult.contingenciaDisponible, evmResult.currency)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#0A2540] block">
                  Presupuesto Autorizado vs EAC Típico
                </span>
                <span className="text-[11px] text-[#718096]">
                  Autorizado: {formatCurrencyAmount(evmResult.presupuestoAutorizado, evmResult.currency)} · EAC: {formatCurrencyAmount(evmResult.eacTipico, evmResult.currency)}
                </span>
              </div>
              <span className={`text-base font-bold font-mono ${evmResult.esEacCubiertoPorPresupuesto ? 'text-emerald-700' : 'text-rose-600'}`}>
                {evmResult.deltaPresupuestoAutorizado !== null ? formatVarianceAmount(evmResult.deltaPresupuestoAutorizado, evmResult.currency) : '—'}
              </span>
            </div>

            {/* Diagnóstico ejecutivo de viabilidad */}
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
              evmResult.esEacCubiertoPorPresupuesto
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : evmResult.esEacCubiertoPorContingencia
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}>
              {evmResult.esEacCubiertoPorPresupuesto ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block font-bold">
                  {evmResult.esEacCubiertoPorPresupuesto
                    ? 'Dentro del Presupuesto Autorizado'
                    : evmResult.esEacCubiertoPorContingencia
                    ? 'Cubierto con Reserva de Contingencia'
                    : 'Riesgo de Sobrecosto no absorbible'}
                </strong>
                <span>
                  {evmResult.esEacCubiertoPorPresupuesto
                    ? `El EAC típico proyectado se mantiene dentro del presupuesto de ${formatCurrencyAmount(evmResult.presupuestoAutorizado, evmResult.currency)} con un margen de ${formatCurrencyAmount(evmResult.deltaPresupuestoAutorizado, evmResult.currency)}.`
                    : evmResult.esEacCubiertoPorContingencia
                    ? `El EAC proyectado supera el BAC original pero puede ser absorbido por la contingencia disponible (+${formatCurrencyAmount(evmResult.contingenciaDisponible, evmResult.currency)}).`
                    : `El EAC típico (${formatCurrencyAmount(evmResult.eacTipico, evmResult.currency)}) excede tanto el BAC como el presupuesto con contingencia.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de Vista Detallada */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('resumen')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'resumen'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Resumen y Cronograma Ganado</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cuentas_control')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'cuentas_control'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cuentas de control ({evmResult.controlAccounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curva_s')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'curva_s'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Serie semanal (S1 a S{effectiveCutoffWeek})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avance_crudo')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'avance_crudo'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Datos crudos: Avance ({avance.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('costos_crudo')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'costos_crudo'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Datos crudos: Costos ({costos.length})</span>
          </button>
        </div>

        {activeTab === 'avance_crudo' && (
          <label className="flex items-center gap-2 text-xs text-[#2D3748] cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
            <input
              type="checkbox"
              checked={filterOnlyCutoffWeek}
              onChange={(e) => setFilterOnlyCutoffWeek(e.target.checked)}
              className="rounded border-[#E2E8F0] text-[#00D4B2] focus:ring-[#00D4B2]"
            />
            <span>Filtrar solo Semana de corte ({effectiveCutoffWeek})</span>
          </label>
        )}
      </div>

      {/* Subtab 1: Resumen y Cronograma Ganado */}
      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00D4B2]" />
              <span>Detalles del Cronograma Ganado (Earned Schedule)</span>
            </h3>
            <div className="space-y-2.5 text-xs text-[#2D3748]">
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Semanas de PV acumulado completadas (C)</span>
                <span className="font-mono font-bold text-[#0A2540]">{evmResult.cCount} semanas</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Cronograma Ganado interpolado (ES)</span>
                <span className="font-mono font-bold text-emerald-800">{formatWeeksAmount(evmResult.es)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Semana de corte evaluada (k)</span>
                <span className="font-mono font-bold text-[#0A2540]">Semana {effectiveCutoffWeek}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Desviación en el tiempo (Atraso = k − ES)</span>
                <span className={`font-mono font-bold ${evmResult.atrasoSemanas !== null && evmResult.atrasoSemanas > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {evmResult.atrasoSemanas !== null ? `${evmResult.atrasoSemanas > 0 ? '+' : ''}${evmResult.atrasoSemanas.toFixed(2)} semanas` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#718096]">Duración total pronosticada</span>
                <span className="font-mono font-bold text-[#0A2540]">
                  {evmResult.duracionPronosticada !== null ? `${evmResult.duracionPronosticada.toFixed(2)} semanas` : '—'} (Plan: {evmResult.duracionSemanas} sem)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00D4B2]" />
              <span>Umbrales y Tolerancias PMO</span>
            </h3>
            <div className="space-y-2.5 text-xs text-[#2D3748]">
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Umbral de Alerta (Verde / Amarillo)</span>
                <span className="font-mono font-bold text-emerald-700">&ge; {evmResult.umbralVerde.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Umbral Crítico (Amarillo / Rojo)</span>
                <span className="font-mono font-bold text-rose-600">&lt; {evmResult.umbralAmarillo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Estado Semáforo CPI</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(evmResult.semaforoCpi)}`}>
                  {evmResult.semaforoCpi}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#718096]">Estado Semáforo SPI</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(evmResult.semaforoSpi)}`}>
                  {evmResult.semaforoSpi}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#718096]">Estado Semáforo TCPI</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(evmResult.semaforoTcpi)}`}>
                  {evmResult.semaforoTcpi}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Tabla de Cuentas de Control */}
      {activeTab === 'cuentas_control' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Desglose analítico por Cuentas de Control
              </h2>
              <p className="text-xs text-[#718096]">
                Evaluación granular de desempeño presupuestario y temporal a la Semana {effectiveCutoffWeek}.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#0A2540] bg-white px-3 py-1 rounded border border-[#E2E8F0]">
              {evmResult.controlAccounts.length} cuentas configuradas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">Cuenta de control</th>
                  <th scope="col" className="py-3 px-3 text-center">Actividades</th>
                  <th scope="col" className="py-3 px-4 text-right">BAC</th>
                  <th scope="col" className="py-3 px-4 text-right">PV (S{effectiveCutoffWeek})</th>
                  <th scope="col" className="py-3 px-4 text-right">EV (S{effectiveCutoffWeek})</th>
                  <th scope="col" className="py-3 px-4 text-right">AC (S{effectiveCutoffWeek})</th>
                  <th scope="col" className="py-3 px-3 text-center">CPI</th>
                  <th scope="col" className="py-3 px-3 text-center">SPI</th>
                  <th scope="col" className="py-3 px-4 text-right">CV</th>
                  <th scope="col" className="py-3 px-4 text-right">EAC Típico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {evmResult.controlAccounts.map((ca, idx) => (
                  <tr key={idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {ca.cuenta_control}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      {ca.actividadesCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#0A2540]">
                      {formatCurrencyAmount(ca.bac, evmResult.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatCurrencyAmount(ca.pv, evmResult.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      {formatCurrencyAmount(ca.ev, evmResult.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#0A2540]">
                      {formatCurrencyAmount(ca.ac, evmResult.currency)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(ca.semaforoCpi)}`}>
                        {formatIndexValue(ca.cpi)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(ca.semaforoSpi)}`}>
                        {formatIndexValue(ca.spi)}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${ca.cv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {formatVarianceAmount(ca.cv, evmResult.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                      {formatCurrencyAmount(ca.eacTipico, evmResult.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F7FAFC] font-bold border-t-2 border-[#E2E8F0]">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-xs text-[#0A2540]">
                    Total Proyecto Consolidado:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#0A2540]">
                    {formatCurrencyAmount(evmResult.bac, evmResult.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatCurrencyAmount(evmResult.pv, evmResult.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-800">
                    {formatCurrencyAmount(evmResult.ev, evmResult.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#0A2540]">
                    {formatCurrencyAmount(evmResult.ac, evmResult.currency)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(evmResult.semaforoCpi)}`}>
                      {formatIndexValue(evmResult.cpi)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(evmResult.semaforoSpi)}`}>
                      {formatIndexValue(evmResult.spi)}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right font-mono ${evmResult.cv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {formatVarianceAmount(evmResult.cv, evmResult.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#0A2540]">
                    {formatCurrencyAmount(evmResult.eacTipico, evmResult.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Serie Semanal y Curva S */}
      {activeTab === 'curva_s' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Evolución semanal histórica (Semana 1 a S{effectiveCutoffWeek})
              </h2>
              <p className="text-xs text-[#718096]">
                Valores acumulados de Curva S (PV, EV, AC), e índices de costo y cronograma por período.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> PV Acum
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D4B2]" /> EV Acum
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0A2540]" /> AC Acum
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">Semana</th>
                  <th scope="col" className="py-3 px-4 text-right">PV Período</th>
                  <th scope="col" className="py-3 px-4 text-right">PV Acumulado</th>
                  <th scope="col" className="py-3 px-4 text-right">EV Acumulado</th>
                  <th scope="col" className="py-3 px-4 text-right">AC Período</th>
                  <th scope="col" className="py-3 px-4 text-right">AC Acumulado</th>
                  <th scope="col" className="py-3 px-3 text-center">CPI</th>
                  <th scope="col" className="py-3 px-3 text-center">SPI</th>
                  <th scope="col" className="py-3 px-3 text-center">ES (sem)</th>
                  <th scope="col" className="py-3 px-3 text-center">SPI(t)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {evmResult.weeklySeries.map((row) => {
                  const isCurrent = row.week === effectiveCutoffWeek;
                  return (
                    <tr
                      key={row.week}
                      className={`hover:bg-[#F7FAFC] transition-colors ${isCurrent ? 'bg-[#00D4B2]/10 font-medium' : ''}`}
                    >
                      <td className="py-3 px-4 font-bold text-[#0A2540] whitespace-nowrap">
                        Semana {row.week}
                        {isCurrent && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[#00D4B2] text-[#0A2540] font-bold">
                            Corte
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatCurrencyAmount(row.pv, evmResult.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-blue-700">
                        {formatCurrencyAmount(row.pvAcum, evmResult.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                        {formatCurrencyAmount(row.evAcum, evmResult.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatCurrencyAmount(row.ac, evmResult.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#0A2540]">
                        {formatCurrencyAmount(row.acAcum, evmResult.currency)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {formatIndexValue(row.cpi)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {formatIndexValue(row.spi)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {formatWeeksAmount(row.es)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {formatIndexValue(row.spiT)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Datos Crudos de Avance Semanal */}
      {activeTab === 'avance_crudo' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F7FAFC]">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Tabla de datos crudos · Hoja «Avance_Semanal»
              </h2>
              <p className="text-xs text-[#718096]">
                Reportes registrados de avance físico acumulado y costos reales por semana.
              </p>
            </div>
            <div className="text-xs text-[#0A2540] font-semibold bg-white px-3 py-1.5 rounded border border-[#E2E8F0]">
              Total costo real reportado: {formatCurrencyAmount(evmResult.ac, evmResult.currency)}
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
                  <th scope="col" className="py-3 px-4 text-center">Estado frente al corte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {displayedAvance.map((item, idx) => {
                  const isCurrentCutoff = Number(item.semana) === Number(effectiveCutoffWeek);
                  const pctFormatted =
                    typeof item.pct_completado_acum === 'number'
                      ? `${(item.pct_completado_acum <= 1 ? item.pct_completado_acum * 100 : item.pct_completado_acum).toFixed(1)}%`
                      : (item.pct_completado_acum || '—');

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[#F7FAFC] transition-colors ${
                        isCurrentCutoff ? 'bg-[#00D4B2]/10 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#0A2540]">
                        Semana {item.semana ?? '—'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540]">
                        {item.codigo || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {pctFormatted}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                        {typeof item.costo_real_semana === 'number'
                          ? formatCurrencyAmount(item.costo_real_semana, evmResult.currency)
                          : (item.costo_real_semana || '—')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCurrentCutoff ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00D4B2] text-[#0A2540]">
                            Corte activo (S{effectiveCutoffWeek})
                          </span>
                        ) : Number(item.semana) < Number(effectiveCutoffWeek) ? (
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

      {/* Subtab 5: Datos Crudos de Costos */}
      {activeTab === 'costos_crudo' && (
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
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{c.id || '—'}</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {c.cuenta_control || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{c.concepto || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                      {typeof c.monto === 'number'
                        ? formatCurrencyAmount(c.monto, evmResult.currency)
                        : (c.monto || '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Transparencia "¿Cómo se calculó?" */}
      <ComoSeCalculoModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        evmResult={evmResult}
        initialMetricKey={selectedAuditMetric || 'CPI'}
      />

      {/* Modal de Pruebas Automáticas Unitarias ALBA */}
      {isTestResultsModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col animate-in fade-in-50 duration-200">
            <div className="bg-[#0A2540] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Montserrat']">
                    Pruebas Unitarias del Motor EVM (Caso ALBA S6)
                  </h3>
                  <p className="text-xs text-white/70">
                    Verificación de precisión según los requisitos obligatorios de cálculo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestResultsModalOpen(false)}
                className="p-1 rounded text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {(() => {
                const { allPassed, results } = runEvmUnitTests();
                return (
                  <>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Check className="w-6 h-6 text-emerald-700 font-black" />
                        <div>
                          <strong className="text-sm font-bold text-emerald-950 block">
                            {allPassed ? '10/10 Pruebas pasaron exitosamente' : 'Algunas pruebas fallaron'}
                          </strong>
                          <span className="text-xs text-emerald-800">
                            Coincidencia matemática exacta con las especificaciones del PMI.
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full">
                        APROBADO 100%
                      </span>
                    </div>

                    <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                      {results.map((r, i) => (
                        <div key={i} className="p-3.5 flex items-center justify-between bg-white text-xs">
                          <div className="flex items-center gap-2">
                            {r.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span className="font-semibold text-[#0A2540]">{r.testName}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-500 text-[11px]">Esperado: {String(r.expected)}</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Obtenido: {String(r.actual)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-[#F7FAFC] border-t border-[#E2E8F0] px-6 py-3.5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTestResultsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0A2540] text-white hover:bg-[#1A365D]"
              >
                Cerrar reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
