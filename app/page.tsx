'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './page.module.css'
import { fetchBooks } from './lib/api'
import { exportToCsv } from './lib/exportToCsv'
import { Book } from './lib/types'

export default function Home() {
	const [form, setForm] = useState({
		seed: '123',
		locale: 'en',
		avgLikes: 5,
		avgReviews: 2,
	})

	const [books, setBooks] = useState<Book[]>([])
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [loading, setLoading] = useState(false)

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setForm(prev => ({
			...prev,
			[name]: ['avgLikes', 'avgReviews'].includes(name) ? +value : value,
		}))
	}

	const loadMoreBooks = useCallback(
		async (pageNumber: number) => {
			if (loading || !hasMore) return
			setLoading(true)

			const data = await fetchBooks({ ...form, page: pageNumber })

			if (data.length === 0) {
				setHasMore(false)
			} else {
				setBooks(prev => [...prev, ...data])
				setPage(prev => prev + 1)
			}

			setLoading(false)
		},
		[form, loading, hasMore]
	)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setBooks([])
		setPage(1)
		setHasMore(true)
		await loadMoreBooks(1)
	}

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadMoreBooks(page)
				}
			},
			{ threshold: 1 }
		)

		const sentinel = document.querySelector('#scroll-sentinel')
		if (sentinel) observer.observe(sentinel)

		return () => {
			if (sentinel) observer.unobserve(sentinel)
		}
	}, [loadMoreBooks, page, hasMore, loading])

	return (
		<div className={styles.container}>
			<h1 className={styles.heading}>Book Generator</h1>
			<form onSubmit={handleSubmit} className={styles.form}>
				<div>
					<label>Seed</label>
					<input
						type='text'
						name='seed'
						value={form.seed}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label>Language</label>
					<select name='locale' value={form.locale} onChange={handleChange}>
						<option value='en'>English</option>
						<option value='ru'>Russian</option>
						<option value='fr'>French</option>
						<option value='de'>German</option>
						<option value='es'>Spanish</option>
						<option value='it'>Italian</option>
					</select>
				</div>

				<div>
					<label>Average Likes</label>
					<input
						type='number'
						name='avgLikes'
						value={form.avgLikes}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label>Average Reviews</label>
					<input
						type='number'
						name='avgReviews'
						value={form.avgReviews}
						onChange={handleChange}
					/>
				</div>

				<button type='submit'>Generate</button>
			</form>

			{books.length > 0 && (
				<button
					onClick={() => exportToCsv('books.csv', books)}
					style={{ margin: '1rem 0' }}
				>
					Download CSV
				</button>
			)}

			<div className={styles.list}>
				{books.map((book: Book) => (
					<div key={book.index} className={styles.card}>
						<h3>{book.title}</h3>
						<p>
							<b>Author:</b> {book.authors.join(', ')}
						</p>
						<p>
							<b>Publisher:</b> {book.publisher}
						</p>
						<p>
							<b>Likes:</b> {book.likes}, <b>Reviews:</b> {book.reviews}
						</p>
						<p>
							<b>ISBN:</b> {book.isbn}
						</p>
					</div>
				))}
			</div>

			{loading && <p>Loading more books...</p>}
			{!hasMore && <p>No more books to load.</p>}
			<div id='scroll-sentinel' style={{ height: '1px' }} />
		</div>
	)
}
