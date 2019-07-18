const tap = require('tap')
const unmarshal = require('../lib/unmarshal')
const {
  WritableStreamBuffer,
  ReadableStreamBuffer
} = require('stream-buffers')

// Stream NDJSON (maybe) through unmarshal().
const s = async text => {
  const input = new ReadableStreamBuffer()
  const output = new WritableStreamBuffer()
  const debug = false
  input.put(Buffer.from(text))
  input.stop()
  await unmarshal(input, output, { debug })
  const data = output.getContentsAsString()
  return data
}

// Perform a marshal -> unmarshal cycle on all supplied input objects.
const u = async (...objs) => {
  const data = objs.map(JSON.stringify).join('\n')
  const ndjson = await s(data)
  return ndjson
}

tap.test('should parse JSON objects', async t => {
  t.equal(await u({}),
    'json = {};\n'
  )
  t.equal(await u({ k: 'v' }),
    'json = {};\n' +
          'json.k = "v";\n'
  )
  t.equal(await u({ n: null }),
    'json = {};\n' +
          'json.n = null;\n'
  )
  t.equal(await u({ b: true }),
    'json = {};\n' +
          'json.b = true;\n'
  )
  t.equal(await u({ b: false }),
    'json = {};\n' +
          'json.b = false;\n'
  )
  t.equal(await u({ n: 0 }),
    'json = {};\n' +
          'json.n = 0;\n'
  )
  t.equal(await u({ n: 1 }),
    'json = {};\n' +
          'json.n = 1;\n'
  )
  t.equal(await u({ n: 1.1 }),
    'json = {};\n' +
          'json.n = 1.1;\n'
  )
  t.equal(await u({ n: 0.1 }),
    'json = {};\n' +
          'json.n = 0.1;\n'
  )
  t.equal(await u({ t: 'foobar' }),
    'json = {};\n' +
          'json.t = "foobar";\n'
  )
  t.equal(await u({ a: [1] }),
    'json = {};\n' +
          'json.a = [];\n' +
          'json.a[0] = 1;\n'
  )
  t.equal(await u({ 'hyphen-ate': 0 }),
    'json = {};\n' +
          'json["hyphen-ate"] = 0;\n'
  )
  t.equal(await u({ '"q"': 1 }),
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

tap.test('should parse nested JSON arrays containing sub-objects', async t => {
  t.equal(await u({ records: [{ id: 1, name: 'first' }, { name: 'second', id: 2 }, { id: 3, name: 'third' }] }),
    'json = {};\n' +
          'json.records = [];\n' +
          'json.records[0] = {};\n' +
          'json.records[0].id = 1;\n' +
          'json.records[0].name = "first";\n' +
          'json.records[1] = {};\n' +
          'json.records[1].name = "second";\n' +
          'json.records[1].id = 2;\n' +
          'json.records[2] = {};\n' +
          'json.records[2].id = 3;\n' +
          'json.records[2].name = "third";\n'
  )
})

tap.test('should parse nested JSON arrays containing sub-arrays', async t => {
  t.equal(await u({ records: [[0, 1], [2, 3], [4, 5], [6, 7]] }),
    'json = {};\n' +
          'json.records = [];\n' +
          'json.records[0] = [];\n' +
          'json.records[0][0] = 0;\n' +
          'json.records[0][1] = 1;\n' +
          'json.records[1] = [];\n' +
          'json.records[1][0] = 2;\n' +
          'json.records[1][1] = 3;\n' +
          'json.records[2] = [];\n' +
          'json.records[2][0] = 4;\n' +
          'json.records[2][1] = 5;\n' +
          'json.records[3] = [];\n' +
          'json.records[3][0] = 6;\n' +
          'json.records[3][1] = 7;\n'
  )
})

tap.test('should parse multiple, full JSON structures', async t => {
  t.equal(await s('{}\n{}\n'),
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

/* TODO: handle junk data cleanly
tap.test('should handle garbage data cleanly', async t => {
  t.equal(await s(`
    {
      "name": "willy",
      "meta": [
        {
          "key": "thing",
          "value": "is cool"
        },
        {
          "key": "other",
          "value": "is also cool"
        }
      ]
    }

    junk

    {
      "disposition": "free",
      "turtles": {
        "turtles": {
          "turtles": {
            "turtles": [
              "turtles",
              "turtles",
              "turtles",
              {
                "turtles": {
                  "turtles": "turtles"
                }
              }
            ]
          }
        }
      }
    }

    more junk

    {
      "name": "leroy"
    }
  `),
    'json = {};\n' +
    'json.name = "willy";\n' +
    'json.meta = [];\n' +
    'json.meta[0] = {};\n' +
    'json.meta[0].key = "thing";\n' +
    'json.meta[0].value = "is cool";\n' +
    'json.meta[1] = {};\n' +
    'json.meta[1].key = "other";\n' +
    'json.meta[1].value = "is also cool";\n' +
    'json.disposition = "free";\n' +
    'json.turtles = {};\n' +
    'json.turtles.turtles = {};\n' +
    'json.turtles.turtles.turtles = {};\n' +
    'json.turtles.turtles.turtles.turtles = [];\n' +
    'json.turtles.turtles.turtles.turtles[0] = "turtles";\n' +
    'json.turtles.turtles.turtles.turtles[1] = "turtles";\n' +
    'json.turtles.turtles.turtles.turtles[2] = {};\n' +
    'json.turtles.turtles.turtles.turtles[2].turtles = {};\n' +
    'json.turtles.turtles.turtles.turtles[2].turtles.turtles = "turtles";\n' +
    'json.name = "leroy";\n'
  )
})
*/
