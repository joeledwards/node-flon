module.exports = unmarshal

function unmarshal (input, output) {
  return new Promise((resolve, reject) => {
    const oboe = require('oboe')
    const r = require('ramda')
    const once = require('./once')
    const root = once(() => console.log('json = {}'))
    const esc = r.replace(/"/g, '\\"')
    const ref = id => (typeof id === 'number')
      ? `[${id}]`
      : (id.match(/^[a-zA-Z$_][0-9a-zA-Z$_]*$/))
      ? `.${id}`
      : `["${esc(id)}"]`
    const assemble = parts => 'json' + parts.map(ref).join('')

    oboe(input)
    .node('*', (value, path, ancestors) => {
      root()

      if (value === null) {
        output.write(`${assemble(path)} = null\n`)
      } else {
        const type = typeof value
        if (type === 'boolean')
          output.write(`${assemble(path)} = ${value}\n`)
        if (type === 'number')
          output.write(`${assemble(path)} = ${value}\n`)
        if (type === 'string')
          output.write(`${assemble(path)} = "${esc(value)}"\n`)
      }

      return oboe.drop
    })
    .done(resolve)
    .fail(reject)
  })
}
