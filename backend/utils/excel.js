const XLSX = require('xlsx');

const generateExcel = (data, sheetName = 'Sheet1', fileName = 'export.xlsx') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  return { buffer, fileName };
};

module.exports = { generateExcel };