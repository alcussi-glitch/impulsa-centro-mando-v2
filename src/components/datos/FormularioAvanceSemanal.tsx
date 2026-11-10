/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  Percent,
} from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { AvanceSemanalItem } from '../../types/projectData.ts';

interface FormularioAvanceSemanalProps {
  cutoffWeek: number;
  onSuccess?: () => void;
}

export const FormularioAvanceSemanal: React.FC<FormularioAvanceSemanalProps> = ({
  cutoffWeek,
  onSuccess,
}) => {
  const { projectData, saveProjectData, isSavingToFirestore, user } = useProjectData();

  const actividades = projectData?.actividades || [];
  const moneda = projectData?.proyecto?.moneda || 'PEN';

  const [semana, setSemana] = useState<number>(cutoffWeek || 6);
  const [codigoActividad, setCodigoActividad] = useState<string>(actividades[0]?.codigo || '');
  const [pctCompletado, setPctCompletado] = useState<string>('50');
  const [costoRealSemana, setCostoRealSemana] = useState<string>('25000');
  const [comentario, setComentario] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sincronizar semana o actividad por defecto cuando cargan los datos
  useEffect(() => {
    if (cutoffWeek) {
      setSemana(cutoffWeek);
    }
  }, [cutoffWeek]);

  useEffect(() => {
    if (actividades.length > 0 && !actividades.some((a) => a.codigo === codigoActividad)) {
      setCodigoActividad(actividades[0].codigo);
    }
  }, [actividades]);

  // Si ya existe un registro para esta semana y actividad, precargar sus valores para edición rápida
  useEffect(() => {
    if (!projectData?.avance_semanal || !codigoActividad) return;
    const existing = projectData.avance_semanal.find(
      (a) => a.semana === Number(semana) && a.codigo === codigoActividad
    );
    if (existing) {
      setPctCompletado(String(Math.round(existing.pct_completado_acum * 100)));
      setCostoRealSemana(String(existing.costo_real_semana));
      setComentario(existing.comentario || '');
    }
  }, [semana, codigoActividad, projectData?.avance_semanal]);

  const selectedActividad = actividades.find((a) => a.codigo === codigoActividad);

  // Obtener el avance previo registrado más reciente para esta actividad
  const prevAvance = projectData?.avance_semanal
    ?.filter((a) => a.codigo === codigoActividad && a.semana < Number(semana))
    ?.sort((a, b) => b.semana - a.semana)?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!projectData) {
      setErrorMsg('No hay ningún proyecto activo cargado.');
      return;
    }

    if (!codigoActividad) {
      setErrorMsg('Selecciona una actividad de la estructura del proyecto.');
      return;
    }

    const numPct = parseFloat(pctCompletado);
    if (isNaN(numPct) || numPct < 0 || numPct > 100) {
      setErrorMsg('El porcentaje de avance debe encontrarse entre 0% y 100%.');
      return;
    }

    const numCosto = parseFloat(costoRealSemana);
    if (isNaN(numCosto) || numCosto < 0) {
      setErrorMsg('El costo real de la semana debe ser un número mayor o igual a 0.');
      return;
    }

    // Validación de integridad PMBOK: El avance acumulado no puede decrecer respecto a la semana previa
    if (prevAvance && numPct < prevAvance.pct_completado_acum * 100) {
      setErrorMsg(
        `Regla PMBOK de Integridad: El % acumulado (${numPct}%) no puede ser inferior al avance registrado en la Semana ${prevAvance.semana} (${Math.round(prevAvance.pct_completado_acum * 100)}%).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const currentList = [...(projectData.avance_semanal || [])];
      const existingIdx = currentList.findIndex(
        (a) => a.semana === Number(semana) && a.codigo === codigoActividad
      );

      const newEntry: AvanceSemanalItem = {
        semana: Number(semana),
        codigo: codigoActividad,
        pct_completado_acum: numPct / 100,
        costo_real_semana: numCosto,
        comentario: comentario.trim() || undefined,
      };

      if (existingIdx >= 0) {
        currentList[existingIdx] = newEntry;
      } else {
        currentList.push(newEntry);
      }

      currentList.sort((a, b) => a.semana - b.semana || a.codigo.localeCompare(b.codigo));

      const updatedDataset = {
        ...projectData,
        avance_semanal: currentList,
      };

      await saveProjectData(updatedDataset, {
        tipo: 'registro_avance',
        hoja: 'Avance_Semanal',
        descripcion: `Avance Sem. ${semana} - Act. ${codigoActividad}: ${numPct}% (${moneda} ${numCosto.toLocaleString()})${comentario ? ` · ${comentario}` : ''}`,
      });

      setSuccessMsg(
        `¡Avance registrado con éxito para la Semana ${semana}! Actividad ${codigoActividad} actualizada al ${numPct}%.`
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Ocurrió un error al guardar el avance: ${err?.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00D4B2]/15 border border-[#00D4B2]/40 flex items-center justify-center text-[#0A2540]">
            <TrendingUp className="w-4 h-4 text-[#0A2540]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#0A2540] font-['Montserrat']">
              Registrar avance semanal
            </h2>
            <p className="text-xs text-[#718096]">
              Captura el progreso real de las actividades para el cálculo de Valor Ganado (EVM)
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#0A2540]/5 text-[#0A2540] border border-[#0A2540]/10 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-[#00D4B2]" />
          <span>Corte activo: Semana {cutoffWeek}</span>
        </span>
      </div>

      {/* Banner de error o éxito */}
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Semana de avance */}
          <div>
            <label htmlFor="avance-semana" className="block text-xs font-bold text-[#0A2540] mb-1.5 font-['Montserrat']">
              Semana de avance:
            </label>
            <select
              id="avance-semana"
              value={semana}
              onChange={(e) => setSemana(Number(e.target.value))}
              className="w-full text-xs border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white text-[#0A2540] font-semibold focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
            >
              {Array.from({ length: projectData?.proyecto?.duracion_semanas || 12 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  Semana {s} {s === cutoffWeek ? '(Semana de corte actual)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Actividad */}
          <div className="lg:col-span-2">
            <label htmlFor="avance-actividad" className="block text-xs font-bold text-[#0A2540] mb-1.5 font-['Montserrat']">
              Actividad del proyecto:
            </label>
            <select
              id="avance-actividad"
              value={codigoActividad}
              onChange={(e) => setCodigoActividad(e.target.value)}
              className="w-full text-xs border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white text-[#0A2540] font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
            >
              {actividades.length === 0 ? (
                <option value="">(No hay actividades registradas)</option>
              ) : (
                actividades.map((a) => (
                  <option key={a.codigo} value={a.codigo}>
                    [{a.codigo}] {a.actividad} ({a.responsable || 'Sin asignar'}) · BAC: {moneda} {a.BAC?.toLocaleString()}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* % Acumulado */}
          <div>
            <label htmlFor="avance-pct" className="block text-xs font-bold text-[#0A2540] mb-1.5 font-['Montserrat'] flex items-center justify-between">
              <span>% Acumulado:</span>
              <span className="text-[10px] text-[#718096] font-normal">Escala 0–100%</span>
            </label>
            <div className="relative">
              <input
                id="avance-pct"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                value={pctCompletado}
                onChange={(e) => setPctCompletado(e.target.value)}
                placeholder="75"
                className="w-full text-xs border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 font-mono text-[#0A2540] font-bold focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Fila 2: Costo real y Comentario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Costo real de la semana */}
          <div>
            <label htmlFor="avance-costo" className="block text-xs font-bold text-[#0A2540] mb-1.5 font-['Montserrat'] flex items-center justify-between">
              <span>Costo real de la semana (AC):</span>
              <span className="text-[10px] text-[#718096] font-mono">{moneda}</span>
            </label>
            <div className="relative">
              <input
                id="avance-costo"
                type="number"
                min="0"
                step="100"
                required
                value={costoRealSemana}
                onChange={(e) => setCostoRealSemana(e.target.value)}
                placeholder="25000"
                className="w-full text-xs border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 font-mono text-[#0A2540] font-bold focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                {moneda}
              </span>
            </div>
            {prevAvance && (
              <p className="text-[10px] text-slate-500 mt-1">
                Semana anterior ({prevAvance.semana}): {Math.round(prevAvance.pct_completado_acum * 100)}% (Costo: {moneda} {prevAvance.costo_real_semana?.toLocaleString()})
              </p>
            )}
          </div>

          {/* Comentario / Justificación */}
          <div className="md:col-span-2">
            <label htmlFor="avance-comentario" className="block text-xs font-bold text-[#0A2540] mb-1.5 font-['Montserrat']">
              Comentario u observación ejecutiva (Opcional):
            </label>
            <input
              id="avance-comentario"
              type="text"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej.: Pruebas de integración aprobadas, ligero sobrecosto por horas extra de desarrollo."
              className="w-full text-xs border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
            />
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
          <div className="text-[11px] text-[#718096] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#00D4B2]" />
            <span>
              {user ? 'Se guardará en Cloud Firestore y actualizará EVM en tiempo real.' : 'Se guardará en almacenamiento local (Modo local).'}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isSavingToFirestore || actividades.length === 0}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#00D4B2] disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#00D4B2]" />
            <span>{isSubmitting ? 'Guardando avance...' : 'Guardar avance semanal'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
