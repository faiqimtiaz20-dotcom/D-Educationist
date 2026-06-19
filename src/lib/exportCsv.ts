export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
  filename: string,
) {
  const header = columns.map((c) => c.header).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.key]
          const str = val == null ? '' : String(val)
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        })
        .join(','),
    )
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
