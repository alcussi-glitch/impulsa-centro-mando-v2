/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { ProjectDataset, HistoryEntry, UserProjectSummary } from '../types/projectData.ts';

// Guardar proyecto completo en Firestore con la jerarquía: proyectos/{projectId}/{subcollection}/{docId}
export async function saveProjectToFirestore(
  dataset: ProjectDataset,
  user: User,
  sharedWithEmail: string = ''
): Promise<string> {
  const projectId = dataset.proyecto?.id || `proj_${user.uid.substring(0, 6)}_${Date.now()}`;
  const projectRef = doc(db, 'proyectos', projectId);

  // 1. Guardar primero el documento raíz del proyecto de forma directa
  // Esto garantiza que el documento exista en Firestore antes de escribir subcolecciones
  const projectRootData = {
    ...dataset.proyecto,
    id: projectId,
    ownerId: user.uid,
    ownerEmail: user.email || '',
    sharedWithEmail: (sharedWithEmail || dataset.proyecto.sharedWithEmail || '').trim().toLowerCase(),
    updatedAt: new Date().toISOString(),
    metadataCarga: dataset.metadataCarga || {
      fechaCarga: new Date().toISOString(),
      nombreArchivo: 'Proyecto_IMPULSA.xlsx',
      esDatosEjemplo: false,
    },
  };

  try {
    await setDoc(projectRef, projectRootData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `proyectos/${projectId}`);
  }

  // 2. Preparar todas las operaciones de subcolección incluyendo ownerId explícito
  try {
    const subcollectionsMap: Record<string, any[]> = {
      actividades: dataset.actividades || [],
      avance_semanal: dataset.avance_semanal || [],
      riesgos: dataset.riesgos || [],
      objetivos: dataset.objetivos || [],
      supuestos: dataset.supuestos || [],
      interesados: dataset.interesados || [],
      requisitos: dataset.requisitos || [],
      entregables: dataset.entregables || [],
      edt: dataset.edt || [],
      hitos: dataset.hitos || [],
      lineabase_pv: dataset.lineaBase_pv || [],
      recursos: dataset.recursos || [],
      raci: dataset.raci || [],
      costos: dataset.costos || [],
      riesgos_historial: dataset.riesgos_historial || [],
      respuestas_riesgo: dataset.respuestas_riesgo || [],
      contingencia: dataset.contingencia || [],
      plan_comunicaciones: dataset.plan_comunicaciones || [],
      comunicaciones: dataset.comunicaciones || [],
      adquisiciones: dataset.adquisiciones || [],
      calidad: dataset.calidad || [],
      incidentes: dataset.incidentes || [],
      cambios: dataset.cambios || [],
      lecciones: dataset.lecciones || [],
      automatizaciones: dataset.automatizaciones || [],
      plantillas: dataset.catalogo_plantillas || [],
    };

    interface PendingOp {
      ref: any;
      data: any;
    }
    const operations: PendingOp[] = [];

    // Subcolección: cargas (historial de cargas)
    const cargaId = `carga_${Date.now()}`;
    const totalFilas = Object.values(dataset).reduce(
      (acc: number, curr: any) => (Array.isArray(curr) ? acc + curr.length : acc),
      0
    );
    operations.push({
      ref: doc(db, 'proyectos', projectId, 'cargas', cargaId),
      data: {
        id: cargaId,
        ownerId: user.uid,
        fecha: new Date().toISOString(),
        tipo: 'carga_excel',
        hoja: 'Carga completa .xlsx',
        nombreArchivo: dataset.metadataCarga?.nombreArchivo || 'Sincronización manual',
        tamanoBytes: dataset.metadataCarga?.tamanoBytes || 0,
        checksum: dataset.metadataCarga?.checksum || `sha256-${Date.now()}`,
        usuario: user.email || user.displayName || 'Gestor',
        filasTotales: totalFilas,
        descripcion: `Carga de ${dataset.metadataCarga?.nombreArchivo || 'archivo Excel'} (${totalFilas} registros)`,
        snapshotJson: JSON.stringify(dataset),
      },
    });

    // Subcolecciones por hoja del PMBOK
    for (const [subName, items] of Object.entries(subcollectionsMap)) {
      items.forEach((item, index) => {
        const rawId = item.id || item.codigo || item.codigo_actividad || `item_${index + 1}`;
        const docId = String(rawId).replace(/[/#?.]/g, '_');
        operations.push({
          ref: doc(db, 'proyectos', projectId, subName, docId),
          data: { ...item, id: docId, ownerId: user.uid, orden: index + 1 },
        });
      });
    }

    // Subcolección: alertas automáticas
    const alertaId = 'alerta_desempeno_corte';
    operations.push({
      ref: doc(db, 'proyectos', projectId, 'alertas', alertaId),
      data: {
        id: alertaId,
        ownerId: user.uid,
        tipo: 'EVM',
        severidad: 'Alerta',
        mensaje: `Monitoreo activo para semana de corte ${dataset.proyecto?.semana_corte || 6}`,
        fecha: new Date().toISOString(),
      },
    });

    // Subcolección: bitacora_ia (trazabilidad ética y de IA)
    const logId = `ia_init_${Date.now()}`;
    operations.push({
      ref: doc(db, 'proyectos', projectId, 'bitacora_ia', logId),
      data: {
        id: logId,
        ownerId: user.uid,
        fechaHora: new Date().toISOString(),
        modelo: 'Gemini 2.5 Flash (Backend)',
        tarea: 'Inicialización de estructura PMBOK y validación de reglas en Firestore',
        responsable: user.displayName || user.email || 'Director de Proyecto',
        estado: 'Auditado',
      },
    });

    // Escritura en lotes de máximo 400 operaciones (evita el límite de 500 de Firestore)
    const BATCH_SIZE = 400;
    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
      const chunk = operations.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((op) => batch.set(op.ref, op.data, { merge: true }));
      await batch.commit();
    }

    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `proyectos/${projectId}/subcollections`);
  }
}

