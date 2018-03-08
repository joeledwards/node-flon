const tap = require('tap')
const unmarshal = require('../lib/unmarshal')
const {
  WritableStreamBuffer,
  ReadableStreamBuffer
} = require('stream-buffers')

const u = async (...objs) => {
  const input = new ReadableStreamBuffer()
  const output = new WritableStreamBuffer()
  const buffer = Buffer.from(objs.map(JSON.stringify).join("\n"))
  input.put(buffer)
  input.stop()
  if (objs.length > 1) {
    console.error(buffer.toString())
  }
  await unmarshal(input, output)
  return output.getContentsAsString()
}

tap.test('should parse JSON objects', async t => {
    t.equal(await u({}),
            'json = {};\n'
           )
    t.equal(await u({k: 'v'}),
            'json = {};\n' +
            'json.k = "v";\n'
           )
    t.equal(await u({"n": null}),
            'json = {};\n' +
            'json.n = null;\n'
           )
    t.equal(await u({b: true}),
            'json = {};\n' +
            'json.b = true;\n'
           )
    t.equal(await u({b: false}),
            'json = {};\n' +
            'json.b = false;\n'
           )
    t.equal(await u({n: 0}),
            'json = {};\n' +
            'json.n = 0;\n'
           )
    t.equal(await u({n: 1}),
            'json = {};\n' +
            'json.n = 1;\n'
           )
    t.equal(await u({n: 1.1}),
            'json = {};\n' +
            'json.n = 1.1;\n'
           )
    t.equal(await u({n: .1}),
            'json = {};\n' +
            'json.n = 0.1;\n'
           )
    t.equal(await u({t: "foobar"}),
            'json = {};\n' +
            'json.t = "foobar";\n'
           )
    t.equal(await u({a: [1]}),
            'json = {};\n' +
            'json.a = [];\n' +
            'json.a[0] = 1;\n'
           )
    t.equal(await u({"hyphen-ate": 0}),
            'json = {};\n' +
            'json["hyphen-ate"] = 0;\n'
           )
    t.equal(await u({"\"q\"": 1}),
            'json = {};\n' +
            'json["\\"q\\""] = 1;\n'
           )

    t.done()
})

tap.test('should parse JSON arrays', async t => {
    t.equal(await u(['a']),
            'json = [];\n' +
            'json[0] = "a";\n'
           )
    t.equal(await u([1, '2']),
            'json = [];\n' +
            'json[0] = 1;\n' +
            'json[1] = "2";\n'
           )
})

/* TODO: figure out how to make continuation (multiple, distinct JSON objects)
tap.test('should parse multiple, full JSON structures', async t => {
    t.equal(await u({}, {}),
            'json = {};\n' +
            'json = {};\n'
           )
})
*/
