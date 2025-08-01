'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
	const [hasMore, setHasMore] = useState(true)
	const [loading, setLoading] = useState(false)

	const pageRef = useRef(1)

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setForm(prev => ({
			...prev,
			[name]: ['avgLikes', 'avgReviews'].includes(name) ? +value : value,
		}))
	}

	const getStarRating = (likes: number, reviews: number): number => {
		if (reviews === 0) return 0
		const ratio = likes / reviews
		return Math.round(Math.min(ratio, 1) * 5)
	}

	const loadMoreBooks = useCallback(async () => {
		if (loading || !hasMore) return
		setLoading(true)

		const data = await fetchBooks({ ...form, page: pageRef.current })

		if (data.length === 0) {
			setHasMore(false)
		} else {
			setBooks(prev => [...prev, ...data])
			pageRef.current += 1
		}

		setLoading(false)
	}, [form, loading, hasMore])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setBooks([])
		pageRef.current = 1
		setHasMore(true)
		await loadMoreBooks()
	}

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadMoreBooks()
				}
			},
			{ threshold: 1 }
		)

		const sentinel = document.querySelector('#scroll-sentinel')
		if (sentinel) observer.observe(sentinel)

		return () => {
			if (sentinel) observer.unobserve(sentinel)
		}
	}, [loadMoreBooks, hasMore, loading])

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

			<div className={styles.cardList}>
				{books.map(book => {
					const stars = getStarRating(book.likes, book.reviews)
					return (
						<div key={book.index} className={styles.cardItem}>
							<h3>
								{book.title}
								<span>
									👍 <span>{book.likes}</span>
								</span>
							</h3>
							<p className={styles.author}>by {book.authors.join(', ')}</p>
							<div className={styles.stars}>
								{Array.from({ length: 5 }, (_, i) => (
									<span key={i}>{i < stars ? '★' : '☆'}</span>
								))}
							</div>
							<p className={styles.publisher}>{book.publisher}</p>
						</div>
					)
				})}
			</div>

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>#</th>
							<th>ISBN</th>
							<th>Title</th>
							<th>Author(s)</th>
							<th>Publisher</th>
							<th>Likes</th>
							<th>Reviews</th>
						</tr>
					</thead>
					<tbody>
						{books.map(book => (
							<tr key={book.index}>
								<td>{book.index}</td>
								<td>{book.isbn}</td>
								<td>{book.title}</td>
								<td>{book.authors.join(', ')}</td>
								<td>{book.publisher}</td>
								<td>{book.likes}</td>
								<td>{book.reviews}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{loading && <p>Loading more books...</p>}
			{!hasMore && <p>No more books to load.</p>}
			<div id='scroll-sentinel' style={{ height: '1px' }} />
		</div>
	)
}
