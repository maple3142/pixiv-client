interface DesktopApi {
	getIllustData(illustId: string | number): Promise<any>
	getIllustBookmarkData(illustId: string | number): Promise<any>
	getUserData(userId: string | number): Promise<any>
	getUserProfileData(userId: string | number): Promise<any>
	getUserBookmarkData(userId: string | number, optSearchParams?: object): Promise<any>
	getIllustUgoiraMetaData(illustId: string | number): Promise<any>
	postIllustLike(illustId: string | number): Promise<any>
	postFollowUser(userId: string | number): Promise<any>
	postRPCAddBookmark(illustId: string | number): Promise<any>
	postRPCDeleteBookmark(bookmarkId: string | number): Promise<any>
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
interface MobileApi {
	getRanking(mode: RankingMode, date: Date): Promise<any>
	getBookmarks(userId: string | number): Promise<any>
	getUserDetail(userId: string | number): Promise<any>
	getIllusts(userId: string | number): Promise<any>
	user: UserData
}
interface Pixiv extends DesktopApi, MobileApi {}
declare class Pixiv {
	static login(acc: string, pwd: string): Promise<Pixiv>
}
export = Pixiv
