import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditFile from "../components/forms/EditFile";
import { FileActionGroup, UploadButton } from "../components/ui/action-buttons";
import { Button } from "../components/ui/button";
import { FileItem, apiService } from "../services/api";
import {
  FileManagerState,
  useFileManagerStore,
} from "../stores/fileManagerStore";

export const FileManager: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const {
    // State
    selectedFiles,
    currentView,
    searchQuery,
    filterType,
    sortBy,
    sortOrder,
    storageStats,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    showUploadModal,
    dragOver,
    showPreviewModal,
    previewFile,
    previewBase64,

    // Actions
    fetchFiles,
    uploadFiles,
    uploadImages,
    deleteFile,
    deleteSelectedFiles,
    downloadFile,
    selectAllFiles,
    clearSelection,
    toggleFileSelection,
    setSearchQuery,
    setFilterType,
    setSortBy,
    setSortOrder,
    setCurrentView,
    setShowUploadModal,
    setDragOver,
    showPreview,
    hidePreview,
    fetchStorageStats,
    clearError,
    getFilteredFiles,
    formatFileSize,
    getFileIcon,
  } = useFileManagerStore();

  useEffect(() => {
    fetchFiles();
    fetchStorageStats();
  }, []);

  const filteredFiles = getFilteredFiles();

  // Menu items for navigation
  const menuItems = [
    {
      name: "Proyectos",
      href: "/projects",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      active: false,
    },
    {
      name: "Archivos",
      href: "/files",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      active: true,
    },
    {
      name: "Configuración",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      name: "Ayuda",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const handleEditFile = async (
    fileId: string,
    data: { original_name: string }
  ) => {
    try {
      await apiService.updateFile(fileId, data);
      setEditingFile(null);
      // Refresh the files list
      fetchFiles();
    } catch (error) {
      console.error("Error updating file:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const images = files.filter((file) => file.type.startsWith("image/"));
      const otherFiles = files.filter(
        (file) => !file.type.startsWith("image/")
      );

      if (images.length > 0) {
        uploadImages(images);
      }
      if (otherFiles.length > 0) {
        uploadFiles(otherFiles);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const images = fileArray.filter((file) => file.type.startsWith("image/"));
      const otherFiles = fileArray.filter(
        (file) => !file.type.startsWith("image/")
      );

      if (images.length > 0) {
        uploadImages(images);
      }
      if (otherFiles.length > 0) {
        uploadFiles(otherFiles);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderFileCard = (file: FileItem) => {
    const isSelected = selectedFiles.has(file.id);

    if (currentView === "grid") {
      return (
        <div
          key={file.id}
          className={`group relative bg-card border border-border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 ${
            isSelected ? "border-primary bg-primary/10" : "hover:border-border"
          }`}
          onClick={() => toggleFileSelection(file.id)}
          onDoubleClick={() => showPreview(file)}
        >
          <div className="p-4">
            <div className="flex items-center justify-center h-16 mb-3">
              {file.is_image && file.thumbnail_path ? (
                <img
                  src={`/api/files/${file.id}?variant=thumbnail`}
                  alt={file.original_name}
                  className="max-h-16 max-w-16 object-cover rounded border border-border"
                  onError={(e) => {
                    // Hide image and show icon instead
                    e.currentTarget.style.display = "none";
                    const iconSpan = document.createElement("span");
                    iconSpan.className = "text-4xl";
                    iconSpan.textContent = getFileIcon(file);
                    e.currentTarget.parentElement?.appendChild(iconSpan);
                  }}
                />
              ) : (
                <span className="text-4xl">{getFileIcon(file)}</span>
              )}
            </div>

            <div className="text-center">
              <h3 className="font-medium text-sm text-foreground truncate mb-1">
                {file.original_name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {isSelected && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          <FileActionGroup
            onDownload={(e) => {
              e.stopPropagation();
              downloadFile(file.id);
            }}
            onEdit={(e) => {
              e.stopPropagation();
              setEditingFile(file.id);
            }}
            onDelete={(e) => {
              e.stopPropagation();
              deleteFile(file.id);
            }}
          />
        </div>
      );
    } else {
      return (
        <tr
          key={file.id}
          className={`cursor-pointer hover:bg-accent/50 ${
            isSelected ? "bg-primary/10" : ""
          }`}
          onClick={() => toggleFileSelection(file.id)}
          onDoubleClick={() => showPreview(file)}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="mr-3 accent-primary"
              />
              <span className="text-2xl mr-3">{getFileIcon(file)}</span>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {file.original_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {file.mimetype}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
            {new Date(file.created_at).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(file.id);
              }}
              className="text-primary hover:text-primary/80 mr-3 transition-colors"
            >
              Descargar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingFile(file.id);
              }}
              className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(file.id);
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Eliminar
            </button>
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Oroya API
              </h1>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => item.href && navigate(item.href)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </button>
                ))}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="ml-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-all duration-200"
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>

            <div className="md:hidden">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-all duration-200"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Gestor de Archivos
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gestiona tus archivos y documentos en un sistema centralizado
            </p>
          </div>

          {/* Storage Stats */}
          {storageStats &&
            storageStats.uploads &&
            storageStats.thumbnails &&
            storageStats.compressed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground">
                    Archivos Totales
                  </h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {storageStats.uploads.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(storageStats.uploads.totalSize || 0)}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground">
                    Imágenes
                  </h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    {storageStats.thumbnails.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(storageStats.thumbnails.totalSize || 0)}{" "}
                    thumbnails
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground">
                    Comprimidos
                  </h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    {storageStats.compressed.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(storageStats.compressed.totalSize || 0)}{" "}
                    ahorrados
                  </p>
                </div>
              </div>
            )}

          {/* Controls */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-lg">
                  <input
                    type="text"
                    placeholder="Buscar archivos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <UploadButton onClick={() => setShowUploadModal(true)} />

                  {selectedFiles.size > 0 && (
                    <Button
                      onClick={deleteSelectedFiles}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      Eliminar Seleccionados ({selectedFiles.size})
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters and View Controls */}
            <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Filter Type */}
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as FileManagerState["filterType"]
                    )
                  }
                  className="px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todos los Archivos</option>
                  <option value="image">Imágenes</option>
                  <option value="document">Documentos</option>
                  <option value="file">Otros Archivos</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as FileManagerState["sortBy"])
                  }
                  className="px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">Fecha</option>
                  <option value="name">Nombre</option>
                  <option value="size">Tamaño</option>
                  <option value="type">Tipo</option>
                </select>

                <Button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  variant="outline"
                  size="sm"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">
                  Vista:
                </span>
                <Button
                  onClick={() => setCurrentView("grid")}
                  variant={currentView === "grid" ? "default" : "outline"}
                  size="sm"
                >
                  ⊞
                </Button>
                <Button
                  onClick={() => setCurrentView("list")}
                  variant={currentView === "list" ? "default" : "outline"}
                  size="sm"
                >
                  ☰
                </Button>

                <div className="ml-4 flex items-center gap-2">
                  <Button
                    onClick={selectAllFiles}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                  >
                    Seleccionar Todo
                  </Button>
                  <Button
                    onClick={clearSelection}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-red-900/50 dark:border-red-800">
              <div className="flex justify-between items-center">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground">Subiendo archivos...</span>
                <span className="text-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Files Display */}
          <div
            className={`bg-card border border-border rounded-lg ${
              dragOver ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Cargando archivos...
                </p>
              </div>
            ) : filteredFiles.length > 0 ? (
              currentView === "grid" ? (
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredFiles.map(renderFileCard)}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Tamaño
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredFiles.map(renderFileCard)}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="p-12 text-center">
                {dragOver ? (
                  <div>
                    <p className="text-2xl text-primary mb-2">📂</p>
                    <p className="text-lg font-medium text-primary">
                      Suelta los archivos aquí para subirlos
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-6xl text-muted-foreground mb-4">📁</p>
                    <p className="text-xl font-medium text-muted-foreground mb-2">
                      No se encontraron archivos
                    </p>
                    <p className="text-muted-foreground">
                      Sube archivos o ajusta tus filtros
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Editing */}
          {editingFile && (
            <div className="bg-card border border-border rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Editar Archivo
              </h3>
              <EditFile
                file={filteredFiles.find((f) => f.id === editingFile)!}
                onSave={(data) => handleEditFile(editingFile, data)}
                onCancel={() => setEditingFile(null)}
              />
            </div>
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    Subir Archivos
                  </h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <p className="text-4xl text-muted-foreground mb-4">📁</p>
                  <p className="text-lg font-medium text-foreground mb-2">
                    Arrastra archivos aquí o haz click para explorar
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Soporta imágenes, documentos y archivos generales
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Elegir Archivos
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreviewModal && previewFile && (
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    {previewFile.original_name}
                  </h3>
                  <button
                    onClick={hidePreview}
                    className="text-muted-foreground hover:text-foreground text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="text-center">
                  {previewFile.is_image && previewBase64 ? (
                    <img
                      src={`data:${previewFile.mimetype};base64,${previewBase64}`}
                      alt={previewFile.original_name}
                      className="max-w-full max-h-96 mx-auto rounded border border-border"
                    />
                  ) : (
                    <div className="py-12">
                      <span className="text-8xl">
                        {getFileIcon(previewFile)}
                      </span>
                      <p className="mt-4 text-lg text-muted-foreground">
                        Vista previa no disponible
                      </p>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <span className="font-medium text-foreground">
                        Tamaño:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {formatFileSize(previewFile.size)}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-foreground">Tipo:</span>{" "}
                      <span className="text-muted-foreground">
                        {previewFile.mimetype}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-foreground">
                        Creado:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {new Date(previewFile.created_at).toLocaleString()}
                      </span>
                    </div>
                    {previewFile.is_image &&
                      previewFile.width &&
                      previewFile.height && (
                        <div className="text-left">
                          <span className="font-medium text-foreground">
                            Dimensiones:
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {previewFile.width} × {previewFile.height}
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="mt-6 flex justify-center gap-3">
                    <Button
                      onClick={() => downloadFile(previewFile.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Descargar
                    </Button>
                    <Button
                      onClick={() => {
                        deleteFile(previewFile.id);
                        hidePreview();
                      }}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
