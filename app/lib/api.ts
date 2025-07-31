export async function fetchBooks(params: {
	seed: string
	locale: string
	page: number
	avgLikes: number
	avgReviews: number
}) {
	const query = new URLSearchParams({
		seed: params.seed,
		region: params.locale,
		page: params.page.toString(),
		likes: params.avgLikes.toString(),
		reviews: params.avgReviews.toString(),
	}).toString()

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books?${query}`)
	return res.json()
}
