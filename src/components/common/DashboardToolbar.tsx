/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Filter, Download, RotateCcw } from 'lucide-react';

interface DashboardToolbarProps {
  title: string;
  subtitle: string;
  domainTag: string;
  cutoffWeek: number;
  maxWeeks?: number;
  onCutoffChange: (week: number) => void;
  // Filtro Cuenta de Control
  selectedControlAccount?: string;
  controlAccounts?: string[];
  onControlAccountChange?: (ca: string) => void;
  // Filtro Categoría
  selectedCategory?: string;
  categories?: string[];
  onCategoryChange?: (cat: string) => void;
  // Acción adicional opcional
  extraActions?: React.ReactNode;
}

export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  title,
  subtitle,
  domainTag,
  cutoffWeek,
  maxWeeks = 12,
  onCutoffChange,
  selectedControlAccount = 'TODAS',
  controlAccounts = [],
  onControlAccountChange,
  selectedCategory = 'TODAS',
  categories = [],
  extraActions,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const hasActiveFilters =
    (selectedControlAccount && selectedControlAccount !== 'TODAS') ||
    (selectedCategory && selectedCategory !== 'TODAS');

  const handleResetFilters = () => {
    if (onControlAccountChange) onControlAccountChange('TODAS');
    if (onCategoryChange) onCategoryChange('TODAS');
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#E2E8F0] print:border-none print:pb-2">
      {/* Título y metadatos */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded">
            {domainTag}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs text-[#718096]">
            Corte evaluado: <strong className="text-[#0A2540]">Semana {cutoffWeek}</strong> de {maxWeeks}
          </span>
          {hasActiveFilters && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded">
                Filtros activos
              </span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-[#0A2540] font-['Montserrat'] tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] mt-0.5 max-w-3xl">
          {subtitle}
        </p>
      </div>

      {/* Controles de Filtrado y Exportación (ocultos o limpios en impresión) */}
      <div className="flex flex-wrap items-center gap-2.5 no-print">
        {/* Selector de semana de corte */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#00D4B2]" />
          <label htmlFor="dashboard-cutoff-select" className="text-xs font-semibold text-[#718096]">
            Corte:
          </label>
          <select
            id="dashboard-cutoff-select"
            value={cutoffWeek}
            onChange={(e) => onCutoffChange(Number(e.target.value))}
            className="text-xs font-bold text-[#0A2540] bg-transparent border-none focus:outline-hidden cursor-pointer"
          >
            {Array.from({ length: maxWeeks }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Semana {w}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Cuenta de Control */}
        {onControlAccountChange && controlAccounts.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="dashboard-ca-select" className="text-xs font-semibold text-[#718096]">
              Cuenta:
            </label>
            <select
              id="dashboard-ca-select"
              value={selectedControlAccount}
              onChange={(e) => onControlAccountChange(e.target.value)}
              className="text-xs font-medium text-[#0A2540] bg-transparent border-none focus:outline-hidden cursor-pointer max-w-[130px] truncate"
            >
              <option value="TODAS">Todas las cuentas</option>
              {controlAccounts.map((ca) => (
                <option key={ca} value={ca}>
                  {ca}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por Categoría */}
        {onCategoryChange && categories.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="dashboard-cat-select" className="text-xs font-semibold text-[#718096]">
              Categoría:
            </label>
            <select
              id="dashboard-cat-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs font-medium text-[#0A2540] bg-transparent border-none focus:outline-hidden cursor-pointer max-w-[130px] truncate"
            >
              <option value="TODAS">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón Reset si hay filtros activos */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="p-1.5 text-slate-500 hover:text-[#0A2540] bg-white hover:bg-slate-50 rounded-lg border border-[#E2E8F0] transition-colors shadow-xs"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Botón Descargar tablero en PDF */}
        <button
          type="button"
          onClick={handlePrint}
          className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#0A2540] text-white hover:bg-[#1A365D] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          title="Descargar este tablero formateado en PDF o imprimir"
        >
          <Download className="w-3.5 h-3.5 text-[#00D4B2]" />
          <span>Descargar tablero en PDF</span>
        </button>

        {/* Acciones extra específicas de la vista si existen */}
        {extraActions}
      </div>
    </div>
  );
};
