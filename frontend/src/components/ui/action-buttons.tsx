import * as React from "react";
import { cn } from "../../lib/utils";
import { Button, ButtonProps } from "./button";

// Download Icon
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

// Edit Icon
const EditIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

// Delete Icon
const DeleteIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// Upload Icon
const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
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
);

// Save Icon
const SaveIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// Cancel Icon
const CancelIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// Action Button Props
interface ActionButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  size?: "sm" | "default" | "icon-sm" | "icon-xs";
  showText?: boolean;
}

// Upload Button
export const UploadButton = ({
  children,
  size = "default",
  showText = true,
  className,
  ...props
}: ActionButtonProps) => (
  <Button
    variant="gradient"
    size={size}
    className={cn("shadow-lg", className)}
    {...props}
  >
    <UploadIcon />
    {showText && (children || "Subir Archivos")}
  </Button>
);

// Download Button
export const DownloadButton = ({
  children,
  size = "icon-sm",
  showText = false,
  className,
  ...props
}: ActionButtonProps) => (
  <Button
    variant="action-primary"
    size={size}
    className={className}
    title={!showText ? "Descargar" : undefined}
    {...props}
  >
    <DownloadIcon className={showText ? "w-3 h-3" : undefined} />
    {showText && (children || "Descargar")}
  </Button>
);

// Edit Button
export const EditButton = ({
  children,
  size = "icon-sm",
  showText = false,
  className,
  ...props
}: ActionButtonProps) => (
  <Button
    variant="action-success"
    size={size}
    className={className}
    title={!showText ? "Editar" : undefined}
    {...props}
  >
    <EditIcon className={showText ? "w-3 h-3" : undefined} />
    {showText && (children || "Editar")}
  </Button>
);

// Delete Button
export const DeleteButton = ({
  children,
  size = "icon-sm",
  showText = false,
  className,
  ...props
}: ActionButtonProps) => (
  <Button
    variant="action-danger"
    size={size}
    className={className}
    title={!showText ? "Eliminar" : undefined}
    {...props}
  >
    <DeleteIcon className={showText ? "w-3 h-3" : undefined} />
    {showText && (children || "Eliminar")}
  </Button>
);

// Save Button
export const SaveButton = ({
  children,
  size = "default",
  showText = true,
  className,
  loading,
  ...props
}: ActionButtonProps) => (
  <Button
    variant="success"
    size={size}
    className={className}
    loading={loading}
    {...props}
  >
    {!loading && <SaveIcon />}
    {showText && (children || (loading ? "Guardando..." : "Guardar"))}
  </Button>
);

// Cancel Button
export const CancelButton = ({
  children,
  size = "default",
  showText = true,
  className,
  ...props
}: ActionButtonProps) => (
  <Button variant="outline" size={size} className={className} {...props}>
    {showText && <CancelIcon />}
    {showText && (children || "Cancelar")}
  </Button>
);

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup = ({ children, className }: ButtonGroupProps) => (
  <div className={cn("flex space-x-2", className)}>{children}</div>
);

// File Action Group Props
interface FileActionGroupProps {
  onDownload: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

// File Action Group
export const FileActionGroup = ({
  onDownload,
  onEdit,
  onDelete,
  className,
}: FileActionGroupProps) => (
  <div
    className={cn(
      "absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1",
      className
    )}
  >
    <DownloadButton onClick={onDownload} />
    <EditButton onClick={onEdit} />
    <DeleteButton onClick={onDelete} />
  </div>
);
