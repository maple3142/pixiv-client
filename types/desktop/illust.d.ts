export interface Illust {
	illustId: string
	illustTitle: string
	illustComment: string
	id: string
	title: string
	description: string
	illustType: number
	createDate: string
	uploadDate: string
	restrict: number
	xRestrict: number
	urls: Urls
	tags: Tags
	storableTags: string[]
	userId: string
	userName: string
	userAccount: string
	userIllusts: { [key: string]: UserIllust | null }
	likeData: boolean
	width: number
	height: number
	pageCount: number
	bookmarkCount: number
	likeCount: number
	commentCount: number
	responseCount: number
	viewCount: number
	isHowto: boolean
	isOriginal: boolean
	imageResponseOutData: any[]
	imageResponseData: any[]
	imageResponseCount: number
	pollData: null
	seriesNavData: null
	descriptionBoothId: null
	comicPromotion: null
	contestBanners: any[]
	factoryGoods: FactoryGoods
	isBookmarkable: boolean
	bookmarkData: BookmarkData
	zoneConfig: ZoneConfig
}

export interface BookmarkData {
	id: string
	private: boolean
}

export interface FactoryGoods {
	integratable: boolean
	integrated: boolean
}

export interface Tags {
	authorId: string
	isLocked: boolean
	tags: Tag[]
	writable: boolean
}

export interface Tag {
	tag: string
	locked: boolean
	deletable: boolean
	userId?: string
	romaji: null | string
	userName?: string
	translation?: Translation
}

export interface Translation {
	en: string
	[key: string]: string
}

export interface Urls {
	mini: string
	thumb: string
	small: string
	regular: string
	original: string
}

export interface UserIllust {
	illustId: string
	illustTitle: string
	id: string
	title: string
	illustType: number
	xRestrict: number
	restrict: number
	url: string
	description: string
	tags: string[]
	userId: string
	width: number
	height: number
	pageCount: number
	isBookmarkable: boolean
	bookmarkData: BookmarkData | null
}

export interface ZoneConfig {
	[key: string]: any
}
