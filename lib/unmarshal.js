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

    const r = require('ramda')
    const once = require('./once')
    const clarinet = require('clarinet')
    let lastPath = null

    const {debug, noColor} = config

		let stack = []
    let prevNode
		let node
    let hasWritten = false

    const write = data => {
      if (!hasWritten) {
        hasWritten = true
      }
      output.write(data)
    }

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
    const root = once(() => {
      const rootComponent = stack[0] || prevNode
      if (rootComponent.isArray) {
        write(`${noColor ? 'json' : blue('json')} = [];\n`)
      } else if (rootComponent.isObject) {
        write(`${noColor ? 'json' : blue('json')} = {};\n`)
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
    const allocateParent = (path) => {
      let textPath = noColor ? 'json' : blue('json')
      let deviated = lastPath ? false : true
      const limit = path.length - 1

      for (i = 0; i < limit; i++) {
        textPath += ref(path[i])
        if (deviated || lastPath[i] !== path[i]) {
          deviated = true
          if (stack[i+1].isArray) {
            write(`${textPath} = [];\n`)
          } else {
            write(`${textPath} = {};\n`)
          }
        }
      }
    }

    // Allocate an empty structure if this is the first time
    // encountering a path.
    const allocate = (value, path) => {
      if (parentChanged(lastPath, path)) {
        allocateParent(path)
        lastPath = path
      }
    }

    const stream = clarinet.createStream()

		stream.on('error', error => {
      if (debug) console.info('onerror')
			stack = []
      prevNode = undefined
      node = undefined
      hasWritten = false
      stream._parser.error = null
      stream._parser.resume()
		});

		stream.on('value', value => {
      if (debug) console.info('onvalue')

			const path = r.map(s => s.key)(stack)
      const type = typeof value

      if (lastPath == null) {
        root()
      }

      if (type === 'object' && value !== null) {
        return
      }

			allocate(value, path)

      if (value === null) {
        write(`${assemble(path)} = ${noColor ? 'null' : yellow('null')};\n`)
      } else {
        const type = typeof value
        if (type === 'boolean') {
          write(`${assemble(path)} = ${noColor ? value : purple(value)};\n`)
        } else if (type === 'number') {
          write(`${assemble(path)} = ${noColor ? value : orange(value)};\n`)
        } else if (type === 'string') {
          write(`${assemble(path)} = "${noColor ? esc(value) : green(esc(value))}";\n`)
        }
      } 

			if (node && node.isArray) {
				node.key++
			}
		});

		stream.on('openobject', key => {
      if (debug) console.info('onopenobject')
      prevNode = node
			node = {
				isObject: true,
				key
			}
			stack.push(node)
		});

		stream.on('key', key => {
      if (debug) console.info('onkey')
			node.key = key
		});

		stream.on('closeobject', () => {
      if (debug) console.info('oncloseobject')
      prevNode = node
			stack.pop()
			node = r.last(stack)
		});

		stream.on('openarray', () => {
      if (debug) console.info('onopenarray')
      prevNode = node
			node = {
				isArray: true,
				key: 0
			}
			stack.push(node)
		});

		stream.on('closearray', () => {
      if (debug) console.info('onclosearray')
			prevNode = node
      stack.pop()
			node = r.last(stack)
		});

		stream.on('end', () => {
      if (debug) console.info('onend')
      if (!hasWritten) root()
			resolve()
		});

		input.pipe(stream)
  })
}
