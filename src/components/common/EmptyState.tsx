/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, PlusCircle, AlertCircle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { SectionId } from '../../types/navigation.ts';

interface EmptyStateProps {
  sectionTitle: string;
  sectionSubtitle: string;
  pmbokDomain: string;
  expectedContent: string[];
  onNavigateToData: () => void;
  onManualCapture?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  sectionTitle,
  sectionSubtitle,
  pmbokDomain,
  expectedContent,
  onNavigateToData,
  onManualCapture,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 md:p-10 max-w-4xl mx-auto my-6">
      {/* Encabezado del estado con semáforo accesible (Color, Icono y Texto) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[#E2E8F0] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#00D4B2]">
              {pmbokDomain}
            </span>
            <span className="text-slate-300">·</span>
            {/* Semáforo accesible: color ámbar, icono AlertCircle, texto explicativo "Sin datos" */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300"
              role="status"
              aria-label="Estado del módulo: Sin datos cargados"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Sin datos cargados</span>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0A2540] font-['Montserrat']">
            {sectionTitle}
          </h2>
          <p className="text-sm text-[#718096] mt-0.5">{sectionSubtitle}</p>
        </div>

        {/* Indicador de rigor de datos */}
        <div className="flex items-center gap-2 text-xs bg-[#F7FAFC] px-3 py-2 rounded-lg border border-[#E2E8F0] self-start sm:self-auto">
          <Database className="w-4 h-4 text-[#0A2540]" aria-hidden="true" />
          <span className="text-[#2D3748] font-medium">Motor EVM / PMBOK 8 en espera</span>
        </div>
      </div>

      {/* Cuerpo principal del estado vacío */}
      <div className="py-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0A2540]/5 border border-[#0A2540]/10 flex items-center justify-center text-[#0A2540] mb-4">
          <FileSpreadsheet className="w-8 h-8 text-[#0A2540]" aria-hidden="true" />
        </div>

        <h3 className="text-lg font-bold text-[#0A2540] font-['Montserrat'] mb-2">
          Aún no hay datos cargados
        </h3>
        <p className="text-sm text-[#2D3748] max-w-lg mb-6 leading-relaxed">
          Para visualizar esta sección bajo el estándar PMBOK 8 (PMI, 2025), sube el archivo Excel institucional del proyecto o ingresa los registros iniciales.
        </p>

        {/* Qué se visualizará al cargar datos */}
        <div className="w-full bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl p-5 mb-8 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0A2540] font-['Montserrat'] mb-3">
            Elementos previstos para este módulo:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#2D3748]">
            {expectedContent.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4B2] mt-1.5 shrink-0" aria-hidden="true"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botones de acción accesibles */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onNavigateToData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white text-xs font-semibold rounded-lg hover:bg-[#0A2540]/90 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
          >
            <Database className="w-4 h-4 text-[#00D4B2]" aria-hidden="true" />
            <span>Ir a Carga de Datos (.xlsx)</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
          </button>

          {onManualCapture && (
            <button
              type="button"
              onClick={onManualCapture}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#0A2540] text-xs font-semibold rounded-lg border border-[#E2E8F0] hover:bg-[#F7FAFC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
            >
              <PlusCircle className="w-4 h-4 text-[#00D4B2]" aria-hidden="true" />
              <span>Capturar datos manualmente</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
