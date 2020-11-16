module.exports.name = 'qq-auth'
module.exports.apply = async (app, options = {}) => {
  const db = await require('./db')(options)
  app.middleware(async (meta, next) => {
    console.log(meta.message)
    if (meta.message.startsWith('!auth')) {
      console.log('auth')
      const token = meta.message.slice(5).trim()
      const tokenStat = await db.getStat({ token })
      console.log(tokenStat)
      if (!tokenStat) return meta.$send('不存在这个token')
      if (tokenStat.status === 'authenticated') return meta.$send('已经认证过了，要换号先revoke (!revoke token)')
      const result = await db.authenticateTokenToQQ(token, meta.userId)
      if (result) return meta.$send('done')
    } else if (meta.message.startsWith('!bindqq')) {
      const token = await db.createAuth()
      meta.$send(token.token)
      meta.$send('用你的qq发送上面的token内容给小阿日')
    }
    return next()
  })
}
