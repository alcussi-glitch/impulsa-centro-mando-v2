/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProyectoInfo } from '../../types/projectData.ts';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ProyectoFormModalProps {
  isOpen: boolean;
  initialValues?: Partial<ProyectoInfo>;
  onClose: () => void;
  onSubmit: (values: ProyectoInfo) => void;
}

export const ProyectoFormModal: React.FC<ProyectoFormModalProps> = ({
  isOpen,
  initialValues,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [nombre, setNombre] = useState(initialValues?.nombre || 'IMPULSA — Sistema de información con IA');
  const [moneda, setMoneda] = useState(initialValues?.moneda || 'PEN');
  const [presupuestoAutorizado, setPresupuestoAutorizado] = useState(initialValues?.presupuesto_autorizado || 850000);
  const [bac, setBac] = useState(initialValues?.BAC || 770000);
  const [reservaContingencia, setReservaContingencia] = useState(initialValues?.reserva_contingencia || 80000);
  const [duracionSemanas, setDuracionSemanas] = useState(initialValues?.duracion_semanas || 12);
  const [semanaCorte, setSemanaCorte] = useState(initialValues?.semana_corte || 6);
  const [umbralAlertaCpi, setUmbralAlertaCpi] = useState(initialValues?.umbral_alerta_cpi || 0.95);
  const [umbralCriticoCpi, setUmbralCriticoCpi] = useState(initialValues?.umbral_critico_cpi || 0.9);
  const [umbralAlertaSpi, setUmbralAlertaSpi] = useState(initialValues?.umbral_alerta_spi || 0.95);
  const [umbralCriticoSpi, setUmbralCriticoSpi] = useState(initialValues?.umbral_critico_spi || 0.9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nombre: nombre.trim(),
      moneda: moneda.trim(),
      presupuesto_autorizado: Number(presupuestoAutorizado),
      BAC: Number(bac),
      reserva_contingencia: Number(reservaContingencia),
      duracion_semanas: Number(duracionSemanas),
      semana_corte: Number(semanaCorte),
      umbral_alerta_cpi: Number(umbralAlertaCpi),
      umbral_critico_cpi: Number(umbralCriticoCpi),
      umbral_alerta_spi: Number(umbralAlertaSpi),
      umbral_critico_spi: Number(umbralCriticoSpi),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-proyecto-titulo"
    >
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 text-[#2D3748]">
        {/* Encabezado */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Hoja «Proyecto» no encontrada
              </span>
            </div>
            <h2 id="modal-proyecto-titulo" className="text-xl font-bold text-[#0A2540] font-['Montserrat']">
              Captura de parámetros base del proyecto
            </h2>
            <p className="text-xs text-[#718096] mt-1">
              Tu archivo no incluye la hoja «Proyecto (campo │ valor)». Por favor, ingresa los parámetros requeridos por el estándar PMBOK 8 para continuar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#0A2540] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
            aria-label="Cerrar ventana de captura"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5">
          <div>
            <label className="block text-xs font-bold text-[#0A2540] mb-1">
              Nombre del proyecto *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              placeholder="Ej: IMPULSA — Sistema de información con IA"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                Moneda *
              </label>
              <input
                type="text"
                required
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
                placeholder="PEN, USD, MXN"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                Presupuesto autorizado *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={presupuestoAutorizado}
                onChange={(e) => setPresupuestoAutorizado(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                BAC (Línea base costo) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={bac}
                onChange={(e) => setBac(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                Reserva de contingencia *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={reservaContingencia}
                onChange={(e) => setReservaContingencia(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                Duración en semanas *
              </label>
              <input
                type="number"
                required
                min="1"
                max="52"
                value={duracionSemanas}
                onChange={(e) => setDuracionSemanas(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                Semana de corte *
              </label>
              <input
                type="number"
                required
                min="1"
                max={duracionSemanas}
                value={semanaCorte}
                onChange={(e) => setSemanaCorte(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              />
            </div>
          </div>

          {/* Umbrales EVM */}
          <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
            <p className="text-xs font-bold text-[#0A2540] uppercase tracking-wider font-['Montserrat']">
              Umbrales de semáforo EVM (CPI y SPI)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">CPI Alerta</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={umbralAlertaCpi}
                  onChange={(e) => setUmbralAlertaCpi(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">CPI Crítico</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={umbralCriticoCpi}
                  onChange={(e) => setUmbralCriticoCpi(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">SPI Alerta</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={umbralAlertaSpi}
                  onChange={(e) => setUmbralAlertaSpi(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">SPI Crítico</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={umbralCriticoSpi}
                  onChange={(e) => setUmbralCriticoSpi(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#2D3748] bg-white border border-[#E2E8F0] hover:bg-[#F7FAFC] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0A2540] hover:bg-[#0A2540]/90 rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00D4B2]" />
              <span>Guardar parámetros del proyecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
