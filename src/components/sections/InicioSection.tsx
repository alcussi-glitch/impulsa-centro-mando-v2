/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Download, Filter, Calendar, FolderGit2, AlertTriangle, Layers, Database } from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { EvmEnginePendingCard } from '../common/EvmEnginePendingCard.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const InicioSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  const { projectData } = useProjectData();

  const tieneDatos = Boolean(projectData?.proyecto?.nombre) || Boolean(projectData?.actividades?.length);

  if (!tieneDatos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
                PMBOK 8 · Visión Integral
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-[#718096]">Corte: Semana {cutoffWeek} de 12</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
              Inicio · Tablero ejecutivo
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
              Visión integral de desempeño, variaciones del valor ganado (EVM) y control predictivo para el proyecto IMPULSA.
            </p>
          </div>
        </div>

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

  const p = projectData?.proyecto;
  const actividades = projectData?.actividades || [];
  const riesgos = projectData?.riesgos || [];
  const totalBAC = actividades.reduce((acc, a) => acc + (Number(a.BAC) || 0), 0) || p?.BAC || 0;

  return (
    <div className="space-y-6">
      {/* Barra superior de la sección */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
              PMBOK 8 · Visión Integral
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">Semana de corte activa: Semana {cutoffWeek} de {p?.duracion_semanas || 12}</span>
            {projectData?.metadataCarga?.esDatosEjemplo && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded">
                DATOS DE EJEMPLO
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Inicio · Tablero ejecutivo
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Resumen general del proyecto «{p?.nombre || 'IMPULSA'}» sincronizado en Cloud Firestore.
          </p>
        </div>
      </div>

      {/* Tarjetas resumen de parámetros base cargados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Presupuesto (BAC)</p>
          <p className="text-xl font-bold text-[#0A2540] mt-1 font-mono">
            {p?.moneda || 'PEN'} {totalBAC.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Línea base autorizada</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Corte evaluativo</p>
          <p className="text-xl font-bold text-[#0A2540] mt-1">
            Semana {cutoffWeek} de {p?.duracion_semanas || 12}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Periodo activo en barra superior</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Actividades EDT</p>
          <p className="text-xl font-bold text-[#0A2540] mt-1">
            {actividades.length} actividades
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{projectData?.hitos?.length || 0} hitos programados</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Riesgos registrados</p>
          <p className="text-xl font-bold text-[#0A2540] mt-1">
            {riesgos.length} amenazas
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Reserva: {p?.moneda || 'PEN'} {p?.reserva_contingencia?.toLocaleString() || '0'}</p>
        </div>
      </div>

      {/* Indicadores calculados EVM en estado de espera */}
      <EvmEnginePendingCard
        title="Tablero Ejecutivo de Desempeño EVM y Curva S"
        description="Los gráficos interactivos de valor ganado, semáforos ejecutivos y proyecciones matemáticas se activarán con el motor analítico EVM."
        pendingIndicators={[
          'Curva S interactiva consolidada (PV vs. EV vs. AC)',
          'Índices de desempeño en tiempo real: CPI (Costo) y SPI (Cronograma)',
          'Variaciones consolidadas: CV (Variación Costo) y SV (Variación Cronograma)',
          'Pronóstico EAC (Costo final proyectado) y VAC (Desviación final)',
          'Semáforos de tolerancia definidos por la dirección del proyecto',
        ]}
      />

      {/* Vista previa de actividades cargadas */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
          <div>
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Resumen de actividades registradas
            </h2>
            <p className="text-xs text-[#718096]">
              Datos disponibles en la base de datos para análisis EVM.
            </p>
          </div>
          <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
            {actividades.length} actividades
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A2540] text-white font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4">Código</th>
                <th scope="col" className="py-3 px-4">Actividad</th>
                <th scope="col" className="py-3 px-4">Responsable</th>
                <th scope="col" className="py-3 px-4 text-center">Periodo plan</th>
                <th scope="col" className="py-3 px-4 text-right">BAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
              {actividades.slice(0, 6).map((a, idx) => (
                <tr key={a.codigo || idx} className="hover:bg-[#F7FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{a.codigo || 'Sin datos'}</td>
                  <td className="py-3 px-4 font-medium">{a.actividad || 'Sin datos'}</td>
                  <td className="py-3 px-4 text-[#718096] whitespace-nowrap">{a.responsable || 'Sin datos'}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">Sem. {a.sem_inicio_plan} - {a.sem_fin_plan}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                    {typeof a.BAC === 'number' ? `${p?.moneda || 'PEN'} ${a.BAC.toLocaleString()}` : (a.BAC || 'Sin datos')}
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
