export { PixivDesktopApi } from './desktop'
export { PixivMobileApi } from './mobile'
import * as got from 'got'
import * as fs from 'fs'
import * as path from 'path'

export function download(url: string, absfilepath = '') {
	const s = got.stream(url, {
		headers: {
			Referer: 'https://www.pixiv.net/'
		}
	})
	if (path.isAbsolute(absfilepath)) {
		return new Promise((res, rej) => {
			s.pipe(fs.createWriteStream(absfilepath))
				.on('finish', () => res())
				.on('error', rej)
		})
	} else {
		return s
	}
}
