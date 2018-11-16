type Id = string | number
interface LoginOption{
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
	static login(opts: LoginOption): PixivDesktopApi
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
export declare class PixivMobileApi {
	getRanking(mode: RankingMode, date?: Date): Promise<any>
	getBookmarks(userId: Id): Promise<any>
	getUserDetail(userId: Id): Promise<any>
	getIllusts(userId: Id): Promise<any>
	currentUser: UserData
	static login(opts: LoginOption): PixivMobileApi
}
