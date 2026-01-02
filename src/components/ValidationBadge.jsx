import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ValidationBadge({ isValid, errors }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm",
      isValid 
        ? "bg-success/10 text-success" 
        : "bg-destructive/10 text-destructive"
    )}>
      {isValid ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>Validation Passed</span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4" />
          <span>Validation Failed</span>
        </>
      )}
    </div>
  );
}

export function ValidationDetails({ 
  calculatedSum, 
  writtenTotal, 
  bubbleTotal, 
  errors 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <ValidationCard
          label="Calculated Sum"
          value={calculatedSum}
          isPrimary
        />
        <ValidationCard
          label="Written Total"
          value={writtenTotal}
          matches={writtenTotal === null || calculatedSum === writtenTotal}
        />
        <ValidationCard
          label="Bubble Digits"
          value={bubbleTotal}
          matches={bubbleTotal === null || calculatedSum === bubbleTotal}
        />
      </div>
      
      {errors.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Validation Errors</p>
              <ul className="mt-2 space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-sm text-destructive/80">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationCard({ label, value, isPrimary, matches }) {
  return (
    <div className={cn(
      "p-4 rounded-lg text-center transition-all",
      isPrimary 
        ? "gradient-primary text-primary-foreground" 
        : matches === false 
          ? "bg-destructive/10 border border-destructive/20"
          : "bg-muted"
    )}>
      <p className={cn(
        "text-xs uppercase tracking-wide",
        isPrimary ? "text-primary-foreground/80" : "text-muted-foreground"
      )}>
        {label}
      </p>
      <p className={cn(
        "text-3xl font-bold mt-1 font-mono",
        isPrimary ? "" : matches === false ? "text-destructive" : "text-foreground"
      )}>
        {value !== null ? value : '—'}
      </p>
    </div>
  );
}
