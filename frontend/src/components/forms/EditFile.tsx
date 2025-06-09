import React, { useState } from "react";
import { FileItem } from "../../services/api";
import { ButtonGroup, CancelButton, SaveButton } from "../ui/action-buttons";

interface EditFileProps {
  file: FileItem;
  onSave: (data: { original_name: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EditFile: React.FC<EditFileProps> = ({
  file,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [fileName, setFileName] = useState(file.original_name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ original_name: fileName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nombre del Archivo *
        </label>
        <input
          type="text"
          required
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nombre del archivo"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Tipo: {file.mimetype} • Tamaño: {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <ButtonGroup>
        <SaveButton
          type="submit"
          loading={loading}
          disabled={loading || fileName.trim() === ""}
        />
        <CancelButton type="button" onClick={onCancel} disabled={loading} />
      </ButtonGroup>
    </form>
  );
};

export default EditFile;