// Actualizar el correo del docente autorizado para lectura (Requisito 2)
export async function updateProjectDocenteEmail(
  projectId: string,
  docenteEmail: string
): Promise<void> {
  const projectRef = doc(db, 'proyectos', projectId);
  try {
    await setDoc(
      projectRef,
      {
        sharedWithEmail: docenteEmail.trim().toLowerCase(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `proyectos/${projectId}`);
  }
}

// Actualizar la semana de corte en tiempo real en Firestore
export async function updateProjectCutoffWeek(
  projectId: string,
  cutoffWeek: number
): Promise<void> {
  const projectRef = doc(db, 'proyectos', projectId);
  try {
    await setDoc(
      projectRef,
      {
        semana_corte: cutoffWeek,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `proyectos/${projectId}`);
  }
}

// Suscripción en tiempo real (onSnapshot) al documento del proyecto (Requisito 3)
export function subscribeToProjectDoc(
  projectId: string,
  onUpdate: (projectRootData: any) => void,
  onError: (err: any) => void
): Unsubscribe {
  const path = `proyectos/${projectId}`;
  const projectRef = doc(db, 'proyectos', projectId);

  return onSnapshot(
    projectRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...snapshot.data() });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      onError(error);
    }
  );
}

// Consultar lista de proyectos del usuario autenticado (propios y compartidos con docente)
export async function fetchUserProjectsList(user: User): Promise<UserProjectSummary[]> {
  const path = 'proyectos';
  const projectsMap = new Map<string, UserProjectSummary>();

  try {
    // 1. Proyectos propios donde ownerId == user.uid
    const ownerQuery = query(collection(db, path), where('ownerId', '==', user.uid));
    const ownerSnap = await getDocs(ownerQuery);
    ownerSnap.forEach((d) => {
      const data = d.data();
      projectsMap.set(d.id, {
        id: d.id,
        nombre: data.nombre || 'Proyecto sin nombre',
        updatedAt: data.updatedAt,
        semana_corte: data.semana_corte,
        moneda: data.moneda || 'PEN',
        presupuesto_autorizado: data.presupuesto_autorizado,
        BAC: data.BAC,
        isShared: false,
        ownerEmail: data.ownerEmail,
        ownerId: data.ownerId,
      });
    });

    // 2. Proyectos compartidos con este usuario (docente o revisor)
    if (user.email) {
      try {
        const sharedQuery = query(
          collection(db, path),
          where('sharedWithEmail', '==', user.email.trim().toLowerCase())
        );
        const sharedSnap = await getDocs(sharedQuery);
        sharedSnap.forEach((d) => {
          if (!projectsMap.has(d.id)) {
            const data = d.data();
            projectsMap.set(d.id, {
              id: d.id,
              nombre: data.nombre || 'Proyecto compartido',
              updatedAt: data.updatedAt,
              semana_corte: data.semana_corte,
              moneda: data.moneda || 'PEN',
              presupuesto_autorizado: data.presupuesto_autorizado,
              BAC: data.BAC,
              isShared: true,
              ownerEmail: data.ownerEmail,
              ownerId: data.ownerId,
            });
          }
        });
      } catch (sharedErr) {
        console.warn('Consulta de proyectos compartidos:', sharedErr);
      }
    }
  } catch (error) {
    console.error('Error al listar proyectos en Firestore:', error);
    handleFirestoreError(error, OperationType.LIST, path);
  }

  const list = Array.from(projectsMap.values());
  // Ordenar por fecha de actualización descendente (el más reciente primero)
  list.sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });

  return list;
}

