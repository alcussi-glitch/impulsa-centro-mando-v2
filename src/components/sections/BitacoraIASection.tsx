/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Download, ShieldCheck, Clock, FileCheck } from 'lucide-react';
import { EmptyState } from '../common/EmptyState.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const BitacoraIASection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded text-[#0A2540]">
              Gobernanza de IA · Trazabilidad y Ética
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">Supervisión humana continua (Human-in-the-Loop)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Bitácora de uso de Inteligencia Artificial
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Trazabilidad rigurosa de tareas asistidas por IA, horas de esfuerzo ahorradas, control de sesgos algorítmicos y validación humana obligatoria.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-400 bg-white border border-[#E2E8F0] rounded-lg cursor-not-allowed self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar bitácora (.csv / .pdf)</span>
        </button>
      </div>

      {/* Alerta visible sobre la Regla 4 de IA responsable */}
      <div className="bg-[#0A2540]/5 border border-[#0A2540]/15 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#00D4B2] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#2D3748]">
          <span className="font-bold text-[#0A2540]">Protocolo de Transparencia Ética (Regla 4): </span>
          Toda asistencia generativa se ejecuta en el servidor sin exponer claves. Cualquier contenido sugerido por IA se rotula visiblemente como{' '}
          <strong className="text-[#0A2540]">«Borrador IA · pendiente de validación humana»</strong> y queda registrado en esta bitácora con sello de auditoría.
        </div>
      </div>

      <EmptyState
        sectionTitle="Registro Auditable de Asistencia de IA"
        sectionSubtitle="Trazabilidad y supervisión ética para gestores de proyectos"
        pmbokDomain="Gobernanza Tecnológica y Ética (PMBOK 8)"
        expectedContent={[
          'Conteo global de interacciones de IA y horas hombre equivalentes ahorradas en el proyecto.',
          'Tasa de aceptación, modificación y rechazo por parte del equipo gestor.',
          'Tabla detallada de auditoría: Fecha, modelo/herramienta, tarea ejecutada, profesional responsable y dictamen humano.',
          'Distribución del uso de IA por categoría (generación documental, adecuación de perfiles, análisis predictivo EVM).',
          'Trazabilidad de prompts y respuestas del servidor para auditorías de cumplimiento.',
        ]}
        onNavigateToData={onNavigateToData}
      />
    </div>
  );
};
