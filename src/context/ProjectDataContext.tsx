/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.ts';
import {
  saveProjectToFirestore,
  subscribeToProjectDoc,
  updateProjectDocenteEmail,
  updateProjectCutoffWeek,
  fetchFullProjectDataset,
  saveHistoryEntryToFirestore,
  fetchProjectHistory,
  fetchUserProjectsList,
} from '../services/firestoreService.ts';
import { ProjectDataset, HistoryEntry, UserProjectSummary } from '../types/projectData.ts';
import { ALBA_SAMPLE_DATASET } from '../services/albaSampleDataset.ts';
import { calculateAllProjectAnalytics, AllProjectAnalytics } from '../services/projectAnalyticsService.ts';

interface ProjectDataContextType {
  projectData: ProjectDataset | null;
  projectAnalytics: AllProjectAnalytics;
  isDataLoaded: boolean;
  user: User | null;
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  sharedDocenteEmail: string;
  updateDocenteEmail: (email: string) => Promise<void>;
  updateCutoffWeek: (week: number) => Promise<void>;
  lastSyncTime: Date | null;
  syncSecondsAgo: number;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'local';
  isSavingToFirestore: boolean;
  saveProjectData: (data: ProjectDataset, historyMeta?: { tipo?: 'carga_excel' | 'edicion_hoja' | 'registro_avance' | 'restauracion'; hoja?: string; descripcion?: string }) => Promise<void>;
  clearProjectData: () => void;
  loadSampleImpulsaData: () => void;
  loadAlbaCaseStudy: () => void;
  historyList: HistoryEntry[];
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'fecha'>) => Promise<void>;
  restoreHistoryVersion: (entry: HistoryEntry) => Promise<void>;
  userProjectsList: UserProjectSummary[];
  isProjectsListLoading: boolean;
  switchActiveProject: (projectId: string) => Promise<void>;
  refreshUserProjects: () => Promise<void>;
}


const STORAGE_KEY = 'impulsa_project_data_v1';
const DOCENTE_STORAGE_KEY = 'impulsa_docente_email_v1';
const HISTORY_STORAGE_KEY = 'impulsa_project_history_v1';

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

