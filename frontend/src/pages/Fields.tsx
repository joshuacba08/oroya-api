import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditField from "../components/forms/EditField";
import { FieldForm } from "../components/forms/FieldForm";
import { Button } from "../components/ui/button";
import { useEntityStore, useFieldStore, useProjectStore } from "../stores";
import { Field } from "../stores/fieldStore";
import { FieldFormData } from "../validation/schemas";

const Fields: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, entityId } = useParams<{
    projectId: string;
    entityId: string;
  }>();

  const { currentProject, getProjectById, setCurrentProject } =
    useProjectStore();

  const { currentEntity, getEntityById, setCurrentEntity } = useEntityStore();

  const {
    loading,
    error,
    fetchFieldsByEntityId,
    createField,
    deleteField,
    getFieldsByEntityId,
    updateFieldRemote,
  } = useFieldStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleLogout = () => {
    navigate("/");
  };

  const handleBackToProjects = () => {
    navigate("/projects");
  };

  const handleBackToEntities = () => {
    navigate(`/projects/${projectId}/entities`);
  };

  const handleCreateField = async (data: FieldFormData) => {
    if (!projectId || !entityId) return;

    try {
      // Transform FieldFormData to Field format
      await createField(projectId, {
        entityId: entityId,
        name: data.name,
        type: data.type,
        required: data.required,
        isUnique: data.isUnique,
        defaultValue: data.defaultValue || null,
        maxLength: data.maxLength || null,
        description: data.description || null,
        acceptsMultiple: data.acceptsMultiple,
        maxFileSize: data.maxFileSize || null,
        allowedExtensions: data.allowedExtensions || null,
      });

      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating field:", error);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      deleteField(fieldId);
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  const handleEditField = async (fieldId: string, data: Partial<Field>) => {
    try {
      if (projectId && entityId) {
        await updateFieldRemote(projectId, entityId, fieldId, data);
        setEditingField(null);
      }
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  // Load project, entity and fields on component mount
  useEffect(() => {
    if (!projectId || !entityId) {
      navigate("/projects");
      return;
    }

    // Set current project
    const project = getProjectById(projectId);
    if (project) {
      setCurrentProject(project);
    }

    // Set current entity
    const entity = getEntityById(entityId);
    if (entity) {
      setCurrentEntity(entity);
    }

    // Fetch fields for this entity
    fetchFieldsByEntityId(projectId, entityId);
  }, [
    projectId,
    entityId,
    navigate,
    getProjectById,
    setCurrentProject,
    getEntityById,
    setCurrentEntity,
    fetchFieldsByEntityId,
  ]);

  // Get fields for current entity
  const entityFields = entityId ? getFieldsByEntityId(entityId) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Cargando campos...</p>
        </div>
      </div>
    );
  }

  if (!currentProject || !currentEntity) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Entidad no encontrada
          </h2>
          <Button onClick={handleBackToProjects}>Volver a Proyectos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Oroya API
              </h1>
              <div className="text-sm text-muted-foreground">
                / {currentProject.name} / {currentEntity.name}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-all duration-200"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={handleBackToProjects}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Proyectos
                </button>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 text-muted-foreground mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <button
                  onClick={handleBackToEntities}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {currentProject.name}
                </button>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 text-muted-foreground mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="text-foreground font-medium">
                  {currentEntity.name}
                </span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Campos de {currentEntity.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                Define la estructura de datos de tu entidad
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              disabled={loading}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Nuevo Campo
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-red-900/50 dark:border-red-800">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Create Field Form */}
          {showCreateForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Crear Nuevo Campo
              </h2>
              <FieldForm
                onSubmit={handleCreateField}
                onCancel={() => setShowCreateForm(false)}
                entityId={entityId!}
                loading={loading}
              />
            </div>
          )}

          {/* Fields List */}
          {entityFields.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay campos
              </h3>
              <p className="text-muted-foreground mb-4">
                Agrega campos para definir la estructura de tu entidad
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Crear Primer Campo
              </Button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  Campos Definidos
                </h3>
              </div>
              <div className="divide-y divide-border">
                {entityFields.map((field) => (
                  <div key={field.id}>
                    {editingField === field.id ? (
                      <div className="px-6 py-4">
                        <h4 className="text-lg font-semibold text-foreground mb-4">
                          Editar Campo
                        </h4>
                        <EditField
                          field={field}
                          onSave={(data: Partial<Field>) =>
                            handleEditField(field.id, data)
                          }
                          onCancel={() => setEditingField(null)}
                          loading={loading}
                        />
                      </div>
                    ) : (
                      <div className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-foreground font-medium text-lg">
                                  {field.name}
                                </h4>
                                <div className="flex space-x-1">
                                  {field.required && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                      Requerido
                                    </span>
                                  )}
                                  {field.isUnique && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                      Único
                                    </span>
                                  )}
                                  {field.acceptsMultiple && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Múltiple
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div>
                                  <span className="font-medium">Tipo:</span>{" "}
                                  {field.type}
                                </div>
                                {field.defaultValue && (
                                  <div>
                                    <span className="font-medium">
                                      Valor por defecto:
                                    </span>{" "}
                                    {field.defaultValue}
                                  </div>
                                )}
                                {field.maxLength && (
                                  <div>
                                    <span className="font-medium">
                                      Longitud máxima:
                                    </span>{" "}
                                    {field.maxLength}
                                  </div>
                                )}
                                {field.maxFileSize && (
                                  <div>
                                    <span className="font-medium">
                                      Tamaño máximo:
                                    </span>{" "}
                                    {field.maxFileSize}MB
                                  </div>
                                )}
                                {field.allowedExtensions && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium">
                                      Extensiones:
                                    </span>{" "}
                                    {field.allowedExtensions}
                                  </div>
                                )}
                              </div>

                              {field.description && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      Descripción:
                                    </span>{" "}
                                    {field.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setEditingField(field.id)}
                              variant="outline"
                              size="sm"
                              className="text-primary border-primary/30 hover:bg-primary/10"
                              disabled={loading}
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeleteField(field.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
                              disabled={loading}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Fields;
