'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { fetchBooks } from './lib/api'
import { exportToCsv } from './lib/exportToCsv'

export default function Home() {
	const [form, setForm] = useState({
		seed: '123',
		locale: 'en',
		avgLikes: 5,
		avgReviews: 2,
	})

	type Book = {
		index: number
		title: string
		authors: string[]
		publisher: string
		likes: number
		reviews: number
		isbn: string
	}

	const [books, setBooks] = useState<Book[]>([])
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [loading, setLoading] = useState(false)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setBooks([])
		setPage(1)
		setHasMore(true)
		loadMoreBooks(1)
	}

	const loadMoreBooks = async (pageNumber: number) => {
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
	}, [page, hasMore, loading])

	return (
		<div className={styles.container}>
			<h1 className={styles.heading}>Book Generator</h1>
			<form onSubmit={handleSubmit} className={styles.form}>
				{['seed', 'locale', 'avgLikes', 'avgReviews'].map(field => (
					<div key={field}>
						<label>{field}</label>
						<input
							type={field === 'locale' ? 'text' : 'number'}
							name={field}
							value={form[field as keyof typeof form]}
							onChange={handleChange}
						/>
					</div>
				))}
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
				{books.map((book: any) => (
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
