import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useFieldsByEntityId } from "../../stores";
import {
  FieldFormData,
  fieldSchema,
  validateFieldName,
} from "../../validation/schemas";
import { Button } from "../ui/button";

interface FieldFormProps {
  onSubmit: (data: FieldFormData) => void;
  onCancel: () => void;
  entityId: string;
  loading?: boolean;
  initialData?: Partial<FieldFormData>;
  isEdit?: boolean;
}

export const FieldForm: React.FC<FieldFormProps> = ({
  onSubmit,
  onCancel,
  entityId,
  loading = false,
  initialData,
  isEdit = false,
}) => {
  const fields = useFieldsByEntityId(entityId);
  const existingFieldNames = fields.map((f) => f.name.toLowerCase());

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setError,
    clearErrors,
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "string",
      required: initialData?.required || false,
    },
    mode: "onChange",
  });

  const nameValue = watch("name");

  // Custom validation for duplicate names and reserved keywords
  React.useEffect(() => {
    if (nameValue && touchedFields.name) {
      const customError = validateFieldName(
        nameValue,
        isEdit ? [] : existingFieldNames
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
    existingFieldNames,
  ]);

  const onSubmitHandler = (data: FieldFormData) => {
    // Final validation before submit
    const nameError = validateFieldName(
      data.name,
      isEdit ? [] : existingFieldNames
    );
    if (nameError) {
      setError("name", { type: "custom", message: nameError });
      return;
    }

    onSubmit(data);
  };

  const fieldTypes = [
    {
      value: "string",
      label: "Texto (string)",
      description: "Cadenas de texto como nombres, emails, etc.",
    },
    {
      value: "number",
      label: "Número (number)",
      description: "Números enteros o decimales",
    },
    {
      value: "boolean",
      label: "Booleano (boolean)",
      description: "Verdadero o falso",
    },
    {
      value: "date",
      label: "Fecha (date)",
      description: "Fechas y timestamps",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {isEdit ? "Editar Campo" : "Crear Nuevo Campo"}
      </h2>

      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre del Campo *
            </label>
            <input
              {...register("name")}
              type="text"
              className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-border focus:ring-primary"
              }`}
              placeholder="Ej: firstName, email, isActive"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Usar camelCase (ej: firstName, lastName, isActive)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Dato *
            </label>
            <select
              {...register("type")}
              className={`w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.type
                  ? "border-red-500 focus:ring-red-500"
                  : "border-border focus:ring-primary"
              }`}
              disabled={loading}
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.type.message}
              </p>
            )}
          </div>
        </div>

        {/* Type description */}
        <div className="bg-muted/50 rounded-md p-3">
          <p className="text-sm text-muted-foreground">
            <strong>Tipo seleccionado:</strong>{" "}
            {fieldTypes.find((t) => t.value === watch("type"))?.description}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            {...register("required")}
            type="checkbox"
            id="required"
            className="h-4 w-4 text-primary focus:ring-primary border-border rounded transition-colors"
            disabled={loading}
          />
          <label
            htmlFor="required"
            className="text-sm text-foreground cursor-pointer"
          >
            <span className="font-medium">Campo requerido</span>
            <p className="text-xs text-muted-foreground mt-1">
              Los campos requeridos deben tener un valor obligatoriamente
            </p>
          </label>
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
              ? "Actualizar Campo"
              : "Crear Campo"}
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
