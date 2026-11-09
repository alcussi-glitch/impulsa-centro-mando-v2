/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Download, PlayCircle, AlertOctagon, ShoppingCart, CheckSquare, Zap, Clock } from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { EvmEnginePendingCard } from '../common/EvmEnginePendingCard.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

type TabType = 'automatizaciones' | 'incidentes' | 'adquisiciones' | 'calidad';

export const EjecucionSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  const { projectData } = useProjectData();
  const [activeTab, setActiveTab] = useState<TabType>('automatizaciones');

  const automatizaciones = projectData?.automatizaciones || [];
  const incidentes = projectData?.incidentes || [];
  const adquisiciones = projectData?.adquisiciones || [];
  const calidad = projectData?.calidad || [];

  const tieneDatos =
    automatizaciones.length > 0 || incidentes.length > 0 || adquisiciones.length > 0 || calidad.length > 0;

  if (!tieneDatos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
                PMBOK 8 · Dominio de Ejecución y Entrega
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-[#718096]">Supervisión de procesos automatizados</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
              Ejecución y automatización
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
              Supervisión continua de flujos automatizados en producción, control de disparadores (triggers) e incidentes.
            </p>
          </div>
        </div>

        <EmptyState
          sectionTitle="Monitoreo de Flujos Automatizados en Producción"
          sectionSubtitle="Fase de Ejecución: Automatizaciones activas del proyecto IMPULSA"
          pmbokDomain="Dominio de Trabajo del Proyecto y Procesos (PMBOK 8)"
          expectedContent={[
            'Monitoreo del flujo de ingestión geográfica de convocatorias laborales (MTPE / portales públicos).',
            'Monitoreo del flujo de asistencia semántica y adecuación curricular de postulantes.',
            'Automatización algorítmica de alertas de desviación EVM (cuando CPI o SPI caen por debajo de 0.90).',
            'Tasa de éxito y recuento de ejecuciones por lote y en tiempo real.',
          ]}
          onNavigateToData={onNavigateToData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
              PMBOK 8 · Dominio de Ejecución y Entrega
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
            Ejecución y automatización
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Catálogo de flujos automatizados, incidentes reportados, adquisiciones y estándares de calidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#718096]">
            {automatizaciones.length} flujos registrados
          </span>
        </div>
      </div>

      {/* Indicadores en espera de EVM */}
      <EvmEnginePendingCard
        title="Monitoreo de Flujos en Tiempo Real y Alertas de Desviación EVM"
        description="Las métricas de tasa de éxito, tiempos acumulados y disparadores automáticos se activarán con el motor analítico."
        pendingIndicators={[
          'Tasa de éxito operativo en vivo (%) y volumen de transacciones procesadas',
          'Ahorro estimado en horas-hombre mensuales por proceso automatizado',
          'Disparadores automáticos de alertas EVM (cuando CPI o SPI < 0.90)',
          'Tasa de cierre y tiempo medio de resolución de incidentes operativos',
          'Cumplimiento porcentual de criterios de calidad y verificación de entregables',
        ]}
      />

      {/* Pestañas de subcolecciones */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('automatizaciones')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'automatizaciones'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Automatizaciones ({automatizaciones.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incidentes')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'incidentes'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Incidentes operativos ({incidentes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adquisiciones')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'adquisiciones'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Adquisiciones ({adquisiciones.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calidad')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'calidad'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Criterios de calidad ({calidad.length})</span>
        </button>
      </div>

      {/* Tabla Automatizaciones */}
      {activeTab === 'automatizaciones' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Automatizaciones»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {automatizaciones.length} flujos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Proceso automatizado</th>
                  <th scope="col" className="py-3 px-4">Categoría</th>
                  <th scope="col" className="py-3 px-4 text-center">Frecuencia / mes</th>
                  <th scope="col" className="py-3 px-4 text-center">Minutos por vez</th>
                  <th scope="col" className="py-3 px-4 text-center">Riesgo error (1-5)</th>
                  <th scope="col" className="py-3 px-4 text-center">Estructura reglas (1-5)</th>
                  <th scope="col" className="py-3 px-4">Disparador (Trigger)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {automatizaciones.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{item.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 font-medium max-w-xs">{item.proceso || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-[#718096] whitespace-nowrap">{item.categoria || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">{item.frecuencia_mes ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold">{item.minutos_por_vez ?? 'Sin datos'} min</td>
                    <td className="py-3 px-4 text-center font-bold">{item.riesgo_error_1a5 ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold">{item.estructura_reglas_1a5 ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{item.disparador || 'Sin datos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Incidentes */}
      {activeTab === 'incidentes' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Incidentes»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {incidentes.length} incidentes
            </span>
          </div>

          {incidentes.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay incidentes reportados en el proyecto.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">ID</th>
                    <th scope="col" className="py-3 px-4">Fecha</th>
                    <th scope="col" className="py-3 px-4">Descripción del incidente</th>
                    <th scope="col" className="py-3 px-4">Responsable</th>
                    <th scope="col" className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {incidentes.map((inc, idx) => (
                    <tr key={inc.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{inc.id || 'Sin datos'}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{inc.fecha || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium max-w-sm">{inc.descripcion || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-[#718096]">{inc.responsable || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          String(inc.estado).toLowerCase().includes('cerr')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}>
                          {inc.estado || 'Sin datos'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Adquisiciones */}
      {activeTab === 'adquisiciones' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Adquisiciones»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {adquisiciones.length} adquisiciones
            </span>
          </div>

          {adquisiciones.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay adquisiciones registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">ID</th>
                    <th scope="col" className="py-3 px-4">Bien o servicio</th>
                    <th scope="col" className="py-3 px-4">Decisión contractual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {adquisiciones.map((adq, idx) => (
                    <tr key={adq.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{adq.id || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium">{adq.bien_o_servicio || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-[#718096]">{adq.decision || 'Sin datos'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Calidad */}
      {activeTab === 'calidad' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Calidad»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {calidad.length} estándares
            </span>
          </div>

          {calidad.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay estándares de calidad registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">ID</th>
                    <th scope="col" className="py-3 px-4">ID Entregable</th>
                    <th scope="col" className="py-3 px-4">Estándar o criterio de aceptación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {calidad.map((cal, idx) => (
                    <tr key={cal.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{cal.id || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-mono text-[#0A2540]">{cal.entregable_id || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium">{cal.estandar_o_criterio || 'Sin datos'}</td>
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
