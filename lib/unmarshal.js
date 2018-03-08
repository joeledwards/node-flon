module.exports = unmarshal

function unmarshal (input, output, config = {}) {
  return new Promise((resolve, reject) => {
    const {
      blue,
      green,
      orange,
      purple,
      yellow,
    } = require('@buzuli/color')

    const oboe = require('oboe')
    const r = require('ramda')
    const once = require('./once')
    let lastPath = null

    const {noColor} = config

    // Used to escape all double quotes in keys and values.
    const esc = r.replace(/"/g, '\\"')

    // Builds a valid path component.
    const ref = id => (typeof id === 'number')
      ? `[${noColor ? id : orange(id)}]`
      : (id.match(/^[a-zA-Z$_][0-9a-zA-Z$_]*$/))
      ? `.${noColor ? id : blue(id)}`
      : `["${noColor ? esc(id) : blue(esc(id))}"]`

    // Assembles a complete path from a path array.
    const assemble = parts =>
      
      (noColor ? 'json' : blue('json')) + parts.map(ref).join('')

    // Assembles the root path.
    const root = once(ancestors => {
      const rootComponent = ancestors[0]
      if (rootComponent instanceof Array) {
        output.write(`${noColor ? 'json' : blue('json')} = [];\n`)
      } else if (rootComponent instanceof Object) {
        output.write(`${noColor ? 'json' : blue('json')} = {};\n`)
      }
    })

    // Determine if the parent element has changed from the previous node.
    const parentChanged = (last, curr) => {
      // There is no prior path.
      if (last == null)
        return true

      // Path lengths do not match, therefore we do not have the same parent.
      if (last.length != curr.length)
        return true

      // Only one step above the root. This is okay in all cases
      // except when the first, in which case the last path will be null.
      if (last.length < 2)
        return false

      // Compare all paths until there is a deviation. If there are no
      // deviations, decrement until -1, which indicates that
      // the parent path is unchanged.
      let i = last.length - 2
      while (i >= 0 && last[i] === curr[i])
        i--

      return i != -1 
    }

    // Recursively allocate all missing parent structures. This is
    // the number of path components which deviate from the parent
    // path of the prior node.
    const allocateParent = (path, ancestors) => {
      let textPath = noColor ? 'json' : blue('json')
      let deviated = lastPath ? false : true
      const limit = path.length - 1

      for (i = 0; i < limit; i++) {
        textPath += ref(path[i])
        if (deviated || lastPath[i] !== path[i]) {
          deviated = true
          if (ancestors[i+1] instanceof Array) {
            output.write(`${textPath} = [];\n`)
          } else {
            output.write(`${textPath} = {};\n`)
          }
        }
      }
    }

    // Allocate an empty structure if this is the first time
    // encountering a path.
    const allocate = (value, path, ancestors) => {
      if (parentChanged(lastPath, path)) {
        allocateParent(path, ancestors)
        lastPath = path
      }
    }

    oboe(input)
    .node('*', (value, path, ancestors) => {
      const type = typeof value

      if (lastPath == null) {
        root(ancestors)
      }

      if (type === 'object' && value !== null) {
        return oboe.drop
      }

      allocate(value, path, ancestors)

      if (value === null) {
        output.write(`${assemble(path)} = ${noColor ? 'null' : yellow('null')};\n`)
      } else {
        const type = typeof value
        if (type === 'boolean') {
          output.write(`${assemble(path)} = ${noColor ? value : purple(value)};\n`)
        } else if (type === 'number') {
          output.write(`${assemble(path)} = ${noColor ? value : orange(value)};\n`)
        } else if (type === 'string') {
          output.write(`${assemble(path)} = "${noColor ? esc(value) : green(esc(value))}";\n`)
        }
      } 

      return oboe.drop
    })
    .done(resolve)
    .fail(reject)
  })
}
