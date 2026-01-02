import { ExtractedData } from '@/types/ocr';
import { FileText, User, BookOpen, Calendar, Hash } from 'lucide-react';

interface MetadataDisplayProps {
  metadata: ExtractedData['metadata'];
}

export function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  return (
    <div className="paper p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Document Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetadataItem
          icon={<BookOpen className="w-4 h-4" />}
          label="Exam"
          value={metadata.exam}
        />
        <MetadataItem
          icon={<Calendar className="w-4 h-4" />}
          label="Month/Year"
          value={metadata.monthYear}
        />
        <MetadataItem
          icon={<Hash className="w-4 h-4" />}
          label="Branch"
          value={metadata.branch}
        />
        <MetadataItem
          icon={<Hash className="w-4 h-4" />}
          label="Subject Code"
          value={metadata.subCode}
        />
        <MetadataItem
          label="Subject Name"
          value={metadata.subName}
          fullWidth
        />
        <MetadataItem
          icon={<User className="w-4 h-4" />}
          label="Examiner"
          value={metadata.examinerName}
        />
        <MetadataItem
          icon={<User className="w-4 h-4" />}
          label="Scrutinizer"
          value={metadata.scrutinizerName}
        />
      </div>
    </div>
  );
}

interface MetadataItemProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}

function MetadataItem({ icon, label, value, fullWidth }: MetadataItemProps) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}
