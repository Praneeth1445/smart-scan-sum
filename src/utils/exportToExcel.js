import * as XLSX from 'xlsx';

export function exportResultsToExcel(results) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare data for Excel
  const excelData = [];
  
  // Add header row
  excelData.push([
    'Sheet #',
    'Q.No',
    'Part A',
    'Part B',
    'Part C',
    'Total',
    'Calculated Sum',
    'Written Total',
    'Bubble Total',
    'Validation',
    'Remarks'
  ]);

  results.forEach((result) => {
    if (result.error) {
      // Add error row
      excelData.push([
        result.index,
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        'FAILED',
        result.error
      ]);
      return;
    }

    const data = result.data;
    const validation = data.validation;
    const marks = data.marks || [];

    // Add each question as a row
    marks.forEach((mark, idx) => {
      const isFirstRow = idx === 0;
      
      excelData.push([
        isFirstRow ? result.index : '',
        mark.questionNo,
        mark.partA !== null ? mark.partA : '-',
        mark.partB !== null ? mark.partB : '-',
        mark.partC !== null ? mark.partC : '-',
        mark.total !== null ? mark.total : '-',
        isFirstRow ? validation.calculatedSum : '',
        isFirstRow ? (validation.writtenTotal !== null ? validation.writtenTotal : '-') : '',
        isFirstRow ? (validation.bubbleTotal !== null ? validation.bubbleTotal : '-') : '',
        isFirstRow ? (validation.isValid ? 'PASSED' : 'FAILED') : '',
        isFirstRow ? (validation.errors.length > 0 ? validation.errors.join('; ') : '-') : ''
      ]);
    });

    // If no marks, still add a summary row
    if (marks.length === 0) {
      excelData.push([
        result.index,
        '-',
        '-',
        '-',
        '-',
        '-',
        validation.calculatedSum,
        validation.writtenTotal !== null ? validation.writtenTotal : '-',
        validation.bubbleTotal !== null ? validation.bubbleTotal : '-',
        validation.isValid ? 'PASSED' : 'FAILED',
        validation.errors.length > 0 ? validation.errors.join('; ') : '-'
      ]);
    }

    // Add empty row between sheets for readability
    excelData.push([]);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },   // Sheet #
    { wch: 6 },   // Q.No
    { wch: 8 },   // Part A
    { wch: 8 },   // Part B
    { wch: 8 },   // Part C
    { wch: 8 },   // Total
    { wch: 14 },  // Calculated Sum
    { wch: 14 },  // Written Total
    { wch: 14 },  // Bubble Total
    { wch: 12 },  // Validation
    { wch: 50 },  // Remarks
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'OCR Results');

  // Create summary sheet
  const summaryData = [
    ['OCR Extraction Summary'],
    [],
    ['Total Sheets', results.length],
    ['Passed', results.filter(r => r.data?.validation?.isValid).length],
    ['Failed Validation', results.filter(r => r.data && !r.data.validation?.isValid).length],
    ['Extraction Errors', results.filter(r => r.error).length],
    [],
    ['Generated On', new Date().toLocaleString()]
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Generate filename with timestamp
  const filename = `ocr-results-${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Write and download
  XLSX.writeFile(wb, filename);

  return filename;
}
