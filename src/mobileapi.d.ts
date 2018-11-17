import { Illust } from './illust'
type Id = string | number
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
interface ApiResponse {
	next_url: string | null
	[key: string]: any
}
interface RankingResponse extends ApiResponse{
	illusts: [Illust]
}
interface IllustResponse extends ApiResponse{
	illust: Illust
}
export declare class PixivMobileApi {
	hasNext(resp: ApiResponse): Promise<ApiResponse>
	next(resp: ApiResponse): Promise<ApiResponse>
	searchIllust(keyword: string, opts?: SearchOption): Promise<ApiResponse>
	searchUser(keyword: string): Promise<ApiResponse>
	getRanking(mode: RankingMode, date?: Date): Promise<RankingResponse>
	getBookmarkTags(opts?: { publicMode: boolean }): Promise<ApiResponse>
	getTrendingTags(): Promise<ApiResponse>
	getUserBookmarks(userId: Id): Promise<ApiResponse>
	getUserDetail(userId: Id): Promise<ApiResponse>
	getUserMypixiv(userId: Id): Promise<ApiResponse>
	getUserFollowers(userId: Id): Promise<ApiResponse>
	getUserFollowings(userId: Id): Promise<ApiResponse>
	getIllusts(userId: Id): Promise<ApiResponse>
	getNewIllusts(): Promise<ApiResponse>
	getRecommendedIllusts(opts?: { includeRanking: boolean }): Promise<ApiResponse>
	getFollowingIllusts(): Promise<ApiResponse>
	getIllustDetail(illustId: Id): Promise<IllustResponse>
	getIllustComment(illustId: Id): Promise<ApiResponse>
	getIllustRelated(illustId: Id): Promise<ApiResponse>
	addBookmark(illustId: Id, opts?: { publicMode: boolean }): Promise<ApiResponse>
	deleteBookmark(illustId: Id): Promise<ApiResponse>
	getRecommendedNovels(opts?: { includeRanking: boolean }): Promise<ApiResponse>
	getRecommendedMangas(opts?: { includeRanking: boolean }): Promise<ApiResponse>
	currentUser: UserData
	static login(opts: LoginOption): Promise<PixivMobileApi>
}
