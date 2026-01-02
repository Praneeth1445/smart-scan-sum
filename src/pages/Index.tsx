import { useState, useCallback } from 'react';
import { Scan, Sparkles } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { ExtractedData } from '@/types/ocr';
import { toast } from 'sonner';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleImageSelect = useCallback(async (base64: string) => {
    setIsProcessing(true);
    setExtractedData(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-extract`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64 }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const data = await response.json();
      setExtractedData(data);
      
      if (data.validation?.isValid) {
        toast.success('Extraction complete - All totals validated successfully!');
      } else {
        toast.warning('Extraction complete - Validation errors found');
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract data');
    } finally {
      setIsProcessing(false);
    }
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
                Extract & validate exam sheet marks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero section */}
          {!extractedData && (
            <div className="text-center space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered OCR
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Extract handwritten marks from exam sheets
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload an exam answer sheet to extract marks, validate totals against 
                bubble digits, and export the results as an image.
              </p>
            </div>
          )}

          {/* Upload area */}
          <ImageUpload 
            onImageSelect={handleImageSelect} 
            isProcessing={isProcessing} 
          />

          {/* Processing indicator */}
          {isProcessing && (
            <div className="paper p-8 text-center animate-fadeIn">
              <div className="inline-flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">
                  Analyzing document with AI...
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Extracting text, tables, and validating marks
              </p>
            </div>
          )}

          {/* Results */}
          {extractedData && !isProcessing && (
            <ResultsDisplay data={extractedData} />
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
