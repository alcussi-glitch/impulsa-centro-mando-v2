/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalendarDays, Download, GitBranch, CheckCircle2, ListTree, Milestone, BarChart3, Users, AlertOctagon } from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { EvmEnginePendingCard } from '../common/EvmEnginePendingCard.tsx';
import { LineaBasePVItem } from '../../types/projectData.ts';
import { RecursosAnalyticsCard } from '../analytics/RecursosAnalyticsCard.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

type TabType = 'actividades' | 'recursos' | 'edt' | 'hitos' | 'lineabase';

export const PlanificacionSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  const { projectData, projectAnalytics } = useProjectData();
  const [activeTab, setActiveTab] = useState<TabType>('actividades');

  const actividades = projectData?.actividades || [];
  const edt = projectData?.edt || [];
  const hitos = projectData?.hitos || [];
  const lineaBase: LineaBasePVItem[] = (projectData?.lineaBase_pv && projectData.lineaBase_pv.length > 0)
    ? projectData.lineaBase_pv
    : ((projectData as any)?.lineabase_pv || []);

  const tieneDatos = actividades.length > 0 || edt.length > 0 || hitos.length > 0;

  if (!tieneDatos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
                PMBOK 8 · Dominio de Planificación
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-[#718096]">Línea base de alcance y tiempo</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
              Planificación del proyecto
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
              Estructura de Desglose del Trabajo (EDT/WBS), diagrama de Gantt de 12 semanas y seguimiento de hitos.
            </p>
          </div>
        </div>

        <EmptyState
          sectionTitle="Cronograma Gantt y Estructura EDT/WBS"
          sectionSubtitle="Fase de Planificación: Definición detallada de entregables y tiempos"
          pmbokDomain="Dominio de Planificación y Entrega (PMBOK 8)"
          expectedContent={[
            'Diagrama de Gantt interactivo con avance de actividades de la Semana 1 a la 12.',
            'Marcador de corte temporal dinámico correspondiente a la semana activa seleccionada.',
            'Estructura de Desglose del Trabajo (EDT / WBS) jerarquizada por paquetes de trabajo.',
            'Monitoreo de hitos clave del proyecto y estado de la ruta crítica.',
            'Presupuesto desglosado por actividad (BAC) y avance físico ponderado acumulado.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  const totalBAC = actividades.reduce((acc, a) => acc + (Number(a.BAC) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
              PMBOK 8 · Dominio de Planificación
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">Semana de corte activa: Semana {cutoffWeek}</span>
            {projectData?.metadataCarga?.esDatosEjemplo && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded">
                DATOS DE EJEMPLO
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Planificación del proyecto
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Línea base registrada: {actividades.length} actividades planificadas con BAC acumulado de {projectData?.proyecto?.moneda || 'PEN'} {totalBAC.toLocaleString()}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#718096]">
            {actividades.length} actividades · {hitos.length} hitos
          </span>
        </div>
      </div>

      {/* Indicadores en espera de EVM */}
      <EvmEnginePendingCard
        title="Cronograma Gantt Interactivo y Ruta Crítica"
        description="Los gráficos dinámicos y la ponderación temporal se activarán con el motor analítico EVM."
        pendingIndicators={[
          'Diagrama de Gantt interactivo con barra de corte dinámica en la Semana ' + cutoffWeek,
          'Cálculo automático de holguras tempranas/tardías y detección de Ruta Crítica',
          'Avance físico ponderado acumulado frente al plan semanal',
          'Histograma de asignación de recursos y cuentas de control',
          'Comparativa gráfica de Línea Base PV vs. cronograma objetivo',
        ]}
      />

      {/* Pestañas de subcolecciones */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('actividades')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'actividades'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Actividades y BAC ({actividades.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recursos')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'recursos'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Carga de Recursos ({projectAnalytics.recursos.cargasPorPersona.length})</span>
          {projectAnalytics.recursos.personasSobreasignadas.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">
              {projectAnalytics.recursos.personasSobreasignadas.length} sobreasignados
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('edt')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'edt'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <ListTree className="w-3.5 h-3.5" />
          <span>Estructura EDT / WBS ({edt.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hitos')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'hitos'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Milestone className="w-3.5 h-3.5" />
          <span>Hitos del proyecto ({hitos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lineabase')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'lineabase'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Línea Base PV por semana ({lineaBase.length})</span>
        </button>
      </div>

      {/* Vista Analítica de Recursos */}
      {activeTab === 'recursos' && (
        <RecursosAnalyticsCard analytics={projectAnalytics.recursos} cutoffWeek={cutoffWeek} />
      )}

      {/* Tabla Actividades */}
      {activeTab === 'actividades' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Tabla de datos crudos · Hoja «Actividades»
              </h2>
              <p className="text-xs text-[#718096]">
                Registro de actividades de la línea base con presupuesto BAC asignado.
              </p>
            </div>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {actividades.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">Código</th>
                  <th scope="col" className="py-3 px-4">Actividad / Paquete de trabajo</th>
                  <th scope="col" className="py-3 px-4">Cuenta de control</th>
                  <th scope="col" className="py-3 px-4">Responsable</th>
                  <th scope="col" className="py-3 px-4 text-center">Sem. Inicio</th>
                  <th scope="col" className="py-3 px-4 text-center">Sem. Fin</th>
                  <th scope="col" className="py-3 px-4 text-right">Presupuesto (BAC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {actividades.map((a, idx) => (
                  <tr key={a.codigo || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {a.codigo || 'Sin datos'}
                    </td>
                    <td className="py-3 px-4 font-medium max-w-sm">{a.actividad || 'Sin datos'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {a.cuenta_control || 'Sin datos'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{a.responsable || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold">Semana {a.sem_inicio_plan ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold">Semana {a.sem_fin_plan ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                      {typeof a.BAC === 'number'
                        ? `${projectData?.proyecto?.moneda || 'PEN'} ${a.BAC.toLocaleString()}`
                        : (a.BAC || 'Sin datos')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla EDT */}
      {activeTab === 'edt' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «EDT» (Estructura de Desglose del Trabajo)
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {edt.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">Código EDT</th>
                  <th scope="col" className="py-3 px-4">Nombre del elemento / Paquete</th>
                  <th scope="col" className="py-3 px-4 text-center">Nivel jerárquico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {edt.map((e, idx) => (
                  <tr key={e.codigo || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {e.codigo || 'Sin datos'}
                    </td>
                    <td className="py-3 px-4 font-medium" style={{ paddingLeft: `${(Number(e.nivel) || 1) * 16}px` }}>
                      {e.nombre || 'Sin datos'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-[#0A2540]">
                        Nivel {e.nivel ?? 'Sin datos'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Hitos */}
      {activeTab === 'hitos' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Hitos»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {hitos.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID Hito</th>
                  <th scope="col" className="py-3 px-4">Descripción del hito de entrega</th>
                  <th scope="col" className="py-3 px-4 text-center">Semana planificada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {hitos.map((h, idx) => (
                  <tr key={h.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {h.id || 'Sin datos'}
                    </td>
                    <td className="py-3 px-4 font-medium">{h.hito || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">
                      Semana {h.semana_plan ?? 'Sin datos'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Línea Base PV */}
      {activeTab === 'lineabase' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «LineaBase_PV» (Valor Planificado S1 a S12)
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {lineaBase.length} actividades
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-3">Código</th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} scope="col" className={`py-3 px-2 text-right ${cutoffWeek === i + 1 ? 'bg-[#00D4B2] text-[#0A2540] font-bold' : ''}`}>
                      S{i + 1}
                    </th>
                  ))}
                  <th scope="col" className="py-3 px-3 text-right">Total PV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {lineaBase.map((lb, idx) => {
                  const sumRow = Array.from({ length: 12 }, (_, i) => Number((lb as any)[`S${i + 1}`]) || 0).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={lb.codigo || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                        {lb.codigo || 'Sin datos'}
                      </td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const val = (lb as any)[`S${i + 1}`];
                        return (
                          <td key={i} className={`py-3 px-2 text-right font-mono ${cutoffWeek === i + 1 ? 'bg-[#00D4B2]/10 font-bold' : ''}`}>
                            {val ? Number(val).toLocaleString() : '0'}
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0A2540]">
                        {sumRow.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
