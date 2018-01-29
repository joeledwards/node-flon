#!/usr/bin/env node

const yargs = require('yargs')

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
    .help()
    .argv
}

async function run () {
  let source = 'stdin'

  try {
    const {stopwatch} = require('durations')
    const r = require('ramda')
    const unmarshal = require('../lib/unmarshal')

    const {file, url} = config()
    const output = process.stdout
    const watch = stopwatch()

    if (file) {
      source = file
      const fs = require('fs')
      watch.start()
      await unmarshal(fs.createReadStream(file), output)
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
