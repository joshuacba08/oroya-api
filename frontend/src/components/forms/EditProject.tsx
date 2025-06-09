import React, { useState } from "react";
import { Project } from "../../stores/projectStore";
import { Button } from "../ui/button";

interface EditProjectProps {
  project: Project;
  onSave: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EditProject: React.FC<EditProjectProps> = ({
  project,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nombre del Proyecto *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nombre del proyecto"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Descripción del proyecto"
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
          {loading ? "Guardando..." : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default EditProject;
