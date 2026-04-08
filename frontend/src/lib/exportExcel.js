import * as XLSX from 'xlsx';

/**
 * Common utility to export JSON data to Excel
 * @param {Array} data - Flat array of objects to export
 * @param {String} fileName - Desired file name (without extension)
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'report', sheetName = 'Sheet1') => {
    // 1. Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // 2. Convert JSON data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 3. Add worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 4. Trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
