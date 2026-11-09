/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SectionId =
  | 'inicio'
  | 'datos'
  | 'inicio-proyecto'
  | 'planificacion'
  | 'riesgos'
  | 'control'
  | 'integracion'
  | 'ejecucion'
  | 'plantillas'
  | 'bitacora-ia'
  | 'acerca-de';

export interface SectionMeta {
  id: SectionId;
  label: string;
  subtitle: string;
  pmbokPhase: string;
  badge?: string;
  description: string;
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    subtitle: 'Tablero ejecutivo',
    pmbokPhase: 'Visión Integral',
    description: 'Tablero ejecutivo integral con variación de valor ganado (EVM), estado del cronograma, mini matriz de riesgos y proyección.',
  },
  {
    id: 'datos',
    label: 'Datos',
    subtitle: 'Carga y validación',
    pmbokPhase: 'Gobierno de Datos',
    description: 'Importación y verificación de la matriz Excel (.xlsx) del proyecto, validación de 6 hojas del PMBOK y control de checksums.',
  },
  {
    id: 'inicio-proyecto',
    label: 'Inicio del proyecto',
    subtitle: 'Acta y gobernanza inicial',
    pmbokPhase: 'Fase de Inicio',
    description: 'Acta de Constitución (Project Charter), objetivos SMART medibles y registro inicial de personas y entidades interesadas clave.',
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    subtitle: 'Alcance, EDT y cronograma',
    pmbokPhase: 'Fase de Planificación',
    description: 'Línea base del alcance, Estructura de Desglose del Trabajo (EDT/WBS) y diagrama de Gantt de 12 semanas con ruta crítica.',
  },
  {
    id: 'riesgos',
    label: 'Riesgos',
    subtitle: 'Matriz 5×5 y contingencias',
    pmbokPhase: 'Gestión de Incertidumbre',
    description: 'Matriz de probabilidad e impacto (5×5), inventario de amenazas y oportunidades, mitigaciones y reserva de contingencia.',
  },
  {
    id: 'control',
    label: 'Control',
    subtitle: 'Desempeño y Valor Ganado (EVM)',
    pmbokPhase: 'Monitoreo y Control',
    description: 'Análisis de Valor Ganado (EVM): Curva S, índices de costo y cronograma (CPI, SPI), pronósticos EAC, ETC, VAC y TCPI.',
  },
  {
    id: 'integracion',
    label: 'Integración y comunicación',
    subtitle: 'Plan y matriz de interesados',
    pmbokPhase: 'Integración & Stakeholders',
    description: 'Plan oficial de comunicaciones, matriz de canales y frecuencias, agenda de eventos de seguimiento y compromisos.',
  },
  {
    id: 'ejecucion',
    label: 'Ejecución y automatización',
    subtitle: 'Flujos operativos activos',
    pmbokPhase: 'Fase de Ejecución',
    description: 'Supervisión de flujos de trabajo automatizados, disparadores por evento, procesamiento en producción y tasas de éxito.',
  },
  {
    id: 'plantillas',
    label: 'Plantillas',
    subtitle: 'Biblioteca PMBOK 8',
    pmbokPhase: 'Activos de Procesos',
    description: 'Repositorio oficial con 28 plantillas descargables y adaptables por fase: actas, planes subsidiarios, matrices y lecciones aprendidas.',
  },
  {
    id: 'bitacora-ia',
    label: 'Bitácora IA',
    subtitle: 'Trazabilidad y ética',
    pmbokPhase: 'Gobernanza de IA',
    badge: 'Auditoría',
    description: 'Registro auditable de todas las interacciones asistidas por IA, horas de esfuerzo ahorradas, validación humana y cumplimiento ético.',
  },
  {
    id: 'acerca-de',
    label: 'Acerca de',
    subtitle: 'Guía de uso y principios',
    pmbokPhase: 'Información del Sistema',
    description: 'Instrucciones claras para personas gestoras de proyectos, marco PMBOK 8 y principios de accesibilidad y transparencia.',
  },
];
