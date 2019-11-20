#!/usr/bin/env node

const yargs = require('yargs')
const buffered = require('buffered-stream')
const { orange } = require('@buzuli/color')

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
    .option('allow-unknown-certs', {
      type: 'boolean',
      desc: 'do not validate TLS certs',
      default: false,
      alias: ['U']
    })
    .help()
    .argv
}

async function run () {
  let source = 'stdin'

  try {
    const { stopwatch } = require('durations')
    const unmarshal = require('../lib/unmarshal')

    const watch = stopwatch()
    const {
      allowUnknownCerts,
      file,
      noBuffer,
      noColor,
      summarize,
      url
    } = config()

    let httpsAgent

    if (allowUnknownCerts) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      const { Agent } = require('https')
      httpsAgent = new Agent({ rejectUnauthorized: false })
    }

    let output = process.stdout
    if (!noBuffer) {
      const buffer = buffered(8192)
      buffer.pipe(output)
      output.on('error', error => {
        if (error.code !== 'EPIPE') {
          console.error(error)
        }
        process.exit(1)
      })
      output = buffer
    }

    if (file) {
      source = file
      const fs = require('fs')
      watch.start()
      const input = fs.createReadStream(file)
      await unmarshal(input, output, { noColor })
    } else if (url) {
      source = url
      const axios = require('axios')
      const { data } = await axios({
        method: 'get',
        url: url,
        httpsAgent,
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
    if (error.code !== 'EPIPE') {
      console.error(
        `Error parsing JSON from ${source || 'stdin'} :`,
        error
      )
    }
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
