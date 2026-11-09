/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 border-t border-[#E2E8F0] bg-white text-center text-xs text-[#2D3748]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-medium text-[#2D3748]">
          IMPULSA · Professional Certificate en IA para la Gestión de Proyectos · Continental Florida University
        </p>
        <p className="text-[11px] text-[#718096]">
          Estándar Guía PMBOK 8 (PMI, 2025) · Accesibilidad WCAG AA
        </p>
      </div>
    </footer>
  );
};
