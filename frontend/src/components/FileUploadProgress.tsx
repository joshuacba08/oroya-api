import React from "react";

interface FileUploadProgressProps {
  isUploading: boolean;
  progress: number;
  fileName?: string;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  isUploading,
  progress,
  fileName,
}) => {
  if (!isUploading) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-80 z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm font-medium text-gray-900">
            {fileName ? `Uploading ${fileName}...` : "Uploading files..."}
          </span>
        </div>
        <span className="text-sm text-blue-600 font-medium">{progress}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {progress === 100 && (
        <div className="mt-2 flex items-center text-green-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">Upload complete!</span>
        </div>
      )}
    </div>
  );
};
