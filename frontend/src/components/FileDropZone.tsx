import React, { useRef } from "react";

interface FileDropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  accept,
  multiple = true,
  disabled = false,
  className = "",
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
        ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {children || (
        <div className="p-8 text-center">
          <div className="text-4xl text-gray-300 mb-4">
            {isDragOver ? "📂" : "📁"}
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragOver
              ? "Drop files here"
              : "Drop files here or click to browse"}
          </p>
          <p className="text-sm text-gray-500">
            {accept ? `Accepts: ${accept}` : "Supports all file types"}
          </p>
        </div>
      )}

      {isDragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="text-blue-600 font-medium text-lg">
            Drop to upload
          </div>
        </div>
      )}
    </div>
  );
};
