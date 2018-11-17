export { PixivDesktopApi } from './desktop'
export { PixivMobileApi } from './mobile'

import { ReadStream } from 'fs'

export declare function download(url: string): ReadStream
export declare function download(url: string, absfilepath: string): Promise<void>
