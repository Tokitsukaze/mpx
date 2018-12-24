const path = require('path')
const hash = require('hash-sum')

class NormalizeOptions {
  constructor (options) {
    this._options = options
    this.type = options.type
    this.mode = options.mode || 'wx'
    this.components = this.createComponents()
  }

  createComponents () {
    let jsonOptions = this._options.jsonOptions
    let components = {}
    if (jsonOptions) {
      if (jsonOptions.usingComponents) {
        // components
        components = jsonOptions.usingComponents
      } else if (jsonOptions.pages) {
        // app
        jsonOptions.pages.forEach(i => {
          let key = path.basename(i) + hash(i)
          components[key] = i
        })
      }
    }
    return components
  }
}

module.exports = NormalizeOptions
