/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SectionId } from './types/navigation.ts';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';

import { InicioSection } from './components/sections/InicioSection.tsx';
import { DatosSection } from './components/sections/DatosSection.tsx';
import { InicioProyectoSection } from './components/sections/InicioProyectoSection.tsx';
import { PlanificacionSection } from './components/sections/PlanificacionSection.tsx';
import { RiesgosSection } from './components/sections/RiesgosSection.tsx';
import { ControlSection } from './components/sections/ControlSection.tsx';
import { IntegracionSection } from './components/sections/IntegracionSection.tsx';
import { EjecucionSection } from './components/sections/EjecucionSection.tsx';
import { PlantillasSection } from './components/sections/PlantillasSection.tsx';
import { BitacoraIASection } from './components/sections/BitacoraIASection.tsx';
import { AcercaDeSection } from './components/sections/AcercaDeSection.tsx';
import { ConfiguracionModal } from './components/configuracion/ConfiguracionModal.tsx';

import { ProjectDataProvider, useProjectData } from './context/ProjectDataContext.tsx';

function AppContent() {
  const { projectData, updateCutoffWeek } = useProjectData();
  const [activeSection, setActiveSection] = useState<SectionId>('inicio');
  const [cutoffWeek, setCutoffWeek] = useState<number>(6);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Sincronizar semana de corte si el dataset cargado o Firestore la actualiza en tiempo real
  React.useEffect(() => {
    if (projectData?.proyecto?.semana_corte && projectData.proyecto.semana_corte !== cutoffWeek) {
      setCutoffWeek(projectData.proyecto.semana_corte);
    }
  }, [projectData?.proyecto?.semana_corte]);

  const handleCutoffWeekChange = (newWeek: number) => {
    setCutoffWeek(newWeek);
    updateCutoffWeek(newWeek);
  };

  const handleNavigateToData = () => {
    setActiveSection('datos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (section: SectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'inicio':
        return <InicioSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'datos':
        return <DatosSection cutoffWeek={cutoffWeek} />;
      case 'inicio-proyecto':
        return <InicioProyectoSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'planificacion':
        return <PlanificacionSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'riesgos':
        return <RiesgosSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'control':
        return <ControlSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'integracion':
        return <IntegracionSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'ejecucion':
        return <EjecucionSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'plantillas':
        return <PlantillasSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'bitacora-ia':
        return <BitacoraIASection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
      case 'acerca-de':
        return <AcercaDeSection onNavigate={handleNavigate} />;
      default:
        return <InicioSection cutoffWeek={cutoffWeek} onNavigateToData={handleNavigateToData} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7FAFC] text-[#2D3748]">
      {/* Enlace accesible para saltar directamente al contenido */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0A2540] focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-[#00D4B2]"
      >
        Saltar al contenido principal
      </a>

      {/* Menú lateral (Sidebar) con fondo azul marino #0A2540 */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />

      {/* Área de contenido con Header y Footer */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          cutoffWeek={cutoffWeek}
          onCutoffWeekChange={handleCutoffWeekChange}
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenConfig={() => setIsConfigModalOpen(true)}
        />

        <main id="contenido-principal" tabIndex={-1} className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto outline-none">
          {renderActiveSection()}
        </main>

        <Footer />
      </div>

      {/* Modal de Configuración (Docente, Firebase, Reglas) */}
      <ConfiguracionModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectDataProvider>
      <AppContent />
    </ProjectDataProvider>
  );
}
