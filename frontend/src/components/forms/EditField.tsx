import React from "react";
import { Field } from "../../stores/fieldStore";
import { FieldFormData } from "../../validation/schemas";
import { FieldForm } from "./FieldForm";

interface EditFieldProps {
  field: Field;
  onSave: (data: Partial<Field>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EditField: React.FC<EditFieldProps> = ({
  field,
  onSave,
  onCancel,
  loading = false,
}) => {
  const handleSubmit = (data: FieldFormData) => {
    // Transform FieldFormData to Field format
    const fieldData: Partial<Field> = {
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
    };

    onSave(fieldData);
  };

  // Transform Field to FieldFormData for initial values
  const initialData: Partial<FieldFormData> = {
    name: field.name,
    type: field.type,
    required: field.required,
    isUnique: field.isUnique || false,
    defaultValue: field.defaultValue || "",
    maxLength: field.maxLength || undefined,
    description: field.description || "",
    acceptsMultiple: field.acceptsMultiple || false,
    maxFileSize: field.maxFileSize || undefined,
    allowedExtensions: field.allowedExtensions || "",
  };

  return (
    <FieldForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      entityId={field.entityId}
      loading={loading}
      initialData={initialData}
      isEdit={true}
    />
  );
};

export default EditField;
