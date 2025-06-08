import React from "react";
import {
  useEntityStats,
  useFieldStats,
  useGlobalError,
  useGlobalLoading,
  useProjectStats,
} from "../stores";

export const AppStatus: React.FC = () => {
  const isLoading = useGlobalLoading();
  const globalError = useGlobalError();
  const projectStats = useProjectStats();
  const entityStats = useEntityStats();
  const fieldStats = useFieldStats();

  const features = [
    {
      name: "🚀 API Integration",
      status: "implemented",
      description: "Servicio centralizado con axios, interceptores y fallbacks",
    },
    {
      name: "💾 Persistencia LocalStorage",
      status: "implemented",
      description: "Datos persistidos automáticamente con Zustand persist",
    },
    {
      name: "⚡ Selectors Optimizados",
      status: "implemented",
      description: "Selectors para mejor performance y reutilización",
    },
    {
      name: "✅ Validaciones Robustas",
      status: "implemented",
      description:
        "Esquemas Zod + React Hook Form con validaciones personalizadas",
    },
    {
      name: "🎯 Formularios Avanzados",
      status: "implemented",
      description: "Validación en tiempo real, palabras reservadas, duplicados",
    },
    {
      name: "📊 Estados Globales",
      status: "implemented",
      description: "Loading, error y stats centralizados",
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-card border border-border rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-semibold text-foreground mb-3 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Estado de la App
      </h3>

      {/* Global Status */}
      <div className="space-y-2 mb-4">
        {isLoading && (
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
            Cargando...
          </div>
        )}

        {globalError && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            <div className="flex items-start">
              <span className="text-xs mr-1">⚠️</span>
              <span>{globalError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="text-center">
          <div className="font-semibold text-primary">
            {projectStats.totalProjects}
          </div>
          <div className="text-muted-foreground">Proyectos</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-primary">
            {entityStats.totalEntities}
          </div>
          <div className="text-muted-foreground">Entidades</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-primary">
            {fieldStats.totalFields}
          </div>
          <div className="text-muted-foreground">Campos</div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">
          Características Implementadas:
        </h4>
        {features.map((feature, index) => (
          <div key={index} className="flex items-start text-xs">
            <span className="text-green-500 mr-2 mt-0.5">✓</span>
            <div>
              <div className="font-medium text-foreground">{feature.name}</div>
              <div className="text-muted-foreground text-xs">
                {feature.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Storage:</span>
            <span className="text-green-600 dark:text-green-400">Active</span>
          </div>
          <div className="flex justify-between">
            <span>Validation:</span>
            <span className="text-green-600 dark:text-green-400">Active</span>
          </div>
          <div className="flex justify-between">
            <span>API:</span>
            <span className="text-amber-600 dark:text-amber-400">
              Mock Mode
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
