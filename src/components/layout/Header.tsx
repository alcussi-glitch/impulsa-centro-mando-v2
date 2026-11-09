/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Bell, Menu, Info, Settings, LogIn, CheckCircle2, RefreshCw } from 'lucide-react';
import { SectionId } from '../../types/navigation.ts';
import { useProjectData } from '../../context/ProjectDataContext.tsx';

interface HeaderProps {
  cutoffWeek: number;
  onCutoffWeekChange: (week: number) => void;
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onToggleMobileMenu: () => void;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cutoffWeek,
  onCutoffWeekChange,
  activeSection,
  onNavigate,
  onToggleMobileMenu,
  onOpenConfig,
}) => {
  const {
    projectData,
    isDataLoaded,
    user,
    signInWithGoogle,
    isAuthLoading,
    syncSecondsAgo,
    syncStatus,
  } = useProjectData();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-[#E2E8F0] shadow-xs">
      {/* Zona izquierda: botón móvil, nombre del proyecto y estado de sincronización en tiempo real */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#2D3748] hover:text-[#0A2540] hover:bg-[#F7FAFC] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
          aria-label="Abrir u ocultar menú lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
          <span className="font-semibold text-sm sm:text-base text-[#0A2540] tracking-tight truncate max-w-[200px] md:max-w-xs lg:max-w-md">
            {projectData?.proyecto?.nombre || 'IMPULSA — Sistema de información con IA'}
          </span>

          {/* Requisito 3: Tiempo real en la barra superior «Sincronizado · hace X s» */}
          <div className="flex items-center gap-1.5">
            {syncStatus === 'synced' ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-full"
                title="Sincronización en tiempo real activa mediante Cloud Firestore (onSnapshot)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sincronizado · hace {syncSecondsAgo} s</span>
              </span>
            ) : syncStatus === 'syncing' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-300 rounded-full">
                <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                <span>Sincronizando...</span>
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full">
                {user ? 'Cloud Firestore listo' : 'Modo local'}
              </span>
            )}

            {isDataLoaded && projectData?.metadataCarga?.esDatosEjemplo && (
              <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider rounded bg-amber-50 text-amber-800 border border-amber-300">
                DATOS DE EJEMPLO
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zona central y derecha: Selector semana de corte, notificaciones, usuario y Logo IMPULSA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Selector Semana de corte */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg px-2 sm:px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#00D4B2]">
          <Calendar className="w-4 h-4 text-[#0A2540] shrink-0" aria-hidden="true" />
          <label htmlFor="semana-corte-select" className="text-xs text-[#2D3748] font-medium hidden md:inline">
            Corte:
          </label>
          <select
            id="semana-corte-select"
            value={cutoffWeek}
            onChange={(e) => onCutoffWeekChange(Number(e.target.value))}
            className="bg-transparent text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none cursor-pointer pr-1"
            aria-label="Seleccionar semana de corte del proyecto"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                Semana {week} {week === 6 ? '(Corte actual)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Botón de Configuración (Docente, Firebase, Seguridad) */}
        <button
          type="button"
          onClick={onOpenConfig}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border text-[#2D3748] bg-white border-[#E2E8F0] hover:bg-[#F7FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
          title="Configuración de proyecto, acceso a docente y estado de Firebase"
          aria-label="Abrir configuración de seguridad y docente"
        >
          <Settings className="w-3.5 h-3.5 text-[#0A2540]" />
          <span className="hidden xl:inline">Configuración</span>
        </button>

        {/* Botón / Estado de Usuario con Google */}
        {user ? (
          <button
            type="button"
            onClick={onOpenConfig}
            className="flex items-center gap-2 p-1 pl-2 bg-[#F7FAFC] hover:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors"
            title={`Sesión iniciada como ${user.displayName || user.email}`}
          >
            <span className="text-xs font-medium text-[#0A2540] hidden lg:inline max-w-[100px] truncate">
              {user.displayName?.split(' ')[0] || 'Mi cuenta'}
            </span>
            <img
              src={user.photoURL || 'https://lh3.googleusercontent.com/a/default-user'}
              alt={user.displayName || 'Usuario'}
              className="w-6 h-6 rounded-full border border-[#00D4B2]"
              referrerPolicy="no-referrer"
            />
          </button>
        ) : (
          <button
            type="button"
            disabled={isAuthLoading}
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-[#0A2540] hover:bg-[#0A2540]/90 rounded-lg transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
            title="Iniciar sesión con Google para sincronizar en la nube"
          >
            <LogIn className="w-3.5 h-3.5 text-[#00D4B2]" />
            <span className="hidden sm:inline">Iniciar sesión</span>
          </button>
        )}

        {/* Logotipo IMPULSA oficial a la derecha del encabezado (Regla 1) */}
        <div
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E2E8F0]"
          aria-label="Logotipo institucional IMPULSA"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0A2540] flex items-center justify-center shadow-xs">
            {/* Isotipo geométrico turquesa */}
            <svg
              className="w-4 h-4 text-[#00D4B2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-wider text-[#0A2540] leading-none font-['Montserrat']">
              IMPULSA
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#718096] font-medium hidden sm:inline">
              Gestión PMBOK 8
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
