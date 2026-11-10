/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Download, AlertTriangle, ShieldCheck, FileSpreadsheet, Layers, ShieldX } from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { RiesgosAnalyticsCard } from '../analytics/RiesgosAnalyticsCard.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

type TabType = 'riesgos' | 'respuestas' | 'contingencia' | 'historial';

export const RiesgosSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  const { projectData, projectAnalytics } = useProjectData();
  const [activeTab, setActiveTab] = useState<TabType>('riesgos');

  const riesgos = projectData?.riesgos || [];
  const respuestas = projectData?.respuestas_riesgo || [];
  const contingencia = projectData?.contingencia || [];
  const historial = projectData?.riesgos_historial || [];

  // La pantalla solo muestra "Sin datos cargados" si la subcolección está realmente vacía
  const tieneDatos = riesgos.length > 0 || respuestas.length > 0 || contingencia.length > 0;

  if (!tieneDatos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
                PMBOK 8 · Dominio de Incertidumbre y Riesgos
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-[#718096]">Corte evaluativo: Semana {cutoffWeek} de 12</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
              Gestión de riesgos
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
              Registro cuantitativo, estrategias de mitigación y administración de la reserva de contingencia.
            </p>
          </div>
        </div>

        <EmptyState
          sectionTitle="Matriz de Severidad 5×5 y Contingencias"
          sectionSubtitle="Monitoreo de incertidumbre: Probabilidad vs. Impacto"
          pmbokDomain="Dominio de Incertidumbre (PMBOK 8)"
          expectedContent={[
            'Matriz de calor 5×5 interactiva con conteo de amenazas por cuadrante de severidad.',
            'Tablero de riesgos críticos que requieren mitigación inmediata según umbrales PMBOK.',
            'Control de la reserva de contingencia asignada vs. consumida por eventos de riesgo.',
            'Desglose por categoría: Técnico/IA, Gobernanza/Legal, Operacional e Infraestructura.',
            'Planes de respuesta a contingencias asignados con responsables directos y fechas límite.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de la sección */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
              PMBOK 8 · Dominio de Incertidumbre y Riesgos
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">Corte evaluativo: Semana {cutoffWeek} de 12</span>
            {projectData?.metadataCarga?.esDatosEjemplo && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded">
                DATOS DE EJEMPLO
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Gestión de riesgos
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Datos registrados en Firestore para el proyecto «{projectData?.proyecto?.nombre || 'IMPULSA'}».
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#718096]">
            {riesgos.length} riesgos registrados
          </span>
        </div>
      </div>

      {/* Analítica cuantitativa en tiempo real de riesgos */}
      <RiesgosAnalyticsCard analytics={projectAnalytics.riesgos} cutoffWeek={cutoffWeek} />

      {/* Pestañas de subcolecciones de riesgos */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('riesgos')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'riesgos'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Registro de riesgos ({riesgos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('respuestas')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'respuestas'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Respuestas ejecutadas ({respuestas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contingencia')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'contingencia'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Reserva de contingencia ({contingencia.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'historial'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Historial semanal ({historial.length})</span>
        </button>
      </div>

      {/* Tabla de datos crudos: Hoja Riesgos */}
      {activeTab === 'riesgos' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Tabla de datos crudos · Hoja «Riesgos»
              </h2>
              <p className="text-xs text-[#718096]">
                Columnas cargadas tal cual desde Firestore sin procesar cálculos automáticos.
              </p>
            </div>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {riesgos.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Riesgo / Descripción</th>
                  <th scope="col" className="py-3 px-4">Categoría</th>
                  <th scope="col" className="py-3 px-4 text-center">Probabilidad (1-5)</th>
                  <th scope="col" className="py-3 px-4 text-center">Impacto (1-5)</th>
                  <th scope="col" className="py-3 px-4">Estrategia</th>
                  <th scope="col" className="py-3 px-4">Respuesta planificada</th>
                  <th scope="col" className="py-3 px-4">Propietario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {riesgos.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">
                      {item.id || 'Sin datos'}
                    </td>
                    <td className="py-3 px-4 font-medium max-w-xs">{item.riesgo || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-[#718096] whitespace-nowrap">{item.categoria || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">{item.probabilidad_1a5 ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">{item.impacto_1a5 ?? 'Sin datos'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {item.estrategia || 'Sin datos'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm text-slate-700">{item.respuesta_planificada || 'Sin datos'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{item.propietario || 'Sin datos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de datos crudos: Respuestas a Riesgos */}
      {activeTab === 'respuestas' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Respuestas_Riesgo»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {respuestas.length} registros
            </span>
          </div>
          {respuestas.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay acciones de respuesta registradas para este proyecto.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">ID Riesgo</th>
                    <th scope="col" className="py-3 px-4">Acción ejecutada</th>
                    <th scope="col" className="py-3 px-4">Fecha</th>
                    <th scope="col" className="py-3 px-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {respuestas.map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540]">{r.id_riesgo || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium">{r.accion_ejecutada || 'Sin datos'}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{r.fecha || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-[#718096]">{r.responsable || 'Sin datos'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla de datos crudos: Contingencia */}
      {activeTab === 'contingencia' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Contingencia»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {contingencia.length} registros
            </span>
          </div>
          {contingencia.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay registros de consumo de contingencia para este proyecto.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">Fecha</th>
                    <th scope="col" className="py-3 px-4">Semana</th>
                    <th scope="col" className="py-3 px-4">ID Riesgo</th>
                    <th scope="col" className="py-3 px-4">Concepto</th>
                    <th scope="col" className="py-3 px-4 text-right">Monto ejecutado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {contingencia.map((c, idx) => (
                    <tr key={idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">{c.fecha || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-bold text-center">{c.semana ?? 'Sin datos'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540]">{c.riesgo || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium">{c.concepto || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#0A2540]">
                        {typeof c.monto === 'number' ? `${projectData?.proyecto?.moneda || 'PEN'} ${c.monto.toLocaleString()}` : (c.monto || 'Sin datos')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla de datos crudos: Historial de Riesgos */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Riesgos_Historial»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {historial.length} registros
            </span>
          </div>
          {historial.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay historial semanal de riesgos registrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">Semana</th>
                    <th scope="col" className="py-3 px-4">ID Riesgo</th>
                    <th scope="col" className="py-3 px-4 text-center">Probabilidad (1-5)</th>
                    <th scope="col" className="py-3 px-4 text-center">Impacto (1-5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {historial.map((h, idx) => (
                    <tr key={idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-bold text-center">Semana {h.semana ?? 'Sin datos'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540]">{h.id || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-center font-bold">{h.probabilidad_1a5 ?? 'Sin datos'}</td>
                      <td className="py-3 px-4 text-center font-bold">{h.impacto_1a5 ?? 'Sin datos'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
