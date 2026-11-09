/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface EvmEnginePendingCardProps {
  title: string;
  description: string;
  pendingIndicators: string[];
}

export const EvmEnginePendingCard: React.FC<EvmEnginePendingCardProps> = ({
  title,
  description,
  pendingIndicators,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0A2540]/5 border border-[#0A2540]/10 flex items-center justify-center text-[#0A2540] shrink-0">
            <Database className="w-5 h-5 text-[#0A2540]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0A2540] font-['Montserrat']">
                {title}
              </h2>
              {/* Semáforo accesible con Color, Icono y Texto */}
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300"
                role="status"
                aria-label="Estado: Motor EVM / PMBOK 8 en espera"
              >
                <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                <span>Motor EVM / PMBOK 8 en espera</span>
              </span>
            </div>
            <p className="text-xs text-[#718096] mt-0.5">{description}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#2D3748] self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#00D4B2]" aria-hidden="true" />
          <span className="font-medium">Datos crudos disponibles abajo</span>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-xs font-semibold text-[#0A2540] uppercase tracking-wider mb-2.5">
          Cálculos e indicadores analíticos programados:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {pendingIndicators.map((indicator, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2.5 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]/70 text-xs text-[#2D3748]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" aria-hidden="true"></span>
              <span className="leading-snug">{indicator}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