// Cargar dataset completo con subcolecciones
export async function fetchFullProjectDataset(projectId: string): Promise<ProjectDataset | null> {
  const path = `proyectos/${projectId}`;
  try {
    const projectSnap = await getDoc(doc(db, 'proyectos', projectId));
    if (!projectSnap.exists()) return null;

    const rootData = projectSnap.data() as any;

    const subcollections = [
      'actividades',
      'avance_semanal',
      'riesgos',
      'objetivos',
      'supuestos',
      'interesados',
      'requisitos',
      'entregables',
      'edt',
      'hitos',
      'lineabase_pv',
      'recursos',
      'raci',
      'costos',
      'riesgos_historial',
      'respuestas_riesgo',
      'contingencia',
      'plan_comunicaciones',
      'comunicaciones',
      'adquisiciones',
      'calidad',
      'incidentes',
      'cambios',
      'lecciones',
      'automatizaciones',
      'plantillas',
    ];

    const results: Record<string, any[]> = {};

    await Promise.all(
      subcollections.map(async (subName) => {
        try {
          const snap = await getDocs(collection(db, 'proyectos', projectId, subName));
          results[subName] = snap.docs.map((d) => d.data());
        } catch (e) {
          results[subName] = [];
        }
      })
    );

    return {
      proyecto: {
        id: projectId,
        nombre: rootData.nombre,
        moneda: rootData.moneda || 'PEN',
        presupuesto_autorizado: rootData.presupuesto_autorizado || 850000,
        BAC: rootData.BAC || 770000,
        reserva_contingencia: rootData.reserva_contingencia || 80000,
        duracion_semanas: rootData.duracion_semanas || 12,
        semana_corte: rootData.semana_corte || 6,
        patrocinador: rootData.patrocinador,
        director_proyecto: rootData.director_proyecto,
        fecha_inicio: rootData.fecha_inicio,
        fecha_fin_planificada: rootData.fecha_fin_planificada,
        sharedWithEmail: rootData.sharedWithEmail || '',
        ownerId: rootData.ownerId,
        ownerEmail: rootData.ownerEmail,
      },
      actividades: results.actividades || [],
      avance_semanal: results.avance_semanal || [],
      riesgos: results.riesgos || [],
      objetivos: results.objetivos || [],
      supuestos: results.supuestos || [],
      interesados: results.interesados || [],
      requisitos: results.requisitos || [],
      entregables: results.entregables || [],
      edt: results.edt || [],
      hitos: results.hitos || [],
      lineaBase_pv: results.lineabase_pv || [],
      recursos: results.recursos || [],
      raci: results.raci || [],
      costos: results.costos || [],
      riesgos_historial: results.riesgos_historial || [],
      respuestas_riesgo: results.respuestas_riesgo || [],
      contingencia: results.contingencia || [],
      plan_comunicaciones: results.plan_comunicaciones || [],
      comunicaciones: results.comunicaciones || [],
      adquisiciones: results.adquisiciones || [],
      calidad: results.calidad || [],
      incidentes: results.incidentes || [],
      cambios: results.cambios || [],
      lecciones: results.lecciones || [],
      automatizaciones: results.automatizaciones || [],
      catalogo_plantillas: results.plantillas || [],
      metadataCarga: rootData.metadataCarga,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Guardar una entrada en el historial de cargas y ediciones en Firestore (Requisito 4)
export async function saveHistoryEntryToFirestore(
  projectId: string,
  entry: HistoryEntry,
  user: User
): Promise<void> {
  const path = `proyectos/${projectId}/cargas/${entry.id}`;
  const historyRef = doc(db, 'proyectos', projectId, 'cargas', entry.id);

  try {
    await setDoc(historyRef, {
      ...entry,
      ownerId: user.uid,
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Recuperar el historial de cargas y ediciones desde Firestore (Requisito 4)
export async function fetchProjectHistory(projectId: string): Promise<HistoryEntry[]> {
  const path = `proyectos/${projectId}/cargas`;
  try {
    const snap = await getDocs(collection(db, 'proyectos', projectId, 'cargas'));
    const entries: HistoryEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      entries.push({
        id: data.id || d.id,
        fecha: data.fecha || new Date().toISOString(),
        usuario: data.usuario || 'Gestor',
        tipo: data.tipo || 'carga_excel',
        hoja: data.hoja || data.nombreArchivo || 'Carga completa',
        filasTotales: data.filasTotales || 0,
        descripcion: data.descripcion || `Operación en ${data.nombreArchivo || 'proyecto'}`,
        snapshotJson: data.snapshotJson || '',
      });
    });

    // Ordenar descendente por fecha (más reciente primero)
    entries.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
