/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Download, MessageSquare, Users, GitPullRequest, BookOpen, Send } from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { InteresadosAnalyticsCard } from '../analytics/InteresadosAnalyticsCard.tsx';
import { ComunicacionesAnalyticsCard } from '../analytics/ComunicacionesAnalyticsCard.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

type TabType = 'interesados' | 'plan' | 'emitidas' | 'cambios' | 'lecciones';

export const IntegracionSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  const { projectData, projectAnalytics } = useProjectData();
  const [activeTab, setActiveTab] = useState<TabType>('interesados');

  const plan = projectData?.plan_comunicaciones || [];
  const emitidas = projectData?.comunicaciones || [];
  const interesados = projectData?.interesados || [];
  const cambios = projectData?.cambios || [];
  const lecciones = projectData?.lecciones || [];

  const tieneDatos =
    plan.length > 0 || emitidas.length > 0 || interesados.length > 0 || cambios.length > 0 || lecciones.length > 0;

  if (!tieneDatos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
                PMBOK 8 · Dominio de Integración e Interesados
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-[#718096]">Plan oficial de comunicaciones</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
              Integración y comunicación
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
              Estrategia de difusión, gobernanza institucional y canales formales según la Matriz de Interesados del PMBOK.
            </p>
          </div>
        </div>

        <EmptyState
          sectionTitle="Plan de Comunicaciones y Gobernanza"
          sectionSubtitle="Alineamiento estratégico de partes interesadas internas y externas"
          pmbokDomain="Dominio de Interesados y Comunicaciones (PMBOK 8)"
          expectedContent={[
            'Matriz completa de canales: Comités directivos, mesas técnicas de interoperabilidad y boletines informativos.',
            'Calendario de eventos de seguimiento programados con hora, periodicidad y responsables.',
            'Métricas de efectividad: Porcentaje de comunicaciones enviadas a tiempo e interacciones concluidas.',
            'Clasificación por tipo de audiencia: Patrocinadores, entidades del Estado, equipo técnico y postulantes beta.',
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
              PMBOK 8 · Dominio de Integración e Interesados
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
            Integración y comunicación
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Registros de difusión, gobernanza, cambios y lecciones aprendidas cargados en Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#718096]">
            {plan.length} canales · {interesados.length} interesados
          </span>
        </div>
      </div>



      {/* Pestañas de subcolecciones */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'plan'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Plan de comunicaciones ({plan.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emitidas')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'emitidas'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Comunicaciones emitidas ({emitidas.length})</span>
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
          <span>Partes interesadas ({interesados.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cambios')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'cambios'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Solicitudes de cambio ({cambios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lecciones')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'lecciones'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white text-[#2D3748] border border-[#E2E8F0] hover:bg-[#F7FAFC]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lecciones aprendidas ({lecciones.length})</span>
        </button>
      </div>

      {/* Tabla Plan de Comunicaciones */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <ComunicacionesAnalyticsCard analytics={projectAnalytics.comunicaciones} cutoffWeek={cutoffWeek} />

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Tabla de datos crudos · Hoja «Plan_Comunicaciones»
              </h2>
              <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
                {plan.length} canales
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">Audiencia objetivo</th>
                    <th scope="col" className="py-3 px-4">Información requerida</th>
                    <th scope="col" className="py-3 px-4">Frecuencia</th>
                    <th scope="col" className="py-3 px-4">Canal</th>
                    <th scope="col" className="py-3 px-4">Responsable de emisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {plan.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#0A2540] whitespace-nowrap">{p.audiencia || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium max-w-sm">{p.informacion_requerida || 'Sin datos'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                          {p.frecuencia || 'Sin datos'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{p.canal || 'Sin datos'}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{p.responsable_emitir || 'Sin datos'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tabla Comunicaciones Emitidas */}
      {activeTab === 'emitidas' && (
        <div className="space-y-6">
          <ComunicacionesAnalyticsCard analytics={projectAnalytics.comunicaciones} cutoffWeek={cutoffWeek} />

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
              <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                Tabla de datos crudos · Hoja «Comunicaciones» (Eventos emitidos)
              </h2>
              <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
                {emitidas.length} emitidas
              </span>
            </div>

            {emitidas.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#718096]">No hay eventos de comunicación emitidos registrados aún.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0A2540] text-white font-semibold">
                    <tr>
                      <th scope="col" className="py-3 px-4">Semana</th>
                      <th scope="col" className="py-3 px-4">Comunicación / Reporte emitido</th>
                      <th scope="col" className="py-3 px-4">Audiencia receptora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                    {emitidas.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#F7FAFC] transition-colors">
                        <td className="py-3 px-4 font-bold text-center">Semana {c.semana ?? 'Sin datos'}</td>
                        <td className="py-3 px-4 font-medium">{c.comunicacion || 'Sin datos'}</td>
                        <td className="py-3 px-4 text-[#718096]">{c.audiencia || 'Sin datos'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla Interesados */}
      {activeTab === 'interesados' && (
        <div className="space-y-6">
          <InteresadosAnalyticsCard analytics={projectAnalytics.interesados} />

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
                  <th scope="col" className="py-3 px-4">Rol en el proyecto</th>
                  <th scope="col" className="py-3 px-4 text-center">Poder (1-5)</th>
                  <th scope="col" className="py-3 px-4 text-center">Interés (1-5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {interesados.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{item.id || 'Sin datos'}</td>
                    <td className="py-3 px-4 font-medium">{item.interesado || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-[#718096]">{item.rol || 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">{item.poder_1a5 ?? 'Sin datos'}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0A2540]">{item.interes_1a5 ?? 'Sin datos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* Tabla Cambios */}
      {activeTab === 'cambios' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Cambios» (Solicitudes de cambio / CR)
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {cambios.length} solicitudes
            </span>
          </div>

          {cambios.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay solicitudes de cambio registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">ID</th>
                    <th scope="col" className="py-3 px-4">Fecha</th>
                    <th scope="col" className="py-3 px-4">Descripción del cambio</th>
                    <th scope="col" className="py-3 px-4">Solicitante</th>
                    <th scope="col" className="py-3 px-4 text-center">Decisión formal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {cambios.map((c, idx) => (
                    <tr key={c.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{c.id || 'Sin datos'}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{c.fecha || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium max-w-sm">{c.descripcion || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-[#718096]">{c.solicitante || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          String(c.decision).toLowerCase().includes('aprob')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}>
                          {c.decision || 'Sin datos'}
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

      {/* Tabla Lecciones */}
      {activeTab === 'lecciones' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F7FAFC]">
            <h2 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos crudos · Hoja «Lecciones» (Repositorio de Lecciones Aprendidas)
            </h2>
            <span className="text-xs font-medium text-[#0A2540] bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
              {lecciones.length} lecciones
            </span>
          </div>

          {lecciones.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">No hay lecciones aprendidas documentadas aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0A2540] text-white font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">ID</th>
                    <th scope="col" className="py-3 px-4">Fecha</th>
                    <th scope="col" className="py-3 px-4">Situación observada</th>
                    <th scope="col" className="py-3 px-4">Lección / Recomendación futura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                  {lecciones.map((l, idx) => (
                    <tr key={l.id || idx} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0A2540] whitespace-nowrap">{l.id || 'Sin datos'}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#718096]">{l.fecha || 'Sin datos'}</td>
                      <td className="py-3 px-4 font-medium max-w-xs">{l.situacion || 'Sin datos'}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-sm">{l.leccion || 'Sin datos'}</td>
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
