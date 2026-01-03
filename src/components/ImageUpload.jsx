import { useCallback, useState } from 'react';
import { Upload, FileImage, X, Images } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ImageUpload({ onImagesSelect, isProcessing, imageCount = 0 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFiles = useCallback((files) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    const newPreviews = [];
    const base64Images = [];

    let loadedCount = 0;
    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result;
        newPreviews[index] = { base64, name: file.name };
        base64Images[index] = base64;
        loadedCount++;

        if (loadedCount === imageFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
          onImagesSelect(base64Images);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [onImagesSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    if (e.target.files) handleFiles(e.target.files);
  }, [handleFiles]);

  const clearPreviews = useCallback(() => {
    setPreviews([]);
  }, []);

  const removeImage = useCallback((index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  if (previews.length > 0) {
    return (
      <div className="paper p-4 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-primary" />
            <span className="font-medium">{previews.length} image(s) selected</span>
          </div>
          <button
            onClick={clearPreviews}
            disabled={isProcessing}
            className="px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
              {!isProcessing && (
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 z-10 p-1 rounded-full bg-card/90 hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <img
                src={preview.base64}
                alt={preview.name}
                className="w-full h-24 object-cover bg-muted/30"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!isProcessing && (
          <label className="mt-3 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add more images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        )}

        <p className="text-sm text-muted-foreground text-center mt-3">
          {isProcessing ? `Processing ${imageCount} image(s)...` : 'Ready to process all images'}
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
            {isDragging ? 'Drop your images here' : 'Upload exam sheets'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to browse (multiple files supported)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports: JPG, PNG, WEBP
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
