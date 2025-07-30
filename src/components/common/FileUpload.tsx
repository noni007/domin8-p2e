
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileImage } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export const FileUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5,
  className = "",
  disabled = false 
}: FileUploadProps) => {
  const { isFeatureEnabled } = useFeatureFlags();
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isEnabled = isFeatureEnabled('feature_file_uploads') && !disabled;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isEnabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isEnabled) {
      handleFiles(e.target.files);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (!isEnabled) {
    return (
      <Card className="bg-black/20 border-gray-600 border-dashed">
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">File uploads are currently disabled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card 
        className={`bg-black/20 border-dashed transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-900/20' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {selectedFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileImage className="h-5 w-5 text-blue-400" />
                <span className="text-white text-sm">{selectedFile.name}</span>
                <span className="text-gray-400 text-xs">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300 mb-1">
                Drag & drop a file here, or{" "}
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-gray-500 text-xs">
                Max file size: {maxSize}MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};
