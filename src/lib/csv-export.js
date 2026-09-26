// CSV for downloads that will be opened in Excel or Google Sheets. Cells that
// start with = + - @ (or a tab/CR) are formulas to a spreadsheet, and signup
// addresses are typed by strangers, so those cells get a leading apostrophe.
// No imports: runs in the Worker and in tests.

function cell(value) {
  let s = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

export function toCsv(columns, rows) {
  const lines = [columns.map(cell).join(',')]
  for (const row of rows) lines.push(columns.map((c) => cell(row[c])).join(','))
  // CRLF and a BOM so Excel opens it as UTF-8 without an import dialog
  return '﻿' + lines.join('\r\n') + '\r\n'
}
