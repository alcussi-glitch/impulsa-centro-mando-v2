/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Table,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import { ProjectDataset } from '../../types/projectData.ts';

// Configuración de metadatos de las hojas editables
interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  isPercent?: boolean;
  description?: string;
}

interface SheetConfig {
  id: string;
  datasetKey: keyof ProjectDataset;
  label: string;
  primaryKey: string;
  columns: ColumnConfig[];
}

const SHEETS_CONFIG: SheetConfig[] = [
  {
    id: 'actividades',
    datasetKey: 'actividades',
    label: 'Actividades',
    primaryKey: 'codigo',
    columns: [
      { key: 'codigo', label: 'Código', type: 'text', required: true, description: 'Ej.: 1.1, 1.2' },
      { key: 'actividad', label: 'Nombre de la Actividad', type: 'text', required: true },
      { key: 'cuenta_control', label: 'Cuenta de Control', type: 'text', required: true, description: 'Ej.: CC-01' },
      { key: 'responsable', label: 'Responsable', type: 'text', required: true },
      { key: 'sem_inicio_plan', label: 'Sem. Inicio', type: 'number', min: 1, max: 12, required: true },
      { key: 'sem_fin_plan', label: 'Sem. Fin', type: 'number', min: 1, max: 12, required: true },
      { key: 'BAC', label: 'Presupuesto Base (BAC)', type: 'number', min: 0, required: true },
    ],
  },
  {
    id: 'lineaBase_pv',
    datasetKey: 'lineaBase_pv',
    label: 'Línea Base PV (S1 a S12)',
    primaryKey: 'codigo',
    columns: [
      { key: 'codigo', label: 'Código Actividad', type: 'text', required: true, description: 'Ej.: 1.1, ACT-01' },
      { key: 'S1', label: 'Sem. 1', type: 'number', min: 0, required: true },
      { key: 'S2', label: 'Sem. 2', type: 'number', min: 0, required: true },
      { key: 'S3', label: 'Sem. 3', type: 'number', min: 0, required: true },
      { key: 'S4', label: 'Sem. 4', type: 'number', min: 0, required: true },
      { key: 'S5', label: 'Sem. 5', type: 'number', min: 0, required: true },
      { key: 'S6', label: 'Sem. 6', type: 'number', min: 0, required: true },
      { key: 'S7', label: 'Sem. 7', type: 'number', min: 0, required: true },
      { key: 'S8', label: 'Sem. 8', type: 'number', min: 0, required: true },
      { key: 'S9', label: 'Sem. 9', type: 'number', min: 0, required: true },
      { key: 'S10', label: 'Sem. 10', type: 'number', min: 0, required: true },
      { key: 'S11', label: 'Sem. 11', type: 'number', min: 0, required: true },
      { key: 'S12', label: 'Sem. 12', type: 'number', min: 0, required: true },
      { key: 'total_pv', label: 'Total PV', type: 'number', min: 0 },
    ],
  },
  {
    id: 'avance_semanal',
    datasetKey: 'avance_semanal',
    label: 'Avance Semanal',
    primaryKey: 'codigo',
    columns: [
      { key: 'semana', label: 'Semana', type: 'number', min: 1, max: 12, required: true },
      { key: 'codigo', label: 'Código Actividad', type: 'text', required: true },
      { key: 'pct_completado_acum', label: '% Acumulado (0-1)', type: 'number', min: 0, max: 1, step: 0.01, isPercent: true, required: true },
      { key: 'costo_real_semana', label: 'Costo Real Semana (AC)', type: 'number', min: 0, required: true },
    ],
  },
  {
    id: 'riesgos',
    datasetKey: 'riesgos',
    label: 'Riesgos',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID Riesgo', type: 'text', required: true, description: 'Ej.: RSK-01' },
      { key: 'riesgo', label: 'Descripción del Riesgo', type: 'text', required: true },
      {
        key: 'categoria',
        label: 'Categoría',
        type: 'select',
        options: ['Técnico / Algoritmos e IA', 'Técnico / Integración', 'Gobernanza / Legal', 'Infraestructura Cloud', 'Operativo', 'Económico'],
        required: true,
      },
      { key: 'probabilidad_1a5', label: 'Probabilidad (1-5)', type: 'number', min: 1, max: 5, required: true },
      { key: 'impacto_1a5', label: 'Impacto (1-5)', type: 'number', min: 1, max: 5, required: true },
      {
        key: 'estrategia',
        label: 'Estrategia',
        type: 'select',
        options: ['Mitigar', 'Evitar', 'Transferir', 'Aceptar', 'Escalar'],
        required: true,
      },
      { key: 'respuesta_planificada', label: 'Respuesta Planificada', type: 'text', required: true },
      { key: 'propietario', label: 'Propietario', type: 'text', required: true },
    ],
  },
  {
    id: 'objetivos',
    datasetKey: 'objetivos',
    label: 'Objetivos',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'objetivo', label: 'Objetivo', type: 'text', required: true },
      { key: 'indicador', label: 'Indicador de Éxito', type: 'text', required: true },
      { key: 'meta', label: 'Meta', type: 'text', required: true },
    ],
  },
  {
    id: 'edt',
    datasetKey: 'edt',
    label: 'EDT / WBS',
    primaryKey: 'codigo',
    columns: [
      { key: 'codigo', label: 'Código EDT', type: 'text', required: true },
      { key: 'nombre', label: 'Nombre Entregable/Paquete', type: 'text', required: true },
      { key: 'nivel', label: 'Nivel Jerárquico', type: 'number', min: 1, max: 4, required: true },
    ],
  },
  {
    id: 'hitos',
    datasetKey: 'hitos',
    label: 'Hitos',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID Hito', type: 'text', required: true },
      { key: 'hito', label: 'Descripción del Hito', type: 'text', required: true },
      { key: 'semana_plan', label: 'Semana Planificada', type: 'number', min: 1, max: 12, required: true },
    ],
  },
  {
    id: 'supuestos',
    datasetKey: 'supuestos',
    label: 'Supuestos',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo', type: 'select', options: ['Técnico', 'Organizacional', 'Legal', 'Económico'], required: true },
      { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
    ],
  },
  {
    id: 'interesados',
    datasetKey: 'interesados',
    label: 'Interesados',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'interesado', label: 'Interesado / Organización', type: 'text', required: true },
      { key: 'rol', label: 'Rol en Proyecto', type: 'text', required: true },
      { key: 'poder_1a5', label: 'Poder (1-5)', type: 'number', min: 1, max: 5, required: true },
      { key: 'interes_1a5', label: 'Interés (1-5)', type: 'number', min: 1, max: 5, required: true },
    ],
  },
  {
    id: 'requisitos',
    datasetKey: 'requisitos',
    label: 'Requisitos',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo', type: 'select', options: ['Funcional', 'No Funcional', 'Seguridad', 'Calidad', 'Transición'], required: true },
      { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
      { key: 'criterio_aceptacion', label: 'Criterio de Aceptación', type: 'text', required: true },
    ],
  },
  {
    id: 'entregables',
    datasetKey: 'entregables',
    label: 'Entregables',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'entregable', label: 'Entregable', type: 'text', required: true },
      { key: 'incluido', label: 'Incluido en Alcance', type: 'boolean', required: true },
    ],
  },
  {
    id: 'recursos',
    datasetKey: 'recursos',
    label: 'Recursos',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID Recurso', type: 'text', required: true },
      { key: 'recurso', label: 'Nombre Recurso / Rol', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo', type: 'select', options: ['Personal', 'Material/Tecnología', 'Servicio', 'Infraestructura'], required: true },
    ],
  },
  {
    id: 'costos',
    datasetKey: 'costos',
    label: 'Costos',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'cuenta_control', label: 'Cuenta Control', type: 'text', required: true },
      { key: 'concepto', label: 'Concepto', type: 'text', required: true },
      { key: 'monto', label: 'Monto Planificado', type: 'number', min: 0, required: true },
    ],
  },
  {
    id: 'incidentes',
    datasetKey: 'incidentes',
    label: 'Incidentes',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID Incidente', type: 'text', required: true },
      { key: 'fecha', label: 'Fecha (AAAA-MM-DD)', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
      { key: 'responsable', label: 'Responsable', type: 'text', required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Abierto', 'En Curso', 'Cerrado'], required: true },
    ],
  },
  {
    id: 'cambios',
    datasetKey: 'cambios',
    label: 'Control de Cambios',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID Cambio', type: 'text', required: true },
      { key: 'fecha', label: 'Fecha (AAAA-MM-DD)', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripción del Cambio', type: 'text', required: true },
      { key: 'solicitante', label: 'Solicitante', type: 'text', required: true },
      { key: 'decision', label: 'Decisión', type: 'select', options: ['Aprobado', 'Rechazado', 'En Evaluación'], required: true },
    ],
  },
  {
    id: 'lecciones',
    datasetKey: 'lecciones',
    label: 'Lecciones Aprendidas',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'fecha', label: 'Fecha (AAAA-MM-DD)', type: 'text', required: true },
      { key: 'situacion', label: 'Situación Observada', type: 'text', required: true },
      { key: 'leccion', label: 'Lección y Recomendación', type: 'text', required: true },
    ],
  },
];

