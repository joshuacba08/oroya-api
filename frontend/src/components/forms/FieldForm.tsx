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
      isUnique: initialData?.isUnique || false,
      defaultValue: initialData?.defaultValue || "",
      maxLength: initialData?.maxLength || undefined,
      description: initialData?.description || "",
      acceptsMultiple: initialData?.acceptsMultiple || false,
      maxFileSize: initialData?.maxFileSize || undefined,
      allowedExtensions: initialData?.allowedExtensions || "",
    },
    mode: "onChange",
  });

  const nameValue = watch("name");
  const typeValue = watch("type");

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
      value: "text",
      label: "Texto largo (text)",
      description: "Texto extenso, comentarios, descripciones",
    },
    {
      value: "number",
      label: "Número (number)",
      description: "Números enteros o decimales",
    },
    {
      value: "integer",
      label: "Entero (integer)",
      description: "Números enteros únicamente",
    },
    {
      value: "decimal",
      label: "Decimal (decimal)",
      description: "Números decimales con precisión específica",
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
    {
      value: "file",
      label: "Archivo (file)",
      description: "Archivos generales",
    },
    {
      value: "image",
      label: "Imagen (image)",
      description: "Archivos de imagen",
    },
    {
      value: "document",
      label: "Documento (document)",
      description: "Documentos PDF, Word, etc.",
    },
  ];

  const isFileType = ["file", "image", "document"].includes(typeValue);
  const isTextType = ["string", "text"].includes(typeValue);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {isEdit ? "Editar Campo" : "Crear Nuevo Campo"}
      </h2>

      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
            Información Básica
          </h3>

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
              {fieldTypes.find((t) => t.value === typeValue)?.description}
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
              placeholder="Descripción opcional del campo"
              rows={3}
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Descripción opcional para documentar el propósito del campo
            </p>
          </div>
        </div>

        {/* Configuración de Validación */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
            Configuración de Validación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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

              <div className="flex items-center space-x-3">
                <input
                  {...register("isUnique")}
                  type="checkbox"
                  id="isUnique"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded transition-colors"
                  disabled={loading}
                />
                <label
                  htmlFor="isUnique"
                  className="text-sm text-foreground cursor-pointer"
                >
                  <span className="font-medium">Valor único</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    No se permiten valores duplicados para este campo
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Valor por defecto
                </label>
                <input
                  {...register("defaultValue")}
                  type="text"
                  className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    errors.defaultValue
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  }`}
                  placeholder="Valor por defecto (opcional)"
                  disabled={loading}
                />
                {errors.defaultValue && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.defaultValue.message}
                  </p>
                )}
              </div>

              {isTextType && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Longitud máxima
                  </label>
                  <input
                    {...register("maxLength", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      errors.maxLength
                        ? "border-red-500 focus:ring-red-500"
                        : "border-border focus:ring-primary"
                    }`}
                    placeholder="Ej: 255"
                    disabled={loading}
                  />
                  {errors.maxLength && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.maxLength.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Número máximo de caracteres permitidos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuración específica para archivos */}
        {isFileType && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
              Configuración de Archivos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  {...register("acceptsMultiple")}
                  type="checkbox"
                  id="acceptsMultiple"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded transition-colors"
                  disabled={loading}
                />
                <label
                  htmlFor="acceptsMultiple"
                  className="text-sm text-foreground cursor-pointer"
                >
                  <span className="font-medium">Múltiples archivos</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Permitir cargar varios archivos en este campo
                  </p>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tamaño máximo (MB)
                </label>
                <input
                  {...register("maxFileSize", { valueAsNumber: true })}
                  type="number"
                  min="0.1"
                  step="0.1"
                  className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    errors.maxFileSize
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  }`}
                  placeholder="Ej: 10"
                  disabled={loading}
                />
                {errors.maxFileSize && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.maxFileSize.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Extensiones permitidas
              </label>
              <input
                {...register("allowedExtensions")}
                type="text"
                className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.allowedExtensions
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="Ej: .jpg,.png,.pdf,.docx"
                disabled={loading}
              />
              {errors.allowedExtensions && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.allowedExtensions.message}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Extensiones separadas por comas (opcional). Dejar vacío para
                permitir cualquier tipo
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t border-border">
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
