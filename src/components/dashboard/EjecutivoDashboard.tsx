/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Milestone,
  ShieldAlert,
  DollarSign,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
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
  LineChart,
  Line,
} from 'recharts';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { DashboardToolbar } from '../common/DashboardToolbar.tsx';
import { TrafficLightBadge, TrafficLightColor } from '../common/TrafficLightBadge.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import {
  calculateEvmMetrics,
  formatCurrencyAmount,
  formatIndexValue,
  formatVarianceAmount,
} from '../../services/evmService.ts';

interface DashboardProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const EjecutivoDashboard: React.FC<DashboardProps> = ({
  cutoffWeek,
  onNavigateToData,
}) => {
  const { projectData, projectAnalytics, updateCutoffWeek } = useProjectData();
  const [selectedControlAccount, setSelectedControlAccount] = useState<string>('TODAS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  const tieneDatos =
    Boolean(projectData?.proyecto?.nombre) || Boolean(projectData?.actividades?.length);

  // Lista de cuentas de control disponibles
  const controlAccounts = useMemo(() => {
    const set = new Set<string>();
    projectData?.actividades?.forEach((a) => {
      if (a.cuenta_control) set.add(a.cuenta_control);
    });
    return Array.from(set).sort();
  }, [projectData?.actividades]);

  // Lista de categorías disponibles (de riesgos y actividades)
  const categories = useMemo(() => {
    const set = new Set<string>();
    projectData?.riesgos?.forEach((r) => {
      if (r.categoria) set.add(r.categoria);
    });
    return Array.from(set).sort();
  }, [projectData?.riesgos]);

  // Filtrado de dataset si el usuario seleccionó cuenta o categoría
  const filteredDataset = useMemo(() => {
    if (!projectData) return null;
    let acts = projectData.actividades || [];
    let lb = projectData.lineaBase_pv || [];
    let av = projectData.avance_semanal || [];
    let r = projectData.riesgos || [];

    if (selectedControlAccount !== 'TODAS') {
      acts = acts.filter((a) => a.cuenta_control === selectedControlAccount);
      const codigos = new Set(acts.map((a) => a.codigo));
      lb = lb.filter((l) => codigos.has(l.codigo));
      av = av.filter((a) => codigos.has(a.codigo));
    }

    if (selectedCategory !== 'TODAS') {
      r = r.filter((item) => item.categoria === selectedCategory);
    }

    return {
      ...projectData,
      actividades: acts,
      lineaBase_pv: lb,
      avance_semanal: av,
      riesgos: r,
    };
  }, [projectData, selectedControlAccount, selectedCategory]);

  if (!tieneDatos || !projectData) {
    return (
      <div className="space-y-6">
        <DashboardToolbar
          title="Tablero Ejecutivo"
          subtitle="Visión integral de desempeño, variaciones del valor ganado (EVM) y control predictivo."
          domainTag="PMBOK 8 · Dominio de Desempeño"
          cutoffWeek={cutoffWeek}
          onCutoffChange={updateCutoffWeek}
        />
        <EmptyState
          sectionTitle="Tablero Ejecutivo de Desempeño"
          sectionSubtitle="Monitoreo consolidado de indicadores clave de desempeño (KPIs)"
          pmbokDomain="Dominio de Desempeño del Proyecto (PMBOK 8)"
          expectedContent={[
            'Avance físico ponderado vs. avance planificado a la semana de corte.',
            'Índice de Desempeño del Cronograma (SPI) con alertas de holgura.',
            'Índice de Desempeño del Costo (CPI) y variación de costo al corte.',
            'Estimación a la Conclusión (EAC) y Variación a la Conclusión (VAC).',
            'Curva S de Desempeño EVM interactiva con curvas PV, EV y AC.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  // Métricas EVM sobre dataset filtrado
  const evm = calculateEvmMetrics(filteredDataset, cutoffWeek);
  const p = projectData.proyecto;
  const currency = evm.currency;

  // Cálculos de porcentajes de avance
  const pctReal = evm.bac > 0 ? (evm.ev / evm.bac) * 100 : 0;
  const pctPlan = evm.bac > 0 ? (evm.pv / evm.bac) * 100 : 0;

  // Semáforo General del Proyecto
  let semaforoGeneral: TrafficLightColor = 'green';
  let semaforoGeneralTexto = 'Proyecto Saludable';
  let semaforoGeneralDesc =
    'El proyecto avanza según los umbrales de costo y cronograma aprobados por el comité directivo.';

  const cpiVal = evm.cpi ?? 1;
  const spiVal = evm.spi ?? 1;
  const riesgosAltos = projectAnalytics.riesgos.riesgosAltosAbiertos;
  const hayMaterializado = projectAnalytics.riesgos.riesgosMaterializados.length > 0;
  const incidentesCriticos = projectAnalytics.ejecucion.incidentesCriticos;

  if (cpiVal < 0.85 || spiVal < 0.85 || hayMaterializado || incidentesCriticos > 0) {
    semaforoGeneral = 'red';
    semaforoGeneralTexto = 'Estado Crítico';
    semaforoGeneralDesc =
      'Desviación severa en costo o cronograma, riesgos materializados o incidentes críticos abiertos que requieren intervención urgente del patrocinador.';
  } else if (cpiVal < 0.95 || spiVal < 0.95 || riesgosAltos > 1) {
    semaforoGeneral = 'yellow';
    semaforoGeneralTexto = 'En Observación / Alerta Preventiva';
    semaforoGeneralDesc =
      'Se identifican desviaciones moderadas frente a la línea base o acumulación de amenazas en evaluación preventiva.';
  }

  // Próximos hitos
  const hitos = projectData.hitos || [];
  const proximosHitos = [...hitos]
    .sort((a, b) => (Number(a.semana_plan) || 0) - (Number(b.semana_plan) || 0))
    .slice(0, 5);

  // Alertas detectadas automáticamente
  const alertas: { tipo: 'critica' | 'alerta' | 'info'; mensaje: string; detalle: string }[] = [];

  if (evm.spi !== null && evm.spi < 0.90) {
    alertas.push({
      tipo: 'critica',
      mensaje: `Retraso severo en cronograma (SPI = ${formatIndexValue(evm.spi)})`,
      detalle: `El proyecto marcha con un atraso de ${evm.atrasoSemanas?.toFixed(1) || '0'} semanas respecto a la línea base temporal.`,
    });
  }

  if (evm.cpi !== null && evm.cpi < 0.90) {
    alertas.push({
      tipo: 'critica',
      mensaje: `Sobrecosto acumulado (CPI = ${formatIndexValue(evm.cpi)})`,
      detalle: `Variación de costo negativa de ${formatVarianceAmount(evm.cv, currency)}. El EAC típico proyecta ${formatCurrencyAmount(evm.eacTipico, currency)}.`,
    });
  }

  if (hayMaterializado) {
    alertas.push({
      tipo: 'critica',
      mensaje: `Riesgo materializado en ejecución (${projectAnalytics.riesgos.riesgosMaterializados.length})`,
      detalle: `Se requiere activar de inmediato el plan de respuesta y contingencias aprobadas.`,
    });
  }

  if (projectAnalytics.recursos.personasSobreasignadas.length > 0) {
    alertas.push({
      tipo: 'alerta',
      mensaje: `Sobreasignación de personal detectada (${projectAnalytics.recursos.personasSobreasignadas.length} colaboradores)`,
      detalle: `Recursos superan el 100% de dedicación en actividades simultáneas durante la semana ${cutoffWeek}.`,
    });
  }

  if (alertas.length === 0) {
    alertas.push({
      tipo: 'info',
      mensaje: 'Operación dentro de tolerancias contractuales',
      detalle: 'No se registran alertas críticas activas para la semana de corte evaluada.',
    });
  }

  // Decisiones requeridas para el PMO / Patrocinador
  const decisionesRequeridas: string[] = [];
  if (evm.spi !== null && evm.spi < 0.90) {
    decisionesRequeridas.push(
      'Evaluar compresión de cronograma (crashing/fast-tracking) o aprobar reprogramación formal de hitos críticos.'
    );
  }
  if (evm.cpi !== null && evm.cpi < 1.0) {
    if (evm.esEacCubiertoPorContingencia) {
      decisionesRequeridas.push(
        `Autorizar liberación parcial de la Reserva de Contingencia disponible (${formatCurrencyAmount(evm.contingenciaDisponible, currency)}) para absorber la variación de costo.`
      );
    } else {
      decisionesRequeridas.push(
        'Convocar al Comité de Cambios (CCB) para gestionar adenda presupuestal o redefinición de alcance no crítico.'
      );
    }
  }
  if (projectAnalytics.recursos.personasSobreasignadas.length > 0) {
    decisionesRequeridas.push(
      'Rebalancear asignación de personal clave en los paquetes de trabajo concurrentes de la semana activa.'
    );
  }
  if (decisionesRequeridas.length === 0) {
    decisionesRequeridas.push(
      'Mantener la cadencia actual de ejecución y validar entregables del próximo hito programado.'
    );
  }

  // Datos para gráfico comparativo presupuestal Recharts
  const chartPresupuestoData = [
    {
      name: 'Presupuesto BAC',
      monto: evm.bac,
      color: '#0A2540',
      label: 'Línea base autorizada',
    },
    {
      name: 'EAC Típico',
      monto: evm.eacTipico || evm.bac,
      color: evm.cpi && evm.cpi < 1.0 ? '#DC2626' : '#00D4B2',
      label: 'Costo final proyectado',
    },
    {
      name: 'Costo Real (AC)',
      monto: evm.ac,
      color: '#475569',
      label: 'Gasto devengado actual',
    },
    {
      name: 'Contingencia Disp.',
      monto: evm.contingenciaDisponible,
      color: '#10B981',
      label: 'Reserva remanente',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de control superior con filtros y exportación PDF */}
      <DashboardToolbar
        title="Tablero Ejecutivo"
        subtitle={`Resumen directivo de desempeño para «${p?.nombre || 'Proyecto'}».`}
        domainTag="PMBOK 8 · Visión Integral Ejecutiva"
        cutoffWeek={cutoffWeek}
        maxWeeks={evm.duracionSemanas || 12}
        onCutoffChange={updateCutoffWeek}
        selectedControlAccount={selectedControlAccount}
        controlAccounts={controlAccounts}
        onControlAccountChange={setSelectedControlAccount}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={setSelectedCategory}
      />

      {/* Banner de Semáforo General del Proyecto */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          semaforoGeneral === 'green'
            ? 'bg-emerald-50/70 border-emerald-300'
            : semaforoGeneral === 'yellow'
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-rose-50/70 border-rose-300'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] shadow-xs">
            {semaforoGeneral === 'green' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
            {semaforoGeneral === 'yellow' && (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
            {semaforoGeneral === 'red' && (
              <AlertOctagon className="w-6 h-6 text-rose-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Semáforo General PMO
              </span>
              <TrafficLightBadge
                color={semaforoGeneral}
                label={semaforoGeneralTexto}
                size="sm"
              />
            </div>
            <p className="text-xs text-[#2D3748] mt-1 font-medium max-w-2xl">
              {semaforoGeneralDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs text-[#718096]">
          <div className="text-right">
            <span className="block font-bold text-[#0A2540] font-mono text-sm">
              Semana {cutoffWeek} / {evm.duracionSemanas}
            </span>
            <span>Corte evaluado</span>
          </div>
        </div>
      </div>

      {/* Las 6 Tarjetas de Indicadores Ejecutivos con texto en lenguaje sencillo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Avance Físico */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Avance Físico Ponderado
              </span>
              <TrafficLightBadge
                color={pctReal >= pctPlan ? 'green' : pctReal >= pctPlan - 10 ? 'yellow' : 'red'}
                label={pctReal >= pctPlan ? 'A tiempo' : 'Rezago'}
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#0A2540]">
                {pctReal.toFixed(1)}%
              </span>
              <span className="text-xs text-[#718096] font-mono">
                plan: {pctPlan.toFixed(1)}%
              </span>
            </div>
            {/* Barra de avance dual */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#00D4B2] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, pctReal)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2.5 border-t border-[#E2E8F0] italic">
            «Has completado el {pctReal.toFixed(1)}% del total del trabajo presupuestado frente al {pctPlan.toFixed(1)}% programado.»
          </p>
        </div>

        {/* 2. SPI (Cronograma) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                SPI · Índice de Cronograma
              </span>
              <TrafficLightBadge
                color={evm.semaforoSpi}
                label={evm.spi !== null && evm.spi >= 1.0 ? 'Acelerado' : 'Atrasado'}
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#0A2540]">
                {formatIndexValue(evm.spi)}
              </span>
              <span className="text-xs text-[#718096]">
                SV: {formatVarianceAmount(evm.sv, currency)}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2.5 border-t border-[#E2E8F0] italic">
            «SPI {formatIndexValue(evm.spi)}: avanzaste {evm.spi !== null ? (evm.spi * 100).toFixed(0) : '—'}% de lo planeado a esta fecha {evm.spi !== null && evm.spi < 1.0 ? '(retraso en el ritmo de entrega)' : '(al día con el plan)'}.»
          </p>
        </div>

        {/* 3. CPI (Costo) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                CPI · Eficiencia de Costo
              </span>
              <TrafficLightBadge
                color={evm.semaforoCpi}
                label={evm.cpi !== null && evm.cpi >= 1.0 ? 'Eficiente' : 'Sobrecosto'}
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#0A2540]">
                {formatIndexValue(evm.cpi)}
              </span>
              <span className="text-xs text-[#718096]">
                CV: {formatVarianceAmount(evm.cv, currency)}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2.5 border-t border-[#E2E8F0] italic">
            «CPI {formatIndexValue(evm.cpi)}: por cada S/ 1.00 gastado generaste {currency} {formatIndexValue(evm.cpi)} de valor {evm.cpi !== null && evm.cpi < 1.0 ? '(sobrecosto operativo)' : '(ahorro presupuestario)'}.»
          </p>
        </div>

        {/* 4. EAC vs. Presupuesto */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                EAC vs. Presupuesto
              </span>
              <TrafficLightBadge
                color={evm.esEacCubiertoPorPresupuesto ? 'green' : evm.esEacCubiertoPorContingencia ? 'yellow' : 'red'}
                label={evm.esEacCubiertoPorPresupuesto ? 'En Presupuesto' : evm.esEacCubiertoPorContingencia ? 'Usa Reserva' : 'Déficit'}
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-[#0A2540]">
                {formatCurrencyAmount(evm.eacTipico, currency)}
              </span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Autorizado: {formatCurrencyAmount(evm.presupuestoAutorizado, currency)}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2.5 border-t border-[#E2E8F0] italic">
            «Pronóstico final {formatCurrencyAmount(evm.eacTipico, currency)} frente a {formatCurrencyAmount(evm.presupuestoAutorizado, currency)} autorizados con contingencias.»
          </p>
        </div>

        {/* 5. Riesgos Altos Abiertos */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Riesgos Altos Abiertos
              </span>
              <TrafficLightBadge
                color={riesgosAltos === 0 ? 'green' : riesgosAltos <= 2 ? 'yellow' : 'red'}
                label={riesgosAltos === 0 ? 'Sin riesgos altos' : `${riesgosAltos} críticos`}
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#0A2540]">
                {riesgosAltos}
              </span>
              <span className="text-xs text-[#718096]">
                de {projectAnalytics.riesgos.totalRiesgos} amenazas
              </span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Exposición total: {projectAnalytics.riesgos.exposicionTotal} pts
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2.5 border-t border-[#E2E8F0] italic">
            «{riesgosAltos} amenazas críticas activas con puntaje ≥ 15 que requieren mitigación prioritaria.»
          </p>
        </div>

        {/* 6. Contingencia Disponible */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Contingencia Disponible
              </span>
              <TrafficLightBadge
                color={evm.contingenciaDisponible > 0 ? 'green' : 'red'}
                label={evm.contingenciaDisponible > 0 ? 'Disponible' : 'Agotada'}
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-800">
                {formatCurrencyAmount(evm.contingenciaDisponible, currency)}
              </span>
            </div>
            <span className="text-xs text-[#718096] block mt-0.5">
              Consumida: {formatCurrencyAmount(evm.contingenciaGastada, currency)} de {formatCurrencyAmount(evm.reservaContingencia, currency)}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-3 pt-2.5 border-t border-[#E2E8F0] italic">
            «{formatCurrencyAmount(evm.contingenciaDisponible, currency)} de reserva remanente para amortiguar sobrecostos o imprevistos.»
          </p>
        </div>
      </div>

      {/* Gráfica Comparativa Presupuestal Stitch + Decisiones Requeridas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico Recharts Comparativo */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Estructura y Pronóstico Financiero del Proyecto
              </h3>
              <p className="text-xs text-[#718096]">
                Comparación directa entre línea base (BAC), proyección final (EAC) y fondos disponibles.
              </p>
            </div>
          </div>

          <div className="h-64 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartPresupuestoData}
                margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
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
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `${currency} ${Number(val).toLocaleString()}`,
                    'Monto',
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                  {chartPresupuestoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#E2E8F0] text-center text-[11px]">
            <div>
              <span className="text-[#718096] block">BAC</span>
              <strong className="text-[#0A2540] font-mono">{formatCurrencyAmount(evm.bac, currency)}</strong>
            </div>
            <div>
              <span className="text-[#718096] block">EAC Típico</span>
              <strong className="text-[#0A2540] font-mono">{formatCurrencyAmount(evm.eacTipico, currency)}</strong>
            </div>
            <div>
              <span className="text-[#718096] block">AC Real</span>
              <strong className="text-[#0A2540] font-mono">{formatCurrencyAmount(evm.ac, currency)}</strong>
            </div>
            <div>
              <span className="text-[#718096] block">Contingencia</span>
              <strong className="text-emerald-700 font-mono">{formatCurrencyAmount(evm.contingenciaDisponible, currency)}</strong>
            </div>
          </div>
        </div>

        {/* Panel de Decisiones Requeridas y Alertas Activas */}
        <div className="lg:col-span-5 space-y-4">
          {/* Decisiones Requeridas */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#00D4B2]" />
              <span>Decisiones Requeridas (Comité PMO)</span>
            </h3>
            <div className="space-y-2">
              {decisionesRequeridas.map((dec, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0] text-xs text-[#2D3748] flex items-start gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#00D4B2] shrink-0 mt-0.5" />
                  <span>{dec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas Detectadas */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat'] flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Alertas del Proyecto en S{cutoffWeek}</span>
            </h3>
            <div className="space-y-2">
              {alertas.map((al, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                    al.tipo === 'critica'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : al.tipo === 'alerta'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {al.tipo === 'critica' && (
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  {al.tipo === 'alerta' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  {al.tipo === 'info' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-semibold">{al.mensaje}</strong>
                    <span className="text-[11px] opacity-90">{al.detalle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Hitos del Proyecto */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milestone className="w-4 h-4 text-[#00D4B2]" />
            <h3 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Próximos Hitos del Cronograma
            </h3>
          </div>
          <span className="text-xs text-[#718096]">
            {hitos.length} hitos definidos en la línea base
          </span>
        </div>

        {proximosHitos.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#718096]">
            No hay hitos programados en la hoja de datos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">Código</th>
                  <th scope="col" className="py-3 px-4">Hito / Entregable Clave</th>
                  <th scope="col" className="py-3 px-4 text-center">Semana Plan</th>
                  <th scope="col" className="py-3 px-4">Criterio de Aceptación</th>
                  <th scope="col" className="py-3 px-4 text-center">Estado Temporal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {proximosHitos.map((h, idx) => {
                  const semPlan = Number(h.semana_plan) || 0;
                  const esPasado = semPlan < cutoffWeek;
                  const esActual = semPlan === cutoffWeek;
                  const estadoColor: TrafficLightColor = esPasado
                    ? 'green'
                    : esActual
                    ? 'yellow'
                    : 'green';
                  const estadoTexto = esPasado
                    ? 'Superado'
                    : esActual
                    ? 'En Curso'
                    : 'Futuro';

                  return (
                    <tr key={h.codigo || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                        {h.codigo || `H-${idx + 1}`}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#0A2540]">
                        {h.hito || 'Sin descripción'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        Semana {h.semana_plan ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-[#718096] max-w-md">
                        {h.criterio_aceptacion || 'Criterio estándar PMO'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <TrafficLightBadge color={estadoColor} label={estadoTexto} size="sm" />
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
