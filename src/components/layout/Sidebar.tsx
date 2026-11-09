/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Database,
  FileText,
  CalendarDays,
  ShieldAlert,
  TrendingUp,
  Share2,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  Building2,
  X,
  Compass,
} from 'lucide-react';
import { SectionId, SECTIONS } from '../../types/navigation.ts';

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenConfig?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  onOpenConfig,
}) => {
  const getIcon = (id: SectionId) => {
    switch (id) {
      case 'inicio':
        return LayoutDashboard;
      case 'datos':
        return Database;
      case 'inicio-proyecto':
        return FileText;
      case 'planificacion':
        return CalendarDays;
      case 'riesgos':
        return ShieldAlert;
      case 'control':
        return TrendingUp;
      case 'integracion':
        return Share2;
      case 'ejecucion':
        return Cpu;
      case 'plantillas':
        return Layers;
      case 'bitacora-ia':
        return Sparkles;
      case 'acerca-de':
        return HelpCircle;
      default:
        return Compass;
    }
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Menú lateral con fondo azul marino ejecutivo #0A2540 */}
      <aside
        id="sidebar-navegacion"
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-20 h-screen w-72 bg-[#0A2540] text-white flex flex-col justify-between shrink-0 shadow-xl transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Menú principal de navegación del proyecto"
      >
        {/* Cabecera del Sidebar */}
        <div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00D4B2]/20 border border-[#00D4B2]/40 flex items-center justify-center text-[#00D4B2]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-wider uppercase text-white font-['Montserrat']">
                  Centro de Mando
                </h1>
                <p className="text-[11px] text-[#00D4B2] font-medium">Plataforma IMPULSA</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
              aria-label="Cerrar menú lateral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grupo de enlaces */}
          <div className="px-3 py-4">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/50 font-['Montserrat']">
              Navegación del proyecto (PMBOK 8)
            </p>

            <nav className="space-y-1" aria-label="Secciones del proyecto">
              {SECTIONS.map((section) => {
                const IconComponent = getIcon(section.id);
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      onNavigate(section.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2] ${
                      isActive
                        ? 'bg-[#00D4B2]/15 text-[#00D4B2] font-semibold border-l-3 border-[#00D4B2] shadow-xs'
                        : 'text-white/80 hover:text-white hover:bg-white/8'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#00D4B2]' : 'text-white/60 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate text-left">{section.label}</span>
                    </div>

                    {section.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-[#00D4B2]/20 text-[#00D4B2] border border-[#00D4B2]/30">
                        {section.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Pie del menú lateral (Entorno Corporativo y Configuración) */}
        <div className="p-4 border-t border-white/10 bg-black/15">
          <button
            type="button"
            onClick={onOpenConfig}
            className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2] rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-white/5"
            title="Abrir configuración de seguridad, docente y Firebase"
          >
            <div className="flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00D4B2]" aria-hidden="true"></span>
                <span className="font-medium text-white/90 group-hover:text-[#00D4B2] transition-colors">
                  Entorno Corporativo
                </span>
              </div>
              <Building2 className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" aria-hidden="true" />
            </div>
            <p className="mt-1 text-[10px] text-white/50 leading-tight">
              Gobernanza activa · Configurar acceso
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};
