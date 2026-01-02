import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function MarksTable({ marks }) {
  return (
    <div className="paper overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-center w-16">Q.No</TableHead>
            <TableHead className="font-semibold text-center">Part A</TableHead>
            <TableHead className="font-semibold text-center">Part B</TableHead>
            <TableHead className="font-semibold text-center">Part C</TableHead>
            <TableHead className="font-semibold text-center bg-primary/5">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marks.map((mark, index) => (
            <TableRow 
              key={mark.questionNo} 
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="text-center font-medium">{mark.questionNo}</TableCell>
              <TableCell className="text-center font-mono">
                {mark.partA !== null ? mark.partA : '—'}
              </TableCell>
              <TableCell className="text-center font-mono">
                {mark.partB !== null ? mark.partB : '—'}
              </TableCell>
              <TableCell className="text-center font-mono">
                {mark.partC !== null ? mark.partC : '—'}
              </TableCell>
              <TableCell className="text-center font-mono font-semibold bg-primary/5">
                {mark.total !== null ? mark.total : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
