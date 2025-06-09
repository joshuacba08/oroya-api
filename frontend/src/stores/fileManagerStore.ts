import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  apiService,
  FileItem,
  FileUploadBase64Data,
  FileVariant,
  StorageStats,
} from "../services/api";

// Enable MapSet support for Immer
enableMapSet();

export interface FileManagerState {
  // Files data
  files: FileItem[];
  selectedFiles: Set<string>;
  currentView: "grid" | "list";

  // Filter and search
  searchQuery: string;
  filterType: "all" | "image" | "document" | "file";
  sortBy: "name" | "size" | "date" | "type";
  sortOrder: "asc" | "desc";

  // Statistics
  storageStats: StorageStats | null;

  // UI State
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Upload modal
  showUploadModal: boolean;
  dragOver: boolean;

  // Preview modal
  showPreviewModal: boolean;
  previewFile: FileItem | null;
  previewBase64: string | null;
}

export interface FileManagerActions {
  // File operations
  fetchFiles: () => Promise<void>;
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  uploadImages: (images: FileList | File[]) => Promise<void>;
  uploadFromBase64: (data: FileUploadBase64Data) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteSelectedFiles: () => Promise<void>;
  downloadFile: (fileId: string, variant?: FileVariant) => Promise<void>;

  // Selection
  selectFile: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  toggleFileSelection: (fileId: string) => void;

  // Filtering and sorting
  setSearchQuery: (query: string) => void;
  setFilterType: (type: FileManagerState["filterType"]) => void;
  setSortBy: (sortBy: FileManagerState["sortBy"]) => void;
  setSortOrder: (order: FileManagerState["sortOrder"]) => void;

  // View
  setCurrentView: (view: FileManagerState["currentView"]) => void;

  // Modals
  setShowUploadModal: (show: boolean) => void;
  setDragOver: (dragOver: boolean) => void;
  showPreview: (file: FileItem) => Promise<void>;
  hidePreview: () => void;

  // Statistics
  fetchStorageStats: () => Promise<void>;

  // Utility
  clearError: () => void;
  getFilteredFiles: () => FileItem[];
  formatFileSize: (bytes: number) => string;
  getFileIcon: (file: FileItem) => string;
}

export type FileManagerStore = FileManagerState & FileManagerActions;

