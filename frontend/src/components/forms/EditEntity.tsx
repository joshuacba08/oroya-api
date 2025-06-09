import React, { useState } from "react";
import { Entity } from "../../stores/entityStore";
import { Button } from "../ui/button";

interface EditEntityProps {
  entity: Entity;
  onSave: (data: Partial<Entity>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EditEntity: React.FC<EditEntityProps> = ({
  entity,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: entity.name,
    description: entity.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nombre de la Entidad *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nombre de la entidad"
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
          placeholder="Descripción de la entidad"
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

export default EditEntity;
