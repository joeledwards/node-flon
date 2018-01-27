module.exports = unmarshal

function unmarshal (input, output) {
  return new Promise((resolve, reject) => {
    const oboe = require('oboe')
    const once = require('./once')
    const root = once(() => console.log('json = {}'))

    oboe(input)
    .node('*', (value, path, ancestors) => {
      root()
      if (value === null) {
        output.write(`${assemble(path)} = null\n`)
      } else {
        const type = typeof value
        if (type === 'boolean') output.write(`${assemble(path)} = ${value}\n`)
        if (type === 'number') output.write(`${assemble(path)} = ${value}\n`)
        if (type === 'string') output.write(`${assemble(path)} = "${value}"\n`)
      }

      return oboe.drop
    })
    .done(resolve)
    .fail(reject)
  })
}

function ref (id) {
  return (typeof id === 'number') ? `[${id}]` : `.${id}`
}

function assemble (parts) {
  return 'json' + parts.map(ref).join('')
}
