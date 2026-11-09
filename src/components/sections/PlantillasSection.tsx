/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, Download, Search, FileText } from 'lucide-react';
import { EmptyState } from '../common/EmptyState.tsx';

interface SectionProps {
  cutoffWeek: number;
  onNavigateToData: () => void;
}

export const PlantillasSection: React.FC<SectionProps> = ({ cutoffWeek, onNavigateToData }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded text-[#0A2540]">
              PMBOK 8 · Activos de los Procesos de la Organización
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-[#718096]">Catálogo de 28 artefactos oficiales</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            Biblioteca de plantillas PMBOK
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Repositorio con 28 plantillas documentales oficiales para todas las fases del ciclo de vida del proyecto (formatos DOCX, XLSX y PDF).
          </p>
        </div>

        <button
          type="button"
          disabled
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-400 bg-white border border-[#E2E8F0] rounded-lg cursor-not-allowed self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Descargar paquete completo (.zip)</span>
        </button>
      </div>

      <EmptyState
        sectionTitle="Biblioteca de Artefactos y Plantillas PMBOK 8"
        sectionSubtitle="Documentos estandarizados y sincronizados con los datos del proyecto"
        pmbokDomain="Gobernanza y Activos de Procesos (PMBOK 8)"
        expectedContent={[
          'Fase de Inicio: Acta de Constitución del Proyecto y Registro de Interesados Clave.',
          'Fase de Planificación: Plan de Dirección, Diccionario EDT, Cronograma de Ruta Crítica, Línea Base de Costos y Matriz RACI.',
          'Fase de Ejecución: Registro de Incidentes, Asignación de Recursos y Minutas Técnicas.',
          'Fase de Monitoreo y Control: Informe de Desempeño EVM, Registro de Cambios y Matriz de Riesgos.',
          'Fase de Cierre: Informe de Cierre de Proyecto y Repositorio de Lecciones Aprendidas.',
          'Pre-llenado automático de cada documento a partir de la matriz de datos cargada.',
        ]}
        onNavigateToData={onNavigateToData}
      />
    </div>
  );
};
