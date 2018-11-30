# pixiv-client

> Pixiv api client written in node.js

## Example

```js
// ES6:
import { PixivDesktopApi, PixivMobileApi, downloadAsStream } from 'pixiv-client'
// Commomjs:
const { PixivDesktopApi, PixivMobileApi, downloadAsStream } = require('pixiv-client')

;(async () => {
  const auth = {
    username: 'USERNAME',
    password: 'PASSWORD'
  }
  const dc = await PixivDesktopApi.login(auth)
  const r = await dc.getIllustData(70337017)
  downloadAsStream(r.urls.original).pipe(fs.createWriteStream(__dirname + '/test.png')) // or `await downloadToLocal(r.urls.original, __dirname + '/test.png')`
  console.log(await dc.getUserProfileData(5323203))
  const mc = await PixivMobileApi.login(auth)
  console.log(await mc.getRanking('day'))
  const bm = await mc.getUserBookmarks(mc.oauth.info.user.id)
  if (mc.hasNext(bm)) {
    console.log(await mc.next(bm))
  }
  else{
    console.log(bm)
  }
})()
```

## Documentation

* [index](src/index.ts)
* [desktop api](src/desktop/index.ts)
* [mobile api](src/mobile/index.ts)
