import { useRef, useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExtractedData } from '@/types/ocr';
import { ValidationBadge, ValidationDetails } from './ValidationBadge';
import { MarksTable } from './MarksTable';
import { MetadataDisplay } from './MetadataDisplay';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ResultsDisplayProps {
  data: ExtractedData;
}

export function ResultsDisplay({ data }: ResultsDisplayProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  const exportAsImage = useCallback(async () => {
    if (!resultsRef.current) return;

    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `ocr-results-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Image exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export image');
    }
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with validation status */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Extraction Results</h2>
        <div className="flex items-center gap-3">
          <ValidationBadge 
            isValid={data.validation.isValid} 
            errors={data.validation.errors}
          />
          <Button onClick={exportAsImage} className="gap-2">
            <Download className="w-4 h-4" />
            Export as Image
          </Button>
        </div>
      </div>

      {/* Exportable content */}
      <div ref={resultsRef} className="space-y-6 p-6 bg-background rounded-xl">
        {/* Validation summary */}
        <ValidationDetails
          calculatedSum={data.validation.calculatedSum}
          writtenTotal={data.validation.writtenTotal}
          bubbleTotal={data.validation.bubbleTotal}
          errors={data.validation.errors}
        />

        {/* Marks in words */}
        {data.totalMarks.marksInWords && (
          <div className="paper p-4 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Tens Place</p>
              <p className="text-xl font-semibold capitalize">{data.totalMarks.marksInWords.tens || '—'}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Units Place</p>
              <p className="text-xl font-semibold capitalize">{data.totalMarks.marksInWords.units || '—'}</p>
            </div>
          </div>
        )}

        {/* Marks table */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Question-wise Marks</h3>
          <MarksTable marks={data.marks} />
        </div>

        {/* Metadata */}
        <MetadataDisplay metadata={data.metadata} />
      </div>
    </div>
  );
}
