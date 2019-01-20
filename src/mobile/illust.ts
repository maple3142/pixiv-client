export interface Illust {
	id: number
	title: string
	type: Type
	image_urls: ImageUrls
	caption: string
	restrict: number
	user: User
	tags: Tag[]
	tools: any[]
	create_date: string
	page_count: number
	width: number
	height: number
	sanity_level: number
	x_restrict: number
	series: null
	meta_single_page: MetaSinglePage
	meta_pages: any[]
	total_view: number
	total_bookmarks: number
	is_bookmarked: boolean
	visible: boolean
	is_muted: boolean
}

export interface ImageUrls {
	square_medium: string
	medium: string
	large: string
}

export interface MetaSinglePage {
	original_image_url: string
}

export interface Tag {
	name: string
}

export interface User {
	id: number
	name: string
	account: string
	profile_image_urls: ProfileImageUrls
	is_followed: boolean
}

export interface ProfileImageUrls {
	medium: string
}

export type Type = 'illust' | 'manga' | 'ugoira'
