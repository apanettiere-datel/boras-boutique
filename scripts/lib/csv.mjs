// Minimal RFC 4180 CSV reader/writer. Handles quoted fields, doubled quotes,
// commas and newlines inside quotes, CRLF, and the BOM that Excel and Google
// Sheets put at the start of UTF-8 exports.

export function parseCsv(text) {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"' && field === '') {
      quoted = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (quoted) throw new Error('CSV ends inside a quoted field (missing closing ")')
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  // Drop fully blank lines (trailing newline, spacer rows in a spreadsheet)
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

// Rows as objects keyed by the header row; each object also carries `line`,
// the 1-based line number in the spreadsheet, for error messages.
export function parseCsvObjects(text) {
  const [header, ...rows] = parseCsv(text)
  if (!header) return { columns: [], records: [] }
  const columns = header.map((h) => h.trim().toLowerCase())
  const records = rows.map((cells, i) => {
    const record = { line: i + 2 }
    columns.forEach((col, c) => {
      record[col] = (cells[c] ?? '').trim()
    })
    return record
  })
  return { columns, records }
}

function quote(value) {
  const s = value == null ? '' : String(value)
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

export function toCsv(columns, records) {
  const lines = [columns.map(quote).join(',')]
  for (const record of records) {
    lines.push(columns.map((col) => quote(record[col])).join(','))
  }
  return lines.join('\n') + '\n'
}
