import { useState } from "react";
import {
  useApiInfo,
  useCreateProject,
  useHealthCheck,
  useProjects,
} from "../../lib/react-query";

export function ApiExample() {
  const [projectName, setProjectName] = useState("");

  // Queries
  const { data: health, isLoading: healthLoading } = useHealthCheck();
  const { data: apiInfo, isLoading: apiInfoLoading } = useApiInfo();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  // Mutations
  const createProjectMutation = useCreateProject();

  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProjectMutation.mutate({
        name: projectName,
        description: `Proyecto creado desde el frontend: ${projectName}`,
      });
      setProjectName("");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Example</h1>

      {/* Health Check */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Health Check</h2>
        {healthLoading ? (
          <p>Loading health status...</p>
        ) : health ? (
          <div className="text-green-600">
            <p>Status: {health.status}</p>
            <p>Message: {health.message}</p>
            <p>Timestamp: {health.timestamp}</p>
          </div>
        ) : (
          <p className="text-red-600">Health check failed</p>
        )}
      </div>

      {/* API Info */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">API Information</h2>
        {apiInfoLoading ? (
          <p>Loading API info...</p>
        ) : apiInfo ? (
          <div>
            <p>
              <strong>Name:</strong> {apiInfo.name}
            </p>
            <p>
              <strong>Version:</strong> {apiInfo.version}
            </p>
            <p>
              <strong>Description:</strong> {apiInfo.description}
            </p>
          </div>
        ) : (
          <p className="text-red-600">Failed to load API info</p>
        )}
      </div>

      {/* Projects */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Projects</h2>

        {/* Create Project Form */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="px-3 py-2 border rounded flex-1"
          />
          <button
            onClick={handleCreateProject}
            disabled={createProjectMutation.isPending || !projectName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
          </button>
        </div>

        {createProjectMutation.isError && (
          <p className="text-red-600 mb-2">
            Error: {createProjectMutation.error?.message}
          </p>
        )}

        {/* Projects List */}
        {projectsLoading ? (
          <p>Loading projects...</p>
        ) : projects ? (
          <div>
            <p className="mb-2">Total projects: {projects.length}</p>
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="p-2 bg-gray-50 rounded">
                  <h3 className="font-medium">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-red-600">Failed to load projects</p>
        )}
      </div>
    </div>
  );
}
