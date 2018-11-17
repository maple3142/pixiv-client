# pixiv-client

> Pixiv api client written in node.js

## Example

```js
// ES6:
import { PixivDesktopApi, PixivMobileApi, download } from 'pixiv-client'
// Commomjs:
const { PixivDesktopApi, PixivMobileApi, download } = require('pixiv-client')

;(async () => {
  const auth = {
    username: 'USERNAME',
    password: 'PASSWORD'
  }
  const dc = await PixivDesktopApi.login(auth)
  const r = await dc.getIllustData(70337017)
  download(r.urls.original).pipe(fs.createWriteStream(__dirname + 'test.png')) // or `await download(r.urls.original, __dirname + 'test.png')`
  console.log(await dc.getUserProfileData(5323203))
  const mc = await PixivMobileApi.login(auth)
  console.log(await mc.getRanking('day'))
  const bm = await mc.getUserBookmarks(mc.currentUser.id)
  if (mc.hasNext(bm)) {
    console.log(await mc.next(bm))
  }
  else{
    console.log(bm)
  }
})()
```

## Documentation

[Typescript definitions](./types)

> Although there is lots of undocumented api if you inspect the api client, you should not use it because it won't follow semver.
