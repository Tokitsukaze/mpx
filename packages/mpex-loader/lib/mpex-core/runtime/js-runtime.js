function makeRoutes (components) {
  // let result = ''
  // result += '['
  // let component = Object.keys(components).map(i => {
  //   return `{path: "${components[i]}", component: ${i}}`
  // }).join(',')
  // result += (component + ']')

  // return result

  let key = Object.keys(components)[0]
  return `[{path: "/", component: ${key}}]`
}

function makeComponents (components) {
  return JSON.stringify(components)
}

function makeRender () {
  return `
    function (createElement) {
      return createElement(
        'div',
        {},
        [
          createElement('router-view')
        ]
      )
    }
  `
}
function createRuntime (options) {
  let rawScriptSrc = options.rawScriptSrc
  let src = '\n'

  // import components
  for (let i in options.components) {
    src += `import ${i} from '${options.components[i]}'\n`
  }

  // runtime
  let runtime = options.type === 'app' ? 'createApp' : 'createComponent'
  src += `import {${runtime}} from '@mpxjs/mpex-loader/lib/mpex-core/runtime/runtime'\n`

  // original options
  src += rawScriptSrc + '\n'

  // injectOptions
  src += `let injectOptions = {}\n`
  if (options.type === 'app') {
    src += `injectOptions.render = ${makeRender()}\n`
    src += `injectOptions.routes = ${makeRoutes(options.components)}\n`
  } else {
    src += `injectOptions.components = ${makeComponents(options.components)}\n`
  }

  // components
  let exportPrefix = options.mode === 'vue' ? 'export default ' : ''
  src += `${exportPrefix}${runtime}(options, injectOptions)\n`

  return src
}
module.exports = createRuntime
