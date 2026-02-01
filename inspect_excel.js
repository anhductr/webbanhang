import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Construct absolute path to the public file
const currentDir = process.cwd();
const filePath = path.join(currentDir, 'public', '[PLC1.4] BÁN HÀNG TẾT JW MARRIOTT.xlsx');

console.log('Reading file from:', filePath);

try {
    const buf = fs.readFileSync(filePath);
    const wb = XLSX.read(buf);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length > 0) {
        console.log('Headers:', Object.keys(data[0]));
        console.log('First Row Sample:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('No data found in the first sheet.');
    }
} catch (err) {
    console.error('Error reading file:', err);
}
