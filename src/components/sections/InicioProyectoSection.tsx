/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Download, Users, Target, HelpCircle, CheckSquare, Layers, Award } from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { EvmEnginePendingCard } from '../common/EvmEnginePendingCard.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

type TabType = 'objetivos' | 'supuestos' | 'interesados' | 'requisitos' | 'entregables';

export const InicioProyectoSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  const { projectData } = useProjectData();
  const [activeTab, setActiveTab] = useState<TabType>('objetivos');

  const p = projectData?.proyecto;
  const objetivos = projectData?.objetivos || [];
  const supuestos = projectData?.supuestos || [];
  const interesados = projectData?.interesados || [];
  const requisitos = projectData?.requisitos || [];
  const entregables = projectData?.entregables || [];

  const tieneDatos =
    Boolean(p?.nombre) ||
    objetivos.length > 0 ||
    supuestos.length > 0 ||
    interesados.length > 0 ||
    requisitos.length > 0 ||
    entregables.length > 0;

  if (!tieneDatos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
                PMBOK 8 · Dominio de Gobernanza e Inicio
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-[#718096]">Acta formal de constitución</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
              Inicio del proyecto
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
              Información base del Acta de Constitución (Project Charter), objetivos SMART institucionales y registro inicial de partes interesadas.
            </p>
          </div>
        </div>

        <EmptyState
          sectionTitle="Acta de Constitución y Objetivos SMART"
          sectionSubtitle="Fase de Inicio: Fundamentación y alcance inicial del proyecto"
          pmbokDomain="Dominio de Gobernanza y Dirección (PMBOK 8)"
          expectedContent={[
            'Ficha ejecutiva: Patrocinador, Gerente de Proyecto, Fecha de inicio y fin planificado.',
            'Presupuesto inicial asignado (BAC) y duración total del ciclo de entrega.',
            'Objetivos SMART medibles (precisión algorítmica, fuentes integradas, tiempos de respuesta y tolerancia presupuestaria).',
            'Matriz inicial de interesados clave: Nivel de poder, interés y estrategia de comunicación.',
            'Criterios de éxito y entregables principales formalmente aprobados.',
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
              PMBOK 8 · Dominio de Gobernanza e Inicio
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
            Inicio del proyecto
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Acta de Constitución (Project Charter) y parámetros base sincronizados en Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#718096]">
            {objetivos.length} objetivos · {interesados.length} interesados
          </span>
        </div>
      </div>

      {/* Ficha ejecutiva del Acta de Constitución */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 md:p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] mb-4 flex items-center gap-2 font-['Montserrat']">
          <FileText className="w-4 h-4 text-[#00D4B2]" />
          <span>Ficha Resumen del Proyecto (Project Charter)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Nombre del proyecto</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">{p?.nombre || 'Sin datos'}</p>
          </div>

          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Patrocinador (Sponsor)</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">{p?.patrocinador || 'Sin datos'}</p>
          </div>

          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Director del proyecto</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">{p?.director_proyecto || 'Sin datos'}</p>
          </div>

          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Presupuesto BAC / Moneda</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">
              {p?.moneda || 'PEN'} {p?.BAC?.toLocaleString() || 'Sin datos'}
            </p>
          </div>

          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Presupuesto autorizado</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">
              {p?.moneda || 'PEN'} {p?.presupuesto_autorizado?.toLocaleString() || 'Sin datos'}
            </p>
          </div>

          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Reserva de contingencia</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">
              {p?.moneda || 'PEN'} {p?.reserva_contingencia?.toLocaleString() || 'Sin datos'}
            </p>
          </div>

          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Duración planificada</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">{p?.duracion_semanas || 12} semanas</p>
          </div>

          <div className="p-3 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] text-[#718096] uppercase font-semibold">Periodo planificado</p>
            <p className="text-sm font-bold text-[#0A2540] mt-0.5">
              {p?.fecha_inicio || 'Sin datos'} ➔ {p?.fecha_fin_planificada || 'Sin datos'}
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores en espera de EVM */}
      <EvmEnginePendingCard
        title="Validación Analítica y Alineamiento SMART"
        description="El análisis automatizado de completitud de objetivos y viabilidad de supuestos se activará con el motor analítico."
        pendingIndicators={[
          'Índice de completitud algorítmica del Acta de Constitución según PMBOK 8',
          'Trazabilidad automatizada de Objetivos SMART contra entregables del proyecto',
          'Monitoreo del ratio Reserva de Contingencia / BAC inicial (' + (p?.BAC ? ((p.reserva_contingencia / p.BAC) * 100).toFixed(1) : 0) + '%)',
          'Matriz de influencia inicial de interesados clave sobre los objetivos',
        ]}
      />

      {/* Pestañas de subcolecciones */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('objetivos')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'objetivos'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Objetivos SMART ({objetivos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supuestos')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'supuestos'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Supuestos ({supuestos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('interesados')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'interesados'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Interesados iniciales ({interesados.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requisitos')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'requisitos'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Requisitos ({requisitos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entregables')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'entregables'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Entregables principales ({entregables.length})</span>
        </button>
      </div>

      {/* Tabla Objetivos */}
      {activeTab === 'objetivos' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Objetivos»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {objetivos.length} objetivos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Objetivo SMART</th>
                  <th scope="col" className="py-3 px-4">Indicador de cumplimiento</th>
                  <th scope="col" className="py-3 px-4 text-center">Meta definida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {objetivos.map((o, idx) => (
                  <tr key={o.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{o.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 font-medium max-w-sm">{o.objetivo || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-[#718096]">{o.indicador || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {o.meta || 'Sin datos'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Supuestos */}
      {activeTab === 'supuestos' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Supuestos»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {supuestos.length} supuestos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Tipo</th>
                  <th scope="col" className="py-3 px-4">Descripción del supuesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {supuestos.map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{s.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {s.tipo || 'Sin datos'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{s.descripcion || 'Sin datos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Interesados */}
      {activeTab === 'interesados' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Interesados»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {interesados.length} interesados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Interesado / Organización</th>
                  <th scope="col" className="py-3 px-4">Rol institucional</th>
                  <th scope="col" className="py-3 px-4 text-center">Poder (1-5)</th>
                  <th scope="col" className="py-3 px-4 text-center">Interés (1-5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {interesados.map((i, idx) => (
                  <tr key={i.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{i.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 font-medium">{i.interesado || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-[#718096]">{i.rol || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">{i.poder_1a5 ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">{i.interes_1a5 ?? 'Sin datos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Requisitos */}
      {activeTab === 'requisitos' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Requisitos»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {requisitos.length} requisitos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Tipo</th>
                  <th scope="col" className="py-3 px-4">Descripción del requisito</th>
                  <th scope="col" className="py-3 px-4">Criterio de aceptación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {requisitos.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{r.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{r.tipo || 'Sin datos'}</td>
                    <td className="py-3 px-4 font-medium">{r.descripcion || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-slate-700">{r.criterio_aceptacion || 'Sin datos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Entregables */}
      {activeTab === 'entregables' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Entregables»
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {entregables.length} entregables
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A2540] text-white font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID</th>
                  <th scope="col" className="py-3 px-4">Entregable principal</th>
                  <th scope="col" className="py-3 px-4 text-center">Incluido en el alcance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {entregables.map((ent, idx) => (
                  <tr key={ent.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{ent.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 font-medium">{ent.entregable || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        ent.incluido
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {ent.incluido ? 'Incluido' : 'Excluido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
