import { Book } from './types'

export function exportToCsv(filename: string, rows: Book[]) {
	if (!rows.length) return

	const headers = Object.keys(rows[0]) as (keyof Book)[]
	const csvContent =
		headers.join(',') +
		'\n' +
		rows
			.map(row =>
				headers
					.map(field => {
						const value = row[field]
						const stringValue = Array.isArray(value)
							? value.join(', ')
							: String(value ?? '')
						return `"${stringValue.replace(/"/g, '""')}"`
					})
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
