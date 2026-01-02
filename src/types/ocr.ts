export interface MarkEntry {
  questionNo: number;
  partA: number | null;
  partB: number | null;
  partC: number | null;
  total: number | null;
}

export interface ExtractedData {
  metadata: {
    exam: string;
    monthYear: string;
    branch: string;
    subCode: string;
    subName: string;
    examinerName: string;
    scrutinizerName: string;
  };
  marks: MarkEntry[];
  totalMarks: {
    calculated: number;
    written: number | null;
    bubbleDigits: number | null;
    marksInWords: {
      tens: string;
      units: string;
    };
  };
  validation: {
    isValid: boolean;
    calculatedSum: number;
    writtenTotal: number | null;
    bubbleTotal: number | null;
    errors: string[];
  };
  rawText: string;
}
