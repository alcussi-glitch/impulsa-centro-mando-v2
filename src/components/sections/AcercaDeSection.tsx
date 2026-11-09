/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, HelpCircle, Compass, Calendar, Database, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { SectionId } from '../../types/navigation.ts';

interface AcercaDeProps {
  onNavigate: (section: SectionId) => void;
}

export const AcercaDeSection: React.FC<AcercaDeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Cabecera */}
      <div className="pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2540] bg-[#00D4B2]/15 px-2 py-0.5 rounded text-[#0A2540]">
            Guía para personas gestoras
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs text-[#718096]">Centro de Mando · IMPULSA</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] font-['Montserrat']">
          Acerca del Centro de Mando · Instrucciones de uso
        </h1>
        <p className="text-sm text-[#718096] mt-1 max-w-3xl leading-relaxed">
          Esta plataforma está diseñada para acompañarte en la dirección ejecutiva, control de valor ganado (EVM) y gobernanza de proyectos basada en la Guía PMBOK 8 (PMI, 2025). No requiere conocimientos de programación.
        </p>
      </div>

      {/* Tarjeta de bienvenida */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#0A2540] font-['Montserrat'] mb-3 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#00D4B2]" />
          <span>¿Cómo utilizar esta aplicación paso a paso?</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold font-mono">1</span>
              <h3 className="text-sm font-bold text-[#0A2540]">Navegación por áreas del PMBOK 8</h3>
            </div>
            <p className="text-xs text-[#2D3748] leading-relaxed">
              Utiliza el menú lateral izquierdo con fondo azul marino para moverte entre las 10 secciones del proyecto (desde el Acta inicial hasta la Bitácora de IA).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold font-mono">2</span>
              <h3 className="text-sm font-bold text-[#0A2540]">Selector de Semana de corte</h3>
            </div>
            <p className="text-xs text-[#2D3748] leading-relaxed">
              En la barra superior encontrarás el selector de «Semana de corte». Te permite viajar en el tiempo entre la semana 1 y la 12 para evaluar cómo ha evolucionado el desempeño del proyecto.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold font-mono">3</span>
              <h3 className="text-sm font-bold text-[#0A2540]">Carga de datos y rigor matemático</h3>
            </div>
            <p className="text-xs text-[#2D3748] leading-relaxed">
              Ninguna cifra se inventa (Regla 3). Para activar los cálculos, dirígete a la sección <strong>«Datos»</strong> y sube el archivo Excel con las 6 hojas normalizadas del PMBOK.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold font-mono">4</span>
              <h3 className="text-sm font-bold text-[#0A2540]">Inteligencia Artificial transparente y ética</h3>
            </div>
            <p className="text-xs text-[#2D3748] leading-relaxed">
              Cualquier informe o propuesta redactada con IA siempre te solicitará aprobación y estará rotulada como <em>«Borrador IA · pendiente de validación humana»</em> (Regla 4).
            </p>
          </div>
        </div>
      </div>

      {/* Cuadro de accesibilidad y diseño */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#00D4B2]/15 text-[#0A2540] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5 text-[#0A2540]" />
          </div>
          <h3 className="text-sm font-bold text-[#0A2540] mb-1">Accesibilidad WCAG AA</h3>
          <p className="text-xs text-[#718096] leading-relaxed">
            Contraste validado, soporte para lectores de pantalla con etiquetas ARIA y semáforos informativos redundantes (color, icono y texto).
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#00D4B2]/15 text-[#0A2540] flex items-center justify-center mb-3">
            <Database className="w-5 h-5 text-[#0A2540]" />
          </div>
          <h3 className="text-sm font-bold text-[#0A2540] mb-1">Control EVM en tiempo real</h3>
          <p className="text-xs text-[#718096] leading-relaxed">
            Indicadores matemáticos estándar: Valor Planificado (PV), Valor Ganado (EV), Costo Real (AC), índices CPI/SPI y pronósticos EAC/VAC.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#00D4B2]/15 text-[#0A2540] flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5 text-[#0A2540]" />
          </div>
          <h3 className="text-sm font-bold text-[#0A2540] mb-1">Seguridad en el servidor</h3>
          <p className="text-xs text-[#718096] leading-relaxed">
            Las claves de API y modelos de procesamiento nunca se exponen al navegador de los usuarios finales, garantizando máxima seguridad corporativa.
          </p>
        </div>
      </div>

      {/* Tarjeta de crédito institucional */}
      <div className="bg-gradient-to-r from-[#0A2540] to-[#143d66] text-white rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#00D4B2] font-semibold">
            Marco Académico e Institucional
          </p>
          <p className="text-base font-bold mt-1 font-['Montserrat']">
            IMPULSA · Professional Certificate en IA para la Gestión de Proyectos
          </p>
          <p className="text-xs text-white/80 mt-0.5">
            Continental Florida University · Guía PMBOK 8 (Project Management Institute, 2025)
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#00D4B2] text-[#0A2540] text-xs font-bold rounded-lg hover:bg-[#00D4B2]/90 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Ir al Tablero Ejecutivo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
