#!/usr/bin/env node

const yargs = require('yargs')
const buffered = require('buffered-stream')
const {orange} = require('@buzuli/color')

function config () {
  return yargs
    .env('FLON')
    .option('file', {
      type: 'string',
      desc: 'read from specified file instead of stdin',
      alias: ['f']
    })
    .option('url', {
      type: 'string',
      desc: 'read from specified URL instead of stdin',
      alias: ['u'],
      conflicts: ['file']
    })
    .option('summary', {
      type: 'boolean',
      desc: 'output summary info to stderr',
      default: false,
      alias: ['v']
    })
    .option('no-buffer', {
      type: 'boolean',
      desc: 'flush every line as it is generated',
      default: false,
      alias: ['B']
    })
    .option('no-color', {
      type: 'boolean',
      desc: 'do not colorize output',
      default: false,
      alias: ['C']
    })
    .help()
    .argv
}

async function run () {
  let source = 'stdin'

  try {
    const {stopwatch} = require('durations')
    const r = require('ramda')
    const unmarshal = require('../lib/unmarshal')

    const watch = stopwatch()
    const {
      file,
      noBuffer,
      noColor,
      summarize,
      url
    } = config()

    let output = process.stdout
    if (!noBuffer) {
      const buffer = buffered(8192)
      buffer.pipe(output)
      output = buffer
    }

    if (file) {
      source = file
      const fs = require('fs')
      watch.start()
      await unmarshal(fs.createReadStream(file), output, {noColor})
    } else if (url) {
      source = url
      const axios = require('axios')
      const {data} = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      })
      watch.start()
      await unmarshal(data, output)
    } else {
      process.stdin.resume()
      watch.start()
      await unmarshal(process.stdin, output)
    }

    if (!noBuffer) {
      output.end()
    }

    if (summarize) {
      console.error(`Finished parsing in ${orange(watch)}`)
    }
  } catch (error) {
    console.error(
      `Error parsing JSON from ${source ? source : 'stdin'} :`,
      error
    )
  }
}

async function flon () {
  try {
    await run()
  } catch (error) {
    console.error(error)
  }
}

flon()
