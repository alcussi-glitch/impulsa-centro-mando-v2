/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Mail,
  CheckCircle2,
  X,
  Database,
  Lock,
  Eye,
  LogOut,
  LogIn,
  RefreshCw,
} from 'lucide-react';
import { useProjectData } from '../../context/ProjectDataContext.tsx';
import firebaseConfig from '../../../firebase-applet-config.json';

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    signInWithGoogle,
    signOutUser,
    isAuthLoading,
    sharedDocenteEmail,
    updateDocenteEmail,
    syncStatus,
    syncSecondsAgo,
    projectData,
  } = useProjectData();

  const [emailInput, setEmailInput] = useState(sharedDocenteEmail || '');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    setEmailInput(sharedDocenteEmail || '');
  }, [sharedDocenteEmail]);

  if (!isOpen) return null;

  const handleSaveDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    setSuccessMsg(false);
    try {
      await updateDocenteEmail(emailInput);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="config-modal-titulo"
    >
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 text-[#2D3748]">
        {/* Encabezado */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#00D4B2]">
                Centro de Mando · Configuración
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">Firebase Backend</span>
            </div>
            <h2 id="config-modal-titulo" className="text-xl font-bold text-[#0A2540] font-['Montserrat']">
              Seguridad, Accesos y Conexión en Tiempo Real
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#0A2540] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#00D4B2]"
            aria-label="Cerrar configuración"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5 text-xs">
          {/* 1. Estado de Autenticación con Google */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F7FAFC]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <img
                      src={user.photoURL || 'https://lh3.googleusercontent.com/a/default-user'}
                      alt={user.displayName || 'Usuario'}
                      className="w-10 h-10 rounded-full border border-[#00D4B2]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#0A2540] text-sm">{user.displayName}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded">
                          Autenticado
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="font-bold text-[#0A2540] text-sm">Sesión no iniciada</span>
                    <p className="text-slate-500 text-[11px]">
                      Inicia sesión con tu cuenta de Google para sincronizar tus proyectos en Cloud Firestore.
                    </p>
                  </div>
                )}
              </div>

              {user ? (
                <button
                  type="button"
                  onClick={signOutUser}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors self-start sm:self-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar sesión</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isAuthLoading}
                  onClick={signInWithGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0A2540] hover:bg-[#0A2540]/90 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
                >
                  <LogIn className="w-4 h-4 text-[#00D4B2]" />
                  <span>{isAuthLoading ? 'Iniciando...' : 'Iniciar con Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Requisito 2: Autorizar acceso de solo lectura al docente */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00D4B2]" />
              <h3 className="font-bold text-[#0A2540] text-sm font-['Montserrat']">
                Autorización de acceso de solo lectura (Docente / Revisor)
              </h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Indica el correo de tu docente de Continental Florida University para autorizarle acceso de <strong>solo lectura</strong> a tus proyectos mediante las reglas de seguridad de Firestore. Nadie más podrá ver ni modificar tu información.
            </p>

            <form onSubmit={handleSaveDocente} className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="docente@continental.edu.pe"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4B2]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="px-4 py-2 bg-[#0A2540] text-white font-semibold rounded-lg hover:bg-[#0A2540]/90 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  {isSavingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4B2]" />}
                  <span>Guardar autorización</span>
                </button>
              </div>

              {successMsg && (
                <p className="text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acceso de solo lectura actualizado correctamente para: <strong>{sharedDocenteEmail}</strong></span>
                </p>
              )}
            </form>
          </div>

          {/* 3. Requisito 4: Explicación en lenguaje sencillo de las reglas de seguridad */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F7FAFC] space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0A2540]" />
              <h3 className="font-bold text-[#0A2540] text-sm font-['Montserrat']">
                ¿Cómo protegen tus datos las reglas de seguridad? (Lenguaje sencillo)
              </h3>
            </div>
            <ul className="space-y-2 text-slate-700 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#00D4B2] font-bold text-sm leading-none">•</span>
                <span><strong>Privacidad total del estudiante:</strong> Cada persona gestora solo puede crear, leer, editar y borrar sus propios proyectos (verificado mediante tu identidad de Google).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00D4B2] font-bold text-sm leading-none">•</span>
                <span><strong>Permiso exclusivo de lectura para el docente:</strong> Si autorizas un correo docente, Firestore le permite ver los informes y tableros, pero bloquea cualquier intento de edición o borrado.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00D4B2] font-bold text-sm leading-none">•</span>
                <span><strong>Jerarquía protegida (Master Gate):</strong> Todas las 26 subcolecciones (actividades, riesgos, bitácora IA, etc.) validan que quien escribe sea el dueño del proyecto principal.</span>
              </li>
            </ul>
          </div>

          {/* 4. Requisito 4: Dónde ver los datos en la consola de Firebase */}
          <div className="p-4 rounded-xl border border-[#0A2540]/20 bg-[#0A2540]/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0A2540]" />
                <h3 className="font-bold text-[#0A2540] text-sm font-['Montserrat']">
                  Consola de Cloud Firestore
                </h3>
              </div>
              <a
                href={firebaseConsoleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#0A2540] font-bold hover:underline"
              >
                <span>Abrir en Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Puedes inspeccionar los documentos en vivo en la consola oficial de Firebase bajo la colección <strong>«proyectos»</strong> y sus subcolecciones correspondientes (<code>actividades</code>, <code>avance_semanal</code>, <code>riesgos</code>, <code>cargas</code>, <code>bitacora_ia</code>, etc.).
            </p>
            <div className="bg-white p-2.5 rounded border border-[#E2E8F0] font-mono text-[10px] text-slate-700 truncate">
              ID Base de datos: {firebaseConfig.firestoreDatabaseId}
            </div>
          </div>
        </div>

        {/* Pie de modal */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#0A2540] text-white text-xs font-semibold rounded-lg hover:bg-[#0A2540]/90 transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
