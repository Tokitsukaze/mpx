const loaderUtils = require('loader-utils')
const cache = require('./utils/cache')
const mpex = require('./mpex-core')
const hash = require('hash-sum')

const hashKeys = []
module.exports = function (content) {
  let callback = this.async()
  const filePath = this.resourcePath
  const resourceQuery = this.resourceQuery || '?'

  // query options from user
  const queryObj = loaderUtils.parseQuery(resourceQuery)

  // loader options from webpack
  const options = loaderUtils.getOptions(this) || {}
  const rootResource = this._compilation.entries[0].resource

  // vue-loader会在资源query拼接自己的参数，这些参数不由用户拼接
  // 仅以资源名、资源、约定的资源query参数作为hash参数，剔除自动参数，避免重复缓存
  let hashItems = [filePath, content]
  hashKeys.forEach(i => {
    if (queryObj.hasOwnProperty) {
      hashItems.push(queryObj[i])
    }
  })
  let hashName = this.resourcePath + hash(hashItems.join(''))

  let output = cache.getCache(hashName)
  if (!output) {
    let transpilerOptions = {
      userOptions: queryObj,
      loaderOptions: options
    }
    if (filePath === rootResource) {
      transpilerOptions.type = 'app'
    } else {
      transpilerOptions.type = 'component'
    }
    mpex.compile(this, content, filePath, transpilerOptions).then(result => {
      cache.setCache(hashName, result)
      callback(null, result)
    }).catch(err => {
      callback(err)
    })
  } else {
    callback(null, output)
  }
}
