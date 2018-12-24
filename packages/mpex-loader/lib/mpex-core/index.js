const path = require('path')
const parse = require('./parser')
const compiler = require('./compiler')
const createRuntime = require('./runtime')
const NormalizeOptions = require('./normalize-options')

function compile (content, resourceInfo, options) {
  let fileName = resourceInfo.fileName
  let loaderContext = options.loaderContext
  let vueSfc
  let transpilerOptions

  return Promise.resolve().then(() => {
    let runtimeFile = path.resolve(__dirname, './js-runtime.js')
    loaderContext.addDependency(runtimeFile)
    let sfc = parse(content, fileName, {})

    // 新建一个SFC，避免转vue操作中修改原始SFC
    vueSfc = Object.assign({}, sfc)

    try {
      let ret = JSON.parse(vueSfc.json.content)
      options.jsonOptions = ret
    } catch (e) {}

    transpilerOptions = new NormalizeOptions(options)

    if (transpilerOptions.mode === 'vue') {
      delete vueSfc.json
    }

    // inject js-runtime
    const selectorLoader = path.resolve(__dirname, 'selector')
    let rawScriptSrc = `import options from '!!${selectorLoader}?type=script!${fileName}'`
    transpilerOptions.rawScriptSrc = rawScriptSrc

    return createRuntime(transpilerOptions)
  }).then(jsRuntime => {
    vueSfc.script.transformedContent = jsRuntime

    vueSfc = compiler.transpileComponent(vueSfc, transpilerOptions)
    let result = compiler.serializeComponent(vueSfc)
    return result
  })
}

module.exports = {
  compile
}
