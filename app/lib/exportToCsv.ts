export function exportToCsv(filename: string, rows: any[]) {
	if (!rows.length) return

	const headers = Object.keys(rows[0])
	const csvContent =
		headers.join(',') +
		'\n' +
		rows
			.map(row =>
				headers
					.map(
						field => `"${(row[field] ?? '').toString().replace(/"/g, '""')}"`
					)
					.join(',')
			)
			.join('\n')

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.setAttribute('download', filename)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}