export const TablaEditableHoja: React.FC = () => {
  const { projectData, saveProjectData, isSavingToFirestore, user } = useProjectData();

  const [selectedSheetId, setSelectedSheetId] = useState<string>('actividades');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [rowToDelete, setRowToDelete] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const activeSheetConfig = useMemo(() => {
    return SHEETS_CONFIG.find((s) => s.id === selectedSheetId) || SHEETS_CONFIG[0];
  }, [selectedSheetId]);

  // Lista de datos de la hoja activa
  const rawRows: any[] = useMemo(() => {
    if (!projectData) return [];
    if (activeSheetConfig.datasetKey === 'lineaBase_pv') {
      const list = (projectData.lineaBase_pv && projectData.lineaBase_pv.length > 0)
        ? projectData.lineaBase_pv
        : ((projectData as any).lineabase_pv || []);
      return Array.isArray(list) ? list : [];
    }
    const list = projectData[activeSheetConfig.datasetKey] as any[];
    return Array.isArray(list) ? list : [];
  }, [projectData, activeSheetConfig]);

  // Filtrado por buscador
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rawRows;
    const term = searchTerm.toLowerCase();
    return rawRows.filter((r) =>
      Object.values(r).some((val) => String(val || '').toLowerCase().includes(term))
    );
  }, [rawRows, searchTerm]);

  // Abrir modal de creación
  const handleOpenAdd = () => {
    setValidationError(null);
    const initial: Record<string, any> = {};
    activeSheetConfig.columns.forEach((col) => {
      if (col.type === 'number') {
        initial[col.key] = col.min ?? 0;
      } else if (col.type === 'boolean') {
        initial[col.key] = true;
      } else if (col.type === 'select') {
        initial[col.key] = col.options?.[0] || '';
      } else {
        initial[col.key] = '';
      }
    });
    setFormValues(initial);
    setIsAddingNew(true);
    setEditingRow(null);
  };

  // Abrir modal de edición
  const handleOpenEdit = (row: any) => {
    setValidationError(null);
    setFormValues({ ...row });
    setEditingRow(row);
    setIsAddingNew(false);
  };

  // Guardar fila (Agregar o Editar)
  const handleSaveRow = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!projectData) return;

    // 1. Validaciones por columna
    for (const col of activeSheetConfig.columns) {
      const val = formValues[col.key];
      if (col.required && (val === undefined || val === null || val === '')) {
        setValidationError(`El campo "${col.label}" es obligatorio.`);
        return;
      }
      if (col.type === 'number') {
        const num = Number(val);
        if (isNaN(num)) {
          setValidationError(`El campo "${col.label}" debe ser un valor numérico.`);
          return;
        }
        if (col.min !== undefined && num < col.min) {
          setValidationError(`El campo "${col.label}" no puede ser menor a ${col.min}.`);
          return;
        }
        if (col.max !== undefined && num > col.max) {
          setValidationError(`El campo "${col.label}" no puede ser mayor a ${col.max}.`);
          return;
        }
      }
    }

    // 2. Validación de llave primaria en creación
    const pk = activeSheetConfig.primaryKey;
    const primaryVal = formValues[pk];
    if (isAddingNew) {
      const duplicate = rawRows.some(
        (r) => String(r[pk]).toLowerCase() === String(primaryVal).toLowerCase()
      );
      if (duplicate && pk !== 'codigo') {
        setValidationError(`Ya existe un registro con el identificador "${primaryVal}".`);
        return;
      }
    }

    // 3. Validación especial de cálculo de severidad para riesgos
    if (activeSheetConfig.id === 'riesgos') {
      const prob = Number(formValues.probabilidad_1a5) || 1;
      const imp = Number(formValues.impacto_1a5) || 1;
      formValues.severidad = prob * imp;
    }

    // 3.1 Especial: Línea Base PV, asegurar números en S1..S12 y total_pv
    if (activeSheetConfig.id === 'lineaBase_pv') {
      let sumS = 0;
      for (let s = 1; s <= 12; s++) {
        const key = `S${s}`;
        const num = Number(formValues[key]) || 0;
        formValues[key] = num;
        sumS += num;
      }
      formValues.total_pv = sumS;
    }

    // 4. Actualizar dataset
    const updatedList = [...rawRows];
    if (isAddingNew) {
      updatedList.push({ ...formValues });
    } else {
      const index = updatedList.findIndex((r) => {
        if (r === editingRow) return true;
        if (activeSheetConfig.id === 'avance_semanal') {
          return r.codigo === editingRow?.codigo && Number(r.semana) === Number(editingRow?.semana);
        }
        return r[pk] === editingRow?.[pk];
      });
      if (index >= 0) {
        updatedList[index] = { ...formValues };
      } else {
        updatedList.push({ ...formValues });
      }
    }

    const newDataset: ProjectDataset = {
      ...projectData,
      [activeSheetConfig.datasetKey]: updatedList,
    };
    if (activeSheetConfig.datasetKey === 'lineaBase_pv') {
      (newDataset as any).lineabase_pv = updatedList;
    }

    try {
      await saveProjectData(newDataset, {
        tipo: 'edicion_hoja',
        hoja: activeSheetConfig.label,
        descripcion: `${isAddingNew ? 'Agregado registro' : 'Modificado registro'} en ${activeSheetConfig.label}: [${primaryVal}]`,
      });

      setActionSuccessMsg(
        `Registro ${isAddingNew ? 'agregado' : 'modificado'} correctamente en la hoja ${activeSheetConfig.label}.`
      );
      setIsAddingNew(false);
      setEditingRow(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setValidationError(`Error al guardar: ${err?.message || 'Error desconocido'}`);
    }
  };

  // Confirmar eliminación de fila
  const handleConfirmDelete = async () => {
    if (!projectData || !rowToDelete) return;
    const pk = activeSheetConfig.primaryKey;
    const primaryVal = rowToDelete[pk];

    const updatedList = rawRows.filter((r) => r !== rowToDelete);
    const newDataset: ProjectDataset = {
      ...projectData,
      [activeSheetConfig.datasetKey]: updatedList,
    };
    if (activeSheetConfig.datasetKey === 'lineaBase_pv') {
      (newDataset as any).lineabase_pv = updatedList;
    }

    try {
      await saveProjectData(newDataset, {
        tipo: 'edicion_hoja',
        hoja: activeSheetConfig.label,
        descripcion: `Eliminado registro [${primaryVal}] de la hoja ${activeSheetConfig.label}`,
      });

      setActionSuccessMsg(`Registro [${primaryVal}] eliminado de la hoja ${activeSheetConfig.label}.`);
      setRowToDelete(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setActionSuccessMsg('Ocurrió un error al intentar eliminar el registro.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      {/* Cabecera y selectores */}
      <div className="p-5 border-b border-[#E2E8F0] bg-[#F7FAFC]/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D4B2]">
                Gestión Directa · PMBOK 8
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-[#718096]">
                {rawRows.length} {rawRows.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#0A2540] font-['Montserrat']">
              Tabla de datos: {activeSheetConfig.label}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Selector de hoja */}
            <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4 text-[#00D4B2] shrink-0" />
              <label htmlFor="select-hoja" className="text-xs font-semibold text-[#0A2540]">
                Hoja:
              </label>
              <select
                id="select-hoja"
                value={selectedSheetId}
                onChange={(e) => {
                  setSelectedSheetId(e.target.value);
                  setSearchTerm('');
                  setValidationError(null);
                }}
                className="bg-transparent text-xs font-bold text-[#0A2540] focus:outline-none cursor-pointer pr-1"
              >
                {SHEETS_CONFIG.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.label} ({(projectData?.[sheet.datasetKey] as any[])?.length || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar fila..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2] w-36 sm:w-44"
              />
            </div>

            {/* Botón Agregar Fila */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0A2540] hover:bg-[#0A2540]/90 rounded-lg transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
            >
              <Plus className="w-4 h-4 text-[#00D4B2]" />
              <span>Agregar fila</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner de éxito */}
      {actionSuccessMsg && (
        <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabla con scroll horizontal */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F7FAFC] border-b border-[#E2E8F0] text-[#0A2540] font-['Montserrat'] shadow-2xs">
            <tr>
              <th className="py-2.5 px-3 font-bold text-center w-12">#</th>
              {activeSheetConfig.columns.map((col) => (
                <th key={col.key} className="py-2.5 px-3 font-bold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="py-2.5 px-3 font-bold text-center w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={activeSheetConfig.columns.length + 2}
                  className="py-12 text-center text-slate-500 text-xs"
                >
                  <p className="font-semibold text-slate-700 mb-1">
                    {searchTerm ? 'No se encontraron filas que coincidan con la búsqueda.' : `No hay registros en la hoja ${activeSheetConfig.label}.`}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="mt-2 text-xs text-[#0A2540] font-bold underline hover:text-[#00D4B2]"
                  >
                    Haz clic aquí para agregar la primera fila
                  </button>
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr
                  key={row.id || row.codigo || idx}
                  className="hover:bg-[#F7FAFC] transition-colors group"
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  {activeSheetConfig.columns.map((col) => {
                    const rawVal = row[col.key];
                    let displayVal = rawVal;

                    if (col.isPercent && typeof rawVal === 'number') {
                      displayVal = `${Math.round(rawVal * 100)}%`;
                    } else if (col.type === 'number' && typeof rawVal === 'number') {
                      displayVal = rawVal.toLocaleString('es-PE');
                    } else if (col.type === 'boolean') {
                      displayVal = rawVal ? 'Sí' : 'No';
                    } else if (displayVal === undefined || displayVal === null || displayVal === '') {
                      displayVal = '—';
                    }

                    return (
                      <td
                        key={col.key}
                        className={`py-2.5 px-3 text-[#2D3748] whitespace-nowrap max-w-[280px] truncate ${
                          col.type === 'number' ? 'font-mono' : ''
                        }`}
                        title={String(rawVal ?? '')}
                      >
                        {col.key === activeSheetConfig.primaryKey ? (
                          <span className="font-bold text-[#0A2540]">{String(displayVal)}</span>
                        ) : col.key === 'severidad' ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              Number(rawVal) >= 15
                                ? 'bg-rose-100 text-rose-800'
                                : Number(rawVal) >= 8
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {String(displayVal)}
                          </span>
                        ) : (
                          String(displayVal)
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="p-1 text-slate-500 hover:text-[#0A2540] hover:bg-slate-100 rounded transition-colors"
                        title="Editar fila"
                        aria-label="Editar fila"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRowToDelete(row)}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Eliminar fila"
                        aria-label="Eliminar fila"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Agregar / Editar Fila */}
      {(isAddingNew || editingRow) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 text-[#2D3748] my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#00D4B2]" />
                <h4 className="text-sm font-bold text-[#0A2540] font-['Montserrat']">
                  {isAddingNew ? 'Agregar fila a' : 'Editar fila en'} {activeSheetConfig.label}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingRow(null);
                }}
                className="p-1 text-slate-400 hover:text-[#0A2540] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {validationError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRow} className="space-y-3.5 pt-4 text-xs">
              <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                {activeSheetConfig.columns.map((col) => {
                  return (
                    <div key={col.key}>
                      <label className="block font-bold text-[#0A2540] mb-1 font-['Montserrat'] flex items-center justify-between">
                        <span>
                          {col.label} {col.required && <span className="text-rose-500">*</span>}
                        </span>
                        {col.description && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            {col.description}
                          </span>
                        )}
                      </label>

                      {col.type === 'select' ? (
                        <select
                          value={formValues[col.key] || ''}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [col.key]: e.target.value })
                          }
                          className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white text-xs text-[#0A2540] focus:ring-2 focus:ring-[#00D4B2]"
                        >
                          {col.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : col.type === 'boolean' ? (
                        <div className="flex items-center gap-4 py-1">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={col.key}
                              checked={formValues[col.key] === true}
                              onChange={() => setFormValues({ ...formValues, [col.key]: true })}
                              className="text-[#0A2540] focus:ring-[#00D4B2]"
                            />
                            <span>Sí (Incluido)</span>
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={col.key}
                              checked={formValues[col.key] === false}
                              onChange={() => setFormValues({ ...formValues, [col.key]: false })}
                              className="text-[#0A2540] focus:ring-[#00D4B2]"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      ) : (
                        <input
                          type={col.type === 'number' ? 'number' : 'text'}
                          min={col.min}
                          max={col.max}
                          step={col.step || (col.type === 'number' ? 'any' : undefined)}
                          required={col.required}
                          value={formValues[col.key] ?? ''}
                          onChange={(e) =>
                            setFormValues({
                              ...formValues,
                              [col.key]:
                                col.type === 'number'
                                  ? e.target.value === ''
                                    ? ''
                                    : Number(e.target.value)
                                  : e.target.value,
                            })
                          }
                          className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#2D3748] focus:ring-2 focus:ring-[#00D4B2]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingRow(null);
                  }}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingToFirestore}
                  className="px-5 py-2 bg-[#0A2540] text-white font-bold rounded-lg hover:bg-[#0A2540]/90 transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5 text-[#00D4B2]" />
                  <span>{isAddingNew ? 'Agregar registro' : 'Guardar cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {rowToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 text-[#2D3748] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-center text-[#0A2540] font-['Montserrat'] mb-2">
              ¿Eliminar registro de {activeSheetConfig.label}?
            </h4>

            <p className="text-xs text-slate-600 text-center leading-relaxed mb-4">
              Estás a punto de eliminar el registro identificado como{' '}
              <strong className="text-[#0A2540] font-mono">
                {String(rowToDelete[activeSheetConfig.primaryKey] || 'registro')}
              </strong>
              . Esta acción actualizará los tableros de control y quedará registrada en el historial de auditoría.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingToFirestore}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
