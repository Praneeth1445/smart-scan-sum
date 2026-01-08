import { useState, useCallback, useEffect } from 'react';
import { Scan, Sparkles, Play, FileSpreadsheet } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { toast } from 'sonner';
import { exportResultsToExcel } from '@/utils/exportToExcel';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [results, setResults] = useState([]);
  const [processedCount, setProcessedCount] = useState(0);

  const handleImagesSelect = useCallback((base64Images) => {
    setPendingImages(prev => [...prev, ...base64Images]);
  }, []);

  const processAllImages = useCallback(async () => {
    if (pendingImages.length === 0) return;

    setIsProcessing(true);
    setResults([]);
    setProcessedCount(0);

    const allResults = [];

    for (let i = 0; i < pendingImages.length; i++) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-extract`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: pendingImages[i] }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process image');
        }

        const data = await response.json();
        allResults.push({ index: i + 1, data, error: null });
        setProcessedCount(i + 1);
      } catch (error) {
        console.error(`OCR error for image ${i + 1}:`, error);
        allResults.push({ 
          index: i + 1, 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to extract data' 
        });
        setProcessedCount(i + 1);
      }
    }

    setResults(allResults);
    setIsProcessing(false);

    const successCount = allResults.filter(r => r.data?.validation?.isValid).length;
    const failCount = allResults.filter(r => r.error).length;
    const warningCount = allResults.filter(r => r.data && !r.data.validation?.isValid).length;

    if (failCount === 0 && warningCount === 0) {
      toast.success(`All ${successCount} sheets validated successfully!`);
    } else {
      toast.warning(`Processed: ${successCount} valid, ${warningCount} with errors, ${failCount} failed`);
    }

    // Automatically export to Excel after processing
    try {
      const filename = exportResultsToExcel(allResults);
      toast.success(`Excel exported: ${filename}`);
    } catch (exportError) {
      console.error('Excel export failed:', exportError);
      toast.error('Failed to export Excel file');
    }
  }, [pendingImages]);

  const clearAll = useCallback(() => {
    setPendingImages([]);
    setResults([]);
    setProcessedCount(0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Scan className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">OCR Validator</h1>
              <p className="text-sm text-muted-foreground">
                Bulk extract & validate exam sheet marks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero section */}
          {results.length === 0 && (
            <div className="text-center space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Bulk OCR
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Extract marks from multiple exam sheets
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload multiple exam answer sheets to extract marks, validate totals,
                and process them all at once.
              </p>
            </div>
          )}

          {/* Upload area */}
          <ImageUpload 
            onImagesSelect={handleImagesSelect} 
            isProcessing={isProcessing}
            imageCount={pendingImages.length}
          />

          {/* Process button */}
          {pendingImages.length > 0 && !isProcessing && results.length === 0 && (
            <div className="flex justify-center">
              <button
                onClick={processAllImages}
                className="flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <Play className="w-5 h-5" />
                Process {pendingImages.length} Image(s)
              </button>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="paper p-8 text-center animate-fadeIn">
              <div className="inline-flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">
                  Processing image {processedCount + 1} of {pendingImages.length}...
                </span>
              </div>
              <div className="mt-4 w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(processedCount / pendingImages.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && !isProcessing && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Results ({results.length} sheets)</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      try {
                        exportResultsToExcel(results);
                        toast.success('Excel exported successfully');
                      } catch (err) {
                        toast.error('Export failed');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    Process New Batch
                  </button>
                </div>
              </div>
              
              {results.map((result) => (
                <div key={result.index} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b border-border">
                    <span className="font-medium">Sheet #{result.index}</span>
                    {result.error && (
                      <span className="ml-2 text-sm text-destructive">— Error: {result.error}</span>
                    )}
                  </div>
                  {result.data && (
                    <div className="p-4">
                      <ResultsDisplay data={result.data} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container py-4">
          <p className="text-sm text-muted-foreground text-center">
            Powered by AI vision for accurate handwriting recognition
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
