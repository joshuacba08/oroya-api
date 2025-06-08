import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useProjectList } from "../../stores";
import {
  ProjectFormData,
  projectSchema,
  validateProjectName,
} from "../../validation/schemas";
import { Button } from "../ui/button";

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<ProjectFormData>;
  isEdit?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  isEdit = false,
}) => {
  const projects = useProjectList();
  const existingProjectNames = projects.map((p) => p.name.toLowerCase());

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setError,
    clearErrors,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
    mode: "onChange",
  });

  const nameValue = watch("name");

  // Custom validation for duplicate names
  React.useEffect(() => {
    if (nameValue && touchedFields.name) {
      const customError = validateProjectName(
        nameValue,
        isEdit ? [] : existingProjectNames
      );
      if (customError) {
        setError("name", { type: "custom", message: customError });
      } else {
        clearErrors("name");
      }
    }
  }, [
    nameValue,
    touchedFields.name,
    setError,
    clearErrors,
    isEdit,
    existingProjectNames,
  ]);

  const onSubmitHandler = (data: ProjectFormData) => {
    // Final validation before submit
    const nameError = validateProjectName(
      data.name,
      isEdit ? [] : existingProjectNames
    );
    if (nameError) {
      setError("name", { type: "custom", message: nameError });
      return;
    }

    onSubmit(data);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {isEdit ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
      </h2>

      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nombre del Proyecto *
          </label>
          <input
            {...register("name")}
            type="text"
            className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-border focus:ring-primary"
            }`}
            placeholder="Ej: E-commerce API"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Debe tener entre 3-50 caracteres. Solo letras, números, espacios,
            guiones y guiones bajos.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Descripción
          </label>
          <textarea
            {...register("description")}
            className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none ${
              errors.description
                ? "border-red-500 focus:ring-red-500"
                : "border-border focus:ring-primary"
            }`}
            placeholder="Descripción opcional del proyecto"
            rows={3}
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Máximo 500 caracteres (opcional)
          </p>
        </div>

        <div className="flex space-x-3 pt-2">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={loading || !isValid}
          >
            {loading
              ? "Guardando..."
              : isEdit
              ? "Actualizar Proyecto"
              : "Crear Proyecto"}
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
    </div>
  );
};
