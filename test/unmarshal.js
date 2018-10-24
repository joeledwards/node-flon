const tap = require('tap')
const unmarshal = require('../lib/unmarshal')
const {
  WritableStreamBuffer,
  ReadableStreamBuffer
} = require('stream-buffers')

const s = async text => {
  const input = new ReadableStreamBuffer()
  const output = new WritableStreamBuffer()
  input.put(Buffer.from(text))
  input.stop()
  await unmarshal(input, output, {debug: false})
  const data = output.getContentsAsString()
  return data
}

const u = async (...objs) => {
  const data = objs.map(JSON.stringify).join("\n")
  return await s(data)
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

    t.equal(await s('{"id": "a", "value": 1}\n{"id": "b", "value": 2}'),
            'json = {};\n' +
            'json.id = "a";\n' +
            'json.value = 1;\n' +
            'json.id = "b";\n' +
            'json.value = 2;\n'
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

tap.test('should parse multiple, full JSON structures', async t => {
    t.equal(await s("{}\n{}\n"),
            'json = {};\n'
    )
    t.equal(await s('{}\n{"id": "a"}\n'),
            'json = {};\n' +
            'json.id = "a";\n'
    )
    t.equal(await s('{"id": "a", "value": 1}\n{"id": "b", "value": 2}'),
            'json = {};\n' +
            'json.id = "a";\n' +
            'json.value = 1;\n' +
            'json.id = "b";\n' +
            'json.value = 2;\n'
    )
})
