import { Illust } from './illust'

export interface UserData {
	profile_image_urls: object
	id: string
	name: string
	account: string
	mail_address: string
	is_premium: boolean
	x_restrict: number
	is_mail_authorized: boolean
}

export interface OauthInfo {
	access_token:  string;
	expires_in:    number;
	token_type:    string;
	scope:         string;
	refresh_token: string;
	user:          UserData;
	device_token:  string;
}
export interface Oauth{
	time: number
	info: OauthInfo
}

export type RankingMode =
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
export interface SearchOption {
	searchTarget?: 'partial_match_for_tags' | 'exact_match_for_tags' | 'title_and_caption'
}
export interface ExtendedSearchOption extends SearchOption {
	sort?: 'date_desc' | 'date_asc'
	duration?: 'within_last_day' | 'within_last_week' | 'within_last_month'
}
export interface ApiResponse {
	next_url: string | null
	[key: string]: any
}
export interface RankingOrSearchResponse extends ApiResponse {
	illusts: [Illust]
}
export interface IllustResponse extends ApiResponse {
	illust: Illust
}
export interface Params{
	[key: string]: string | number
}
export interface UsernameAuth{
	username: string
	password: string
}
export interface RefreshAuth{
	refresh_token: string
}