export const useFileManagerStore = create<FileManagerStore>()(
  immer((set, get) => ({
    // Initial state
    files: [],
    selectedFiles: new Set(),
    currentView: "grid",
    searchQuery: "",
    filterType: "all",
    sortBy: "date",
    sortOrder: "desc",
    storageStats: null,
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    showUploadModal: false,
    dragOver: false,
    showPreviewModal: false,
    previewFile: null,
    previewBase64: null,

    // File operations
    fetchFiles: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const files = await apiService.getAllFiles();
        // Normalize is_image from backend (number to boolean)
        const normalizedFiles = files.map((file) => ({
          ...file,
          is_image: Boolean(file.is_image),
        }));

        set((state) => {
          state.files = normalizedFiles;
          state.isLoading = false;
        });
      } catch (error) {
        console.error("Error fetching files from API:", error);
        // Fallback to mock data when API is not available
        const mockFiles: FileItem[] = [
          {
            id: "1",
            original_name: "proyecto-frontend.zip",
            filename: "uuid-1.zip",
            mimetype: "application/zip",
            size: 5242880, // 5MB
            path: "/storage/uploads/uuid-1.zip",
            is_image: false,
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            original_name: "diseño-ui.png",
            filename: "uuid-2.png",
            mimetype: "image/png",
            size: 1048576, // 1MB
            path: "/storage/uploads/uuid-2.png",
            is_image: true,
            width: 1920,
            height: 1080,
            thumbnail_path: "/storage/thumbnails/thumb_uuid-2.png",
            compressed_path: "/storage/compressed/compressed_uuid-2.png",
            created_at: "2024-01-14T15:45:00Z",
          },
          {
            id: "3",
            original_name: "documentacion.pdf",
            filename: "uuid-3.pdf",
            mimetype: "application/pdf",
            size: 2097152, // 2MB
            path: "/storage/uploads/uuid-3.pdf",
            is_image: false,
            created_at: "2024-01-13T09:15:00Z",
          },
          {
            id: "4",
            original_name: "logo-empresa.svg",
            filename: "uuid-4.svg",
            mimetype: "image/svg+xml",
            size: 32768, // 32KB
            path: "/storage/uploads/uuid-4.svg",
            is_image: true,
            width: 512,
            height: 512,
            thumbnail_path: "/storage/thumbnails/thumb_uuid-4.svg",
            created_at: "2024-01-12T11:20:00Z",
          },
          {
            id: "5",
            original_name: "base-datos.sql",
            filename: "uuid-5.sql",
            mimetype: "application/sql",
            size: 524288, // 512KB
            path: "/storage/uploads/uuid-5.sql",
            is_image: false,
            created_at: "2024-01-11T14:30:00Z",
          },
        ];

        set((state) => {
          state.files = mockFiles;
          state.isLoading = false;
          // Don't set error here since we have fallback data
        });
      }
    },

    uploadFiles: async (files: FileList | File[]) => {
      set((state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      });

      try {
        const response = await apiService.uploadFiles(files);
        // Normalize is_image from backend (number to boolean)
        const normalizedFiles = response.files.map((file) => ({
          ...file,
          is_image: Boolean(file.is_image),
        }));

        set((state) => {
          // Ensure files is an array before using unshift
          if (!Array.isArray(state.files)) {
            state.files = [];
          }
          state.files.unshift(...normalizedFiles);
          state.isUploading = false;
          state.uploadProgress = 100;
          state.showUploadModal = false;
        });

        // Reset progress after a short delay
        setTimeout(() => {
          set((state) => {
            state.uploadProgress = 0;
          });
        }, 1000);
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Error uploading files";
          state.isUploading = false;
          state.uploadProgress = 0;
        });
      }
    },

    uploadImages: async (images: FileList | File[]) => {
      set((state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      });

      try {
        const response = await apiService.uploadImages(images);
        // Normalize is_image from backend (number to boolean)
        const normalizedFiles = response.files.map((file) => ({
          ...file,
          is_image: Boolean(file.is_image),
        }));

        set((state) => {
          // Ensure files is an array before using unshift
          if (!Array.isArray(state.files)) {
            state.files = [];
          }
          state.files.unshift(...normalizedFiles);
          state.isUploading = false;
          state.uploadProgress = 100;
          state.showUploadModal = false;
        });

        setTimeout(() => {
          set((state) => {
            state.uploadProgress = 0;
          });
        }, 1000);
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Error uploading images";
          state.isUploading = false;
          state.uploadProgress = 0;
        });
      }
    },

    uploadFromBase64: async (data: FileUploadBase64Data) => {
      set((state) => {
        state.isUploading = true;
        state.error = null;
      });

      try {
        const response = await apiService.uploadFromBase64(data);
        // Normalize is_image from backend (number to boolean)
        const normalizedFiles = response.files.map((file) => ({
          ...file,
          is_image: Boolean(file.is_image),
        }));

        set((state) => {
          // Ensure files is an array before using unshift
          if (!Array.isArray(state.files)) {
            state.files = [];
          }
          state.files.unshift(...normalizedFiles);
          state.isUploading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "Error uploading from base64";
          state.isUploading = false;
        });
      }
    },

    deleteFile: async (fileId: string) => {
      try {
        await apiService.deleteFile(fileId);
        set((state) => {
          // Ensure files is an array before using filter
          if (!Array.isArray(state.files)) {
            state.files = [];
          }
          state.files = state.files.filter((file) => file.id !== fileId);
          state.selectedFiles.delete(fileId);
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Error deleting file";
        });
      }
    },

    deleteSelectedFiles: async () => {
      const { selectedFiles } = get();
      const promises = Array.from(selectedFiles).map((fileId) =>
        apiService.deleteFile(fileId)
      );

      try {
        await Promise.all(promises);
        set((state) => {
          // Ensure files is an array before using filter
          if (!Array.isArray(state.files)) {
            state.files = [];
          }
          state.files = state.files.filter(
            (file) => !selectedFiles.has(file.id)
          );
          state.selectedFiles.clear();
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Error deleting files";
        });
      }
    },

    downloadFile: async (fileId: string, variant: FileVariant = "original") => {
      try {
        const blob = await apiService.downloadFile(fileId, variant);
        const { files } = get();
        // Ensure files is an array before using find
        const fileArray = Array.isArray(files) ? files : [];
        const file = fileArray.find((f) => f.id === fileId);
        if (file) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.original_name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Error downloading file";
        });
      }
    },

    // Selection methods
    selectFile: (fileId: string) => {
      set((state) => {
        state.selectedFiles.clear();
        state.selectedFiles.add(fileId);
      });
    },

    selectAllFiles: () => {
      set((state) => {
        const filteredFiles = get().getFilteredFiles();
        state.selectedFiles.clear();
        filteredFiles.forEach((file) => state.selectedFiles.add(file.id));
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedFiles.clear();
      });
    },

    toggleFileSelection: (fileId: string) => {
      set((state) => {
        if (state.selectedFiles.has(fileId)) {
          state.selectedFiles.delete(fileId);
        } else {
          state.selectedFiles.add(fileId);
        }
      });
    },

    // Filter and sort methods
    setSearchQuery: (query: string) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    setFilterType: (type: FileManagerState["filterType"]) => {
      set((state) => {
        state.filterType = type;
      });
    },

    setSortBy: (sortBy: FileManagerState["sortBy"]) => {
      set((state) => {
        state.sortBy = sortBy;
      });
    },

    setSortOrder: (order: FileManagerState["sortOrder"]) => {
      set((state) => {
        state.sortOrder = order;
      });
    },

    // View methods
    setCurrentView: (view: FileManagerState["currentView"]) => {
      set((state) => {
        state.currentView = view;
      });
    },

    // Modal methods
    setShowUploadModal: (show: boolean) => {
      set((state) => {
        state.showUploadModal = show;
        if (!show) {
          state.dragOver = false;
        }
      });
    },

    setDragOver: (dragOver: boolean) => {
      set((state) => {
        state.dragOver = dragOver;
      });
    },

    showPreview: async (file: FileItem) => {
      set((state) => {
        state.previewFile = file;
        state.showPreviewModal = true;
        state.previewBase64 = null;
      });

      if (file.is_image) {
        try {
          const response = await apiService.getFileAsBase64(
            file.id,
            "original"
          );
          set((state) => {
            if (state.previewFile?.id === file.id) {
              state.previewBase64 = response.base64;
            }
          });
        } catch (error) {
          console.error("Error loading preview:", error);
        }
      }
    },

    hidePreview: () => {
      set((state) => {
        state.showPreviewModal = false;
        state.previewFile = null;
        state.previewBase64 = null;
      });
    },

    // Statistics
    fetchStorageStats: async () => {
      try {
        const response = await apiService.getStorageStats();
        set((state) => {
          state.storageStats = response.stats;
        });
      } catch {
        // Fallback to mock stats when API is not available
        const mockStats: StorageStats = {
          uploads: { count: 5, totalSize: 8945664 }, // ~8.5MB total
          thumbnails: { count: 2, totalSize: 512000 }, // ~500KB
          compressed: { count: 1, totalSize: 1048576 }, // ~1MB saved
        };

        set((state) => {
          state.storageStats = mockStats;
        });
      }
    },

    // Utility methods
    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    getFilteredFiles: () => {
      const { files, searchQuery, filterType, sortBy, sortOrder } = get();

      // Ensure files is an array (safety check)
      const fileArray = Array.isArray(files) ? files : [];

      const filtered = fileArray.filter((file) => {
        const matchesSearch =
          searchQuery === "" ||
          file.original_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType =
          filterType === "all" ||
          (filterType === "image" && file.is_image) ||
          (filterType === "document" &&
            !file.is_image &&
            [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/plain",
            ].includes(file.mimetype)) ||
          (filterType === "file" && !file.is_image);

        return matchesSearch && matchesType;
      });

      // Sort files
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "name":
            comparison = a.original_name.localeCompare(b.original_name);
            break;
          case "size":
            comparison = a.size - b.size;
            break;
          case "date":
            comparison =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime();
            break;
          case "type":
            comparison = a.mimetype.localeCompare(b.mimetype);
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

      return filtered;
    },

    formatFileSize: (bytes: number): string => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    getFileIcon: (file: FileItem): string => {
      if (file.is_image) return "🖼️";

      const mimeType = file.mimetype.toLowerCase();
      if (mimeType.includes("pdf")) return "📄";
      if (mimeType.includes("word") || mimeType.includes("document"))
        return "📝";
      if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
        return "📊";
      if (mimeType.includes("text")) return "📃";
      if (mimeType.includes("video")) return "🎥";
      if (mimeType.includes("audio")) return "🎵";
      if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️";

      return "📁";
    },
  }))
);
