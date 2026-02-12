import * as XLSX from "xlsx";

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportOptions {
  filename: string;
  sheetName?: string;
  metadata?: Record<string, string | number>;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  totalRow?: Record<string, unknown>;
}

/**
 * Export data to Excel file with proper formatting
 */
export function exportToExcel(options: ExportOptions): void {
  const {
    filename,
    sheetName = "Sheet1",
    metadata,
    columns,
    data,
    totalRow,
  } = options;

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare data array for worksheet
  const wsData: unknown[][] = [];

  // Add metadata if provided
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      wsData.push([key, value]);
    });
    wsData.push([]); // Empty row separator
  }

  // Add headers
  const headers = columns.map((col) => col.header);
  wsData.push(headers);

  // Add data rows
  data.forEach((row) => {
    const rowData = columns.map((col) => row[col.key] ?? "");
    wsData.push(rowData);
  });

  // Add total row if provided
  if (totalRow) {
    wsData.push([]); // Empty row separator
    const totalRowData = columns.map((col) => totalRow[col.key] ?? "");
    wsData.push(totalRowData);
  }

  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = columns.map((col) => ({
    wch: col.width || 15,
  }));
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, filename);
}
