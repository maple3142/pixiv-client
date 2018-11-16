type Id = string | number
interface LoginOption {
	username: string
	password: string
}
export declare class PixivDesktopApi {
	getIllustData(illustId: Id): Promise<any>
	getIllustBookmarkData(illustId: Id): Promise<any>
	getUserData(userId: Id): Promise<any>
	getUserProfileData(userId: Id): Promise<any>
	getUserBookmarkData(userId: Id, optSearchParams?: object): Promise<any>
	getIllustUgoiraMetaData(illustId: Id): Promise<any>
	postIllustLike(illustId: Id): Promise<any>
	postFollowUser(userId: Id): Promise<any>
	postRPCAddBookmark(illustId: Id): Promise<any>
	postRPCDeleteBookmark(bookmarkId: Id): Promise<any>
	static login(opts: LoginOption): Promise<PixivDesktopApi>
}
interface UserData {
	profile_image_urls: object
	id: string
	name: string
	account: string
	mail_address: string
	is_premium: boolean
	x_restrict: number
	is_mail_authorized: boolean
}
type RankingMode =
	| 'day'
	| 'week'
	| 'month'
	| 'day_male'
	| 'day_female'
	| 'week_original'
	| 'week_rookie'
	| 'day_r18'
	| 'day_male_r18'
	| 'day_female_r18'
	| 'week_r18'
	| 'week_r18g'
interface SearchOption {
	searchTarget?: 'partial_match_for_tags' | 'exact_match_for_tags' | 'title_and_caption'
	sort?: 'date_desc' | 'date_asc'
	duration?: 'within_last_day' | 'within_last_week' | 'within_last_month'
}
export declare class PixivMobileApi {
	hasNext(resp: object): Promise<any>
	next(resp: object): Promise<any>
	searchIllust(keyword: string, opts?: SearchOption): Promise<any>
	searchUser(keyword: string): Promise<any>
	getRanking(mode: RankingMode, date?: Date): Promise<any>
	getTrendingTags(): Promise<any>
	getUserBookmarks(userId: Id): Promise<any>
	getUserDetail(userId: Id): Promise<any>
	getUserMypixiv(userId: Id): Promise<any>
	getUserFollowers(userId: Id): Promise<any>
	getUserFollowings(userId: Id): Promise<any>
	getIllusts(userId: Id): Promise<any>
	getNewIllusts(): Promise<any>
	getRecommendedIllusts(): Promise<any>
	getFollowingIllusts(): Promise<any>
	getIllustDetail(illustId: Id): Promise<any>
	getIllustComment(illustId: Id): Promise<any>
	getIllustRelated(illustId: Id): Promise<any>
	addBookmark(illustId: Id, public_mode?: boolean): Promise<any>
	deleteBookmark(illustId: Id): Promise<any>
	currentUser: UserData
	static login(opts: LoginOption): Promise<PixivMobileApi>
}