export const ProjectDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectData, setProjectData] = useState<ProjectDataset | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [sharedDocenteEmail, setSharedDocenteEmail] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [syncSecondsAgo, setSyncSecondsAgo] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local'>('local');
  const [isSavingToFirestore, setIsSavingToFirestore] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [userProjectsList, setUserProjectsList] = useState<UserProjectSummary[]>([]);
  const [isProjectsListLoading, setIsProjectsListLoading] = useState<boolean>(false);

  const activeProjectIdRef = useRef<string | null>(null);

  // Carga de proyectos desde Firestore para el usuario autenticado (prioriza la nube)
  const loadFirestoreProjects = async (currentUser: User) => {
    setIsProjectsListLoading(true);
    setSyncStatus('syncing');
    try {
      const list = await fetchUserProjectsList(currentUser);
      setUserProjectsList(list);

      if (list.length > 0) {
        // Seleccionar el proyecto que coincida con activeProjectIdRef o el primero (más reciente)
        const targetSummary = list.find((p) => p.id === activeProjectIdRef.current) || list[0];
        activeProjectIdRef.current = targetSummary.id;

        const fullDataset = await fetchFullProjectDataset(targetSummary.id);
        if (fullDataset) {
          setProjectData(fullDataset);
          // Respaldo en localStorage para disponibilidad sin conexión
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fullDataset));
          } catch (e) {}

          if (fullDataset.proyecto?.sharedWithEmail) {
            setSharedDocenteEmail(fullDataset.proyecto.sharedWithEmail);
          }

          // Cargar historial de auditoría y versiones desde Firestore
          try {
            const history = await fetchProjectHistory(targetSummary.id);
            if (history && history.length > 0) {
              setHistoryList(history);
              try {
                localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
              } catch (e) {}
            }
          } catch (hErr) {
            console.warn('No se pudo recuperar historial de Firestore:', hErr);
          }

          setLastSyncTime(new Date());
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }

      } else {
        // El usuario no tiene proyectos en Firestore aún
        // Si hay datos en localStorage, se preservan como borrador local
        setSyncStatus('synced');
      }
    } catch (err) {
      console.warn('Error al consultar proyectos en Firestore:', err);
      setSyncStatus('offline');
    } finally {
      setIsProjectsListLoading(false);
    }
  };

  // 1. Monitoreo de autenticación Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        await loadFirestoreProjects(currentUser);
      } else {
        setSyncStatus('local');
        setUserProjectsList([]);
        // Si se cierra sesión, restaurar desde localStorage como respaldo local
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setProjectData(JSON.parse(stored));
          }
        } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, []);


  // 2. Contador en vivo de segundos desde la última sincronización
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSyncTime) {
        const diffSeconds = Math.max(0, Math.floor((Date.now() - lastSyncTime.getTime()) / 1000));
        setSyncSecondsAgo(diffSeconds);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  // 3. Carga inicial desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          if (!parsed.lineaBase_pv && parsed.lineabase_pv) {
            parsed.lineaBase_pv = parsed.lineabase_pv;
          } else if (!parsed.lineabase_pv && parsed.lineaBase_pv) {
            parsed.lineabase_pv = parsed.lineaBase_pv;
          }
        }
        setProjectData(parsed);
        if (parsed?.proyecto?.id) {
          activeProjectIdRef.current = parsed.proyecto.id;
        }
        if (parsed?.proyecto?.sharedWithEmail) {
          setSharedDocenteEmail(parsed.proyecto.sharedWithEmail);
        }
      }
      const storedDocente = localStorage.getItem(DOCENTE_STORAGE_KEY);
      if (storedDocente) {
        setSharedDocenteEmail(storedDocente);
      }
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistoryList(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.warn('No se pudo recuperar datos previos de localStorage:', e);
    }
  }, []);


  // 4. Suscripción en tiempo real (onSnapshot) al proyecto activo en Firestore (Requisito 3)
  useEffect(() => {
    if (!user || !projectData?.proyecto?.id) return;

    const projectId = projectData.proyecto.id;
    activeProjectIdRef.current = projectId;

    setSyncStatus('syncing');

    const unsubscribe = subscribeToProjectDoc(
      projectId,
      (rootDoc) => {
        if (rootDoc) {
          setLastSyncTime(new Date());
          setSyncStatus('synced');
          if (rootDoc.sharedWithEmail) {
            setSharedDocenteEmail(rootDoc.sharedWithEmail);
          }
          // Actualizar metadatos del proyecto en memoria
          setProjectData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              proyecto: {
                ...prev.proyecto,
                ...rootDoc,
              },
            };
          });
        }
      },
      (err) => {
        console.warn('Escucha en tiempo real de Firestore:', err);
        setSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [user, projectData?.proyecto?.id]);

  // Iniciar sesión con Google (Popup)
  const signInWithGoogle = async () => {
    try {
      setIsAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Cerrar sesión
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setSyncStatus('local');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Actualizar correo del docente autorizado para lectura (Requisito 2)
  const updateDocenteEmail = async (email: string) => {
    const cleaned = email.trim().toLowerCase();
    setSharedDocenteEmail(cleaned);
    try {
      localStorage.setItem(DOCENTE_STORAGE_KEY, cleaned);
    } catch (e) {}

    if (user && projectData?.proyecto?.id) {
      setSyncStatus('syncing');
      await updateProjectDocenteEmail(projectData.proyecto.id, cleaned);
      setLastSyncTime(new Date());
      setSyncStatus('synced');
    }
  };

  // Actualizar semana de corte con persistencia y sincronización en tiempo real en Firestore
  const updateCutoffWeek = async (week: number) => {
    // 1. Actualización inmediata en estado de memoria local
    setProjectData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        proyecto: {
          ...prev.proyecto,
          semana_corte: week,
        },
      };
    });

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.proyecto) {
          parsed.proyecto.semana_corte = week;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch (e) {}

    // 2. Si el proyecto existe en Firestore y el usuario está autenticado, sincronizar en vivo
    if (user && projectData?.proyecto?.id) {
      setSyncStatus('syncing');
      try {
        await updateProjectCutoffWeek(projectData.proyecto.id, week);
        setLastSyncTime(new Date());
        setSyncStatus('synced');
      } catch (err) {
        console.warn('No se pudo sincronizar semana de corte en Firestore:', err);
        setSyncStatus('offline');
      }
    }
  };

  // Guardar datos con sincronización automática en Firestore y localStorage y registro en historial
  const saveProjectData = async (
    data: ProjectDataset,
    historyMeta?: {
      tipo?: 'carga_excel' | 'edicion_hoja' | 'registro_avance' | 'restauracion';
      hoja?: string;
      descripcion?: string;
    }
  ) => {
    // Sincronizar compatibilidad de nombres para línea base
    if (!data.lineaBase_pv && (data as any).lineabase_pv) {
      data.lineaBase_pv = (data as any).lineabase_pv;
    } else if (!(data as any).lineabase_pv && data.lineaBase_pv) {
      (data as any).lineabase_pv = data.lineaBase_pv;
    }

    setProjectData(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error al persistir en localStorage:', e);
    }

    // Calcular total de filas en el dataset
    const totalFilas = Object.values(data).reduce(
      (acc: number, curr: any) => (Array.isArray(curr) ? acc + curr.length : acc),
      0
    );

    const historyEntry: HistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fecha: new Date().toISOString(),
      usuario: user?.displayName || user?.email || 'Gestor local',
      tipo: historyMeta?.tipo || 'carga_excel',
      hoja: historyMeta?.hoja || data.metadataCarga?.nombreArchivo || 'Carga completa .xlsx',
      filasTotales: totalFilas,
      descripcion:
        historyMeta?.descripcion ||
        `Operación en ${data.metadataCarga?.nombreArchivo || 'proyecto'} (${totalFilas} registros)`,
      snapshotJson: JSON.stringify(data),
    };

    // Actualizar historial local inmediatamente
    setHistoryList((prev) => {
      const updated = [historyEntry, ...prev.filter((e) => e.id !== historyEntry.id)];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
      } catch (e) {}
      return updated;
    });

    // Si el usuario está autenticado, sincronizar en Firestore bajo la jerarquía completa
    if (user) {
      setIsSavingToFirestore(true);
      setSyncStatus('syncing');
      try {
        const assignedProjectId = await saveProjectToFirestore(data, user, sharedDocenteEmail);
        data.proyecto.id = assignedProjectId;
        data.proyecto.ownerId = user.uid;
        data.proyecto.ownerEmail = user.email || '';
        data.proyecto.sharedWithEmail = sharedDocenteEmail;
        activeProjectIdRef.current = assignedProjectId;

        // Registrar la entrada de historial en Firestore
        try {
          await saveHistoryEntryToFirestore(assignedProjectId, historyEntry, user);
        } catch (hErr) {
          console.warn('No se pudo guardar entrada en historial de Firestore:', hErr);
        }

        setLastSyncTime(new Date());
        setSyncStatus('synced');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // Refrescar lista de proyectos disponibles
        try {
          const updatedList = await fetchUserProjectsList(user);
          setUserProjectsList(updatedList);
        } catch (e) {}
      } catch (err) {
        console.error('Error al guardar en Firestore:', err);
        setSyncStatus('offline');
      } finally {
        setIsSavingToFirestore(false);
      }
    } else {
      setLastSyncTime(new Date());
      setSyncStatus('local');
    }
  };

  // Restaurar versión anterior desde el historial
  const restoreHistoryVersion = async (entry: HistoryEntry) => {
    if (!entry.snapshotJson) {
      throw new Error('La versión seleccionada no cuenta con una copia de respaldo completa.');
    }
    const parsed: ProjectDataset = JSON.parse(entry.snapshotJson);
    await saveProjectData(parsed, {
      tipo: 'restauracion',
      hoja: entry.hoja,
      descripcion: `Restauración a la versión del ${new Date(entry.fecha).toLocaleString('es-PE')} (${entry.descripcion})`,
    });
  };

  // Agregar entrada manual al historial
  const addHistoryEntry = async (entry: Omit<HistoryEntry, 'id' | 'fecha'>) => {
    const fullEntry: HistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fecha: new Date().toISOString(),
    };
    setHistoryList((prev) => {
      const updated = [fullEntry, ...prev];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
      } catch (e) {}
      return updated;
    });

    if (user && activeProjectIdRef.current) {
      try {
        await saveHistoryEntryToFirestore(activeProjectIdRef.current, fullEntry, user);
      } catch (err) {
        console.warn('No se pudo guardar entrada de historial en Firestore:', err);
      }
    }
  };

  // Cambiar de proyecto activo cargando su dataset completo desde Firestore
  const switchActiveProject = async (projectId: string) => {
    if (!user) return;
    setIsProjectsListLoading(true);
    setSyncStatus('syncing');
    try {
      const fullDataset = await fetchFullProjectDataset(projectId);
      if (fullDataset) {
        setProjectData(fullDataset);
        activeProjectIdRef.current = projectId;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fullDataset));
        } catch (e) {}
        if (fullDataset.proyecto?.sharedWithEmail) {
          setSharedDocenteEmail(fullDataset.proyecto.sharedWithEmail);
        }

        // Cargar historial del proyecto seleccionado
        try {
          const history = await fetchProjectHistory(projectId);
          if (history && history.length > 0) {
            setHistoryList(history);
            try {
              localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
            } catch (e) {}
          }
        } catch (hErr) {}

        setLastSyncTime(new Date());
        setSyncStatus('synced');
      }
    } catch (err) {
      console.error('Error al cambiar de proyecto activo:', err);
      setSyncStatus('offline');
    } finally {
      setIsProjectsListLoading(false);
    }
  };


  // Refrescar manualmente la lista de proyectos en Firestore
  const refreshUserProjects = async () => {
    if (!user) return;
    await loadFirestoreProjects(user);
  };

  const clearProjectData = () => {
    setProjectData(null);
    activeProjectIdRef.current = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }
  };

  // Conjunto de datos de simulación institucional (rotulado DATOS DE EJEMPLO según Regla 3)
  const loadSampleImpulsaData = () => {
    const sample: ProjectDataset = {
      proyecto: {
        nombre: 'IMPULSA — Sistema de información con IA para la búsqueda de empleo en el Perú',
        moneda: 'PEN',
        presupuesto_autorizado: 850000,
        BAC: 770000,
        reserva_contingencia: 80000,
        duracion_semanas: 12,
        semana_corte: 6,
        patrocinador: 'MTPE / Alianza Tech Perú',
        director_proyecto: 'Ing. Carlos Mendoza (Certificación PMP® / Lead)',
        fecha_inicio: '2024-04-08',
        fecha_fin_planificada: '2024-06-30',
        umbral_alerta_cpi: 0.95,
        umbral_critico_cpi: 0.9,
        umbral_alerta_spi: 0.95,
        umbral_critico_spi: 0.9,
      },
      objetivos: [
        {
          id: 'OBJ-01',
          objetivo: 'Desarrollar e implementar el motor algorítmico de emparejamiento laboral (Matching IA) con precisión superior al 85% para perfiles operativos y técnicos en 12 semanas.',
          indicador: 'Validación por métrica F1-Score',
          meta: '> 85%',
        },
        {
          id: 'OBJ-02',
          objetivo: 'Integrar de manera automatizada al menos 15 fuentes de ofertas públicas y privadas cubriendo las 25 regiones del país con actualización en tiempo real antes de la semana 9.',
          indicador: '25 regiones del Perú activas',
          meta: '15 Fuentes',
        },
        {
          id: 'OBJ-03',
          objetivo: 'Alcanzar un tiempo promedio de búsqueda y postulación inferior a 4 minutos por usuario en versión beta y registrar al menos 25,000 postulaciones efectivas en los primeros 45 días posdespliegue.',
          indicador: 'Meta: 25k postulaciones registradas',
          meta: '< 4 Minutos',
        },
        {
          id: 'OBJ-04',
          objetivo: 'Finalizar la entrega de las 4 fases del producto dentro del presupuesto de S/ 865,000 PEN y cumplir el cronograma estricto de 12 semanas.',
          indicador: 'Tolerancia controlada por PMO',
          meta: '+/- 5% BAC',
        },
      ],
      supuestos: [
        { id: 'SUP-01', tipo: 'Técnico', descripcion: 'Las APIs de MTPE y Empleos Perú dispondrán de una tasa de servicio del 99.5%.' },
        { id: 'SUP-02', tipo: 'Organizacional', descripcion: 'El comité directivo validará entregables en un plazo máximo de 48 horas hábiles.' },
      ],
      interesados: [
        { id: 'INT-01', interesado: 'Ministerio de Trabajo y Promoción del Empleo (MTPE)', rol: 'Patrocinador Principal', poder_1a5: 5, interes_1a5: 5 },
        { id: 'INT-02', interesado: 'Alianza Tech Perú', rol: 'Socio Tecnológico', poder_1a5: 4, interes_1a5: 5 },
        { id: 'INT-03', interesado: 'Comité de Usuarios Beta (Postulantes Jóvenes)', rol: 'Usuario Final', poder_1a5: 2, interes_1a5: 5 },
      ],
      requisitos: [
        { id: 'REQ-01', tipo: 'Funcional', descripcion: 'Motor de emparejamiento semántico de CV con vacantes', criterio_aceptacion: 'Tiempo de respuesta menor a 800ms' },
      ],
      entregables: [
        { id: 'ENT-01', entregable: 'Acta de Constitución Formal y Plan de Dirección', incluido: true },
        { id: 'ENT-02', entregable: 'Plataforma Web Beta y Motor de Matching IA', incluido: true },
      ],
      edt: [
        { codigo: '1.0', nombre: 'IMPULSA - Sistema de Información con IA', nivel: 1 },
        { codigo: '1.1', nombre: 'Planificación detallada y arquitectura técnica', nivel: 2 },
        { codigo: '1.2', nombre: 'Diseño UX/UI y flujos de usuario postulante', nivel: 2 },
        { codigo: '1.3', nombre: 'Catálogo y entorno DevOps / Cloud Infrastructure', nivel: 2 },
        { codigo: '1.4', nombre: 'Ingesta y conectores de fuentes públicas y privadas', nivel: 2 },
        { codigo: '1.5', nombre: 'Plataforma web beta y buscador territorial', nivel: 2 },
        { codigo: '1.6', nombre: 'Motor algorítmico de matching IA y scoring', nivel: 2 },
        { codigo: '1.7', nombre: 'Pruebas de aceptación (UAT) y seguridad', nivel: 2 },
        { codigo: '1.8', nombre: 'Lanzamiento formal y despliegue a producción', nivel: 2 },
      ],
      actividades: [
        { codigo: '1.1', actividad: 'Planificación detallada y arquitectura técnica', cuenta_control: 'CC-01', responsable: 'C. Mendoza', sem_inicio_plan: 1, sem_fin_plan: 3, BAC: 60000 },
        { codigo: '1.2', actividad: 'Diseño UX/UI y flujos de usuario postulante', cuenta_control: 'CC-02', responsable: 'L. Paredes', sem_inicio_plan: 2, sem_fin_plan: 4, BAC: 75000 },
        { codigo: '1.3', actividad: 'Catálogo y entorno DevOps / Cloud Infrastructure', cuenta_control: 'CC-03', responsable: 'Ing. Morales', sem_inicio_plan: 3, sem_fin_plan: 5, BAC: 90000 },
        { codigo: '1.4', actividad: 'Ingesta y conectores de fuentes públicas y privadas', cuenta_control: 'CC-04', responsable: 'E. Castro', sem_inicio_plan: 4, sem_fin_plan: 7, BAC: 110000 },
        { codigo: '1.5', actividad: 'Plataforma web beta y buscador territorial', cuenta_control: 'CC-05', responsable: 'R. Ramos', sem_inicio_plan: 5, sem_fin_plan: 8, BAC: 140000 },
        { codigo: '1.6', actividad: 'Motor algorítmico de matching IA y scoring', cuenta_control: 'CC-06', responsable: 'Dr. Valdivia', sem_inicio_plan: 5, sem_fin_plan: 9, BAC: 150000 },
        { codigo: '1.7', actividad: 'Pruebas de aceptación (UAT) y seguridad', cuenta_control: 'CC-07', responsable: 'K. Salazar', sem_inicio_plan: 8, sem_fin_plan: 11, BAC: 85000 },
        { codigo: '1.8', actividad: 'Lanzamiento formal y despliegue a producción', cuenta_control: 'CC-08', responsable: 'C. Mendoza', sem_inicio_plan: 11, sem_fin_plan: 12, BAC: 60000 },
      ],
      hitos: [
        { id: 'HIT-01', hito: 'Línea base y arquitectura aprobadas', semana_plan: 3 },
        { id: 'HIT-02', hito: 'Entorno Cloud y conectores operativos', semana_plan: 5 },
        { id: 'HIT-03', hito: 'Versión Beta funcional en pruebas UAT', semana_plan: 8 },
        { id: 'HIT-04', hito: 'Pase a producción nacional', semana_plan: 12 },
      ],
      lineaBase_pv: [
        { codigo: '1.1', S1: 20000, S2: 25000, S3: 15000, S4: 0, S5: 0, S6: 0, S7: 0, S8: 0, S9: 0, S10: 0, S11: 0, S12: 0, total_pv: 60000 },
        { codigo: '1.2', S1: 0, S2: 25000, S3: 30000, S4: 20000, S5: 0, S6: 0, S7: 0, S8: 0, S9: 0, S10: 0, S11: 0, S12: 0, total_pv: 75000 },
        { codigo: '1.3', S1: 0, S2: 0, S3: 30000, S4: 35000, S5: 25000, S6: 0, S7: 0, S8: 0, S9: 0, S10: 0, S11: 0, S12: 0, total_pv: 90000 },
        { codigo: '1.4', S1: 0, S2: 0, S3: 0, S4: 30000, S5: 35000, S6: 30000, S7: 15000, S8: 0, S9: 0, S10: 0, S11: 0, S12: 0, total_pv: 110000 },
        { codigo: '1.5', S1: 0, S2: 0, S3: 0, S4: 0, S5: 35000, S6: 45000, S7: 35000, S8: 25000, S9: 0, S10: 0, S11: 0, S12: 0, total_pv: 140000 },
        { codigo: '1.6', S1: 0, S2: 0, S3: 0, S4: 0, S5: 40000, S6: 45000, S7: 35000, S8: 20000, S9: 10000, S10: 0, S11: 0, S12: 0, total_pv: 150000 },
        { codigo: '1.7', S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, S7: 0, S8: 25000, S9: 25000, S10: 20000, S11: 15000, S12: 0, total_pv: 85000 },
        { codigo: '1.8', S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, S7: 0, S8: 0, S9: 0, S10: 0, S11: 25000, S12: 35000, total_pv: 60000 },
      ],
      avance_semanal: [
        { semana: 1, codigo: '1.1', pct_completado_acum: 0.35, costo_real_semana: 21000 },
        { semana: 2, codigo: '1.1', pct_completado_acum: 0.75, costo_real_semana: 24500 },
        { semana: 3, codigo: '1.1', pct_completado_acum: 1.0, costo_real_semana: 16000 },
        { semana: 2, codigo: '1.2', pct_completado_acum: 0.3, costo_real_semana: 26000 },
        { semana: 3, codigo: '1.2', pct_completado_acum: 0.7, costo_real_semana: 31000 },
        { semana: 4, codigo: '1.2', pct_completado_acum: 1.0, costo_real_semana: 19500 },
        { semana: 3, codigo: '1.3', pct_completado_acum: 0.3, costo_real_semana: 31500 },
        { semana: 4, codigo: '1.3', pct_completado_acum: 0.7, costo_real_semana: 37000 },
        { semana: 5, codigo: '1.3', pct_completado_acum: 1.0, costo_real_semana: 26000 },
        { semana: 4, codigo: '1.4', pct_completado_acum: 0.25, costo_real_semana: 32000 },
        { semana: 5, codigo: '1.4', pct_completado_acum: 0.55, costo_real_semana: 36800 },
        { semana: 6, codigo: '1.4', pct_completado_acum: 0.8, costo_real_semana: 32500 },
        { semana: 5, codigo: '1.5', pct_completado_acum: 0.25, costo_real_semana: 38000 },
        { semana: 6, codigo: '1.5', pct_completado_acum: 0.55, costo_real_semana: 48000 },
        { semana: 5, codigo: '1.6', pct_completado_acum: 0.25, costo_real_semana: 44000 },
        { semana: 6, codigo: '1.6', pct_completado_acum: 0.5, costo_real_semana: 49000 },
      ],
      recursos: [
        { id: 'REC-01', recurso: 'Ing. Carlos Mendoza', tipo: 'Personal' },
        { id: 'REC-02', recurso: 'Infraestructura Cloud AWS/GCP', tipo: 'Material/Tecnología' },
      ],
      raci: [
        { codigo_actividad: '1.1', persona_o_rol: 'Carlos Mendoza', raci: 'A' },
        { codigo_actividad: '1.6', persona_o_rol: 'Dr. Valdivia', raci: 'R' },
      ],
      costos: [
        { id: 'CST-01', cuenta_control: 'CC-01', concepto: 'Servicios de arquitectura técnica especializada', monto: 60000 },
      ],
      riesgos: [
        {
          id: 'RSK-01',
          riesgo: 'Sesgo algorítmico en recomendaciones laborales juveniles',
          categoria: 'Técnico / Algoritmos e IA',
          probabilidad_1a5: 4,
          impacto_1a5: 5,
          estrategia: 'Mitigar',
          respuesta_planificada: 'Auditoría ética independiente y rebalanceo de datos de entrenamiento',
          propietario: 'Dr. Valdivia (IA Lead)',
          severidad: 20,
        },
        {
          id: 'RSK-02',
          riesgo: 'Latencia y cuellos de botella en APIs externas del MTPE',
          categoria: 'Técnico / Integración',
          probabilidad_1a5: 4,
          impacto_1a5: 5,
          estrategia: 'Mitigar',
          respuesta_planificada: 'Implementar caché distribuido Redis y colas asíncronas con Kafka',
          propietario: 'Ing. Morales (DevOps)',
          severidad: 20,
        },
        {
          id: 'RSK-03',
          riesgo: 'Retraso en validación formal de directivas legales de protección de datos (PCM)',
          categoria: 'Gobernanza / Legal',
          probabilidad_1a5: 3,
          impacto_1a5: 4,
          estrategia: 'Transferir / Mitigar',
          respuesta_planificada: 'Sesiones de acompañamiento bisemanales con asesores de la PCM',
          propietario: 'Asesoría Jurídica MTPE',
          severidad: 12,
        },
        {
          id: 'RSK-04',
          riesgo: 'Sobrecosto por escalado inesperado de modelos fundacionales de LLM',
          categoria: 'Infraestructura Cloud',
          probabilidad_1a5: 4,
          impacto_1a5: 4,
          estrategia: 'Mitigar',
          respuesta_planificada: 'Cuotas de consumo y uso de embeddings locales para tareas masivas',
          propietario: 'Ing. Morales',
          severidad: 16,
        },
      ],
      riesgos_historial: [
        { semana: 6, id: 'RSK-01', probabilidad_1a5: 4, impacto_1a5: 5 },
        { semana: 6, id: 'RSK-02', probabilidad_1a5: 4, impacto_1a5: 5 },
        { semana: 6, id: 'RSK-03', probabilidad_1a5: 3, impacto_1a5: 4 },
        { semana: 6, id: 'RSK-04', probabilidad_1a5: 4, impacto_1a5: 4 },
      ],
      respuestas_riesgo: [
        { id_riesgo: 'RSK-01', accion_ejecutada: 'Implementado módulo de fairness metrics y auditoría de paridad', fecha: '2024-05-12', responsable: 'Dr. Valdivia' },
      ],
      contingencia: [
        { fecha: '2024-05-02', semana: 4, riesgo: 'RSK-02', concepto: 'Aprovisionamiento de clúster Redis de alta disponibilidad', monto: 15000 },
      ],
      plan_comunicaciones: [
        { audiencia: 'Comité Directivo & Sponsor', informacion_requerida: 'Reporte ejecutivo semanal de avances, EVM y riesgos críticos', frecuencia: 'Semanal (Lunes)', canal: 'Sesión presencial + PDF', responsable_emitir: 'Ing. C. Mendoza' },
        { audiencia: 'MTPE / Empleos Perú (Equipo TI)', informacion_requerida: 'Mesa técnica de interoperabilidad y catálogo de APIs', frecuencia: 'Quincenal', canal: 'Videoconferencia + Minuta', responsable_emitir: 'E. Castro' },
      ],
      comunicaciones: [
        { semana: 6, comunicacion: 'Informe de Desempeño EVM Semana 6', audiencia: 'Comité Directivo' },
      ],
      adquisiciones: [
        { id: 'ADQ-01', bien_o_servicio: 'Suscripción Cloud Enterprise Google Cloud Platform', decision: 'Comprar / Contratar' },
      ],
      calidad: [
        { id: 'CAL-01', entregable_id: 'ENT-02', estandar_o_criterio: 'Tiempo de respuesta P95 < 400ms y cobertura de pruebas unitarias > 80%' },
      ],
      incidentes: [
        { id: 'INC-01', fecha: '2024-05-08', descripcion: 'Desconexión momentánea de sandbox MTPE durante pruebas de carga', responsable: 'E. Castro', estado: 'Cerrado' },
      ],
      cambios: [
        { id: 'CR-01', fecha: '2024-05-10', descripcion: 'Inclusión de filtro de accesibilidad para personas con discapacidad visual', solicitante: 'Comité de Usuarios', decision: 'Aprobado' },
      ],
      lecciones: [
        { id: 'LEC-01', fecha: '2024-05-15', situacion: 'Demora en asignación de cuotas de cómputo en la nube', leccion: 'Solicitar reserva de instancias GPU con al menos 3 semanas de anticipación.' },
      ],
      automatizaciones: [
        { id: 'AUT-01', proceso: 'Búsqueda y validación de convocatorias por zona geográfica', categoria: 'ETL / Scraping', frecuencia_mes: 360, minutos_por_vez: 12, riesgo_error_1a5: 2, estructura_reglas_1a5: 4, disparador: 'Cada 6 horas' },
        { id: 'AUT-02', proceso: 'Adecuación de CV a convocatoria específica', categoria: 'NLP / Generativo', frecuencia_mes: 4500, minutos_por_vez: 8, riesgo_error_1a5: 2, estructura_reglas_1a5: 3, disparador: 'On-demand (API)' },
        { id: 'AUT-03', proceso: 'Alerta de desviación de costo/cronograma (EVM)', categoria: 'Monitoreo EVM', frecuencia_mes: 4, minutos_por_vez: 20, riesgo_error_1a5: 1, estructura_reglas_1a5: 5, disparador: 'Semanal (Lunes 00:00 PET)' },
      ],
      metadataCarga: {
        fechaCarga: new Date().toISOString(),
        nombreArchivo: 'Datos_Simulacion_IMPULSA_S6.xlsx',
        tamanoBytes: 1845000,
        checksum: '9a4f...3c18',
        esDatosEjemplo: true,
      },
    };

    saveProjectData(sample);
  };

  // Carga del caso de estudio de referencia ALBA (calibrado para pruebas EVM PMBOK 8 a Semana 6)
  const loadAlbaCaseStudy = () => {
    saveProjectData(ALBA_SAMPLE_DATASET, {
      tipo: 'carga_excel',
      hoja: 'Proyecto_ALBA',
      descripcion: 'Carga del caso oficial de referencia ALBA (EVM PMBOK 8 / S6)',
    });
  };

  // Recalcular métricas analíticas de los 5 dominios en tiempo real
  const projectAnalytics = useMemo(() => {
    const cutoff = Number(projectData?.proyecto?.semana_corte) || 6;
    return calculateAllProjectAnalytics(projectData, cutoff);
  }, [projectData, projectData?.proyecto?.semana_corte]);

  return (
    <ProjectDataContext.Provider
      value={{
        projectData,
        projectAnalytics,
        isDataLoaded: !!projectData,
        user,
        isAuthLoading,
        signInWithGoogle,
        signOutUser,
        sharedDocenteEmail,
        updateDocenteEmail,
        updateCutoffWeek,
        lastSyncTime,
        syncSecondsAgo,
        syncStatus,
        isSavingToFirestore,
        saveProjectData,
        clearProjectData,
        loadSampleImpulsaData,
        loadAlbaCaseStudy,
        historyList,
        addHistoryEntry,
        restoreHistoryVersion,
        userProjectsList,
        isProjectsListLoading,
        switchActiveProject,
        refreshUserProjects,
      }}
    >
      {children}
    </ProjectDataContext.Provider>
  );
};

export const useProjectData = () => {
  const context = useContext(ProjectDataContext);
  if (!context) {
    throw new Error('useProjectData debe usarse dentro de un ProjectDataProvider');
  }
  return context;
};
