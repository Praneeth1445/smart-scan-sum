import { useCallback, useState } from 'react';
import { Upload, FileImage, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ImageUpload({ onImageSelect, isProcessing }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result;
      setPreview(base64);
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  if (preview) {
    return (
      <div className="relative paper p-4 animate-fadeIn">
        <button
          onClick={clearPreview}
          disabled={isProcessing}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-card hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Clear image"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Uploaded document"
            className="w-full h-auto max-h-[400px] object-contain bg-muted/30"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
              <div className="absolute inset-x-0 h-1 bg-primary/30 top-0">
                <div className="h-full w-full bg-primary animate-scan" />
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-3">
          {isProcessing ? 'Extracting text and validating...' : 'Document ready for processing'}
        </p>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "paper p-8 border-2 border-dashed transition-all duration-200 cursor-pointer",
        isDragging 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <label className="flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[200px]">
        <div className={cn(
          "p-4 rounded-full transition-colors",
          isDragging ? "bg-primary/10" : "bg-muted"
        )}>
          {isDragging ? (
            <FileImage className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">
            {isDragging ? 'Drop your image here' : 'Upload exam sheet'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports: JPG, PNG, WEBP
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
