# pixiv-client

[![Greenkeeper badge](https://badges.greenkeeper.io/maple3142/pixiv-client.svg)](https://greenkeeper.io/)

## Example

```js
;(async () => {
  const p = await Pixiv.login('YOUR_PIXIV_ACCOUNT', 'YOUR_PIXIV_PASSWORD')
  console.log(await p.postIllustLike(70337017))
  console.log(await p.getUserProfileData(5323203))
  console.log(await p.getRanking('day'))
  console.log(await p.getBookmarks(p.oauthinfo.user.id))
})()
```
