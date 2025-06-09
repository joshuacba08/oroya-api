import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useEntityStore, useProjectStore } from "../stores";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const { currentProject, getProjectById, setCurrentProject } =
    useProjectStore();

  const {
    loading,
    error,
    fetchEntitiesByProjectId,
    createEntity,
    getEntitiesByProjectId,
  } = useEntityStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEntity, setNewEntity] = useState({
    name: "",
    description: "",
  });

  const handleLogout = () => {
    navigate("/");
  };

  const handleBackToProjects = () => {
    navigate("/projects");
  };

  const handleEntityClick = (entityId: string) => {
    navigate(`/projects/${projectId}/entities/${entityId}/fields`);
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      await createEntity({
        projectId: projectId,
        name: newEntity.name,
        description: newEntity.description,
      });

      setNewEntity({ name: "", description: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating entity:", error);
    }
  };

  // Load project and entities on component mount
  useEffect(() => {
    if (!projectId) {
      navigate("/projects");
      return;
    }

    // Set current project
    const project = getProjectById(projectId);
    if (project) {
      setCurrentProject(project);
    }

    // Fetch entities for this project
    fetchEntitiesByProjectId(projectId);
  }, [
    projectId,
    navigate,
    getProjectById,
    setCurrentProject,
    fetchEntitiesByProjectId,
  ]);

  // Get entities for current project
  const projectEntities = projectId ? getEntitiesByProjectId(projectId) : [];

  // Debug logging
  console.log("🏠 Home - Current projectId:", projectId);
  console.log("🏠 Home - Project entities:", projectEntities);
  console.log("🏠 Home - Loading state:", loading);

  const menuItems = [
    {
      name: "Proyectos",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      onClick: handleBackToProjects,
    },
    {
      name: "Entidades",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      active: true,
    },
    {
      name: "Configuración",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      name: "Ayuda",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Proyecto no encontrado
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
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Oroya API
              </h1>
              <div className="text-sm text-muted-foreground">
                / {currentProject.name}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </button>
                ))}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="ml-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-all duration-200"
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>

            <div className="md:hidden">
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
                <span className="text-foreground font-medium">
                  {currentProject.name}
                </span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {currentProject.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                {currentProject.description ||
                  "Gestiona las entidades de este proyecto"}
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
              Nueva Entidad
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

          {/* Create Entity Form */}
          {showCreateForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Crear Nueva Entidad
              </h2>
              <form onSubmit={handleCreateEntity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de la Entidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEntity.name}
                    onChange={(e) =>
                      setNewEntity({ ...newEntity, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: User, Product, Order"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newEntity.description}
                    onChange={(e) =>
                      setNewEntity({
                        ...newEntity,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Descripción opcional de la entidad"
                    rows={3}
                    disabled={loading}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Creando..." : "Crear Entidad"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewEntity({ name: "", description: "" });
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Entities List */}
          {projectEntities.length === 0 ? (
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay entidades
              </h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera entidad para comenzar a definir la estructura de
                tu API
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Crear Primera Entidad
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectEntities.map((entity) => (
                <div
                  key={entity.id}
                  onClick={() => handleEntityClick(entity.id)}
                  className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:border-primary/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
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
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {entity.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {entity.description || "Sin descripción"}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Creado: {new Date(entity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
